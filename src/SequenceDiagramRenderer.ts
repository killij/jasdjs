//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { G, SVG, Svg } from '@svgdotjs/svg.js'
import { SequenceDiagram } from "./SequenceDiagram"
import { Renderer } from './Renderer'

import { Options, DeepPartial, DiagramOptions, BackgroundPattern, Align, TextOptions } from './Options'

import { Dimensions } from './Dimensions'
import { TitleLayer } from './TitleLayer'
import { LifelinesLayer } from './LifelinesLayer'
import { MessagesLayer } from './MessagesLayer'
import { renderTitle } from './ElementRenderers'

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

        // elements initial layout

        // lifelines finalise spacing

        // lifelines draw
        // elements draw

        // title layout/draw
        // title transform
        // lifelines/elements transform

        let oX = this._options.padding
        let oY = this._options.padding
        const totalWidth = width;



        if (this._diagram.title) {
            // draw title
            const g = renderTitle(
                this._renderer.draw,
                this._diagram.title,
                this._options.title.textOptions)
            
            // move into position
            switch (this._options.title.textOptions.align) {
                case Align.left:
                    g.transform({ translateX: oX, translateY: oY })
                    break
                case Align.middle:
                    const titleCx = totalWidth / 2
                    g.transform({ translateX: titleCx, translateY: oY })
                    break
                case Align.right:
                    const titleX = totalWidth - this._options.padding
                    g.transform({ translateX: titleX, translateY: oY })
                    break
            }

            // update Y offset
            oY += g.bbox().height + this._options.title.paddingBottom
        }

        // move elements/lifelines
        
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