//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { SVG, Svg, Marker, Text, Polyline } from "@svgdotjs/svg.js"
import { ArrowHeadTypes, ArrowLineTypes } from "./SequenceDiagram"
import { G } from "@svgdotjs/svg.js"
import { ArrowOptions, FontOptions, LineOptions, TextBoxOptions, TextOptions } from "./Options"

const defaultColour = "#000"
const defaultContrastColour = "#fff"

enum Align {
    middle = 'middle',
    left = 'left',
    right = 'right',
}

type Point = [number, number]
type Points = Point[]

const ICON_PADDING = 10

class Renderer {
    private _draw: Svg
    private _icons: any = {}
    private _markers: any = {}

    public get draw () { return this._draw }

    constructor(draw: Svg) {
        this._draw = draw

        this._icons.actor = this._draw
            .defs()
            .path("M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z")
            .transform({scale: 1.5})

        this._markers[ArrowHeadTypes.closed] = this._draw.marker(10, 10, (m: Marker) => {
            m.polygon("0 0, 10 5, 0 10").attr({
                fill: defaultColour,
                stroke: defaultColour,
            })
        }).attr({refX: 10, refY: 5})
        
        this._markers[ArrowHeadTypes.open] = this._draw.marker(10, 10, (m: Marker) => {
            m.polyline("0 0, 10 5, 0 10").attr({
                fill: "none",
                stroke: defaultColour,
            })
        }).attr({refX: 10, refY: 5})
    }

    public get icons() { return this._icons }

    //#region Primitive drawing functions

    drawText(text: string, x: number, y: number, options: TextOptions): Text {
        const { fill, align, ...fontOptions } = options
        const el = this._draw
            .text(text)
            .font(fontOptions)
            .attr({ fill: fill ?? defaultColour })
            .y(y)
    
        switch (align) {
            case Align.middle: {
                el.attr({ "text-anchor": "middle" })
                el.cx(x + (el.bbox().width / 2))
                break
            }
            case Align.right: {
                el.attr({ "text-anchor": "end" })
                el.x(x)
                break
            }
            default: {
                el.x(x)
                break
            }
        }
    
        return el
    }

    drawTextBox(text: string, x: number, y: number, width: number, height: number, options: TextBoxOptions) {
        const { margin, padding, fill, rounding, textOptions, icon, strokeOptions: { width: strokeWidth, fill: stroke } } = options
        
        const group = this._draw.group()
        const rect = group
            .rect(width - 2 * margin, height - 2 * margin)
            .move(x + margin, y + margin)
            .attr({
                fill: fill ?? defaultContrastColour,
                stroke: stroke ?? defaultColour,
                "stroke-width": strokeWidth ?? 1,
                rx: rounding ?? 0
            })

        const sx = x + margin + padding
        const sy = y + margin + padding
    
        if (icon) {
            group.use(icon).move(sx, sy)
            const txt = this.drawText(text, sx + Number(icon.width()) + ICON_PADDING, sy, textOptions)
            group.add(txt)
        } else {
            const txt = this.drawText(text, sx, sy, textOptions)
            group.add(txt)
        }

        return group
    }

    group() : G {
        return this._draw.group()
    }

    drawLine(path: Points, options: LineOptions): Polyline {
        const { fill: color, width, dashStyle, lineType } = options
        const line = this._draw
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

    drawArrow(path: any, options: ArrowOptions): Polyline {
        const { headType, ...lineOptions } = options
        const polyline = this.drawLine(path, lineOptions)
        polyline.marker('end', this._markers[headType])
        return polyline
    }

    //#endregion

    //#region Utility functions

    getTextBBox(text: string, options: FontOptions) {
        const t = this._draw.text(text).font(options)
        const bbox = t.bbox()
        t.remove()
        return bbox
    }

    resize(width: number, height: number) {
        this._draw.size(width, height)
    }

    //#endregion
}

export {
    Renderer
}