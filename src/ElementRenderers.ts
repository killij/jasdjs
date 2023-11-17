import { G, Marker, Polyline, Svg, Text } from "@svgdotjs/svg.js"
import { Align, LifelineOptions, LineOptions, TextBoxOptions, TextOptions } from "./Options"
import { Lifeline, Points } from "./SequenceDiagramRenderer"
import { ArrowLineTypes, ParticipantTypes } from "./SequenceDiagram"

const defaultColour = "#000"
const defaultContrastColour = "#fff"

export function drawText(svg: Svg | G, text: string, textOptions: TextOptions): Text {
    const t = svg.text(text).move(0, 0)
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

export function drawTextBox(svg: Svg | G, text: string, options: TextBoxOptions): G {
    const { margin, padding, fill, rounding, textOptions, icon, strokeOptions: { width: strokeWidth, fill: stroke } } = options

    const doublePadding = 2 * padding
    const doubleMargin = 2 * margin

    const group = svg.group()
    const _text = drawText(group, text, textOptions)
    const bbox = _text.bbox()
    const width = bbox.width + doublePadding
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
            _text.x(width - padding - bbox.width)
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
    const t = drawText(group, text, textOptions)
    const textBbox = t.bbox()
    const iconBbox = icon!.bbox()
    
    const width = Math.max(iconBbox.width, textBbox.width) + doublePadding + doubleMargin
    const height = iconBbox.height + textBbox.height + doublePadding + doubleMargin + iconSpacing

    const invisibleRect = group.rect(width + doubleMargin, height + doubleMargin).move(0,0).stroke("none").fill("none")
    group.use(icon!).x((width - iconBbox.width)/2).y(margin + padding)
    t.cx(width / 2).y(height - margin - padding - textBbox.height)
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