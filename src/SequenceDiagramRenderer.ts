//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { G, Marker, SVG, Svg } from '@svgdotjs/svg.js'
import { Participant, ParticipantTypes, ElementTypes, SequenceDiagram, NoteLocations, ArrowHeadTypes, Message } from "./SequenceDiagramParser"
import { Options, DeepPartial, DiagramOptions, BackgroundPattern, Align, defaultColour } from './Options'
import { Dimensions } from './Dimensions'
import { DrawMessageResult, drawActor, drawLifeline, drawMessage, drawSelfMessage, drawText, drawTextBox } from './ElementRenderers'
import { sizeMessage, sizeSelfMessage, sizeTextBox } from './ElementSizers'

type Point = [number, number]
export type Points = Point[]

interface LifeLines {
    lifelines: Lifeline[]
    maxHeight: number
}

type ParticipantMap = Map<Participant, Lifeline>

export interface Activation {
    startY: number,
    endY: number,
    count: number
}

export class Lifeline {
    private _openActivations: Activation[] = []
    private _closedActivations: Activation[] = []

    public x: number = 0
    public dimensions: Dimensions = Dimensions.None
    public spacing: Map<number, number> = new Map()
    public index: number = 0
    public participant?: Participant
    public activations: number = 0
    public get openActivations() { return this._openActivations }
    public get closedActivations() { return this._closedActivations }
    public get cx() {
        return this.x + this.dimensions.cx
    }

    constructor(init?: Partial<Lifeline>) {
        Object.assign(this, init)
    }
}

export default class Renderer {
    private _options: DiagramOptions
    private _diagram: SequenceDiagram
    private _container: HTMLElement
    private _svg: Svg
    private _icons: any = {}
    private _markers: any = {}

    constructor (diagram: SequenceDiagram, container: HTMLElement, options: DeepPartial<DiagramOptions>) {
        if (!diagram) throw new Error("Invalid parameter: diagram must be specified")
        if (!container) throw new Error("Invalid parameter: container must be specified")
        
        this._container = container
        this._container.innerHTML = ''
        this._svg = SVG().addTo(container)

        this._diagram = diagram
        this._options = Options.From(options)

        const actorGroup = this._svg
            .defs()
            .group()
        
        actorGroup.circle(18).fill("black").cx(15)
        actorGroup.rect(30, 10).fill("black").y(23)
        actorGroup.line(5 ,0, 25, 0).stroke({ color: "black", width: 10 }).attr({"stroke-linecap": "round"}).y(23)
        this._icons.actor = actorGroup

        this._markers[ArrowHeadTypes.closed] = this._svg.marker(10, 10, (m: Marker) => {
            m.polygon("0 0, 10 5, 0 10").attr({
                fill: defaultColour,
                stroke: defaultColour,
            })
        }).attr({refX: 10, refY: 5})
        
        this._markers[ArrowHeadTypes.open] = this._svg.marker(10, 10, (m: Marker) => {
            m.polyline("0 0, 10 5, 0 10").attr({
                fill: "none",
                stroke: defaultColour,
            })
        }).attr({refX: 10, refY: 5})
    }

    private static spaceLifeLines(lifelines: Lifeline[]) {
        for (let sourceIndex = 0; sourceIndex < lifelines.length; sourceIndex++) {
            const sourceLayout = lifelines[sourceIndex]
            const spacings = [...sourceLayout.spacing].sort()

            for (const [targetIndex, width] of spacings) {
                const targetLayout = lifelines[targetIndex]
                const scx = sourceLayout.x + sourceLayout.dimensions.cx
                const tcx = targetLayout.x + targetLayout.dimensions.cx
                const diff = width - Math.abs(tcx - scx) 
                if (diff > 0) {
                    // nudge right
                    for (let i = targetIndex; i < lifelines.length; i++) {
                        lifelines.at(i)!.x += diff
                    }
                }
            }
        }
    }

    private static setSpacing(lifelines: Lifeline[], sourceIndex: number, targetIndex: number, width: number) {
        const leftIndex = Math.min(sourceIndex, targetIndex)
        const rightIndex = Math.max(sourceIndex, targetIndex)
        const left = lifelines[leftIndex]
        if (width > (left.spacing.get(rightIndex) ?? 0)) {
            left.spacing.set(rightIndex, width)
        }
    }

