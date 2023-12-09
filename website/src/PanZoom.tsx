import { useCallback, useState, MouseEvent, useRef, WheelEvent } from "react"

const PanZoom = (props: any) => {
    const [panActive, setPanActive] = useState(false)
    const [origin, setOrigin] = useState<DOMPoint>()
    const [transform, setTransform] = useState<DOMMatrix>()
    const innerRef = useRef<HTMLDivElement>(null)
    const outerRef = useRef<HTMLDivElement>(null)

    const handleMouseDown = useCallback((event: MouseEvent<HTMLDivElement>) => {
        setOrigin(new DOMPoint(event.clientX, event.clientY))
        setPanActive(true)
        event.preventDefault()
        event.stopPropagation()
    }, [setPanActive, setOrigin])

    const handleMouseUp = useCallback((event: MouseEvent<HTMLDivElement>) => {
        setPanActive(false)
        setTransform(new DOMMatrix(innerRef.current!.style.transform))
    }, [setPanActive, setTransform, innerRef])

    const handleMouseMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
        if (panActive && innerRef.current) {
            event.preventDefault()
            event.stopPropagation()

            const diffX = event.clientX - origin!.x
            const diffY = event.clientY - origin!.y

            const currentMatrix = new DOMMatrix(innerRef.current.style.transform)
            const currentScale = currentMatrix.m11

            let matrix = new DOMMatrix()
            //matrix = matrix.multiply(new DOMMatrix(innerRef.current.style.transform))
            matrix = matrix.multiply(transform)
            matrix = matrix.translate(diffX * 1/currentScale, diffY * 1/currentScale)
            innerRef.current.style.transform = matrix.toString()
        }
    }, [panActive, innerRef, origin, transform])

    const handleMouseLeave = useCallback((event: MouseEvent) => {
        setPanActive(false)
        setTransform(new DOMMatrix(innerRef.current!.style.transform))
    }, [setPanActive])

    const handleWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
        event.preventDefault()
        if (!innerRef.current || !outerRef.current){
            return
        }

        const rect = outerRef.current.getBoundingClientRect()
        const point = new DOMPoint(event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2)

        const newTransform = new DOMMatrix()
        const currentTransform = new DOMMatrix(innerRef.current?.style.transform)

        newTransform.translateSelf(point.x, point.y)
        const scale = 1 - event.deltaY * 0.001
        newTransform.scaleSelf(scale, scale)
        newTransform.translateSelf(-point.x, -point.y)
        newTransform.multiplySelf(currentTransform)

        innerRef.current.style.transform = newTransform?.toString() ?? ""
        setTransform(newTransform)

        // //currentTransform.translateSelf(event.clientX, event.clientY)

        // scaledTransform.multiplySelf(currentTransform)
        // innerRef.current.style.transform = scaledTransform?.toString() ?? ""
        // setTransform(scaledTransform)


        
        // const scaledTransform = new DOMMatrix(`scale(${1 - event.deltaY * 0.001})`)
        // const currentTransform = new DOMMatrix(innerRef.current?.style.transform)

        // //currentTransform.translateSelf(event.clientX, event.clientY)

        // scaledTransform.multiplySelf(currentTransform)
        // innerRef.current.style.transform = scaledTransform?.toString() ?? ""
        // setTransform(scaledTransform)
    }, [innerRef, outerRef])

    return <>
    <div id="pan-zoom-wrapper"
        style={{overflow: "hidden", flex: "1 1 auto"}}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        ref={outerRef}>
        <div ref={innerRef}>
            {props.children}
        </div>
    </div>
    </>
}

export default PanZoom