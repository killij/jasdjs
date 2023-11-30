//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { G, Marker, Polyline, Svg, Text } from "@svgdotjs/svg.js"
import { Align, ArrowOptions, LifelineOptions, LineOptions, MessageOptions, TextBoxOptions, TextOptions, defaultColour, defaultContrastColour } from "./Options"
import { Lifeline, Points } from "./SequenceDiagramRenderer"
import { ArrowLineTypes, Message, ParticipantTypes } from "./SequenceDiagramParser"

export function drawText(svg: Svg | G, text: string, textOptions: TextOptions): Text {
    const t = svg.text(text)
    const { align, ...fontOptions } = textOptions
    t.font(fontOptions)
    
    switch (align) {
        case Align.middle:
            t.attr({ "text-anchor": "middle" })
            break
        case Align.right:
            t.attr({ "text-anchor": "end" })
            break
    }

    return t
}

export function drawLine(svg: Svg | G, path: Points, options: LineOptions): Polyline {
    const { fill: color, width, dashStyle, lineType } = options
    const line = svg
        .polyline(path)
        .stroke({
            color,
            width
        })
        .attr({
            fill: "none",
            "stroke-linejoin": "round",
            stroke: color ?? defaultColour,
            "stroke-width": width ?? 1
        })

    if ((lineType ?? ArrowLineTypes.solid) === ArrowLineTypes.dashed) {
        line.attr({ "stroke-dasharray": dashStyle ?? "4" })
    }

    return line
}

export function drawTextBox(svg: Svg | G, text: string, options: TextBoxOptions, minimumWidth?: number): G {
    const { margin, padding, fill, rounding, textOptions, strokeOptions: { width: strokeWidth, fill: stroke } } = options

    const doublePadding = 2 * padding
    const doubleMargin = 2 * margin

    const group = svg.group()
    const _text = drawText(group, text, textOptions)
    const bbox = _text.bbox()

    const targetWidth = Math.max(minimumWidth ?? 0, bbox.width)

    const width = targetWidth + doublePadding
    const height = bbox.height + doublePadding
    
    const invisibleRect = group.rect(width + doubleMargin, height + doublePadding).move(0,0).stroke("none").fill("none")
    group.rect(width, height).move(margin, margin).attr({
        fill: fill ?? defaultContrastColour,
        stroke: stroke ?? defaultColour,
        "stroke-width": strokeWidth ?? 1,
        rx: rounding ?? 0
    })

    invisibleRect.back()
    _text.front()
    _text.cy((height + doubleMargin)/2)

    switch (options.textOptions.align) {
        case Align.left:
            _text.x(margin + padding)
            break
        case Align.middle:
            _text.cx((width + doubleMargin)/2)
            break
        case Align.right:
            _text.x(width - bbox.width)
            break
    }

    return group
}

export function drawActor(svg: Svg | G, text: string, icon: Marker, options: TextBoxOptions): G {
    const { margin, padding, textOptions } = options

    const doublePadding = 2 * padding
    const doubleMargin = 2 * margin
    const iconSpacing = 5

    const group = svg.group()
    const _text = drawText(group, text, textOptions)
    const textBbox = _text.bbox()
    const iconBbox = icon!.bbox()
    
    const width = Math.max(iconBbox.width, textBbox.width) + doublePadding + doubleMargin
    const height = iconBbox.height + textBbox.height + doublePadding + doubleMargin + iconSpacing

    const invisibleRect = group.rect(width, height).move(0,0).stroke("none").fill("none")
    group.use(icon!).x((width - iconBbox.width)/2).y(padding + margin + textBbox.height + 5)
    _text.cx(width / 2).y(padding + margin)
    invisibleRect.back()

    return group
}

export function drawLifeline(svg: Svg | G, lifeline: Lifeline, height: number, icon: Marker, options: LifelineOptions): G {
    const participant = lifeline.participant!
    const group = svg.group()
    let top: G
    switch (lifeline.participant!.type) {
        case ParticipantTypes.lifeline: top = drawTextBox(group, participant.alias, options.textBoxOptions); break
        case ParticipantTypes.actor: top = drawActor(group, participant.alias, icon, options.textBoxOptions); break
    }

    const bbox = top.bbox()
    const bottom = top.clone()
    group.add(bottom)
    bottom.translate(0, height + bbox.height)

    const line = drawLine(group, [[bbox.cx, bbox.cy], [bbox.cx, bbox.cy + height + bbox.height]], options.lineOptions)
    line.back()

    return group
}

export function drawArrow(svg: Svg | G, markers: any, path: Points, options: ArrowOptions) {
    const { headType, ...lineOptions } = options
    const polyline = drawLine(svg, path, lineOptions)
    polyline.marker('end', markers[headType])
    return polyline
}

export interface DrawMessageResult {
    group: G
    arrowTip: {
        x: number,
        y: number
    }
}

export function drawMessage(svg: Svg | G, markers: any, message: Message, x: number, y: number, width: number, leftToRight: boolean, options: MessageOptions): DrawMessageResult {
    const { fontOptions, padding, arrowOptions, arrowSpace } = options
    const { arrow: { head, line } } = message
    
    const group = svg.group().attr({ class: "jasd-message" })
    let offsetY = padding + y;

    if (message.text && (message.text.trim() !== "")) {
        const text = drawText(group, message.text, { align: Align.middle, ...fontOptions })
        text.y(offsetY).cx(x + width / 2)
        offsetY += text.bbox().height + arrowSpace
    }
    
    const sx = leftToRight ? x : x + width
    const tx = leftToRight ? x + width : x
    const markerHeight = markers[message.arrow.head].attr("markerHeight") ?? 0
    const halfArrowHeight = markerHeight / 2

    drawArrow(group, markers, [[sx, offsetY+halfArrowHeight], [tx, offsetY+halfArrowHeight]], {
        ...arrowOptions, lineType: line, headType: head
    })

    offsetY += markerHeight + padding
    group.rect(width, offsetY - y).fill("none").stroke("none").move(x, y).back()
    
    return {
        group,
        arrowTip: {
            x: tx,
            y: offsetY
        }
    }
}

export function drawSelfMessage(svg: Svg | G, markers: any, message: Message, source: Lifeline, options: MessageOptions): DrawMessageResult {
    const { fontOptions, padding, arrowOptions, selfArrowWidth, arrowHeight } = options
    const { arrow: { head, line } } = message

    const group = svg.group()
    const halfArrowWidth = arrowHeight / 2
    const text = drawText(group, message.text, { align: Align.left, ...fontOptions })
    
    text.move(0,0).translate(selfArrowWidth + padding, padding)

    const arrowY = padding
    const points: Points = [
        [0, arrowY + halfArrowWidth],
        [selfArrowWidth, arrowY + halfArrowWidth],
        [selfArrowWidth, arrowY + text.bbox().height - halfArrowWidth],
        [0, arrowY + text.bbox().height - halfArrowWidth]
    ]
    
    drawArrow(group, markers, points, { ...arrowOptions, lineType: line, headType: head })

    const tbbox = text.bbox()
    group.rect(tbbox.width + selfArrowWidth + halfArrowWidth, tbbox.height + 2 * padding).fill("none").stroke("none").move(0, 0).front()
    return  {
        group,
        arrowTip: {
            x: 0,
            y: arrowY + text.bbox().height - halfArrowWidth
        }
    }
}