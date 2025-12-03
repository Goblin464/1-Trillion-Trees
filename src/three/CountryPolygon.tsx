import React, { useMemo } from 'react'
import {
    Mesh,
    Shape,
    ShapeGeometry,
    MeshBasicMaterial,
    DoubleSide,
    LineBasicMaterial,
    BufferGeometry,
    Float32BufferAttribute,
    Vector2,
    Color
} from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { Line } from '@react-three/drei'

const DEFAULT_LAND_COLOR = '#1B7319'
const DEFAULT_BORDER_COLOR = '#ffffff'

export interface CountryPolygonProps {
    rings: number[][][]      // GeoJSON rings
    color?: string
    properties: any
    onClick?: (props: any) => void;
}

export function CountryPolygon({ rings, properties, color, onClick }: CountryPolygonProps) {

    function lonLatToXY(lon: number, lat: number): Vector2 {
        const x = (lon / 180) * 1.8
        const y = (lat / 90) * 1.0
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
        // close ring
        /*const v0 = lonLatToXY(outerRing[0][0], outerRing[0][1])
        positions.push(v0.x, v0.y, 0) I THink not neccesairy because of line loop*/

        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
        return geo
    }, [rings])

    if (!shapeGeometry) return null

    return (
        <group>
            {/* Landfläche */}
            <mesh
                geometry={shapeGeometry}
                material={
                    new MeshBasicMaterial({
                        color: new Color(color ?? DEFAULT_LAND_COLOR),
                        side: DoubleSide,
                    })
                }
                onClick={() => onClick?.(properties)}
            />

            {/* Grenzlinien */}
            {borderGeometry && (
                <lineLoop
                    geometry={borderGeometry}
                    material={new LineBasicMaterial({ color: DEFAULT_BORDER_COLOR })}
                />


            )}
        </group>
    )
}