    private createLifelines(): LifeLines {
        const lifelines: Lifeline[] = []
        let offsetX = 0
        let maxHeight = 0
    
        // push a fake left boundary
        lifelines.push(new Lifeline())
    
        for (const participant of this._diagram.participants) {
            let el: G
            switch (participant.type) {
                case ParticipantTypes.lifeline: el = drawTextBox(this._svg, participant.alias, this._options.lifelines.textBoxOptions); break
                case ParticipantTypes.actor: el = drawActor(this._svg, participant.alias, this._icons.actor, this._options.lifelines.textBoxOptions); break
            }
    
            const bbox = el.bbox()
            el.remove()
            lifelines.push(new Lifeline({
                x: offsetX,
                index: lifelines.length,
                dimensions: new Dimensions(bbox.width, bbox.height),
                participant,
            }))

            maxHeight = Math.max(maxHeight, bbox.height)
            offsetX += bbox.width
        }
    
        // push a fake right boundary
        lifelines.push(new Lifeline({
            x: offsetX,
            index: lifelines.length
        }))
    
        Renderer.spaceLifeLines(lifelines)
        return { 
            lifelines,
            maxHeight
        }
    }

    private getLeftLifeline(participantMap: ParticipantMap, source: Participant, target: Participant) {
        const sourceLifeline = participantMap.get(source)!
        const targetLifeline = participantMap.get(target)!

        return sourceLifeline.index < targetLifeline.index ? sourceLifeline : targetLifeline
    }

    private layoutElements(lifelines: Lifeline[], participantMap: ParticipantMap) {
        const getIndex = (p: Participant): number => participantMap.get(p)!.index

        let elementY = 0
        for (const element of this._diagram.elements) {
            switch (element.type) {
                case ElementTypes.message: {
                    const isSelfMessage = element.source === element.target
                    const left = this.getLeftLifeline(participantMap, element.source, element.target)
                    const activationsPadding = left.activations * 10
                    if (isSelfMessage) {
                        const d = sizeSelfMessage(this._svg, element, this._options)
                        Renderer.setSpacing(lifelines, getIndex(element.source), getIndex(element.target) + 1, d.width + activationsPadding)
                        elementY += d.height
                    } else {
                        const d = sizeMessage(this._svg, this._markers, element, this._options)
                        Renderer.setSpacing(lifelines, getIndex(element.source), getIndex(element.target), d.width + activationsPadding)
                        elementY += d.height
                    }
                    break
                }
                case ElementTypes.note: {
                    const { overlap, textBoxOptions } = this._options.notes
                    const noteDimensions = sizeTextBox(this._svg, element.text, textBoxOptions)
                    const sourceIndex = getIndex(element.target[0])

                    switch (element.location) {
                        case (NoteLocations.leftOf): Renderer.setSpacing(lifelines, sourceIndex, sourceIndex - 1, noteDimensions.width); break
                        case (NoteLocations.rightOf): Renderer.setSpacing(lifelines, sourceIndex, sourceIndex + 1, noteDimensions.width); break
                        case (NoteLocations.over):
                            let targetIndex = sourceIndex
                            if (element.target.length === 1) {
                                Renderer.setSpacing(lifelines, targetIndex-1, targetIndex, noteDimensions.width / 2)
                                Renderer.setSpacing(lifelines, targetIndex, targetIndex+1, noteDimensions.width / 2)
                            } else {
                                targetIndex = getIndex(element.target[1])
                                Renderer.setSpacing(lifelines, sourceIndex, targetIndex, noteDimensions.width - 2 * overlap)
                            }
                            break;
                    }
                    elementY += noteDimensions.height
                    break
                }
            }
        }

        return elementY
    }

    private renderLifelines(lifelines: Lifeline[], offsetY: number, maxHeight: number): G {
        const group = this._svg.group()
        group.rect(1, 1).fill("none").stroke("none").move(0,0)
        for (const lifeline of lifelines.slice(1, lifelines.length - 1)) {
            const lifelineGroup = drawLifeline(group, lifeline, offsetY, this._icons.actor, this._options.lifelines)
            lifelineGroup.translate(lifeline.x, maxHeight - lifelineGroup.children()[1].bbox().height)
        }
        return group
    }

