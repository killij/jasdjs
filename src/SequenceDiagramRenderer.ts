//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Box, G, Marker, SVG, Svg } from '@svgdotjs/svg.js'
import { Participant, ParticipantTypes, SequenceDiagram } from "./SequenceDiagram"
import { Renderer } from './Renderer'

import { Options, DeepPartial, DiagramOptions, BackgroundPattern, Align, TextOptions, TextBoxOptions } from './Options'

import { Dimensions } from './Dimensions'
import { TitleLayer } from './TitleLayer'
import { LifelinesLayer } from './LifelinesLayer'
import { MessagesLayer } from './MessagesLayer'
import { drawActor, drawText, drawTextBox } from './ElementRenderers'

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

        for (const layer of layers) {
            layer.finaliseLayout(layers)            
        }

        let height = 2 * padding + titleLayer.dimensions.height + 2 * lifelinesLayer.maxHeight + messageLayer.dimensions.height
        let width = Math.max(titleLayer.dimensions.width, lifelinesLayer.dimensions.width) + 2 * padding
        this._renderer.resize(width, height)

        const backgroundPattern = this._options.background as BackgroundPattern
        if (backgroundPattern && typeof backgroundPattern.pattern?.func === 'function') {
            const { pattern: { width: w, height: h, func } } = backgroundPattern
            const pattern = this._renderer.draw.pattern(w, h, func)
            this._renderer.draw.rect(width, height).fill(pattern)
        }

        let offsetY = this._options.padding
        titleLayer.render(this._options.padding, offsetY)
        offsetY += titleLayer.dimensions.height

        lifelinesLayer.render(this._options.padding, offsetY)
        offsetY += lifelinesLayer.maxHeight

        messageLayer.render(this._options.padding, offsetY)


        // lifelines initial spacing
        const lifelines = this.createLifelines()
         

        // elements initial layout

        // lifelines finalise spacing

        // lifelines draw

        // for (const lifeline of lifelines) {
        //     const g = drawLifeline(this._renderer.draw, lifeline, this._options.lifelines)
        // }



        // elements draw

        // title layout/draw
        // title transform
        // lifelines/elements transform


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

        // move elements/lifelines
    }

    private createLifelines(): Lifeline[] {
        const lifelines: Lifeline[] = []
        let offsetX = 0
    
        // push a fake left boundary
        lifelines.push({ x: 0, index: 0, spacing: new Map(), dimensions: new Dimensions(0, 0) })
    
        for (const participant of this._diagram.participants) {
            let el: G
            switch (participant.type) {
                case ParticipantTypes.lifeline: el = drawTextBox(this._renderer.draw, participant.alias, this._options.lifelines.textBoxOptions); break
                case ParticipantTypes.actor: el = drawActor(this._renderer.draw, participant.alias, this._renderer.icons.actor, this._options.lifelines.textBoxOptions); break
            }
    
            const bbox = el.bbox()
            el.remove()
            lifelines.push({
                x: offsetX,
                index: lifelines.length,
                spacing: new Map(),
                dimensions: new Dimensions(bbox.width, bbox.height)
            })
                
            offsetX += bbox.width
        }
    
        // push a fake right boundary
        lifelines.push({ x: 0, index: lifelines.length, spacing: new Map(), dimensions: new Dimensions(0, 0) })
    
        this.spaceLifeLines(lifelines)
        return lifelines
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

export interface Lifeline {
    x: number
    dimensions: Dimensions
    spacing: Map<number, number>
    index: number
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

