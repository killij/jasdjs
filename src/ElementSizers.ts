//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { Svg } from "@svgdotjs/svg.js";
import { Dimensions } from "./Dimensions";
import { drawText } from "./ElementRenderers";
import { Align, DiagramOptions, TextBoxOptions } from "./Options";

export function sizeMessage(svg: Svg, text: string, options: DiagramOptions) {
    const { messages: { fontOptions, arrowHeight, padding, arrowSpace } } = options
    const _text = drawText(svg, text, { align: Align.left, ...fontOptions })
    const bbox = _text.bbox()
    _text.remove();
    const totalPadding = 2 * padding

    return new Dimensions(
        bbox.width + totalPadding,
        bbox.height + totalPadding + arrowHeight + arrowSpace
    )
}

export function sizeSelfMessage(svg: Svg, text: string, options: DiagramOptions) {
    const { messages: { fontOptions, selfArrowWidth, padding } } = options
    const _text = drawText(svg, text, { align: Align.left, ...fontOptions })
    const bbox = _text.bbox()
    _text.remove();
    const totalPadding = 2 * padding

    return new Dimensions(
        bbox.width + totalPadding + selfArrowWidth,
        bbox.height + totalPadding
    )
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