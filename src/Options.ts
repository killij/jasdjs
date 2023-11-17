//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import merge from "lodash.merge"
import { ArrowHeadTypes, ArrowLineTypes } from "./SequenceDiagram"
import { Marker } from "@svgdotjs/svg.js"
import { Pattern } from "@svgdotjs/svg.js"

export enum Align {
    middle = 'middle',
    left = 'left',
    right = 'right',
}

type TextAlignment = Align.left | Align.middle | Align.right

type FontOptions = {
    family?: string
    size?: number
    weight?: string
    fill?: string
}

type StrokeOptions = {
    width: number,
    fill: string
}

type TextOptions = FontOptions & {
    align?: TextAlignment
}

type TextBoxOptions = {
    fill?: string
    rounding?: number
    margin: number
    padding: number
    textOptions: TextOptions
    strokeOptions: StrokeOptions
    icon?: Marker
}

type LineOptions = {
    fill: string
    width: number
    dashStyle?: string
    lineType?: ArrowLineTypes
}

type ArrowOptions = LineOptions & {
    headType: ArrowHeadTypes
}

type TitleOptions = {
    textOptions: TextOptions
    paddingBottom: number
}

type IconOptions = {
    height: number
    width: number
    paddingRight: number
}

type LifelineOptions = {
    textBoxOptions: TextBoxOptions
    lineOptions: LineOptions
    iconOptions: IconOptions
}

type MessageOptions = {
    fontOptions: FontOptions
    arrowOptions: ArrowOptions
    arrowSpace: number
    padding: number
    arrowHeight: number
    selfArrowWidth: number
}

type NoteOptions = {
    textBoxOptions: TextBoxOptions
    overlap: number
}

type BackgroundColor = {
    color: string
}

export type BackgroundPattern = {
    pattern: {
        width: number
        height: number
        func: (patter: Pattern) => void
    }
}

type DiagramOptions = {
    padding: number
    title: TitleOptions
    messages: MessageOptions
    lifelines: LifelineOptions
    notes: NoteOptions
    background: BackgroundColor | BackgroundPattern | undefined
}

type DeepPartial<T> = Partial<{ [P in keyof T]: DeepPartial<T[P]> }>

class Options {
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
        textOptions: Object.assign({ align: Align.left, ...this._defaultFontOptions }, { size: 18 })
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
        padding: 5,
        arrowHeight: 8,
        selfArrowWidth: 30,
        arrowSpace: 10,
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

export {
    DeepPartial,
    Options,
    DiagramOptions,
    TextOptions,
    LineOptions,
    ArrowOptions,
    FontOptions,
    TextBoxOptions,

}