//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import Parser from './parser.js'

// #region AST types

enum AstElementTypes {
    title = "title",
    declaration = "declaration",   
    message = "message",
    note = "note",
}

interface AstTitleElement {
    type: AstElementTypes.title
    text: string
}

interface AstDeclarationElement {
    type: AstElementTypes.declaration
    id: string
    alias: string
    participant: ParticipantTypes
}

interface ArrowElement {
    headType: ArrowHeadTypes
    lineType: ArrowLineTypes
    modifier: string
}

interface AstMessageElement {
    type: AstElementTypes.message
    source: string
    target: string
    text: string
    arrow: ArrowElement
}

interface AstNoteElement {
    type: AstElementTypes.note
    target: string[]
    location: NoteLocations
    text: string
}

type AstElement = AstTitleElement | AstDeclarationElement | AstMessageElement | AstNoteElement

// #endregion

export enum ArrowHeadTypes {
    open = "open",
    closed = "closed"
}

export enum ArrowLineTypes {
    solid = "solid",
    dashed = "dashed"
}

export enum ParticipantTypes {
    actor = "actor",
    lifeline = "lifeline",
}

export enum NoteLocations {
    leftOf = 'leftOf',
    rightOf = 'rightOf',
    over = 'over',
}

export type Arrow = {
    head: ArrowHeadTypes
    line: ArrowLineTypes
}

export interface Participant {
    type: ParticipantTypes
    id: string
    alias: string
}

export enum ElementTypes {
    message = "message",
    note = "note"
}

export interface Message {
    type: ElementTypes.message
    source: Participant
    target: Participant
    modifier?: string
    arrow: Arrow
    text: string
    activated: boolean
    deactivated: boolean
}

export interface Note {
    type: ElementTypes.note
    location: NoteLocations
    target: Participant[]
    text: string
}

export type Element = Note | Message

export interface SequenceDiagram {
    title?: string
    participants: Participant[]
    elements: Element[]
}

function getOrAddParticipant(sd: SequenceDiagram, id: string, alias: string): Participant {
    id = id.trim()
    alias = alias.trim()

    let participant = sd.participants.find(x => x.id === id)

    if (participant) {
        return participant
    }

    sd.participants.push({
        type: ParticipantTypes.lifeline,
        id,
        alias
    })

    return sd.participants.at(-1)!
}

export default function Parse(input: string): SequenceDiagram {
    const ast: AstElement[] = Parser.parse(input)
    const result: SequenceDiagram = {
        participants: [],
        elements: []
    }

    for (const el of ast)
    {
        switch (el.type) {
            case AstElementTypes.title: {
                result.title = el.text
                break
            }
            case AstElementTypes.declaration: {
                switch (el.participant) {
                    case ParticipantTypes.actor: result.participants.push({ type: ParticipantTypes.actor, id: el.id, alias: el.alias ?? el.id }); break
                    case ParticipantTypes.lifeline: result.participants.push({ type: ParticipantTypes.lifeline, id: el.id, alias: el.alias ?? el.id }); break
                }
                break
            }
            case AstElementTypes.message: {
                const source = getOrAddParticipant(result, el.source, el.source)
                const target = getOrAddParticipant(result, el.target, el.target)

                result.elements.push({
                    type: ElementTypes.message,
                    source,
                    target,
                    arrow: {
                        head: el.arrow.headType,
                        line: el.arrow.lineType
                    },
                    text: el.text,
                    activated: el.arrow.modifier === "activate",
                    deactivated: el.arrow.modifier === "deactivate",
                })
                break
            }
            case AstElementTypes.note: {
                const targets = el.target.map(x => getOrAddParticipant(result, x, x))
                result.elements.push({
                    type: ElementTypes.note,
                    location: el.location,
                    target: targets,
                    text: el.text
                })
                break
            }
        }
    }
    return result
}