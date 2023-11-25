import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import ButtonGroup from 'react-bootstrap/ButtonGroup'

export default function Toolbar({ onThemeSelect }: any) {
    return (
        <div className="navbar fixed-bottom navbar-expand-sm navbar-dark bg-dark">
            <div className="container-fluid">
                <div className="collapse navbar-collapse" id="navbarCollapse">
                    <ul className="navbar-nav">
                        <li className="nav-item dropup">
                        <DropdownButton as={ButtonGroup} key="up" drop="up" variant="secondary" title="Theme" onSelect={onThemeSelect}>
                                <Dropdown.Item eventKey="default">Default</Dropdown.Item>
                                <Dropdown.Item eventKey="basic">Basic</Dropdown.Item>
                                <Dropdown.Item eventKey="lol">I need a designer</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Header>Sponsors</Dropdown.Header>
                                <Dropdown.Item eventKey="talent">Talent Consulting</Dropdown.Item>
                            </DropdownButton>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}