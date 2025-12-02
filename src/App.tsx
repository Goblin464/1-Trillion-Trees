import React, { useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { WorldMap } from "./three/WorldMap"
import { ControlsPanel } from "./ui/ControlsPanel"
import worldGeoJsonRaw from './assets/worldMapV2.geojson?raw'

export function App() {
  // GeoJSON parsen und Antarktis entfernen
  const worldGeoJson = useMemo(() => {
    const parsed = JSON.parse(worldGeoJsonRaw) as any
    parsed.features = parsed.features.filter((f: any) => {
      const name = f.properties?.NAME || ''
      const admin = f.properties?.ADMIN || ''
      return !name.toLowerCase().includes('antarctica') &&
             !admin.toLowerCase().includes('antarctica')
    })
    return parsed
  }, [])

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} />

        <WorldMap geoJson={worldGeoJson} />
      </Canvas>
    </div>
  )
}
