import { useMemo } from 'react'
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
    Vector3
} from 'three'


const DEFAULT_LAND_COLOR = '#1B7319'
const DEFAULT_BORDER_COLOR = '#ffffff'

export interface CountryPolygonProps {
    rings: number[][][]      // GeoJSON rings
    color?: string
    properties: any
    onClick?: (props: any, center: Vector3) => void;
}


export function CountryPolygon({ rings, properties, color, onClick }: CountryPolygonProps) {

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
                userData={{ properties }}
                onClick={(event) => {
                    if (!onClick) return
                    const localCenter = getCenter()        
                    const worldCenter = localCenter.clone()
                    event.object.localToWorld(worldCenter) 
                    onClick(properties, worldCenter)   
                }}
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
