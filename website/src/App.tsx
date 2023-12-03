import { Route, Routes, HashRouter } from 'react-router-dom'
import Home from './Home'
import TryItNow from './TryItNow'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function () {
    return (
    <div className="h-100" style={{display: "flex", flexDirection: "column"}}>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/index" element={<Home />} />
                    <Route path="/tryitnow" element={<TryItNow />} />
                </Routes>
            </HashRouter>
    </div>)
}