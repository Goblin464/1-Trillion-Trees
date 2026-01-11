import { Scale } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
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
    Vector3,
    Box3,
    Group,
    Mesh
} from 'three'
import gsap from 'gsap'

const DEFAULT_LAND_COLOR = '#1B7319'
//const DEFAULT_BORDER_COLOR = '#ffffffff'

export interface CountryPolygonProps {
    rings: number[][][]      // GeoJSON rings
    color?: string
    properties: any
    onClick?: (props: any, center: Vector3) => void;
}


export function CountryPolygon({ rings, properties, color, onClick }: CountryPolygonProps) {
    const originalZRef = useRef<number>(0);

    function lonLatToXY(lon: number, lat: number): Vector2 {
        const x = (lon / 180) * 1.8
        const y = (lat / 90) * 1
        return new Vector2(x, y)
    }
    function getCenter(): Vector3 {
        const [outerRing] = rings
        if (!outerRing || outerRing.length === 0) return new Vector3(0, 0, 0)

        let sumX = 0, sumY = 0
        outerRing.forEach(([lon, lat]) => {
            const v = lonLatToXY(lon, lat)
            sumX += v.x
            sumY += v.y
        })

        const n = outerRing.length

        return new Vector3(sumX / n, sumY / n, 0)
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
                e.stopPropagation();
                //save hovered in userData for heatmap
                const mesh = e.object as Mesh;
                mesh.userData.isHovered = true;

                if (!groupRef.current || !materialRef.current) return;
                gsap.killTweensOf(materialRef.current.color);
              
                // save color before hover
                hoverColorRef.current = materialRef.current.color.clone();
              
                gsap.to(materialRef.current.color, {
                    r: 0.2,
                    g: 0.9,
                    b: 1,
                    duration: 0.2,
                    overwrite: true,
                });
            }}

            onPointerLeave={(e) => {

                e.stopPropagation();

                const mesh = e.object as Mesh;
                mesh.userData.isHovered = false;

                if (!groupRef.current || !materialRef.current || !hoverColorRef.current) return;
                gsap.killTweensOf(materialRef.current.color);


                // Zurück zur Heatmap/Base-Farbe
                gsap.to(materialRef.current.color, {
                    r: hoverColorRef.current.r,
                    g: hoverColorRef.current.g,
                    b: hoverColorRef.current.b,
                    duration: 0.0,
                    overwrite: true,
                });
            }}

        >
            {/* Landfläche */}
            <mesh
                geometry={shapeGeometry}
                userData={{ properties }}
                onClick={(event) => {
                    event.stopPropagation()
                    if (!onClick) return

                    const localCenter = getCenter()
                    const worldCenter = localCenter.clone()
                    event.object.localToWorld(worldCenter)
                    onClick(properties, worldCenter)
                }}
            >
                <meshBasicMaterial
                    ref={materialRef}
                    color={new Color(color ?? DEFAULT_LAND_COLOR)}
                    side={DoubleSide}
                />
            </mesh>

            {/* Grenzlinien */}
            {borderGeometry && (
                <lineLoop
                    renderOrder={1}
                    geometry={borderGeometry}
                    material={new LineBasicMaterial({ color: 0x000000 })}
                    raycast={() => null}
                />
            )}
        </group>
    )

}