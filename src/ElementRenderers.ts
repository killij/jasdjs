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
    const group = svg.group()
    const { headType, ...lineOptions } = options
    const polyline = drawLine(group, path, lineOptions)
    polyline.marker('end', markers[headType])
    return group
}

export function drawMessage(svg: Svg | G, markers: any, message: Message, source: Lifeline, target: Lifeline, options: MessageOptions): G {
    const { fontOptions, padding, arrowOptions, arrowSpace, arrowHeight } = options
    const { arrow: { head, line } } = message
    
    const group = svg.group().move(0, 0)
    let scx = source.x + source.dimensions.cx
    let tcx = target.x + target.dimensions.cx
    const mincx = Math.min(scx, tcx)
    scx -= mincx
    tcx -= mincx

    const width = Math.abs(scx - tcx)
    const text = drawText(group, message.text, { align: Align.middle, ...fontOptions })
    text.move(0,0).y(padding).cx(width / 2)

    const arrowY = text.bbox().height + padding + arrowSpace
    drawArrow(group, markers, [[scx, arrowY], [tcx, arrowY]], {
        ...arrowOptions, lineType: line, headType: head
    })

    const tbbox = text.bbox()
    group.rect(width, tbbox.height + arrowHeight + arrowSpace + (2 * padding)).fill("none").stroke("none").move(0, 0).back()
    return group
}

export function drawSelfMessage(svg: Svg | G, markers: any, message: Message, source: Lifeline, options: MessageOptions): G {
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
    return group
}