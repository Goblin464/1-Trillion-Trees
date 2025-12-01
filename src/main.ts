import './style.css'
import { SceneManager } from './three/SceneManager'
import { WorldMap } from './three/WorldMap'
// GeoJSON als Roh-String importieren und dann parsen
import worldGeoJsonRaw from './assets/worldMapV2.geojson?raw'

const appElement = document.querySelector<HTMLDivElement>('#app')

if (!appElement) {
  throw new Error('Element #app not found')
}

// Scene / Renderer / Camera werden im SceneManager gekapselt
const sceneManager = new SceneManager(appElement)

// Weltkarte aus GeoJSON-Geometrie
const worldGeoJsonRawParsed = JSON.parse(worldGeoJsonRaw) as any

// Entferne Antarktis
const worldGeoJson = {
  ...worldGeoJsonRawParsed,
  features: worldGeoJsonRawParsed.features.filter((feature: any) => {
    const name = feature.properties?.NAME || ''
    const admin = feature.properties?.ADMIN || ''
    return !name.toLowerCase().includes('antarctica') && 
           !admin.toLowerCase().includes('antarctica')
  })
}

const worldMap = new WorldMap(worldGeoJson)
sceneManager.add(worldMap.mesh)

const fitMapToCamera = () => worldMap.fitToCamera(sceneManager.camera)

worldMap.ready.then(() => {
  fitMapToCamera()
  sceneManager.onResize(fitMapToCamera)
})

// Kleine Animation, damit du direkt siehst, dass alles lebt
sceneManager.onUpdate(() => {
  // Optional: Leichte Rotation entfernen, wenn du die Karte statisch haben willst
  // worldMap.mesh.rotation.z = 0.02 * Math.sin(elapsed * 0.3)
})

sceneManager.start()

