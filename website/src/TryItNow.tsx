import { useCallback, useEffect, useRef, useState } from "react"
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/theme-xcode"
import { Parse, Renderer } from "jasdjs"
import Toolbar from "./Toolbar"
import Header from "./Header"
import TalentTheme from "./themes/talent"
import BasicTheme from "./themes/basic"
import debounce from "lodash.debounce"
import panzoom from "panzoom"
import "./TryItNow.css"

function getTheme(id: string) {
    switch (id) {
        case "basic": return BasicTheme
        case "talent": return TalentTheme
        default: return {}
    }
}

const defaultDocument = `title: A title

ll: j as John
ll: s as Simon

j -> s: Hello
s --> j: "Hi, how are you?"
note over j: "What a nice chap,
thought John"
`

function renderDiagram(text: string, theme: object) {
    try {
        const sd = Parse(text)
        const el = document.getElementById("diagram")!
        const renderer = new Renderer(sd, el, theme)
        renderer.render()
    } catch (err) {
        console.log(err)
    }
}

const debouncedRenderDiagram = debounce(renderDiagram, 500)

export default function TryItNow() {
    const [text, setText] = useState(() => {
        const value = window.localStorage.getItem("jasd-document")
        return value !== null ? value : defaultDocument
    })
    const [themeId, setThemeId] = useState(() => {
        const value = window.localStorage.getItem("jasd-theme")
        return value !== null ? value : "default"
    })
    const [theme, setTheme] = useState(getTheme(themeId))

    const handleThemeSelect = useCallback((key: string) => {
        window.localStorage.setItem("jasd-theme", key)
        setThemeId(key)
        setTheme(getTheme(key))
        renderDiagram(text, getTheme(key))
    }, [setThemeId, setTheme, text])

    const handleDocumentChange = useCallback((text: string) => {
        window.localStorage.setItem("jasd-document", text)
        setText(text)
        debouncedRenderDiagram(text, theme)
    }, [setText, theme])

    const diagramHost = useRef<HTMLDivElement>(null)

    useEffect(() => {
        renderDiagram(text, theme)
        const el = document.getElementById('diagram')!
        const ref = panzoom(el, {
            maxZoom: 2,
            minZoom: 0.3
        })
        return () => ref.dispose()
    }, [diagramHost])

    return <>
            <div className="page-header">
                <Header />
                <Toolbar selectedTheme={themeId} onThemeSelect={handleThemeSelect} />
            </div>
            <div className="page-body">
                <div className="editor-column">
                    <AceEditor name="editor"
                        mode="text" theme="xcode"
                        width="400px" height="100%"
                        onChange={handleDocumentChange}
                        value={text}
                    />
                </div>
                <div className="diagram-column">
                    <div className="diagram-wrapper">
                        <div id="diagram" ref={diagramHost}></div>
                    </div>
                </div>
            </div>
        </>
}