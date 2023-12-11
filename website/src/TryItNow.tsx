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
import PanZoom, { PanZoomHandle } from "./PanZoom"

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

function downloadAsPng() {
    const svgElement = document.querySelector('#diagram > svg')!
    const svgString = new XMLSerializer().serializeToString(svgElement)
    const svg = new Blob([svgString], {type: "image/svg+xml"})
    const url = URL.createObjectURL(svg)

    const img = new Image()
    img.onload = function () {
        const canvas = document.createElement("canvas")
        canvas.width = svgElement.clientWidth * 2
        canvas.height = svgElement.clientHeight * 2
        const ctx = canvas.getContext('2d')!
        ctx.scale(2, 2)
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)
        const png = canvas.toDataURL("image/png")
        const a = document.createElement("a")
        a.href = png
        a.download = "diagram.png"
        a.click()
        a.remove()
        canvas.remove()
    }
    img.src = url
}

function downloadAsSvg() {
    const svgElement = document.querySelector('#diagram > svg')!
    const svgString = new XMLSerializer().serializeToString(svgElement)
    const svgUrl = 'data:image/svg+xml,' + encodeURIComponent(svgString)
    const a = document.createElement("a")
    a.href = svgUrl
    a.download = "diagram.svg"
    a.click()
    a.remove()
}

const debouncedRenderDiagram = debounce(renderDiagram, 500)

export default function TryItNow() {

    const pzRef = useRef<PanZoomHandle>(null)

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
        if (pzRef.current) {
            pzRef.current.resetTransform()
        }
    }

    const handleDownloadAs = useCallback((key: string) => {
        switch (key) {
            case ("svg"): {
                downloadAsSvg()
                break
            }
            case ("png"): {
                //downloadSvgAsPng()
                downloadAsPng()
                break
            }
        }
    }, [setThemeId, setTheme, text])

    return <>
        <div className="page-header">
            <Header />
            <Toolbar 
                selectedTheme={themeId}
                onThemeSelect={handleThemeSelect}
                onResetViewClick={handleResetViewClick}
                onDownloadAs={handleDownloadAs}
                />
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
                    <PanZoom ref={pzRef}>
                        <div id="diagram"></div>
                    </PanZoom>
                </div>
            </div>
        </div>
    </>
}