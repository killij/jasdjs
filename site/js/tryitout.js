let editor = undefined

WebFont.load({
    google: {
        families: ['Raleway', 'Kdam Thmor Pro', 'Work Sans']
    },
    active: function() { update(); }
});

function talentBackground(draw, width, height) {
    const group = draw.group()

    const patternFunc = (add) => {
        // attr: https://philiprogers.com/svgpatterns/#honeycomb
        add.rect(56, 100).fill('#fff')
        add.path('M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100').fill('none').stroke('#f7f7f7').attr({"stroke-width": 2})
        add.path('M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34').fill('none').stroke('#fafafa').attr({"stroke-width": 2})
    }

    const pattern = draw.pattern(56, 100, patternFunc)
    group.rect(width, height).fill(pattern).move(0,0).back()
    draw.style(".st0", { fill: "#101920"})
    draw.style(".st1", { fill: "#FFFFFF"})
    draw.style(".st2", { fill: "#00AFCE"})
    draw.style(".st3", { fill: "none"})
    
    const logoGroup = group.group()
    const talentGroup = logoGroup.group()
    talentGroup.path("M340.7,104.6c-5.7,0-8.8-3.3-8.8-9.6V65.4h13.4l3.6-12.7h-17V39.1l-14.8,4.3v52c0,14.1,7.9,21.5,21.8,21.5c5.3,0,10.7-1.4,14.2-4.3L349,102C346.7,103.8,343.8,104.6,340.7,104.6z").addClass("st0")
    talentGroup.path("M134.7,78.7v37.4H123l-2.2-7.8c-3.6,5.5-10.4,8.6-19.9,8.6c-14.5,0-23.6-8-23.6-19.1c0-10.6,7.1-19,26.3-19h16.4v-1c0-8.7-5.2-13.9-15.8-13.9c-7.1,0-14.5,2.4-19.2,6.3l-5.8-10.9c6.8-5.3,16.6-7.9,26.8-7.9C124.2,51.5,134.7,60.3,134.7,78.7z M119.9,96.1v-7.4h-15.3c-10.1,0-12.8,3.8-12.8,8.5c0,5.4,4.5,8.8,12.1,8.8C111.1,106,117.4,102.7,119.9,96.1z").addClass("st0")
    talentGroup.path("M234.3,88.9h-49.7c1.8,9.3,9.5,15.3,20.5,15.3c7.1,0,12.7-2.3,17.2-6.9l7.9,9.2c-5.7,6.8-14.6,10.4-25.5,10.4c-21.2,0-35-13.7-35-32.7s13.9-32.6,32.7-32.6c18.5,0,32,13,32,33C234.5,85.7,234.4,87.5,234.3,88.9z M184.4,79h35.9c-1.2-9.2-8.2-15.5-17.9-15.5C192.9,63.5,185.9,69.7,184.4,79z").addClass("st0")
    talentGroup.polygon("145.9,35 145.9,116.1 160.7,116.1 160.7,30.7").addClass("st0")
    talentGroup.polygon("73.4,30.7 69.8,43.4 95.3,43.4 98.9,30.7").addClass("st2")
    talentGroup.polygon("28.3,30.7 24.7,43.4 51.2,43.4 51.2,116.1 66.1,116.1 66.1,30.7").addClass("st0")
    talentGroup.path("M279.5,51.5c-9.2,0-17,3.1-21.8,9l-2-6.9l-12.1,3.5v59h14.8V83.8c0-12.8,7.1-19.2,17.7-19.2c9.5,0,15.1,5.5,15.1,16.9v34.6h14.8V79.5C305.9,60.3,294.7,51.5,279.5,51.5z").addClass("st0")

    const consultingGroup = logoGroup.group()
    consultingGroup.path("M784.5,104.6c-5.7,0-8.8-3.3-8.8-9.6V65.4h13.4l3.6-12.7h-17V39.1L761,43.4v52c0,14.1,7.9,21.5,21.8,21.5c5.3,0,10.7-1.4,14.2-4.3l-4.2-10.6C790.6,103.8,787.6,104.6,784.5,104.6z").addClass("st2")
    consultingGroup.path("M563.4,51.5c-9.2,0-17,3.1-21.8,9l-2-6.9l-12.1,3.5v59h14.8V83.8c0-12.8,7.1-19.2,17.7-19.2c9.5,0,15.1,5.5,15.1,16.9v34.6h14.8V79.5C589.8,60.3,578.5,51.5,563.4,51.5z").addClass("st2")
    consultingGroup.path("M866.1,51.5c-9.2,0-17,3.1-21.8,9l-2-6.9l-12.1,3.5v59H845V83.8c0-12.8,7.1-19.2,17.7-19.2c9.5,0,15.1,5.5,15.1,16.9v34.6h14.8V79.5C892.6,60.3,881.3,51.5,866.1,51.5z").addClass("st2")
    consultingGroup.path("M368.6,74.4c0-24.9,19-42.8,44.6-42.8c13.6,0,25.2,4.9,33,13.9l-10,9.4c-6.1-6.5-13.6-9.8-22.3-9.8c-17.3,0-29.8,12.1-29.8,29.3s12.5,29.3,29.8,29.3c8.7,0,16.2-3.2,22.3-9.9l10,9.5c-7.7,9-19.4,13.9-33.1,13.9C387.7,117.3,368.6,99.3,368.6,74.4z").addClass("st2")
    consultingGroup.path("M450.6,84.3c0-19,14.3-32.5,33.8-32.5c19.8,0,33.9,13.4,33.9,32.5c0,19-14.2,32.6-33.9,32.6C464.9,116.9,450.6,103.3,450.6,84.3z M503.3,84.3c0-12.1-8.1-19.9-18.9-19.9c-10.7,0-18.8,7.7-18.8,19.9c0,12.1,8.1,19.9,18.8,19.9C495.2,104.2,503.3,96.4,503.3,84.3z").addClass("st2")
    consultingGroup.path("M597,109.8l5.7-11.3c5.6,3.7,14.2,6.3,22.1,6.3c9.4,0,13.3-2.6,13.3-7c0-12.1-39.3-0.7-39.3-26.1c0-12,10.8-19.9,28-19.9c8.4,0,18.1,2,23.8,5.5L645,68.6c-6.1-3.6-12.1-4.8-18.2-4.8c-9,0-13.3,3-13.3,7.1c0,12.9,39.3,1.4,39.3,26.3c0,11.9-10.9,19.6-28.8,19.6C613.3,116.9,602.7,113.8,597,109.8z").addClass("st2")
    consultingGroup.path("M723.7,116.1h-14.2V108c-4.8,5.8-12.3,8.9-20.5,8.9c-16.3,0-27.4-8.9-27.4-28.1V56.7l14.9-4.2v34.3c0,11.5,5.5,17,14.9,17c10.4,0,17.4-6.4,17.4-19.2v-28l14.9-4.2V116.1z").addClass("st2")
    consultingGroup.path("M749.8,27.8v88.3h-14.9V31.9L749.8,27.8z").addClass("st2")
    consultingGroup.path("M802,33.1c0-5,4-8.9,9.5-8.9s9.5,3.7,9.5,8.6c0,5.2-3.9,9.3-9.5,9.3C806.1,42,802,38.1,802,33.1zM818.9,52.5v63.6H804V56.7L818.9,52.5z").addClass("st2")
    consultingGroup.path("M970,106.4c0,23.1-12,33.6-34.3,33.6c-11.9,0-23.7-3.1-30.9-9l6.7-11.2c5.6,4.6,14.6,7.6,23.4,7.6c14,0,20.2-6.4,20.2-19.3v-3.3c-5.2,5.7-12.7,8.5-21.3,8.5c-18.2,0-32.1-12.4-32.1-30.8c0-18.4,13.9-30.6,32.1-30.6c8.9,0,16.8,2.9,22,9.2l1.2-4.5l13-3.9V106.4z M955.3,82.4c0-10.7-8.1-18-19.3-18c-11.3,0-19.4,7.3-19.4,18c0,10.8,8.1,18.2,19.4,18.2C947.3,100.6,955.3,93.2,955.3,82.4z").addClass("st2")


    const scaleFactor = 0.75
    const targetWidth = width * scaleFactor
    const calculatedScaleFactor = targetWidth / group.bbox().width

    logoGroup.cx(width / 2)
    logoGroup.cy(height / 2)
    logoGroup.scale(calculatedScaleFactor, calculatedScaleFactor).opacity(0.05)
    return group
}

