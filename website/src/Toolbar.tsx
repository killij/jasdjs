import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import './Toolbar.css'

export default function Toolbar({ selectedTheme, onThemeSelect, onResetViewClick }: any) {
    
    const defaultThemes = [
        {
            key: "default",
            title: "Default",
            selected: selectedTheme === "default"
        },
        {
            key: "basic",
            title: "Basic",
            selected: selectedTheme === "basic"
        },
    ]

    const sponsorThemes = [
        {
            key: "talent",
            title: "Talent Consulting",
            selected: selectedTheme === "talent"
        },
    ]
    
    return (
        <Navbar expand="lg" bg="dark" as="div" data-bs-theme="dark" role="toolbar">
            <Container fluid>
                <Nav className="me-start">
                    <NavDropdown key="theme" drop="down" title="Theme" onSelect={onThemeSelect}>
                        {
                            defaultThemes.map(theme => {
                                return <NavDropdown.Item key={theme.key} eventKey={theme.key} active={theme.selected} className="checked">{theme.title}</NavDropdown.Item>
                            })
                        }
                        <NavDropdown.Divider />
                        <NavDropdown.Header>Sponsors</NavDropdown.Header>
                        {
                            sponsorThemes.map(theme => {
                                return <NavDropdown.Item key={theme.key} eventKey={theme.key} active={theme.selected} className="checked">{theme.title}</NavDropdown.Item>
                            })
                        }
                    </NavDropdown>
                </Nav>
                <Nav className="me-end">
                    <Nav.Link onClick={onResetViewClick}>Reset view</Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    )
}