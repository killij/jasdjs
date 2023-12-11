//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

Diagram = Statements?

Statements = statements:(Statement)*  { return statements.filter(x => x) }

Statement =
	Title
    / Declaration
    / Note
    / Message
    / Space
    / EmptyLine
    / SingleLineComment
    / MultiLineComment
    
Title
	= 'title:'
    Space?
    titleText:Text
    EOL? { return { type: 'title', text: titleText } }

Declaration
	= Lifeline
    / Actor
    
Lifeline
	= ('participant:' / 'p:') member:Member {
    return {
    	type: 'declaration',
        participant: 'lifeline',
        id: member.id,
        alias: member.alias
    }
}

Actor = ('actor:' / 'a:') member:Member {
    return {
    	type: 'declaration',
        participant: 'actor',
        id: member.id,
        alias: member.alias
    }
}

Member
	= Space* id:Id alias:Alias? EOL? { return { type: 'declaration', id, alias }}

Alias
	= Space* 'as' Space* alias:Text { return alias }
    
Id
	= [a-zA-Z0-9_]* { return text() }

Note
	= NoteLR / NoteOver

NoteLR
	= 'note' Space location:NotePlacement Space? target:Target ':' Space? t:Text EOL? {
    return {
    	type: 'note',
        location,
        target: [target],
        text: t
    }
}

NoteOver
	= 'note' Space location:NoteOverPlacement Space? target:MultipleTargets ':' Space? t:Text EOL? {
	return {
		type: 'note',
		location,
		target,
		text: t
	}
}

Target = SingleLineText

MultipleTargets
	= head:Text
    tail:(',' Space? t:Text { return t })? { return tail ? [head, tail] : [head] }

NotePlacement
	= 'left of' { return "leftOf" }
    / 'right of' { return "rightOf" }
    
NoteOverPlacement = 'over'

Message
	= source:Target Space? arrow:Arrow Space? target:Target ':' Space* t:Text EOL? {
	return {
		type: 'message',
		source,
		target,
		arrow,
		text: t
	}
}
    
Arrow
	= lineType:ArrowLine headType:ArrowHead modifier:ArrowModifier? { 
    return {
        headType,
        lineType,
        modifier
    }
}

ArrowHead = OpenArrow / ClosedArrow
ArrowLine = DashedLine / SolidLine

OpenArrow "open arrow head" = '>>' { return 'open' }
ClosedArrow "closed arrow head" = '>' { return 'closed' }
DashedLine "dashed line" = '--' { return 'dashed' }
SolidLine "solid line" = '-' { return 'solid' }
    
ArrowModifier
	= ActivationModifier
    / DeactivationModifier
    
ActivationModifier = '+' { return 'activate' }
DeactivationModifier = '-' { return 'deactivate' }

SingleLineComment "single line comment"
	= "//" (!EOL SourceCharacter)* {
	return {
		type: 'comment',
		text: text()
	}
}

MultiLineComment "multi line comment"
	= "/*" (!"*/" SourceCharacter)* "*/" {
	return {
		type: "comment",
    	text: text()
	}
}

SingleLineText "single line text"
	= [ a-zA-Z0-9]* { return text() }

MultiLineText "multi line text"
	= '"' (!'"' SourceCharacter)* '"' {
	return text().replaceAll('"', '')
}

EmptyLine "empty line"
	= Space* EOL {}

Space "whitespace"
	= [ \t] {}

Text "text"
	= MultiLineText
	/ SingleLineText
    

SourceCharacter "character"
    = .

EOL "end of line"
	= [\r\n]
