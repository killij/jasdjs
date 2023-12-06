//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { G, Marker, Polyline, Svg, Text } from "@svgdotjs/svg.js"
import { Align, ArrowOptions } from "./Options"
import { Lifeline, Points } from "./SequenceDiagramRenderer"
import { ArrowLineTypes, Message, ParticipantTypes } from "./SequenceDiagramParser"
import { ThemeFontOptions, ThemeMessageOptions, ThemeParticipantOptions, ThemeTextboxOptions } from "./ThemeOptions"

interface LineOptions {
    color: string,
    width: number,
    dashStyle?: string
}

export function drawText(svg: Svg | G, text: string, textAlign: string, font: ThemeFontOptions): Text {
    const t = svg.text(text)
    t.font(font.getAttr())
    
    switch (textAlign) {
        case Align.middle:
            t.attr({ "text-anchor": "middle" })
            break
        case Align.right:
            t.attr({ "text-anchor": "end" })
            break
    }

    return t
}

export function drawLine(svg: Svg | G, path: Points, lineType: ArrowLineTypes, options: LineOptions): Polyline {
    const line = svg
        .polyline(path)
        .stroke({
            color: options.color,
            width: options.width
        })
        .attr({
            fill: "none",
            "stroke-linejoin": "round",
        })

    if (lineType === ArrowLineTypes.dashed) {
        line.attr({ "stroke-dasharray": options.dashStyle })
    }

    return line
}

export function drawTextBox(svg: Svg | G, text: string, options: ThemeTextboxOptions, minimumWidth?: number): G {
    const { margin, padding, textAlign, font } = options

    const doublePadding = 2 * padding
    const doubleMargin = 2 * margin
    
    const group = svg.group()
    const _text = drawText(group, text, textAlign, font)
    const bbox = _text.bbox()

    const targetWidth = Math.max(minimumWidth ?? 0, bbox.width)

    const width = targetWidth + doublePadding
    const height = bbox.height + doublePadding
    
    const invisibleRect = group.rect(width + doubleMargin, height + doublePadding).move(0,0).stroke("none").fill("none")
    group.rect(width, height).move(margin, margin).attr(options.boxAttr())

    invisibleRect.back()
    _text.front()
    _text.cy((height + doubleMargin)/2)

    switch (textAlign) {
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

export function drawActor(svg: Svg | G, text: string, icon: Marker, options: ThemeTextboxOptions): G {
    const { margin, padding, font, textAlign } = options

    const doublePadding = 2 * padding
    const doubleMargin = 2 * margin
    const iconSpacing = 5

    const group = svg.group()
    const _text = drawText(group, text, textAlign, font)
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

export function drawLifeline(svg: Svg | G, lifeline: Lifeline, height: number, icon: Marker, options: ThemeParticipantOptions): G {
    const participant = lifeline.participant!
    const group = svg.group()
    let top: G
    switch (lifeline.participant!.type) {
        case ParticipantTypes.lifeline: top = drawTextBox(group, participant.alias, options.box); break
        case ParticipantTypes.actor: top = drawActor(group, participant.alias, icon, options.box); break
    }

    const bbox = top.bbox()
    const bottom = top.clone()
    group.add(bottom)
    bottom.translate(0, height + bbox.height)

    var lineType = options.lifeline.dashStyle ? ArrowLineTypes.dashed : ArrowLineTypes.solid

    const line = drawLine(group, [[bbox.cx, bbox.cy], [bbox.cx, bbox.cy + height + bbox.height]], lineType, options.lifeline)
    line.back()

    return group
}

export function drawArrow(svg: Svg | G, arrowHead: Marker, lineType: ArrowLineTypes, path: Points, options: ArrowOptions) {
    //const { headType, ...lineOptions } = options
    const polyline = drawLine(svg, path, lineType, options)
    polyline.marker('end', arrowHead)
    return polyline
}

export interface DrawMessageResult {
    group: G
    arrow: {
        startY: number,
        endY: number
    }
}

export function drawMessage(svg: Svg | G, arrowHead: Marker, message: Message, x: number, y: number, width: number, leftToRight: boolean, options: ThemeMessageOptions): DrawMessageResult {
    const { padding, font, arrow } = options
    
    const group = svg.group().attr({ class: "jasd-message" })
    let offsetY = padding + y;

    if (message.text && (message.text.trim().length !== 0)) {
        const text = drawText(group, message.text, Align.middle, font)
        text.y(offsetY).cx(x + width / 2)
        offsetY += text.bbox().height + arrow.paddingTop
    }

    const sx = leftToRight ? x : x + width
    const tx = leftToRight ? x + width : x
    const markerHeight = arrowHead.attr("markerHeight") ?? 0
    const halfArrowHeight = markerHeight / 2

    const arrowY = offsetY+halfArrowHeight
    drawArrow(group, arrowHead, message.arrow.line, [[sx, arrowY], [tx, arrowY]], options.arrow)

    offsetY += markerHeight + padding
    group.rect(width, offsetY - y).fill("none").stroke("none").move(x, y).back()
    
    return {
        group,
        arrow: { startY: arrowY, endY: arrowY }
    }
}

export function drawSelfMessage(svg: Svg | G, markers: any, message: Message, startX: number, endX: number, y: number, options: ThemeMessageOptions): DrawMessageResult {
    const { font, padding, arrow, selfArrowWidth } = options
    
    const group = svg.group().attr({ class: "jasd-self-message" })

    let offsetY = y + padding
    let width = 2 * padding + selfArrowWidth

    if (message.text && (message.text.trim().length !== 0)) {
        const text = drawText(group, message.text, Align.left, font)
        text.move(startX + selfArrowWidth + padding, offsetY)
        offsetY += text.bbox().height
        width += text.bbox().width
    } else offsetY += 10

    const startY = y + padding
    const endY = offsetY

    const points: Points = [
        [startX, startY],
        [startX + selfArrowWidth, y + padding],
        [startX + selfArrowWidth, offsetY],
        [endX, endY]
    ]

    const { arrow: { head, line } } = message

    drawArrow(group, markers[message.arrow.head], line, points, arrow)

    offsetY += padding
    group.rect(width, offsetY - y).fill("none").stroke("none").move(startX, y).back()
    return  {
        group,
        arrow: { startY, endY }
    }
}