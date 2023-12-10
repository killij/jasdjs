import { useCallback, useState, MouseEvent, useRef, WheelEvent, useImperativeHandle, forwardRef, PropsWithChildren } from "react"

export type PanZoomHandle = {
    resetTransform: () => void;
}

const PanZoom = forwardRef<PanZoomHandle, PropsWithChildren>(({ children }, ref) => {

    useImperativeHandle(ref, () => {
        return {
            resetTransform() {
                const transform = new DOMMatrix()
                setTransform(transform)
                innerRef.current!.style.transform = transform.toString()
            }
        }
    })

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

            let matrix = new DOMMatrix()
            matrix = matrix.multiply(transform)
            matrix = matrix.translate(diffX * 1/currentMatrix.m11, diffY * 1/currentMatrix.m11)
            innerRef.current.style.transform = matrix.toString()
        }
    }, [panActive, innerRef, origin, transform])

    const handleMouseLeave = useCallback((event: MouseEvent) => {
        setPanActive(false)
        setTransform(new DOMMatrix(innerRef.current!.style.transform))
    }, [setPanActive])

    const handleWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
        event.stopPropagation()
        if (!innerRef.current || !outerRef.current){
            return
        }

        const rect = outerRef.current.getBoundingClientRect()
        const point = new DOMPoint(event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2)
        const scale = 1 - event.deltaY * 0.001

        const newTransform = new DOMMatrix()
        const currentTransform = new DOMMatrix(innerRef.current?.style.transform)

        newTransform.translateSelf(point.x, point.y)
        newTransform.scaleSelf(scale, scale)

        //const clamp = (min: number, val: number, max: number) => Math.max(min, Math.min(val, max))
        newTransform.translateSelf(-point.x, -point.y)
        newTransform.multiplySelf(currentTransform)

        innerRef.current.style.transform = newTransform.toString()
        setTransform(newTransform)
    }, [innerRef, outerRef])

    return <>
    <div id="pan-zoom-wrapper"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        ref={outerRef}>
        <div ref={innerRef}>
            {children}
        </div>
    </div>
    </>
})

export default PanZoom