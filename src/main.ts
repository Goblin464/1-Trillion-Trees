import './style.css'
import { SceneManager } from './three/SceneManager'
import { WorldMap } from './three/WorldMap'
// GeoJSON als Roh-String importieren und dann parsen
import worldGeoJsonRaw from './assets/worldMap.geojson?raw'

const appElement = document.querySelector<HTMLDivElement>('#app')

if (!appElement) {
  throw new Error('Element #app not found')
}

// Scene / Renderer / Camera werden im SceneManager gekapselt
const sceneManager = new SceneManager(appElement)

// Weltkarte aus GeoJSON-Geometrie
const worldGeoJson = JSON.parse(worldGeoJsonRaw) as any
const worldMap = new WorldMap(worldGeoJson)
sceneManager.add(worldMap.mesh)

const fitMapToCamera = () => worldMap.fitToCamera(sceneManager.camera)

worldMap.ready.then(() => {
  fitMapToCamera()
  sceneManager.onResize(fitMapToCamera)
})

// Kleine Animation, damit du direkt siehst, dass alles lebt
sceneManager.onUpdate((_dt, elapsed) => {
  worldMap.mesh.rotation.z = 0.02 * Math.sin(elapsed * 0.3)
})

sceneManager.start()
