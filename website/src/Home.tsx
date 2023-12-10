import { Link } from "react-router-dom"
import Header from "./Header"

const Home = () => <>
    <Header />
    <div className="px-4 pt-5 my-5 text-center border-bottom">
        <h1 className="display-4 fw-bold text-body-emphasis">Sequence Diagrams for the masses</h1>
        <div className="col-lg-6 mx-auto">
            <p className="lead mb-4">Quickly sketch out process flows then spend hours making them look pretty.</p>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
                <Link to="/tryitnow" className="btn btn-primary btn-lg px-4 me-sm-3" role="button">Try it now</Link>
            </div>
        </div>
    </div>
</>

export default Home