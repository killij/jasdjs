import { useCallback, useEffect, useRef, useState } from "react"
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/theme-xcode"
import { Parse, Renderer } from "jasdjs"
import Toolbar from "./Toolbar"
import Header from "./Header"
import TalentTheme from "./themes/talent"
import BasicTheme from "./themes/basic"
import debounce from "lodash.debounce"
import "./TryItNow.css"
import PanZoom from "./PanZoom"

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

    const divRef = useRef<HTMLDivElement>(null)

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

        
    }, [text, theme])

    function handleResetViewClick() {

    }

    return <>
        <div className="page-header">
            <Header />
            <Toolbar selectedTheme={themeId} onThemeSelect={handleThemeSelect} onResetViewClick={handleResetViewClick}/>
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
                    <PanZoom>
                        <div id="diagram" ref={divRef} ></div>
                    </PanZoom>
                </div>
            </div>
        </div>
    </>
}