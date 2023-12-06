import { OptionOverrides } from "jasdjs"

const theme: OptionOverrides = {
    defaultFont: {
        family: "Arial"
    },    
    title: {
        align: "middle",
        paddingBottom: 10,
        font: {
            size: 36
        }
    },
    notes: {
        box: {
            margin: 7
        }
    },
    participants: {
        box: {
            cornerRounding: 5,
            padding: 10,
            margin: 7,
            font: {
                size: 16
            }
        },
        lifeline: {
            color: "#aaaaaa"
        }
    }
}

export default theme