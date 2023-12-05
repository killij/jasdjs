import { DeepPartial, FontOptions, TextAlignment } from "./Options"

interface StrokeOptions {
    readonly color: string,
    readonly width: string
}

interface TextboxOptions {
    readonly backgroundColor: string
    readonly cornerRounding: string
    readonly font: FontOptions
    readonly margin: string
    readonly padding: string
    readonly stroke: StrokeOptions
    readonly textAlign: TextAlignment
}

interface LifelineOptions {
    readonly color: string
    readonly dashStyle?: string
    readonly width: string
}

interface ParticipantOptions {
    readonly box: TextboxOptions
    readonly lifeline: LifelineOptions
}

interface TitleOptions {
    readonly align: TextAlignment
    readonly font: FontOptions
}

interface NoteOptions {
    readonly box: TextboxOptions
    readonly overlap: number
}

interface ArrowOptions {
    readonly color: string
    readonly paddingTop: string
    readonly width: string
}

interface MessageOptions {
    readonly arrow: ArrowOptions
    readonly font: FontOptions
    readonly padding: string
}

interface ActivationOptions {
    readonly backgroundColor: string
    readonly stroke: StrokeOptions
    readonly width: number
}

interface Options {
    readonly activations: ActivationOptions
    readonly defaultFont: FontOptions
    readonly messages: MessageOptions
    readonly notes: NoteOptions
    readonly padding: string
    readonly participants: ParticipantOptions
    readonly title: TitleOptions
}

class ThemeFontOptions implements FontOptions {
    readonly color: string = "black"
    readonly family: string = "Courier New"
    readonly size: string = "16"
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

class ThemeStrokeOptions implements StrokeOptions {
    readonly color: string = "black"
    readonly width: string = "1"

    constructor(init?: Partial<StrokeOptions>) {
        this.color = init?.color ?? this.color
        this.width = init?.width ?? this.width
    }
}

class ThemeTextboxOptions implements TextboxOptions {
    readonly backgroundColor: string = "white"
    readonly stroke: StrokeOptions
    readonly margin: string = "5"
    readonly padding: string = "5"
    readonly font: FontOptions
    readonly textAlign: TextAlignment = "middle"
    readonly cornerRounding: string = "3"

    constructor(init?: DeepPartial<TextboxOptions>, defaultFont?: ThemeFontOptions) {
        this.font = new ThemeFontOptions(Object.assign({}, defaultFont, { size: 36 }, init?.font))
        this.stroke = new ThemeStrokeOptions(init?.font)
    }
}

class ThemeLifelineOptions implements LifelineOptions {
    readonly width: string = "1"
    readonly color: string = "black"
    readonly dashStyle?: string

    constructor(init?: Partial<LifelineOptions>) {
        this.width = init?.width ?? this.width
        this.color = init?.color ?? this.color
        this.dashStyle = init?.dashStyle ?? this.width
    }
}

class ThemeParticipantOptions implements ParticipantOptions {
    readonly box: TextboxOptions
    readonly lifeline: LifelineOptions

    constructor(init?: DeepPartial<ParticipantOptions>, defaultFont?: ThemeFontOptions) {
        this.box = new ThemeTextboxOptions(init?.box, defaultFont)
        this.lifeline = new ThemeLifelineOptions(init?.lifeline)
    }
}

export class ThemeActivationOptions implements ActivationOptions {
    private _halfWidth: number

    readonly backgroundColor: string = "#AFECFD"
    readonly stroke: StrokeOptions
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

class ThemeNoteOptions implements NoteOptions {
    readonly box: TextboxOptions
    readonly overlap: number = 10

    constructor(init?: DeepPartial<NoteOptions>, defaultFont?: ThemeFontOptions) {
        this.box = new ThemeTextboxOptions(init?.box, defaultFont)
        this.overlap = init?.overlap ?? this.overlap
    }
}

class ThemeTitleOptions implements TitleOptions {
    readonly align: TextAlignment = "middle"
    readonly font: ThemeFontOptions

    constructor (init?: DeepPartial<TitleOptions>, defaultFont?: ThemeFontOptions) {
        this.align = init?.align ?? this.align
        this.font = new ThemeFontOptions(Object.assign({}, defaultFont, { size: 36 }, init?.font ))
    }
}

class ThemeArrowOptions implements ArrowOptions {
    readonly color: string = "black"
    readonly width: string = "1"
    readonly paddingTop: string = "5"

    constructor(init?: Partial<ArrowOptions>) {
        this.color = init?.color ?? this.color
        this.width = init?.width ?? this.width
        this.paddingTop = init?.paddingTop ?? this.paddingTop
    }
}

class ThemeMessageOptions implements MessageOptions {
    readonly padding: string = "5"
    readonly font: FontOptions
    readonly arrow: ArrowOptions

    constructor(init?: DeepPartial<MessageOptions>, defaultFont?: ThemeFontOptions) {
        this.padding = init?.padding ?? this.padding
        this.font = new ThemeFontOptions(Object.assign({}, defaultFont, init?.font))
        this.arrow = new ThemeArrowOptions(init?.arrow)
    }
}

export class ThemeOptions implements Options {
    readonly title: ThemeTitleOptions
    readonly messages: ThemeMessageOptions
    readonly notes: ThemeNoteOptions
    readonly participants: ThemeParticipantOptions
    readonly activations: ThemeActivationOptions
    readonly padding: string = "20"
    readonly defaultFont: ThemeFontOptions

    constructor(init?: DeepPartial<Options>) {
        this.padding = init?.padding ?? this.padding
        this.defaultFont = new ThemeFontOptions(init?.defaultFont)
        this.title = new ThemeTitleOptions(init?.title, this.defaultFont)
        this.participants = new ThemeParticipantOptions(init?.participants, this.defaultFont)
        this.notes = new ThemeNoteOptions(init?.notes, this.defaultFont)
        this.messages = new ThemeMessageOptions(init?.messages, this.defaultFont)
        this.activations = new ThemeActivationOptions(init?.activations)
    }
}

var themeOptions = new ThemeOptions()
console.log("*** theme options ***", JSON.stringify(themeOptions, null, 4))