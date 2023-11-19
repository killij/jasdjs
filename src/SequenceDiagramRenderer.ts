//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { G, SVG } from '@svgdotjs/svg.js'
import { Participant, ParticipantTypes, ElementTypes, SequenceDiagram, NoteLocations } from "./SequenceDiagram"
import { Renderer } from './Renderer'
import { Options, DeepPartial, DiagramOptions, BackgroundPattern, Align } from './Options'
import { Dimensions } from './Dimensions'
import { drawLifeline, drawMessage, drawSelfMessage, drawText, drawTextBox } from './ElementRenderers'
import { sizeMessage, sizeSelfMessage } from './ElementSizers'

type Point = [number, number]

export type Points = Point[]

interface LifeLines {
    lifelines: Lifeline[]
    maxHeight: number
}

export interface Lifeline {
    x: number
    dimensions: Dimensions
    spacing: Map<number, number>
    index: number
    participant?: Participant
}

export default class SequenceDiagramRenderer {
    private _options: DiagramOptions
    private _diagram: SequenceDiagram
    private _container: HTMLElement
    private _renderer: Renderer

    constructor (diagram: SequenceDiagram, container: HTMLElement, options: DeepPartial<DiagramOptions>) {
        if (!diagram) throw new Error("Invalid parameter: diagram must be specified")
        if (!container) throw new Error("Invalid parameter: container must be specified")
        
        this._container = container
        this._container.innerHTML = ''
        const draw = SVG().addTo(container)

        this._diagram = diagram
        this._options = Options.From(options)
        this._renderer = new Renderer(draw)
    }

