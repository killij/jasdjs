import { useCallback, useEffect, useState } from "react"
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/theme-xcode"
import { Parse, Renderer } from "jasdjs"
import Toolbar from "./Toolbar"
import Header from "./Header"
import TalentTheme from "./themes/talents"
import BasicTheme from "./themes/basic"
import './TryItNow.css'
import debounce from "lodash.debounce"

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

    useEffect(() => {
        renderDiagram(text, theme)
    }, [])

    return (
    <>
        <Header />
        <Toolbar selectedTheme={themeId} onThemeSelect={handleThemeSelect} />
        <div className="container-fluid h-100">
            <div className="row mb-3 text-center h-100">
                <div className="col-md-4 ps-0 pe-1 themed-grid-col" style={{ backgroundColor: "#ccc", maxWidth: "400px" }}>
                    <div className="h-100">
                        <AceEditor name="editor"
                            mode="text" theme="xcode"
                            width="" height=""
                            className="h-100"
                            onChange={handleDocumentChange}
                            value={text}
                        />
                    </div>
                </div>
                <div className="col-md-8 themed-grid-col">
                    <div className="diagram h-100">
                        <div id="diagram" className="h-100"></div>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}