    private renderMessage(group: G, element: Message, offsetY: number, participantMap: ParticipantMap): G {
        const activationWidth = 9
        const halfActivationWidth = (activationWidth) / 2 // detect if odd and sub 1 only if necessary
        const source = participantMap.get(element.source)!
        const target = participantMap.get(element.target)!

        if (element.activated) {
            target.openActivations.push({ startY: 0, endY: 0, count: target.openActivations.length })
        }

        const left = source.index < target.index ? source : target
        
        let result: DrawMessageResult
        if (source !== target) {
            const leftToright = source.index < target.index
            let leftX = left.cx
            let width = Math.abs(source.cx - target.cx)
            
            if (source.openActivations.length > 0) {
                const totalActivationWidth = source.openActivations.length * halfActivationWidth
                if (leftToright) {
                    leftX += totalActivationWidth
                    width -= totalActivationWidth
                } else {
                    width += totalActivationWidth - activationWidth
                }
            }

            if (target.openActivations.length > 0) {
                const totalActivationWidth = target.openActivations.length * halfActivationWidth
                if (leftToright) {
                    width += totalActivationWidth - activationWidth
                } else {
                    leftX += totalActivationWidth
                    width -= totalActivationWidth
                }
            }
            
            result = drawMessage(group, this._markers, element, leftX, offsetY, width, source.index < target.index, this._options.messages)
        } else {
            let startX = left.cx
            let endX = left.cx

            if (source.openActivations.length) {
                let totalActivationWidth = source.openActivations.length * halfActivationWidth
                if (element.activated) totalActivationWidth -= halfActivationWidth
                startX += totalActivationWidth

                endX += totalActivationWidth += halfActivationWidth
                if (!element.activated) endX -= halfActivationWidth
                if (element.deactivated) endX -= halfActivationWidth
            }

            result = drawSelfMessage(group, this._markers, element, startX, endX, offsetY, this._options.messages)
        }

        if (element.activated) {
            target.openActivations.at(-1)!.startY = result.arrow.endY
        }

        if (element.deactivated) {
            const activation = source.openActivations.pop()
            if (activation)
            {
                activation.endY = source === target ? result.arrow.startY : result.arrow.endY
                source.closedActivations.push(activation)
            }
        }

        return result.group
    }

    private renderElements(participantMap: ParticipantMap, lifelines: Lifeline[]): G {
        const group = this._svg.group()
        let offsetY = 0
        const activationWidth = 9
        group.rect(1, 1).fill("none").stroke("none").move(0,0)
        for (const element of this._diagram.elements) {
            switch (element.type) {
                case ElementTypes.message: {
                    var mGroup = this.renderMessage(group, element, offsetY, participantMap)
                    offsetY += mGroup.bbox().height
                    break
                }
                case ElementTypes.note: {
                    const noteSource = participantMap.get(element.target[0])!

                    switch (element.location) {
                        case NoteLocations.leftOf:
                            this._options.notes.textBoxOptions.textOptions.align = Align.right
                            const leftOfNote = drawTextBox(group, element.text, this._options.notes.textBoxOptions).move(0,0)
                            if (this._options.notes.name) {
                                leftOfNote.addClass(this._options.notes.name)
                            }
                            leftOfNote.translate(noteSource.x + noteSource.dimensions.cx - leftOfNote.bbox().width, offsetY)
                            offsetY += leftOfNote.bbox().height ?? 0
                            break
                        case NoteLocations.over:
                            this._options.notes.textBoxOptions.textOptions.align = Align.middle
                            const source = participantMap.get(element.target[0])!
                            const target = element.target.length === 1
                                ? source
                                : participantMap.get(element.target[1])!
                            const minimumWidth = Math.abs(source.x + source.dimensions.cx - (target.x + target.dimensions.cx)) + 2 * this._options.notes.textBoxOptions.margin
                            const overNote = drawTextBox(group, element.text, this._options.notes.textBoxOptions, minimumWidth).move(0,0)
                            if (this._options.notes.name) {
                                overNote.addClass(this._options.notes.name)
                            }

                            if (element.target.length === 1) {
                                overNote.y(offsetY)
                                overNote.cx(source.x + source.dimensions.cx)
                            } else {
                                const left = source.x < target.x ? source : target
                                overNote.translate(left.x + left.dimensions.cx - this._options.notes.overlap, offsetY)
                            }
                            offsetY += overNote.bbox().height ?? 0
                            break
                        case NoteLocations.rightOf:
                            this._options.notes.textBoxOptions.textOptions.align = Align.left
                            const rightOfNote = drawTextBox(group, element.text, this._options.notes.textBoxOptions).move(0,0)
                            if (this._options.notes.name) {
                                rightOfNote.addClass(this._options.notes.name)
                            }
                            rightOfNote.translate(noteSource.x + noteSource.dimensions.cx, offsetY)
                            offsetY += rightOfNote.bbox().height ?? 0
                            break
                    }
                    break
                }
            }
        }

        this.renderActivations(group, lifelines, offsetY, activationWidth)

        return group
    }

