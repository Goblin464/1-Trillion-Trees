import { useThree } from '@react-three/fiber'
import React, { useMemo, useEffect, useRef } from 'react'
import {
  Group,
  Box3,
  Vector3,
  PerspectiveCamera
} from 'three'
import { CountryPolygon } from './CountryPolygon'

type GeoJsonFeatureCollection = {
  type: 'FeatureCollection'
  features: {
    type: 'Feature'
    geometry: {
      type: 'Polygon' | 'MultiPolygon'
      coordinates: any
    }
    properties?: Record<string, unknown>
  }[]
}

interface WorldMapProps {
  geoJson: GeoJsonFeatureCollection;
  onCountryClick?: (countryProps: any) => void
}

export function WorldMap({ geoJson, onCountryClick }: WorldMapProps) {
  const meshRef = useRef<Group>(null!)
  const baseSize = useRef<Vector3 | null>(null)

  const { camera, size } = useThree()
  const perspectiveCamera = camera as PerspectiveCamera

  // -----------------------------------
  // Create R3F components for each polygon
  // -----------------------------------
  const polygons = useMemo(
    () =>
      geoJson.features.flatMap((feature, index) => {
        const geom = feature.geometry
        const color = feature.properties?.color as string | undefined

        if (!geom) return []

        if (geom.type === "Polygon") {
          return (
            <CountryPolygon
              key={index}
              rings={geom.coordinates}
              properties={feature.properties}
              color={color}
              onClick={() => {onCountryClick?.(feature.properties)
                console.log('Clicked:', feature.properties)
              }}
            />
          )
        }

        if (geom.type === "MultiPolygon") {
          return geom.coordinates.map((poly: any, i: number) => (
            <CountryPolygon
              key={`${index}_${i}`}
              rings={poly}
              properties={feature.properties}
              color={color}
              onClick={() => onCountryClick?.(feature.properties)}
            />
          ))
        }

        return []
      }),
    [geoJson]
  )

  // -----------------------------------
  // Centering
  // -----------------------------------
  useEffect(() => {
    if (!meshRef.current) return

    const box = new Box3().setFromObject(meshRef.current)
    const center = box.getCenter(new Vector3())
    meshRef.current.position.sub(center)

    baseSize.current = box.getSize(new Vector3())
  }, [polygons])


  // -----------------------------------
  // Fit to camera
  // -----------------------------------
  const fitToCamera = () => {
    if (!meshRef.current || !baseSize.current) return

    const distance = Math.abs(perspectiveCamera.position.z - meshRef.current.position.z)
    const verticalFovRad = (perspectiveCamera.fov * Math.PI) / 180

    const visibleHeight = 2 * Math.tan(verticalFovRad / 2) * distance
    const visibleWidth = visibleHeight * perspectiveCamera.aspect

    const scaleFactor = Math.min(
      visibleWidth / baseSize.current.x,
      visibleHeight / baseSize.current.y
    )

    meshRef.current.scale.setScalar(scaleFactor)
  }

  useEffect(() => {
    fitToCamera()
  }, [polygons, size.width, size.height])

  return (
    <group ref={meshRef}>
      {polygons}
    </group>
  )
}
