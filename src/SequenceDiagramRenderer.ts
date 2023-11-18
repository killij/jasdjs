//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Box, G, Marker, Polyline, SVG, Svg } from '@svgdotjs/svg.js'
import { Participant, ParticipantTypes, ElementTypes, SequenceDiagram, NoteLocations, Message } from "./SequenceDiagram"
import { Renderer } from './Renderer'

import { Options, DeepPartial, DiagramOptions, BackgroundPattern, Align, TextOptions, TextBoxOptions, LifelineOptions, LineOptions, MessageOptions, ArrowOptions } from './Options'

import { Dimensions } from './Dimensions'
import { TitleLayer } from './TitleLayer'
import { LifelinesLayer } from './LifelinesLayer'
import { MessagesLayer } from './MessagesLayer'
import { drawActor, drawArrow, drawLifeline, drawLine, drawMessage, drawSelfMessage, drawText, drawTextBox } from './ElementRenderers'
import { sizeMessage, sizeSelfMessage } from './ElementSizers'

export interface BodyElementHandler<T> {
    layout(item: T, root: Lifeline, target: Lifeline, setSpacing: Spacer): Dimensions
    render(offsetX: number, item: T, root: Lifeline, target: Lifeline, y: number, dimensions: Dimensions): void
}

export interface Spacer {
    (left: number, right: number, width: number): void
}

type Point = [number, number]

