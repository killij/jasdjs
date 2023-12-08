import { Route, Routes, HashRouter } from 'react-router-dom'
import Home from './Home'
import TryItNow from './TryItNow'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

export default function () {
    return (
        <div className="page-wrapper">
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/index" element={<Home />} />
                    <Route path="/tryitnow" element={<TryItNow />} />
                </Routes>
            </HashRouter>
        </div>
    )
}