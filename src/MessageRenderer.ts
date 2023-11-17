//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Message } from "./SequenceDiagram"
import { Renderer } from './Renderer'
import { BodyElementHandler, Spacer, Points, Lifeline } from './SequenceDiagramRenderer'
import { Align, DiagramOptions } from "./Options"
import { Dimensions } from "./Dimensions"

export class MessageRenderer implements BodyElementHandler<Message> {
    private _options: DiagramOptions
    private _renderer: Renderer

    constructor(options: DiagramOptions, renderer: Renderer) {
        this._options = options
        this._renderer = renderer
    }

    private doSelfMessageLayout(item: Message): Dimensions {
        const { messages: { fontOptions, selfArrowWidth, padding } } = this._options
        const bbox = this._renderer.getTextBBox(item.text, fontOptions)
        const totalPadding = 2 * padding

        return new Dimensions(
            bbox.width + totalPadding + selfArrowWidth,
            bbox.height + totalPadding
        )
    }

    public doStandardMessageLayout(item: Message): Dimensions {
        const { messages: { fontOptions, arrowHeight, padding } } = this._options
        const bbox = this._renderer.getTextBBox(item.text, fontOptions)
        const totalPadding = 2 * padding

        return new Dimensions(
            bbox.width + totalPadding,
            bbox.height + totalPadding + arrowHeight
        )
    }

    public layout(item: Message, root: Lifeline, target: Lifeline, setSpacing: Spacer): Dimensions {
        if (root === target) {
            const dimensions = this.doSelfMessageLayout(item)
            setSpacing(root.index, root.index + 1, dimensions.width)
            return dimensions
        }

        const dimensions = this.doStandardMessageLayout(item)
        setSpacing(Math.min(root.index, target.index), Math.max(root.index, target.index), dimensions.width)
        return dimensions
    }

    private renderSelfMessage(offsetX: number, item: Message, root: Lifeline, target: Lifeline, y: number) {
        const { messages: { fontOptions, padding, arrowOptions, selfArrowWidth, arrowHeight } } = this._options
        const { arrow: { head, line } } = item
        const cx = root.x + root.dimensions.cx + offsetX

        const halfArrowWidth = arrowHeight / 2
        const text = this._renderer
            .drawText(item.text, 0, 0, { align: Align.left, ...fontOptions })
            .move(cx + selfArrowWidth + padding, y + padding)

        const arrowY = y + padding
        const points: Points = [
            [cx, arrowY + halfArrowWidth],
            [cx + selfArrowWidth, arrowY + halfArrowWidth],
            [cx + selfArrowWidth, arrowY + text.bbox().height - halfArrowWidth],
            [cx, arrowY + text.bbox().height - halfArrowWidth]
        ]
        const arrow = this._renderer.drawArrow(points, { ...arrowOptions, lineType: line, headType: head })
        const group = this._renderer.group()
        group.add(text)
        group.add(arrow)
    }

    private renderStandardMessage(offsetX: number, item: Message, root: Lifeline, target: Lifeline, y: number) {
        const { messages: { fontOptions, padding, arrowOptions, arrowSpace } } = this._options
        const { arrow: { head, line } } = item

        const rcx = root.x + root.dimensions.cx + offsetX
        const tcx = target.x + target.dimensions.cx + offsetX
        const gap = Math.abs(rcx - tcx)
        const x = Math.min(rcx, tcx)

        const text = this._renderer.drawText(item.text, 0, 0, { align: Align.middle, ...fontOptions })
        text.y(y + padding)
        text.cx(x + gap / 2)

        const arrowY = y + text.bbox().height + arrowSpace
        const arrow = this._renderer.drawArrow([[rcx, arrowY], [tcx, arrowY]], {
            ...arrowOptions, lineType: line, headType: head
        })

        const group = this._renderer.group()
        group.add(text)
        group.add(arrow)
    }

    public render(offsetX: number, item: Message, root: Lifeline, target: Lifeline, y: number, dimensions: Dimensions) {
        if (root === target) {
            this.renderSelfMessage(offsetX, item, root, target, y)
            return
        }

        this.renderStandardMessage(offsetX, item, root, target, y)
    }
}
