function talentBackground(draw, width, height) {
    const group = draw.group()
    const logoGroup = group.group()

    const patternFunc = (add) => {
        // attr: https://philiprogers.com/svgpatterns/#honeycomb
        add.rect(56, 100).fill('#fff')
        add.path('M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100').fill('none').stroke('#131743').attr({"stroke-width": 2}).opacity(0.02)
        add.path('M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34').fill('none').stroke('#131743').attr({"stroke-width": 2}).opacity(0.02)
    }

    const pattern = draw.pattern(56, 100, patternFunc)
    group.rect(width, height).fill(pattern).move(0,0).back()

    logoGroup
        .path("m772.96,847.62l-295.81-.91.53-172.71-171.54-.53.91-295.81,144.95.44.45-145.74,295.81.91-.9,295.8-144.95-.44-.07,22.65,171.54.53-.91,295.81Zm-250.9-45.54l206.27.63.63-206.27-171.54-.53.34-112.17,144.95.44.63-206.28-206.28-.63-.45,145.74-144.95-.44-.63,206.27,171.54.53-.53,172.71Z")
        .fill("#ee3878")
        .stroke("none")
    logoGroup.front()

    const scaleFactor = 0.25
    const targetWidth = width * scaleFactor
    const calculatedScaleFactor = targetWidth / logoGroup.bbox().width

    logoGroup.cx(width / 2)
    logoGroup.cy(height / 2)
    logoGroup.scale(calculatedScaleFactor, calculatedScaleFactor).opacity(0.60)
    return group
}

export default {
    padding: 20,
    title: {
        paddingBottom: 20,
        textOptions: {
            align: "right",
            family: "Work Sans",
            size: 36,
            fill: "#131743",
            weight: "bold"
        }
    },
    notes: {
        name: "jasd-note",
        textBoxOptions: {
            margin: 7,
            textOptions: {
                family: "Work Sans"
            }

        }
    },
    lifelines: {
        textBoxOptions: {
            rounding: 4,
            padding: 10,
            margin: 7,
            fill: "#fafafa",
            textOptions: {
                family: "Work Sans",
                size: 16,
            },
            strokeOptions: {
                width: 1,
                fill: "#777"
            }
        },
        lineOptions: {
            fill: "#777",
            lineType: "dashed",
            dashStyle: "16 2"
        }
    },
    messages: {
        fontOptions: {
            family: "Work Sans",
            fill: "#131743"
        },
        arrowSpace: 0,
        padding: 5
    },
    background: talentBackground
}