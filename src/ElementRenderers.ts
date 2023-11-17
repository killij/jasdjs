import { G, Svg } from "@svgdotjs/svg.js"
import { Align, TextOptions } from "./Options"

export function renderTitle(svg: Svg, text: string, textOptions: TextOptions): G {
    const g = svg.group()
    const title = g.text(text).move(0, 0)
    const { align, ...fontOptions } = textOptions
    title.font(fontOptions)
    
    switch (align) {
        case Align.middle:
            title.attr({ "text-anchor": "middle" })
            break
        case Align.right:
            title.attr({ "text-anchor": "end" })
            break
    }

    return g
}