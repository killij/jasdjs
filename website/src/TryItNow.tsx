import { useCallback, useEffect, useState } from "react"
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/theme-xcode"
import { Parse, Renderer } from "jasdjs"
import Toolbar from "./Toolbar"
import Header from "./Header"
import Talent from "./themes/talents"
import './TryItNow.css'

export default function TryItNow() {
    const [text, setText] = useState(() => {
        const value = window.localStorage.getItem("jasd-document")
        return value !== null ? value : ""
    })
    const [theme, setTheme] = useState({})

    const handleThemeSelect = useCallback((key: string) => {
        switch (key) {
            case "talent": setTheme(Talent); break
            default: setTheme({})
        }
    }, [setTheme])

    const handleDocumentChange = useCallback((text: string) => {
        setText(text)
        window.localStorage.setItem("jasd-document", text)
    }, [setText])

    useEffect(() => {
        try {
            const sd = Parse(text)
            const el = document.getElementById("diagram")!
            const renderer = new Renderer(sd, el, theme)
            renderer.render()
        } catch (err) {
            console.log(err)
        }
    }, [theme, text])

    return (
    <>
        <Header />
        <Toolbar onThemeSelect={handleThemeSelect} />
        <div className="container-fluid h-100">
            <div className="row mb-3 text-center h-100">
                <div className="col-md-4 ps-0 pe-1 themed-grid-col" style={{ backgroundColor: "#ccc" }}>
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