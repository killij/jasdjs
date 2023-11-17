//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Dimensions } from "./Dimensions"
import { LifelinesLayer } from "./LifelinesLayer"
import { MessageRenderer } from "./MessageRenderer"
import { NoteRenderer } from "./NoteRenderer"
import { DiagramOptions } from "./Options"
import { Renderer } from "./Renderer"
import { SequenceDiagram, Element, SegmentTypes as ElementTypes } from "./SequenceDiagram"
import { IDiagramLayer, SpacerFunc } from "./SequenceDiagramRenderer"

export class MessagesLayer implements IDiagramLayer {
    private _renderer: Renderer
    private _dimensions: Dimensions = Dimensions.None
    private _diagram: SequenceDiagram
    private _options: DiagramOptions
    private _dimensionsMap: Map<Element, Dimensions> = new Map()
    private _lifelinesLayer?: LifelinesLayer

    constructor(renderer: Renderer, diagram: SequenceDiagram, options: DiagramOptions) {
        this._renderer = renderer
        this._diagram = diagram
        this._options = options
    }
    
    public get dimensions(): Dimensions { return this._dimensions }    

    private spacer() : SpacerFunc
    {
        return (leftIndex: number, rightIndex: number, width: number) => {
            const leftLayout = this._lifelinesLayer!.lifelines.at(leftIndex)!
            if (width > (leftLayout.spacing.get(rightIndex) ?? 0)) {
                leftLayout.spacing.set(rightIndex, width)
            }
        }
    }

    private layoutBody() {
        let height = 0
        this._dimensionsMap.clear()

        for (const element of this._diagram.elements) {
            switch (element.type) {
                case ElementTypes.message: {
                    const handler = new MessageRenderer(this._options, this._renderer)
                    const rootLifeline = this._lifelinesLayer!.idMap.get(element.source.id)!
                    const targetLifeline = this._lifelinesLayer!.idMap.get(element.target.id)!
                    const dimensions = handler.layout(element, rootLifeline, targetLifeline, this.spacer())
                    this._dimensionsMap.set(element, dimensions)
                    height += dimensions.height
                    break
                }
                case ElementTypes.note: {
                    const handler = new NoteRenderer(this._options, this._renderer)
                    const targetLifeline = this._lifelinesLayer!.idMap.get(element.target[0].id)!
                    const dimensions = handler.layout(element, targetLifeline, targetLifeline, this.spacer())
                    this._dimensionsMap.set(element, dimensions)
                    height += dimensions.height
                    break
                }
            }
        }

        this._dimensions = new Dimensions(0, height)
    }

    private drawBody(startX: number, startY: number) {
        for (const element of this._diagram.elements) {
            const dimensions = this._dimensionsMap.get(element)!

            switch (element.type) {
                case ElementTypes.message: {
                    const handler = new MessageRenderer(this._options, this._renderer)
                    const rootLifeline = this._lifelinesLayer!.idMap.get(element.source.id)!
                    const targetLifeline = this._lifelinesLayer!.idMap.get(element.target.id)!
                    
                    handler.render(startX, element, rootLifeline, targetLifeline, startY, dimensions)
                    startY += dimensions.height
                    break
                }
                case ElementTypes.note: {
                    const handler = new NoteRenderer(this._options, this._renderer)
                    const rootLifeline = this._lifelinesLayer!.idMap.get(element.target[0].id)!
                    const targetLifeline = element.target.length > 1 ? this._lifelinesLayer!.idMap.get(element.target[1].id)! : rootLifeline
                    handler.render(startX, element, rootLifeline, targetLifeline, startY, dimensions)
                    startY += dimensions.height
                    break
                }
            }
        }
    }

    calculateLayout(dependencies: IDiagramLayer[]) {
        this._lifelinesLayer = dependencies.find(x => x instanceof LifelinesLayer)! as LifelinesLayer
        this.layoutBody()
        
    }

    finaliseLayout(layers: IDiagramLayer[]) {
        if (this._dimensions === Dimensions.None) {
            return
        }

        this._dimensions.width = this._lifelinesLayer!.lifelines.at(-1)!.x
    }

    render(offsetX: number, offsetY: number) {
        this.drawBody(offsetX, offsetY)
    }
}