//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Dimensions } from "./Dimensions"
import { Align, DiagramOptions } from "./Options"
import { Renderer } from "./Renderer"
import { SequenceDiagram } from "./SequenceDiagram"
import { IDiagramLayer } from "./SequenceDiagramRenderer"

export class TitleLayer implements IDiagramLayer {
    private _renderer: Renderer
    private _dimensions: Dimensions = Dimensions.None
    private _diagram: SequenceDiagram
    private _options: DiagramOptions

    constructor(renderer: Renderer, diagram: SequenceDiagram, options: DiagramOptions) {
        this._renderer = renderer
        this._diagram = diagram
        this._options = options
    }
    
    public get dimensions(): Dimensions { return this._dimensions }

    calculateLayout() {
        if (!this._diagram.title) {
            return
        }

        const { title: { textOptions, paddingBottom } } = this._options

        const bbox = this._renderer.getTextBBox(this._diagram.title, textOptions)
        this._dimensions = new Dimensions(bbox.width, bbox.height + paddingBottom)
    }

    finaliseLayout(layers: IDiagramLayer[]) {
        if (this._dimensions === Dimensions.None) {
            return
        }

        for (const layer of layers) {
            if (layer === this) {
                continue
            }
            
            if (layer.dimensions.width > this._dimensions.width) {
                this._dimensions.width = layer.dimensions.width
            }
        }
    }

    render(offsetX: number, offsetY: number) {
        if (this._dimensions === Dimensions.None) {
            return
        }

        const { title: { textOptions: { align, ...fontOptions } } } = this._options
        
        const svgText = this._renderer.draw
            .text(this._diagram.title!)
            .font(fontOptions)
            .y(offsetY)

        switch (align) {
            case Align.middle: {
                svgText.x(offsetX + this._dimensions.cx).attr({ "text-anchor": "middle" })
                break
            }
            case Align.right: {
                svgText.x(offsetX + this._dimensions.width - svgText.bbox().width).attr({ "text-anchor": "end" })
                break
            }
            default: {
                svgText.x(offsetX)
                break
            }
        }
    }
}