//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { G, Pattern, Svg } from "@svgdotjs/svg.js"
import { DeepPartial } from "./ThemeOptions"

export enum Align {
    middle = 'middle',
    left = 'left',
    right = 'right',
}

export type TextAlignment = keyof typeof Align

export interface FontOptions {
    readonly family: string
    readonly color: string
    readonly size: number
    readonly weight: string
}

export interface StrokeOptions {
    readonly color: string,
    readonly width: number
}

export interface TextboxOptions {
    readonly backgroundColor: string
    readonly cornerRounding: number
    readonly font: FontOptions
    readonly margin: number
    readonly padding: number
    readonly stroke: StrokeOptions
    readonly textAlign: TextAlignment
}

export interface LifelineOptions {
    readonly color: string
    readonly dashStyle?: string
    readonly width: number
}

export interface ParticipantOptions {
    readonly box: TextboxOptions
    readonly lifeline: LifelineOptions
}

export interface TitleOptions {
    readonly align: TextAlignment
    readonly font: FontOptions
    readonly paddingBottom: number
}

export interface NoteOptions {
    readonly box: TextboxOptions
    readonly overlap: number
}

export interface ArrowOptions {
    readonly color: string
    readonly paddingTop: number
    readonly width: number
    readonly dashStyle: string
}

export interface MessageOptions {
    readonly arrow: ArrowOptions
    readonly font: FontOptions
    readonly padding: number
}

export interface ActivationOptions {
    readonly backgroundColor: string
    readonly stroke: StrokeOptions
    readonly width: number
}

export interface BackgroundColor {
    color: string
}

export interface BackgroundPattern {
    pattern: {
        width: number
        height: number
        func: (patter: Pattern) => void
    }
}

export type BackgroundCallback = (svg: Svg, width: number, height: number) => G

export type Background = BackgroundColor | BackgroundPattern | BackgroundCallback

export interface DiagramOptions {
    readonly activations: ActivationOptions
    readonly defaultFont: FontOptions
    readonly messages: MessageOptions
    readonly notes: NoteOptions
    readonly padding: number
    readonly participants: ParticipantOptions
    readonly title: TitleOptions
    readonly background?: Background
}

export type OptionOverrides = DeepPartial<Omit<DiagramOptions, "background">> & { background?: Background }