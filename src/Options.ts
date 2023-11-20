//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import merge from "lodash.merge"
import { ArrowHeadTypes, ArrowLineTypes } from "./SequenceDiagramParser"
import { G, Marker, Svg } from "@svgdotjs/svg.js"
import { Pattern } from "@svgdotjs/svg.js"

export const defaultColour = "#000"
export const defaultContrastColour = "#fff"

export enum Align {
    middle = 'middle',
    left = 'left',
    right = 'right',
}

export type TextAlignment = keyof typeof Align

export type FontOptions = {
    family?: string
    size?: number
    weight?: string
    fill?: string
}

export type StrokeOptions = {
    width: number,
    fill: string
}

export type TextOptions = FontOptions & {
    align?: TextAlignment
}

export type TextBoxOptions = {
    fill?: string
    rounding?: number
    margin: number
    padding: number
    textOptions: TextOptions
    strokeOptions: StrokeOptions
    icon?: Marker
}

export type LineOptions = {
    fill: string
    width: number
    dashStyle?: string
    lineType?: ArrowLineTypes
}

export type ArrowOptions = LineOptions & {
    headType: ArrowHeadTypes
}

export type TitleOptions = {
    textOptions: TextOptions
    paddingBottom: number
}

export type IconOptions = {
    height: number
    width: number
    paddingRight: number
}

export type LifelineOptions = {
    textBoxOptions: TextBoxOptions
    lineOptions: LineOptions
    iconOptions: IconOptions
}

export type MessageOptions = {
    fontOptions: FontOptions
    arrowOptions: ArrowOptions
    arrowSpace: number
    padding: number
    arrowHeight: number
    selfArrowWidth: number
}

export type NoteOptions = {
    textBoxOptions: TextBoxOptions
    overlap: number
}

export type BackgroundColor = {
    color: string
}

export type BackgroundPattern = {
    pattern: {
        width: number
        height: number
        func: (patter: Pattern) => void
    }
}

export type BackgroundCallback = (svg: Svg, width: number, height: number) => G

export type DiagramOptions = {
    padding: number
    title: TitleOptions
    messages: MessageOptions
    lifelines: LifelineOptions
    notes: NoteOptions
    background: BackgroundColor | BackgroundPattern | BackgroundCallback | undefined
}

export type DeepPartial<T> = Partial<{ [P in keyof T]: DeepPartial<T[P]> }>

export class Options {
    private static _defaultIconOptions: IconOptions = {
        width: 15,
        height: 15,
        paddingRight: 5
    }

    private static _defaultFontOptions: FontOptions = {
        family: "Courier New",
        size: 12,
        fill: "black",
    }

    private static _defaultStrokeOptions: StrokeOptions = {
        fill: "black",
        width: 1,
    }

    private static _defaultTextBoxOptions: TextBoxOptions = {
        fill: '#fff',
        margin: 5,
        padding: 6,
        rounding: 5,

        textOptions: {
            align: Align.middle,
            ...this._defaultFontOptions
        },
        strokeOptions: {
            ...this._defaultStrokeOptions
        }
    }

    private static _defaultNoteOptions: NoteOptions = {
        textBoxOptions: merge({}, this._defaultTextBoxOptions, { fill: '#feffeb', rounding: 0 }),
        overlap: 20
    }

    private static _defaultTitleOptions: TitleOptions = {
        paddingBottom: 20,
        textOptions: Object.assign({ align: Align.right, ...this._defaultFontOptions }, { size: 18 })
    }

    private static _defaultLineOptions: LineOptions = {
        fill: "black",
        width: 1,
        dashStyle: "4",
        lineType: ArrowLineTypes.solid
    }

    private static _defaultArrowOptions: ArrowOptions = {
        headType: ArrowHeadTypes.closed,
        ...this._defaultLineOptions
    }

    private static _defaultLifelineOptions: LifelineOptions = {
        lineOptions: this._defaultLineOptions,
        textBoxOptions: this._defaultTextBoxOptions,
        iconOptions: this._defaultIconOptions,
    }

    private static _defaultMessageOptions: MessageOptions = {
        fontOptions: this._defaultFontOptions,
        arrowOptions: this._defaultArrowOptions,
        padding: 3,
        arrowHeight: 8,
        selfArrowWidth: 30,
        arrowSpace: 5,
    }
    
    private static _defaultDiagramOptions: DiagramOptions = {
        padding: 20,
        lifelines: this._defaultLifelineOptions,
        messages: this._defaultMessageOptions,
        title: this._defaultTitleOptions,
        notes: this._defaultNoteOptions,
        background: undefined
    }

    public static From(options: DeepPartial<DiagramOptions>): DiagramOptions {
        return merge({}, this._defaultDiagramOptions, options ?? {})
    }
}