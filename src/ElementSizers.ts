//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Svg } from "@svgdotjs/svg.js";
import { Dimensions } from "./Dimensions";
import { drawText } from "./ElementRenderers";
import { Align, DiagramOptions, TextBoxOptions } from "./Options";
import { Message } from "./SequenceDiagramParser";

export function sizeMessage(svg: Svg, markers: any, message: Message, options: DiagramOptions) {
    const { messages: { fontOptions, padding, arrowSpace } } = options
    let height = 2 * padding
    let width = height

    if (message.text && (message.text.trim() !== "")) {
        const text = drawText(svg, message.text, { align: Align.middle, ...fontOptions }) 
        const bbox = text.bbox()
        height += bbox.height + arrowSpace
        width += bbox.width
        text.remove()
    }

    const markerHeight = markers[message.arrow.head].attr("markerHeight") ?? 0
    height += markerHeight;
    return new Dimensions(width, height)
}

export function sizeSelfMessage(svg: Svg, message: Message, options: DiagramOptions) {
    const { messages: { fontOptions, selfArrowWidth, padding } } = options
    let height = 2 * padding
    let width = height + selfArrowWidth

    if (message.text && (message.text.trim() !== "")) {
        const text = drawText(svg, message.text, { align: Align.left, ...fontOptions }) 
        const bbox = text.bbox()
        height += bbox.height
        width += bbox.width
        text.remove()
    } else height += 10

    return new Dimensions(width, height)
}

export function sizeTextBox(svg: Svg, text: string, options: TextBoxOptions) {
    const { padding, margin, textOptions: { align, ...fontOptions } } = options
    const _text = drawText(svg, text, { align, ...fontOptions })
    const bbox = _text.bbox()
    _text.remove()

    const totalPadding = 2 * padding
    const totalMargin = 2 * margin

    return new Dimensions(
        bbox.width + totalPadding + totalMargin,
        bbox.height + totalPadding + totalMargin
    )
}