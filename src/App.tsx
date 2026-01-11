import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { WorldMap } from "./three/WorldMap"
import { ControlsPanel } from "./ui/ControlsPanel"
import worldGeoJsonRaw from './assets/worldMapV2.geojson?raw'
import { CountryInfoPanel } from "./ui/CountryInfoPanel"
import { SimulationInfoPanel } from "./ui/SimulationInfoPanel"
import { useLoadData } from "./store/DataProvider"
import { useSimulationStore } from "./store/SimulationStore"

import { Timeline } from "@mui/icons-material"
import { TimeLine } from "./ui/TimeLine"
import { SideControlsPanel } from "./ui/sideControllsPanel"



export function App() {
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [countryPanelPos, setCountryPanelPos] = useState<{ x: number, y: number } | null>(null);

  useLoadData()
  const temperatures = useSimulationStore(s => s.temperatures);
  const worldGeoJson = useMemo(() => {
    const parsed = JSON.parse(worldGeoJsonRaw) as any
    parsed.features = parsed.features
      .filter((f: any) => {
        const name = f.properties?.NAME || ''
        const admin = f.properties?.ADMIN || ''
        return !name.toLowerCase().includes('antarctica') &&
          !admin.toLowerCase().includes('antarctica')
      })
      .map((f: any) => ({
        ...f,
        properties: {
          ...f.properties,
          name: f.properties?.NAME || f.properties?.ADMIN || 'Unknown',
          population: f.properties?.POP_EST || undefined,
          iso: f.properties?.ISO_A3 || undefined,
        }
      }))
    return parsed
  }, [])

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 0, background: "#4DA6FF" }}
      >
        <ambientLight intensity={5} />
        <directionalLight position={[5, 5, 5]} />
        <WorldMap
          geoJson={worldGeoJson}
          temperatures={temperatures}
          onCountryClick={(props, screenPos) => {
            setSelectedCountry(props);
            setCountryPanelPos(screenPos);
          }}
        />
      </Canvas>
      <CountryInfoPanel
        country={selectedCountry}
        position={countryPanelPos}
        onClose={() => {
          setSelectedCountry(null)
          setCountryPanelPos(null)
        }}
      />
    

      <SideControlsPanel>
  <ControlsPanel />
</SideControlsPanel>

      <SimulationInfoPanel></SimulationInfoPanel>
     
      <TimeLine></TimeLine>
    </div>
  )
}
