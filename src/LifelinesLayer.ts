//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Dimensions } from "./Dimensions"
import { MessagesLayer } from "./MessagesLayer"
import { DiagramOptions } from "./Options"
import { Renderer } from "./Renderer"
import { SequenceDiagram, ParticipantTypes } from "./SequenceDiagram"
import { IDiagramLayer, Lifeline } from "./SequenceDiagramRenderer"

export class LifelinesLayer implements IDiagramLayer {
    private _renderer: Renderer
    private _dimensions: Dimensions = Dimensions.None
    private _diagram: SequenceDiagram
    private _options: DiagramOptions
    private _lifelines: Lifeline[] = []
    private _lifelineIdMap: Map<any, any> = new Map()
    private _maxHeight: number = 0
    private _bodyHeight: number = 0

    constructor(renderer: Renderer, diagram: SequenceDiagram, options: DiagramOptions) {
        this._renderer = renderer
        this._diagram = diagram
        this._options = options
    }
    
    public get dimensions(): Dimensions { return this._dimensions }
    public get lifelines(): Lifeline[] { return this._lifelines }
    public get idMap(): Map<any, any> { return this._lifelineIdMap }
    public get maxHeight(): number { return this._maxHeight }

    private layoutLifelines() {
        this._maxHeight = 0, this._lifelines = []
        const { lifelines: {
                textBoxOptions: { textOptions : { align, ...fontOptions }, margin, padding },
                iconOptions: { width: iconWidth, paddingRight: iconPaddingRight },
        } } = this._options

        // Boundary lifelines are used to simplify edge calculations, they aren't rendered
        this._lifelines.push({x: 0, dimensions: Dimensions.None, spacing: new Map(), index: 0})

        let index = 0
        let offsetX = 0
        for (const participant of this._diagram.participants) {
            const bbox = this._renderer.getTextBBox(participant.alias ?? participant.id, fontOptions)
            const iconPadding = participant.type === ParticipantTypes.actor ? iconWidth + iconPaddingRight : 0

            const lifeline = {
                x: offsetX,
                dimensions: new Dimensions(
                    bbox.width + 2 * (margin + padding) + iconPadding,
                    bbox.height + 2 * (margin + padding)
                ),
                spacing: new Map(),
                index: this._lifelines.length,
            }

            this._lifelines.push(lifeline)
            this._lifelineIdMap.set(participant.id, lifeline)
            this._maxHeight = Math.max(this._maxHeight, lifeline.dimensions.height)
            offsetX += lifeline.dimensions.width
            index++
        }

        this._dimensions = new Dimensions(offsetX, 2 * this._maxHeight)

        // Right boundary
        this._lifelines.push({x: offsetX, dimensions: Dimensions.None, spacing: new Map(), index: this._lifelines.length})
    }

    private drawLifelines(startX: number, startY: number) {
        const { lifelines: { textBoxOptions, lineOptions } } = this._options
        const lifelines = this._lifelines.slice(1, this._lifelines.length - 1)
        
        for (const lifeline of lifelines) {
            const { x, dimensions, index } = lifeline
            const participant = this._diagram.participants[index-1]
            const { alias: text } = participant
            textBoxOptions.icon = participant.type === ParticipantTypes.actor ? this._renderer.icons.actor : undefined

            const offsetX = startX + x
            const y = startY + this._maxHeight - dimensions.height
            
            const svgTopBox = this._renderer.drawTextBox(text, offsetX, y, dimensions.width, dimensions.height, textBoxOptions)
            const svgBottomBox = this._renderer.drawTextBox(text, offsetX, y + dimensions.height + this._bodyHeight, dimensions.width, dimensions.height, textBoxOptions)
            const line = this._renderer.drawLine([
                [offsetX + dimensions.cx, startY + svgTopBox.bbox().height],
                [offsetX + dimensions.cx, svgBottomBox.bbox().y]], lineOptions)
            
            const svgGroup = this._renderer.draw.group()
            svgGroup.add(line)
            svgGroup.add(svgTopBox)
            svgGroup.add(svgBottomBox)
        }
    }

    private spaceLifeLines(layouts: Lifeline[]) {
        for (let sourceIndex = 0; sourceIndex < layouts.length; sourceIndex++) {
            const sourceLayout = layouts[sourceIndex]
            const spacings = [...sourceLayout.spacing].sort()

            for (const [targetIndex, width] of spacings) {
                const targetLayout = layouts[targetIndex]
                const scx = sourceLayout.x + sourceLayout.dimensions.cx
                const tcx = targetLayout.x + targetLayout.dimensions.cx
                const diff = width - Math.abs(tcx - scx) 
                if (diff > 0) {
                    // nudge right
                    for (let i = targetIndex; i < layouts.length; i++) {
                        layouts.at(i)!.x += diff
                    }
                }
            }
        }
    }

    calculateLayout(layers: IDiagramLayer[]) {
        this.layoutLifelines()
        this.spaceLifeLines(this._lifelines)
    }

    finaliseLayout(layers: IDiagramLayer[]) {
        if (this._dimensions === Dimensions.None) {
            return
        }

        this.spaceLifeLines(this._lifelines)

        this._dimensions.width = this._lifelines.at(-1)!.x

        const messagesLayer = layers.find(x => x instanceof MessagesLayer)! as MessagesLayer
        
        this._bodyHeight = messagesLayer.dimensions.height

        this._dimensions.height = this._bodyHeight + this._dimensions.height

    }

    render(offsetX: number, offsetY: number) {
        this.drawLifelines(offsetX, offsetY)
    }
}