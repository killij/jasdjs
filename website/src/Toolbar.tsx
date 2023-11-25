import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'

export default function Toolbar({ onThemeSelect }: any) {
    return (
        <Navbar expand="lg" className="navbar-dark bg-dark" as="div" role="" fixed="bottom">
            <Navbar.Brand as="div">&nbsp;Styles</Navbar.Brand>
            {/* <Navbar.Collapse id="basic-navbar-nav"> */}
                    <Nav className="me-auto">
                        <NavDropdown title="Themes" drop="up" key="up" onSelect={onThemeSelect}>
                            <NavDropdown.Item eventKey="default">Default</NavDropdown.Item>
                            <NavDropdown.Item eventKey="basic">Basic</NavDropdown.Item>
                            <NavDropdown.Item eventKey="lol">I'm not artistic</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Header>Sponsors</NavDropdown.Header>
                            <NavDropdown.Item eventKey="talent">Talent</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Background" drop="up" key="up">
                            <NavDropdown.Header>Coming soon...</NavDropdown.Header>
                            {/* <NavDropdown.Header>Colours</NavDropdown.Header>
                            <NavDropdown.Item eventKey="white">White</NavDropdown.Item>
                            <NavDropdown.Item eventKey="light-grey">Light Grey</NavDropdown.Item>
                            <NavDropdown.Item eventKey="medium-greay">Medium Grey</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Header>Patterns</NavDropdown.Header>
                            <NavDropdown.Item eventKey="dots">Dots</NavDropdown.Item>
                            <NavDropdown.Item eventKey="dots">Cubic</NavDropdown.Item> */}
                        </NavDropdown>
                    </Nav>
                {/* </Navbar.Collapse> */}
        </Navbar>
    )
}