    private renderActivations(group: G, lifelines: Lifeline[], endY: number, activationWidth: number) {
        const halfActivationWidth = activationWidth / 2
        const layer = group.group().back().attr({id: "activationsLayer"})
        for (const lifeline of lifelines) {
            // close off any left over activations
            while (lifeline.openActivations.length > 0) {
                const activation = lifeline.openActivations.pop()!
                activation.endY = endY
                lifeline.closedActivations.push(activation)
            }

            for (const { startY, endY, count } of lifeline.closedActivations) {
                const offsetX = count * halfActivationWidth
                layer.rect(activationWidth, endY - startY).y(startY).cx(lifeline.cx + offsetX).fill("#AFECFD").stroke("black").attr({"stroke-width": "0.5"}).back()
            }
        }
    }

    private renderTitle(offsetX: number, offsetY: number, totalWidth: number): G {
        const group = this._svg.group()
        const _text = drawText(group, this._diagram.title ?? "", this._options.title.textOptions)
        
        switch (this._options.title.textOptions.align) {
            case Align.left:
                group.move(offsetX, offsetY)
                break
            case Align.middle:
                group.cx(totalWidth / 2)
                group.y(offsetY)
                break
            case Align.right:
                group.move(totalWidth - this._options.padding - _text.bbox().width, offsetY)
                break
        }

        return group
    }

    private renderBackground(diagramWidth: number, diagramHeight: number) {
        const backgroundPattern = this._options.background as BackgroundPattern
        if (backgroundPattern && typeof backgroundPattern.pattern?.func === 'function') {
            const { pattern: { width: w, height: h, func } } = backgroundPattern
            const pattern = this._svg.pattern(w, h, func)
            this._svg.rect(diagramWidth, diagramHeight).fill(pattern).back()
        }

        if (this._options.background && typeof this._options.background === 'function') {
            const bgGroup = this._options.background(this._svg, diagramWidth, diagramHeight)
            bgGroup.back()
        }
    }

    render() {
        const { lifelines, maxHeight } = this.createLifelines()
        const participantMap = new Map<Participant, Lifeline>(lifelines.map(x => [x.participant!, x]))
        const elementY = this.layoutElements(lifelines, participantMap)

        // calc final lifeline spacing
        Renderer.spaceLifeLines(lifelines)

        // lifelines draw
        const lifelinesGroup = this.renderLifelines(lifelines, elementY, maxHeight)
        
        // elements draw
        const elementsGroup = this.renderElements(participantMap, lifelines)
        
        const diagramWidth = lifelines.at(-1)!.x + 2 * this._options.padding
        let offsetX = this._options.padding
        let offsetY = this._options.padding

        // title draw
        if (this._diagram.title) {
            const titleGroup = this.renderTitle(offsetX, offsetY, diagramWidth)
            offsetY += titleGroup.bbox().height + this._options.title.paddingBottom
        }

        // shift groups to their locations
        lifelinesGroup.move(offsetX, offsetY)
        elementsGroup.move(offsetX, offsetY + maxHeight)
        
        // resize diagram
        const diagramHeight = offsetY + lifelinesGroup.bbox().height + this._options.padding
        this._svg.size(diagramWidth+5000, diagramHeight+5000)

        // draw background
        this.renderBackground(diagramWidth, diagramHeight)
    }  
}