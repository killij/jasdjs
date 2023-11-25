import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Home'
import TryItNow from './TryItNow'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function () {
    return (
    <div className="h-100" style={{display: "flex", flexDirection: "column"}}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/index" element={<Home />} />
                    <Route path="/tryitnow" element={<TryItNow />} />
                </Routes>
            </BrowserRouter>
        {/* <div style={{backgroundColor: "red"}}>
        </div> */}
        {/* <div style={{display: "flex", flexDirection: "row", flexGrow: 1}}>
            <div style={{width: "200px", backgroundColor: "blue"}}></div>
            <div style={{flexGrow:1}}></div>
        </div> */}
    </div>)
}