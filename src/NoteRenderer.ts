//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Note, NoteLocations } from "./SequenceDiagram"
import { Renderer } from './Renderer'
import { BodyElementHandler, Lifeline, Spacer } from './SequenceDiagramRenderer'
import { G } from "@svgdotjs/svg.js"
import { Align, DiagramOptions } from "./Options"
import { Dimensions } from "./Dimensions"

export class NoteRenderer implements BodyElementHandler<Note> {
    private _options: DiagramOptions
    private _renderer: Renderer

    constructor(options: DiagramOptions, renderer: Renderer) {
        this._options = options
        this._renderer = renderer
    }

    private layoutLeftOfNote(item: Note, root: Lifeline, target: Lifeline, setSpacing: Spacer): Dimensions {
        const { textBoxOptions: { textOptions: { align, ...fontOptions }, padding, margin } } = this._options.notes
        const bbox = this._renderer.getTextBBox(item.text, fontOptions)
        const space = 2 * (margin + padding)
        const dimensions = new Dimensions(bbox.width + space, bbox.height + space)

        let leftIndex = Math.min(root.index, target.index) - 1
        let rightIndex = leftIndex + 1    
        setSpacing(leftIndex, rightIndex, dimensions.width)
        return dimensions
    }

    private layoutRightOfNote(item: Note, root: Lifeline, target: Lifeline, setSpacing: Spacer): Dimensions {
        const { textBoxOptions: { textOptions: { align, ...fontOptions }, padding, margin } } = this._options.notes
        const bbox = this._renderer.getTextBBox(item.text, fontOptions)
        const space = 2 * (margin + padding)
        const dimensions = new Dimensions(bbox.width + space, bbox.height + space)

        let leftIndex = Math.min(root.index, target.index)
        let rightIndex = leftIndex + 1
        setSpacing(leftIndex, rightIndex, dimensions.width)
        return dimensions
    }

    private layoutOverNote(item: Note, root: Lifeline, target: Lifeline, setSpacing: Spacer): Dimensions {
        const { overlap, textBoxOptions: { textOptions: { align, ...fontOptions }, padding, margin } } = this._options.notes
        const bbox = this._renderer.getTextBBox(item.text, fontOptions)
        const space = 2 * (margin + padding)
        const dimensions = new Dimensions(bbox.width + space, bbox.height + space)

        let leftIndex = Math.min(root.index, target.index)
        let rightIndex = Math.max(root.index, target.index) + 1

        if (item.target.length === 1) {
            setSpacing(leftIndex-1, rightIndex-1, dimensions.width / 2)
            setSpacing(leftIndex, rightIndex, dimensions.width / 2)
        } else {
            setSpacing(leftIndex, rightIndex, dimensions.width - 2 * overlap)
        }
        return dimensions
    }

    public layout(item: Note, root: Lifeline, target: Lifeline, setSpacing: Spacer): Dimensions {
        switch (item.location) {
            case NoteLocations.leftOf: return this.layoutLeftOfNote(item, root, target, setSpacing)
            case NoteLocations.over: return this.layoutOverNote(item, root, target, setSpacing)
            case NoteLocations.rightOf: return this.layoutRightOfNote(item, root, target, setSpacing)
        }
    }

    private renderLeftOfNote(offsetX: number, item: Note, root: Lifeline, target: Lifeline, y: number, dimensions: Dimensions) : G {
        const { textBoxOptions } = this._options.notes
        let x = root.x + root.dimensions.cx + offsetX
        let width = dimensions.width

        x -= dimensions.width
        textBoxOptions.textOptions.align = Align.right
        const textBox = this._renderer.drawTextBox(item.text, x, y, width, dimensions.height, textBoxOptions)
        return textBox
    }

    private renderRightOfNote(offsetX: number, item: Note, root: Lifeline, target: Lifeline, y: number, dimensions: Dimensions) : G {
        const { textBoxOptions } = this._options.notes
        let x = root.x + root.dimensions.cx + offsetX
        let width = dimensions.width

        textBoxOptions.textOptions.align = Align.left
        return this._renderer.drawTextBox(item.text, x, y, width, dimensions.height, textBoxOptions)
    }

    private renderOverNote(offsetX: number, item: Note, root: Lifeline, target: Lifeline, y: number, dimensions: Dimensions) : G {
        const { textBoxOptions, overlap } = this._options.notes
        const rcx = root.x + root.dimensions.cx
        const tcx = target.x + target.dimensions.cx
        let x = root.x + root.dimensions.cx + offsetX
        let width = dimensions.width
        let shouldCenter = false

        if (item.target.length === 1) {
            x -= dimensions.width / 2
        } else {
            x -= overlap
            const minGap = Math.abs(rcx - tcx) + 2 * overlap
            if (width < minGap) {
                width = minGap
                shouldCenter = true
            }
        }

        textBoxOptions.textOptions.align = Align.middle
        const textBox = this._renderer.drawTextBox(item.text, x, y, width, dimensions.height, textBoxOptions)
        if (shouldCenter) {
            // TODO: this is a hack
            const rcx = root.x + root.dimensions.cx
            const tcx = target.x + target.dimensions.cx
            textBox.children()[1].cx(Math.abs(rcx - tcx) / 2 + Math.min(rcx, tcx) )
        }
        return textBox
    }

    public render(offsetX: number, item: Note, root: Lifeline, target: Lifeline, y: number, dimensions: Dimensions) {
        let textBox: G | undefined
        
        switch (item.location) {
            case NoteLocations.leftOf:
                textBox = this.renderLeftOfNote(offsetX, item, root, target, y, dimensions)
                break
            case NoteLocations.over:
                textBox = this.renderOverNote(offsetX, item, root, target, y, dimensions)
                break
            case NoteLocations.rightOf:
                textBox = this.renderRightOfNote(offsetX, item, root, target, y, dimensions)
                break
        }

        textBox?.addClass("jasd-note")
    }
}
