import { useThree } from '@react-three/fiber'
import { useMemo, useEffect, useRef } from 'react'

import {
  Group,
  Box3,
  Vector3,
  PerspectiveCamera,
  Object3D
} from 'three'
import { CountryPolygon } from './CountryPolygon'
import { useHeatmap } from './HeatmapController'
import { useTrees } from './TreesForCountry'

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
  temperatures: Record<string, number>;
  onCountryClick?: (countryProps: any, screenPos: { x: number; y: number }) => void
}

export function WorldMap({ geoJson, temperatures, onCountryClick }: WorldMapProps) {
  const worldRef = useRef<Group>(null!)
  const treeRef = useRef<Group>(null!)
  
  const { camera, size } = useThree()
  const perspectiveCamera = camera as PerspectiveCamera

  // -----------------------------------
  // Building Map
  // -----------------------------------
  const polygons = useMemo(
    () =>
      geoJson.features.flatMap((feature, index) => {
        const geom = feature.geometry
        const color = feature.properties?.color as string | undefined


        if (!geom) return []

        const handleClick = (props: any, position: Vector3) => {
          if (!position) return
          const vector = position.clone().project(perspectiveCamera)
          const x = ((vector.x + 1) / 2) * size.width
          const y = ((-vector.y + 1) / 2) * size.height
          onCountryClick?.(props, { x, y })
        }

        if (geom.type === "Polygon") {
          return (
            <CountryPolygon
              key={index}
              rings={geom.coordinates}
              properties={feature.properties}
              color={color}
              onClick={handleClick}
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
              onClick={handleClick}
            />
          ))
        }
        return []
      }),
    [geoJson]
  )

  useHeatmap({
    group: worldRef.current,
    temperatures,
  });

  useTrees({
    worldGroupRef: worldRef,
    treeGroupRef: treeRef
  });

 useEffect(() => {
  if (worldRef.current) {
    fitCameraToWorld(perspectiveCamera, worldRef.current, size);
  }
}, [worldRef.current, size, perspectiveCamera]);


function fitCameraToWorld(camera: PerspectiveCamera, object: Object3D, viewportSize: { width: number; height: number }, offset = 1.) {
  const boundingBox = new Box3().setFromObject(object)

  if (!boundingBox.isEmpty()) {
    const center = boundingBox.getCenter(new Vector3())
    const sizeVec = boundingBox.getSize(new Vector3())

    // Berechne die maximale Dimensionen
    const maxX = sizeVec.x
    const maxY = sizeVec.y

    // Berechne die Entfernung, sodass alles sichtbar ist, abhängig von FOV und Aspekt
    const aspect = viewportSize.width / viewportSize.height
    const fov = camera.fov * (Math.PI / 180) // in Radians

    let distanceY = (maxY / 2) / Math.tan(fov / 2)
    let distanceX = (maxX / 2) / (Math.tan(fov / 2) * aspect)

    const distance = Math.max(distanceX, distanceY) * offset

    // Kamera auf Z-Achse setzen 
    camera.position.set(center.x, center.y, distance)
    camera.lookAt(center)

    // near und far anpassen
    camera.near = 0.1
    camera.far = distance * 4
    camera.updateProjectionMatrix()
  }
}


  return (
    <group>
      <group ref={worldRef}>{polygons}</group>
      <group ref={worldRef}>
        {polygons}

        
      </group>

      <group ref={treeRef} />

    </group>

  )
}
