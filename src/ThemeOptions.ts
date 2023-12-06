//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { ActivationOptions, ArrowOptions, Background, BackgroundCallback, BackgroundColor, BackgroundPattern, DiagramOptions, FontOptions, LifelineOptions, MessageOptions, NoteOptions, OptionOverrides, ParticipantOptions, StrokeOptions, TextAlignment, TextboxOptions, TitleOptions } from "./Options"

export const defaultColour = "#000"
export const defaultContrastColour = "#fff"

export type DeepPartial<T> = Partial<{ [P in keyof T]: DeepPartial<T[P]> }>

export class ThemeFontOptions implements FontOptions {
    readonly color: string = defaultColour
    readonly family: string = "Courier New"
    readonly size: number = 12
    readonly weight: string = "normal"

    getAttr() {
        return {
            family: this.family,
            fill: this.color,
            size: this.size,
            weight: this.weight
        }
    }

    constructor (init?: Partial<FontOptions>) {
        this.family = init?.family ?? this.family
        this.color = init?.color ?? this.color
        this.size = init?.size ?? this.size
        this.weight = init?.weight ?? this.weight
    }
}

export class ThemeStrokeOptions implements StrokeOptions {
    readonly color: string = defaultColour
    readonly width: number = 1

    constructor(init?: Partial<StrokeOptions>) {
        this.color = init?.color ?? this.color
        this.width = init?.width ?? this.width
    }

    getAttr() {
        return {
            color: this.color,
            width: this.width
        }
    }
}

export class ThemeTextboxOptions implements TextboxOptions {
    readonly backgroundColor: string = defaultContrastColour
    readonly stroke: ThemeStrokeOptions
    readonly margin: number = 5
    readonly padding: number = 6
    readonly font: ThemeFontOptions
    readonly textAlign: TextAlignment = "middle"
    readonly cornerRounding: number = 7

    constructor(init?: DeepPartial<TextboxOptions>, defaultFont?: ThemeFontOptions) {
        this.backgroundColor = init?.backgroundColor ?? this.backgroundColor
        this.stroke = new ThemeStrokeOptions(init?.font)
        this.margin = init?.margin ?? this.margin
        this.padding = init?.padding ?? this.padding
        this.font = new ThemeFontOptions(Object.assign({}, defaultFont, init?.font))
        this.textAlign = init?.textAlign ?? this.textAlign
        this.cornerRounding = init?.cornerRounding ?? this.cornerRounding
    }

    boxAttr() {
        return {
            fill: this.backgroundColor,
            stroke: this.stroke.color,
            "stroke-width": this.stroke.width,
            rx: this.cornerRounding
        }
    }
}

export class ThemeLifelineOptions implements LifelineOptions {
    readonly width: number = 1
    readonly color: string = defaultColour
    readonly dashStyle?: string

    constructor(init?: Partial<LifelineOptions>) {
        this.width = init?.width ?? this.width
        this.color = init?.color ?? this.color
        this.dashStyle = init?.dashStyle ?? this.dashStyle
    }
}

export class ThemeParticipantOptions implements ParticipantOptions {
    readonly box: ThemeTextboxOptions
    readonly lifeline: ThemeLifelineOptions

    constructor(init?: DeepPartial<ParticipantOptions>, defaultFont?: ThemeFontOptions) {
        this.box = new ThemeTextboxOptions(init?.box, defaultFont)
        this.lifeline = new ThemeLifelineOptions(init?.lifeline)
    }
}

export class ThemeActivationOptions implements ActivationOptions {
    private _halfWidth: number

    readonly backgroundColor: string = "#AFECFD"
    readonly stroke: ThemeStrokeOptions
    readonly width: number = 9

    constructor(init?: DeepPartial<ActivationOptions>) {
        this.backgroundColor = init?.backgroundColor ?? this.backgroundColor
        this.width = init?.width ?? this.width
        this.stroke = new ThemeStrokeOptions(init?.stroke)

        this._halfWidth = this.width / 2
    }

    get halfWidth() {
        return this._halfWidth
    }
}

export class ThemeNoteOptions implements NoteOptions {
    readonly box: ThemeTextboxOptions
    readonly overlap: number = 20

    constructor(init?: DeepPartial<NoteOptions>, defaultFont?: ThemeFontOptions) {
        let defs: DeepPartial<TextboxOptions> = Object.assign({}, {
            backgroundColor: "#feffeb",
            cornerRounding: 0,
        },
        init?.box)
        this.box = new ThemeTextboxOptions(defs, defaultFont)
        this.overlap = init?.overlap ?? this.overlap
    }
}

export class ThemeTitleOptions implements TitleOptions {
    readonly align: TextAlignment = "middle"
    readonly font: ThemeFontOptions
    readonly paddingBottom: number = 20

    constructor (init?: DeepPartial<TitleOptions>, defaultFont?: ThemeFontOptions) {
        this.align = init?.align ?? this.align
        this.paddingBottom = init?.paddingBottom ?? this.paddingBottom
        this.font = new ThemeFontOptions(Object.assign({}, defaultFont, { size: 18 }, init?.font ))
    }
}

export class ThemeArrowOptions implements ArrowOptions {
    readonly color: string = defaultColour
    readonly width: number = 1
    readonly paddingTop: number = 5
    readonly dashStyle: string = "4"

    constructor(init?: Partial<ArrowOptions>) {
        this.color = init?.color ?? this.color
        this.width = init?.width ?? this.width
        this.paddingTop = init?.paddingTop ?? this.paddingTop
        this.dashStyle = init?.dashStyle ?? this.dashStyle
    }
}

export class ThemeMessageOptions implements MessageOptions {
    readonly padding: number = 3
    readonly font: ThemeFontOptions
    readonly arrow: ThemeArrowOptions
    readonly selfArrowWidth: number = 30

    constructor(init?: DeepPartial<MessageOptions>, defaultFont?: ThemeFontOptions) {
        this.padding = init?.padding ?? this.padding
        this.font = new ThemeFontOptions(Object.assign({}, defaultFont, init?.font))
        this.arrow = new ThemeArrowOptions(init?.arrow)
    }
}


export class ThemeOptions implements DiagramOptions {
    readonly title: ThemeTitleOptions
    readonly messages: ThemeMessageOptions
    readonly notes: ThemeNoteOptions
    readonly participants: ThemeParticipantOptions
    readonly activations: ThemeActivationOptions
    readonly padding: number = 20
    readonly defaultFont: ThemeFontOptions
    readonly background?: Background

    constructor(init?: OptionOverrides) {
        this.padding = init?.padding ?? this.padding
        this.defaultFont = new ThemeFontOptions(init?.defaultFont)
        this.title = new ThemeTitleOptions(init?.title, this.defaultFont)
        this.participants = new ThemeParticipantOptions(init?.participants, this.defaultFont)
        this.notes = new ThemeNoteOptions(init?.notes, this.defaultFont)
        this.messages = new ThemeMessageOptions(init?.messages, this.defaultFont)
        this.activations = new ThemeActivationOptions(init?.activations)
        this.background = init?.background
    }
}