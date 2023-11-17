import { G, Marker, Svg, Text } from "@svgdotjs/svg.js"
import { Align, TextBoxOptions, TextOptions } from "./Options"

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

export function drawTextBox(svg: Svg, text: string, options: TextBoxOptions): G {
    const { margin, padding, fill, rounding, textOptions, icon, strokeOptions: { width: strokeWidth, fill: stroke } } = options

    const doublePadding = 2 * padding
    const doubleMargin = 2 * margin

    const g = svg.group()
    const t = drawText(g, text, textOptions)
    const bbox = t.bbox()
    const width = bbox.width + doublePadding
    const height = bbox.height + doublePadding

    const r = g
        .rect(width, height)
        .move(margin, margin)
        .attr({
            fill: fill ?? defaultContrastColour,
            stroke: stroke ?? defaultColour,
            "stroke-width": strokeWidth ?? 1,
            rx: rounding ?? 0
        })

    r.back()
    t.cy((height + doubleMargin)/2)

    const oX = margin + padding
    switch (options.textOptions.align) {
        case Align.left:
            t.x(oX)
            break
        case Align.middle:
            t.cx((width + doubleMargin)/2)
            break
        case Align.right:
            t.x(width - padding - bbox.width)
            break
    }

    return g
}

export function drawActor(svg: Svg, text: string, icon: Marker, options: TextBoxOptions): G {
    const { margin, padding, textOptions } = options

    const doublePadding = 2 * padding
    const doubleMargin = 2 * margin
    const iconSpacing = 5

    const g = svg.group()
    const t = drawText(g, text, textOptions)
    const textBbox = t.bbox()
    const iconBbox = icon!.bbox()
    
    const width = Math.max(iconBbox.width, textBbox.width) + doublePadding + doubleMargin
    const height = iconBbox.height + textBbox.height + doublePadding + doubleMargin + iconSpacing

    g.use(icon!).x((width - iconBbox.width)/2).y(margin + padding)
    t.cx(width / 2).y(height - margin - padding - textBbox.height)
    //g.rect(width, height).move(0,0).stroke("red").fill("none")

    return g
}