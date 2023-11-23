import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Home from './Home';
import TryItNow from './TryItNow';

export default function () {
    return (<>
        <div className="container-fluid">
            <header className="d-flex flex-wrap justify-content-center py-3 mb-0 border-bottom">
                <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
                    <img height="50" src="img/logo.svg"></img>
                    <div>
                        <small className="text-muted">&nbsp;&nbsp;&nbsp;(Just Another Sequence Diagrammer)</small>
                    </div>
                </a>
                <ul className="nav nav-pills">
                    
                    <li className="nav-item"><a href="index" className="nav-link">Home</a></li>
                    <li className="nav-item"><a href="tryitnow" className="nav-link">Try it now</a></li>
                    <li className="nav-item"><a href="https://github.com/killij/jasdjs" className="nav-link">Github</a></li>
                </ul>
            </header>
        </div>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/index" element={<Home />} />
                <Route path="/tryitnow" element={<TryItNow />} />
            </Routes>
        </BrowserRouter>
    </>)
}