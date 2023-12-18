import { Route, Routes, HashRouter } from 'react-router-dom'
import TryItNow from './TryItNow'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

const App = () => {
    return (
        <div className="page-wrapper">
            <HashRouter>
                <Routes>
                    <Route path="/" element={<TryItNow />} />
                    <Route path="/index" element={<TryItNow />} />
                </Routes>
            </HashRouter>
        </div>
    )
}

export default App