    render() {
        // lifelines initial spacing
        const { lifelines, maxHeight } = this.createLifelines()

        const participantMap = new Map<Participant, Lifeline>()
        for (const lifeline of lifelines) {
            participantMap.set(lifeline.participant!, lifeline)
        }

        let eX = 0
        let eY = 0

        // elements initial layout
        for (const element of this._diagram.elements) {
            switch (element.type) {
                case ElementTypes.message:
                    const isSelfMessage = element.source === element.target
                    const d = isSelfMessage
                        ? sizeSelfMessage(this._renderer.draw, element.text, this._options)
                        : sizeMessage(this._renderer.draw, element.text, this._options)

                    if (isSelfMessage) {
                        SequenceDiagramRenderer.setSpacing(lifelines, participantMap.get(element.source)!.index, participantMap.get(element.target)!.index + 1, d.width)
                    } else {
                        SequenceDiagramRenderer.setSpacing(lifelines, participantMap.get(element.source)!.index, participantMap.get(element.target)!.index, d.width)
                    }
                    eY += d.height
                    break
                case ElementTypes.note:
                    const { overlap, textBoxOptions: { textOptions: { align, ...fontOptions }, padding, margin } } = this._options.notes
                    const note = drawTextBox(this._renderer.draw, element.text, this._options.notes.textBoxOptions).move(0,0)
                    const noteBbox = note.bbox()
                    note.remove()
                    
                    let sourceIndex = -1
                    switch (element.location) {
                        case (NoteLocations.leftOf):
                            sourceIndex = participantMap.get(element.target[0])!.index
                            SequenceDiagramRenderer.setSpacing(lifelines, sourceIndex, sourceIndex - 1, noteBbox.width)
                            break;
                        case (NoteLocations.rightOf):
                            sourceIndex = participantMap.get(element.target[0])!.index
                            SequenceDiagramRenderer.setSpacing(lifelines, sourceIndex, sourceIndex + 1, noteBbox.width)
                            break;
                        case (NoteLocations.over):
                            sourceIndex = participantMap.get(element.target[0])!.index
                            let targetIndex = sourceIndex
                            if (element.target.length === 1) {
                                SequenceDiagramRenderer.setSpacing(lifelines, targetIndex-1, targetIndex, noteBbox.width / 2)
                                SequenceDiagramRenderer.setSpacing(lifelines, targetIndex, targetIndex+1, noteBbox.width / 2)
                            } else {
                                targetIndex = participantMap.get(element.target[1])!.index
                                SequenceDiagramRenderer.setSpacing(lifelines, sourceIndex, targetIndex, noteBbox.width - 2 * overlap)
                            }
                            break;
                    }

                    eY += noteBbox.height
                    break
            }
        }
        
        // lifelines finalise spacing
        SequenceDiagramRenderer.spaceLifeLines(lifelines)

        // lifelines draw
        const lifelinesGroup = this._renderer.draw.group()

        for (const lifeline of lifelines.slice(1, lifelines.length - 1)) {
            const lifelineGroup = drawLifeline(lifelinesGroup, lifeline, eY, this._renderer.icons.actor, this._options.lifelines)
            lifelineGroup.translate(lifeline.x, maxHeight - lifelineGroup.children()[1].bbox().height)
        }
        lifelinesGroup.rect(1, 1).fill("none").stroke("none").move(0,0).front()

        // elements draw
        const messagesGroup = this._renderer.draw.group()
        messagesGroup.rect(lifelinesGroup.bbox().width, eY).stroke("none").fill("none").move(0,0)
        let elY = 0
        for (const element of this._diagram.elements) {
            switch (element.type) {
                case ElementTypes.message:
                    const source = participantMap.get(element.source)!
                    const target = participantMap.get(element.target)!
                    const message = source === target
                        ? drawSelfMessage(messagesGroup, this._renderer.markers, element, source, this._options.messages)
                        : drawMessage(messagesGroup, this._renderer.markers, element, source, target, this._options.messages)

                    const left = source.index < target.index ? source : target
                    message.translate(left.x + left.dimensions.cx, elY)
                    
                    // debug
                    //message.rect(message.bbox().width, message.bbox().height).move(0,0).fill("none").stroke("none")
                    
                    elY += message.bbox().height
                    break
                case ElementTypes.note:
                    const noteSource = participantMap.get(element.target[0])!

                    switch (element.location) {
                        case NoteLocations.leftOf:
                            this._options.notes.textBoxOptions.textOptions.align = Align.right
                            const leftOfNote = drawTextBox(messagesGroup, element.text, this._options.notes.textBoxOptions).move(0,0)
                            
                            leftOfNote.translate(noteSource.x + noteSource.dimensions.cx - leftOfNote.bbox().width, elY)
                            elY += leftOfNote.bbox().height ?? 0
                            break
                        case NoteLocations.over:
                            this._options.notes.textBoxOptions.textOptions.align = Align.middle
                            const source = participantMap.get(element.target[0])!
                            const target = element.target.length === 1
                                ? source
                                : participantMap.get(element.target[1])!
                            const minimumWidth = Math.abs(source.x + source.dimensions.cx - (target.x + target.dimensions.cx)) + 2 * this._options.notes.textBoxOptions.margin
                            const overNote = drawTextBox(messagesGroup, element.text, this._options.notes.textBoxOptions, minimumWidth).move(0,0)

                            if (element.target.length === 1) {
                                overNote.y(elY)
                                overNote.cx(source.x + source.dimensions.cx)
                            } else {
                                const left = source.x < target.x ? source : target
                                overNote.translate(left.x + left.dimensions.cx - this._options.notes.overlap, elY)
                                overNote.addClass("jasd-over-note")
                            }
                            elY += overNote.bbox().height ?? 0
                            break
                        case NoteLocations.rightOf:
                            this._options.notes.textBoxOptions.textOptions.align = Align.left
                            const rightOfNote = drawTextBox(messagesGroup, element.text, this._options.notes.textBoxOptions).move(0,0)
                            
                            rightOfNote.translate(noteSource.x + noteSource.dimensions.cx, elY)
                            elY += rightOfNote.bbox().height ?? 0
                            break
                    }
                    break
            }
        }
        
        // title layout/draw
        // title transform
        const diagramWidth = lifelines.at(-1)!.x + 2 * this._options.padding
        let oX = this._options.padding
        let oY = this._options.padding
        const totalWidth = diagramWidth;

        if (this._diagram.title) {
            // draw title
            const g = this._renderer.draw.group()
            const t = drawText(
                this._renderer.draw,
                this._diagram.title,
                this._options.title.textOptions)
            g.add(t)
            
            // move into position
            switch (this._options.title.textOptions.align) {
                case Align.left:
                    g.translate(oX, oY)
                    break
                case Align.middle:
                    g.translate(totalWidth / 2, oY)
                    break
                case Align.right:
                    g.translate(totalWidth - this._options.padding, oY)
                    break
            }

            // update Y offset
            oY += g.bbox().height + this._options.title.paddingBottom
        }
        this._options.messages

        // lifelines/elements transform
        lifelinesGroup.move(oX, oY)
        messagesGroup.move(oX, oY + maxHeight)
        
        // resize diagram and draw background
        const diagramHeight = oY + lifelinesGroup.bbox().height + this._options.padding
        this._renderer.resize(diagramWidth, diagramHeight)

        const backgroundPattern = this._options.background as BackgroundPattern
        if (backgroundPattern && typeof backgroundPattern.pattern?.func === 'function') {
            const { pattern: { width: w, height: h, func } } = backgroundPattern
            const pattern = this._renderer.draw.pattern(w, h, func)
            this._renderer.draw.rect(diagramWidth, diagramHeight).fill(pattern).back()
        }
    }

    private createLifelines(): LifeLines {
        const lifelines: Lifeline[] = []
        let offsetX = 0
        let maxHeight = 0
    
        // push a fake left boundary
        lifelines.push({ x: 0, index: 0, spacing: new Map(), dimensions: new Dimensions(0, 0) })
    
        for (const participant of this._diagram.participants) {
            let el: G
            switch (participant.type) {
                case ParticipantTypes.lifeline: el = drawTextBox(this._renderer.draw, participant.alias, this._options.lifelines.textBoxOptions); break
                case ParticipantTypes.actor: el = drawTextBox(this._renderer.draw, participant.alias, this._options.lifelines.textBoxOptions); break
                //case ParticipantTypes.actor: el = drawActor(this._renderer.draw, participant.alias, this._renderer.icons.actor, this._options.lifelines.textBoxOptions); break
            }
    
            const bbox = el.bbox()
            el.remove()
            lifelines.push({
                x: offsetX,
                index: lifelines.length,
                spacing: new Map(),
                dimensions: new Dimensions(bbox.width, bbox.height),
                participant
            })

            maxHeight = Math.max(maxHeight, bbox.height)
            offsetX += bbox.width
        }
    
        // push a fake right boundary
        lifelines.push({ x: offsetX, index: lifelines.length, spacing: new Map(), dimensions: new Dimensions(0, 0) })
    
        SequenceDiagramRenderer.spaceLifeLines(lifelines)
        return { 
            lifelines,
            maxHeight
        }
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
}