export type Points = Point[]

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
        const { padding } = this._options
        const titleLayer = new TitleLayer(this._renderer, this._diagram, this._options)
        const lifelinesLayer = new LifelinesLayer(this._renderer, this._diagram, this._options)
        const messageLayer = new MessagesLayer(this._renderer, this._diagram, this._options)
        const layers: IDiagramLayer[] = [titleLayer, lifelinesLayer, messageLayer]

        for (const layer of layers) {
            layer.calculateLayout(layers)
        }

        console.log(lifelinesLayer.lifelines)

        for (const layer of layers) {
            layer.finaliseLayout(layers)            
        }

        let height = 2 * padding + titleLayer.dimensions.height + 2 * lifelinesLayer.maxHeight + messageLayer.dimensions.height
        let width = Math.max(titleLayer.dimensions.width, lifelinesLayer.dimensions.width) + 2 * padding
        this._renderer.resize(width + 200, height + 200)

        const backgroundPattern = this._options.background as BackgroundPattern
        if (backgroundPattern && typeof backgroundPattern.pattern?.func === 'function') {
            const { pattern: { width: w, height: h, func } } = backgroundPattern
            const pattern = this._renderer.draw.pattern(w, h, func)
            this._renderer.draw.rect(width, height).fill(pattern)
        }

        let offsetY = this._options.padding
        //titleLayer.render(this._options.padding, offsetY)
        offsetY += titleLayer.dimensions.height

        //lifelinesLayer.render(this._options.padding, offsetY)
        offsetY += lifelinesLayer.maxHeight

        //messageLayer.render(this._options.padding, offsetY)
        
        console.log(lifelinesLayer.lifelines)


        // ==========================================================================================
        // ==========================================================================================
        // ==========================================================================================
        // ==========================================================================================
        // ==========================================================================================
        // ==========================================================================================
        // ==========================================================================================
        // ==========================================================================================
        // ==========================================================================================
        // ==========================================================================================
        // ==========================================================================================


        // lifelines initial spacing
        const { lifelines, maxHeight } = this.createLifelines()

        const participantMap = new Map<Participant, Lifeline>()
        for (const lifeline of lifelines) {
            participantMap.set(lifeline.participant!, lifeline)
        }

        let eX = 0
        let eY = 0
        const elementDimensions = new Map()
        console.log("ll -1", JSON.stringify(lifelines, null, 4))

        // elements initial layout
        for (const element of this._diagram.elements) {
            switch (element.type) {
                case ElementTypes.message:
                    const isSelfMessage = element.source === element.target
                    const d = isSelfMessage
                        ? sizeSelfMessage(this._renderer.draw, element.text, this._options)
                        : sizeMessage(this._renderer.draw, element.text, this._options)
                    elementDimensions.set(element, d)
                    if (isSelfMessage) {
                        setSpacing(lifelines, participantMap.get(element.source)!.index, participantMap.get(element.target)!.index + 1, d.width)
                    } else {
                        setSpacing(lifelines, participantMap.get(element.source)!.index, participantMap.get(element.target)!.index, d.width)
                    }
                    eY += d.height
                    break
                case ElementTypes.note:
                    // const { overlap, textBoxOptions: { textOptions: { align, ...fontOptions }, padding, margin } } = this._options.notes
                    // const bbox = this._renderer.getTextBBox(element.text, fontOptions)
                    // const space = 2 * (margin + padding)
                    // const dimensions = new Dimensions(bbox.width + space, bbox.height + space)

                    // let sourceIndex = -1
                    // switch (element.location) {
                    //     case (NoteLocations.leftOf):
                    //         sourceIndex = participantMap.get(element.target[0])!.index
                    //         setSpacing(lifelines, sourceIndex, sourceIndex - 1, dimensions.width)
                    //         break;
                    //     case (NoteLocations.rightOf):
                    //         sourceIndex = participantMap.get(element.target[0])!.index
                    //         setSpacing(lifelines, sourceIndex, sourceIndex + 1, dimensions.width)
                    //         break;
                    //     case (NoteLocations.over):
                    //         sourceIndex = participantMap.get(element.target[0])!.index
                    //         let targetIndex = sourceIndex
                    //         if (element.target.length === 1) {
                    //             setSpacing(lifelines, sourceIndex-1, targetIndex-1, dimensions.width / 2)
                    //             setSpacing(lifelines, sourceIndex, targetIndex, dimensions.width / 2)
                    //         } else {
                    //             targetIndex = participantMap.get(element.target[1])!.index
                    //             setSpacing(lifelines, sourceIndex, targetIndex, dimensions.width - 2 * overlap)
                    //         }
                    //         break;
                    // }
                    // eY += dimensions.height
                    break
            }
        }
        
        console.log("ll 0", JSON.stringify(lifelines, null, 4))
        // lifelines finalise spacing
        this.spaceLifeLines(lifelines)

        // lifelines draw
        const lifelinesGroup = this._renderer.draw.group()
        for (const lifeline of lifelines.slice(1, lifelines.length - 1)) {
            const lifelineGroup = drawLifeline(lifelinesGroup, lifeline, eY, this._renderer.icons.actor, this._options.lifelines)
            lifelineGroup.translate(lifeline.x, maxHeight - lifelineGroup.children()[1].bbox().height)
        }
        //lifelinesGroup.rect(lifelinesGroup.bbox().width, lifelinesGroup.bbox().height).fill("none").stroke("green").move(0,0).front()

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
                    //message.rect(message.bbox().width, message.bbox().height).move(0,0).fill("none").stroke("red")
                    
                    elY += message.bbox().height
                    break
                case ElementTypes.note:
                    break
            }
        }
        
        // title layout/draw
        // title transform
        let oX = this._options.padding
        let oY = this._options.padding
        const totalWidth = width;

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
        console.log("ll 1", JSON.stringify(lifelines, null, 4))
        console.log("ll 1", lifelines)
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
    
        this.spaceLifeLines(lifelines)
        return { 
            lifelines,
            maxHeight
        }
    }

    private spaceLifeLines(lifelines: Lifeline[]) {
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
}



function setSpacing(lifelines: Lifeline[], sourceIndex: number, targetIndex: number, width: number) {
    const leftIndex = Math.min(sourceIndex, targetIndex)
    const rightIndex = Math.max(sourceIndex, targetIndex)
    const left = lifelines[leftIndex]
    if (width > (left.spacing.get(rightIndex) ?? 0)) {
        left.spacing.set(rightIndex, width)
    }
}

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

export type SpacerFunc = {
    (leftIndex: number, rightIndex: number, width: number): void
}

export interface IDiagramLayer {
    dimensions: Dimensions
    calculateLayout(dependencies: IDiagramLayer[]): void
    finaliseLayout(layers: IDiagramLayer[]): void
    render(offsetX: number, offsetY: number): void
}