function update() {
    try {
        const text = editor.getValue()
        const diagram = jasdjs.Parse(text)
        const container = document.getElementById("diagram")
        // const rendererx = new jasdjs.Renderer(diagram, container)
        // rendererx.render()
        // return
        const renderer = new jasdjs.Renderer(diagram, container, {
            padding: 20,
            title: {
                paddingBottom: 20,
                textOptions: {
                    align: "right",
                    family: "Work Sans",
                    size: 36,
                    fill: "#009CB8",
                    weight: "bold"
                }
            },
            lifelines: {
                textBoxOptions: {
                    margin: 7
                }
            },
            notes: {
                textBoxOptions: {
                    margin: 7

                }
            },
            lifelines: {
                textBoxOptions: {
                    rounding: 7,
                    padding: 15,
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
                    //width: 1,
                    fill: "#777",
                    lineType: "dashed",
                    dashStyle: "16 2"
                }
            },
            
            background: talentBackground
        })
        renderer.render()
    } catch (ex) {
        console.error(ex)
    }
}

// setup Ace editor once the dom has loaded
addEventListener("DOMContentLoaded", (event) => {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/xcode");
    editor.getSession().setMode("ace/mode/asciidoc");
    
    editor.getSession().on('change', function () {
        update()
    });

    update()
});