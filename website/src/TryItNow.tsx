import AceEditor from "react-ace"
//import "ace-builds/src-noconflict/mode-text"
import "ace-builds/src-noconflict/theme-xcode"
//import "ace-builds/src-noconflict/ext-language_tools"
import { Parse, Renderer } from "jasdjs"

function onChange(newValue: string) {
    try {
        const sd = Parse(newValue)
        const el = document.getElementById("diagram")!
        const renderer = new Renderer(sd, el, {})
        renderer.render()
    } catch (err) {
        console.log(err)
    }
}

export default function TryItNow() {
    return <div className="container-fluid h-100">
    <div className="row mb-3 text-center h-100">
        <div className="col-md-4 ps-0 pe-1 themed-grid-col" style={{backgroundColor: "#ccc"}}>
            <div className="h-100">
                <AceEditor name="editor"
                    mode="text" theme="xcode"
                    width="" height=""
                    className="h-100"
                    onChange={onChange}
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
}