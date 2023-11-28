import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import './Toolbar.css'

export default function Toolbar({ selectedTheme, onThemeSelect }: any) {
    
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
    
    return (
        <div className="container-fluid toolbar bg-dark">
            <DropdownButton  key="down" drop="down" variant="secondary" title="Theme" onSelect={onThemeSelect}>
                {
                    defaultThemes.map(theme => {
                        return <Dropdown.Item eventKey={theme.key} active={theme.selected} className="checked">{theme.title}</Dropdown.Item>
                    })
                }
                {/*
                <Dropdown.Divider />
                <Dropdown.Header>Sponsors</Dropdown.Header>
                <Dropdown.Item eventKey="talent">Talent Consulting</Dropdown.Item> */}
            </DropdownButton>
        </div>
    )
}