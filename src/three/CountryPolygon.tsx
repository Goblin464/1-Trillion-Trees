
import { useMemo, useRef} from 'react'
import {
    Shape,
    ShapeGeometry,
    MeshBasicMaterial,
    DoubleSide,
    LineBasicMaterial,
    BufferGeometry,
    Float32BufferAttribute,
    Vector2,
    Color,
    Group,
    Mesh,
} from 'three'
import { useSimulationStore } from '../store/SimulationStore'
import gsap from 'gsap'


const DEFAULT_LAND_COLOR = '#b4c309'
//const DEFAULT_BORDER_COLOR = '#ffffffff'

export interface CountryPolygonProps {
    rings: number[][][]      // GeoJSON rings
    properties: any
}


export function CountryPolygon({ rings, properties}: CountryPolygonProps) {
    function lonLatToXY(lon: number, lat: number): Vector2 {
        const x = (lon / 180) * 1.8
        const y = (lat / 90) * 1
        return new Vector2(x, y)
    }

    const shapeGeometry = useMemo(() => {
        const [outerRing] = rings
        if (!outerRing) return null
        const shape = new Shape()

        outerRing.forEach(([lon, lat], i) => {
            const v = lonLatToXY(lon, lat)
            i === 0 ? shape.moveTo(v.x, v.y) : shape.lineTo(v.x, v.y)
        })
        shape.closePath()

        return new ShapeGeometry(shape)

    }, [rings])


    const borderGeometry = useMemo(() => {
        const [outerRing] = rings
        if (!outerRing) return null

        const positions: number[] = []
        outerRing.forEach(([lon, lat]) => {
            const v = lonLatToXY(lon, lat)
            positions.push(v.x, v.y, 0)
        })

        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
        return geo
    }, [rings])

    if (!shapeGeometry) return null
    const groupRef = useRef<Group>(null!)
    const materialRef = useRef<MeshBasicMaterial>(null)
    const hoverColorRef = useRef<Color | null>(null);

    return (
        <group
            ref={groupRef}
            onPointerEnter={(e) => {

                e.stopPropagation()

                const mesh = e.object as Mesh
                mesh.userData.isHovered = true

                if (!materialRef.current) {

                    return
                }
                gsap.killTweensOf(materialRef.current.color)

                // Hover-Farbe merken
                hoverColorRef.current = materialRef.current.color.clone()

                // Hover-Far   be animieren
                gsap.to(materialRef.current.color, {
                    r: 10,
                    g: 1,
                    b: 1,
                    duration: 0.2,
                    overwrite: true,
                })

                // 👉 Tooltip-Logik (aus onPointerMove)

                const mouseX = e.clientX;
                const mouseY = e.clientY;

                // Bildschirmgröße
                const screenWidth = window.innerWidth;
                // Offset für das Panel
                const offsetX = 150; // Abstand zur Maus
                const offsetY = 50;

                // Prüfen, ob die Maus links oder rechts vom Bildschirm ist
                const panelX = mouseX < screenWidth / 2 ? mouseX + offsetX : mouseX - offsetX;
                const panelY = mouseY - offsetY; // Panel leicht über der Maus
                useSimulationStore.getState().setPanel(properties, {
                    x: panelX,
                    y: panelY,
                });
                //console.log("setting position: " + worldPosition.x)
            }}

            onPointerLeave={(e) => {
                e.stopPropagation()

                const mesh = e.object as Mesh
                mesh.userData.isHovered = false

                if (!materialRef.current || !hoverColorRef.current) return
                gsap.killTweensOf(materialRef.current.color)

                // Farbe zurücksetzen
                gsap.to(materialRef.current.color, {
                    r: hoverColorRef.current.r,
                    g: hoverColorRef.current.g,
                    b: hoverColorRef.current.b,
                    duration: 0,
                    overwrite: true,
                })

                // Tooltip ausblenden
                if (!useSimulationStore.getState().isHoveringPanel) {
                    useSimulationStore.getState().clearPanel();
                }


            }}
        >

            {/* Landfläche */}
            <mesh
                geometry={shapeGeometry}
                userData={{ properties }}

            ><meshBasicMaterial
                    ref={materialRef}
                    color={new Color(DEFAULT_LAND_COLOR)}
                    side={DoubleSide}
                />

            </mesh>

            {/* Grenzlinien */}
            {borderGeometry && (
                <lineLoop
                    renderOrder={1}
                    geometry={borderGeometry}
                    material={new LineBasicMaterial({ color: "black" })}
                    raycast={() => null}
                />
            )}
        </group>
    )

}