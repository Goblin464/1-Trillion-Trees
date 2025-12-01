import {
  Group,
  Mesh,
  MeshBasicMaterial,
  Line,
  LineBasicMaterial,
  PerspectiveCamera,
  ShapeGeometry,
  DoubleSide,
  Box3,
  Vector3,
  Shape,
  Path,
  Vector2,
  Color,
  Float32BufferAttribute,
  BufferGeometry,
} from 'three'

const DEFAULT_LAND_COLOR = '#1B7319'
const DEFAULT_BORDER_COLOR = '#ffffff'

type GeoJsonGeometry =
  | { 
      type: 'Polygon'
      coordinates: number[][][]
    }
  | {
      type: 'MultiPolygon'
      coordinates: number[][][][]
    }
  | {
      type: 'LineString'
      coordinates: number[][]
    }
  | {
      type: 'MultiLineString'
      coordinates: number[][][]
    }

type GeoJsonFeature = {
  type: 'Feature'
  geometry: GeoJsonGeometry
  properties?: Record<string, unknown>
}

type GeoJsonFeatureCollection = {
  type: 'FeatureCollection'
  features: GeoJsonFeature[]
}

export class WorldMap {
  public readonly mesh: Group
  public readonly ready: Promise<void>

  private baseSize: Vector3 | null = null

  constructor(geoJson: GeoJsonFeatureCollection) {
    this.mesh = new Group()
    this.ready = this.buildFromGeoJson(geoJson)
  }

  private async buildFromGeoJson(geoJson: GeoJsonFeatureCollection) {
    const group = new Group()

    console.log('[WorldMap] features:', geoJson.features?.length ?? 0)

    for (const feature of geoJson.features) {
      const geom = feature.geometry
      if (!geom) continue

      const colorValue =
        (feature.properties?.color as string | undefined) ?? DEFAULT_LAND_COLOR
      const material = new MeshBasicMaterial({
        color: new Color(colorValue),
        side: DoubleSide,
        depthWrite: false,
      })

      if (geom.type === 'Polygon') {
        this.addPolygon(group, geom.coordinates, material)
      } else if (geom.type === 'MultiPolygon') {
        for (const polygon of geom.coordinates) {
          this.addPolygon(group, polygon, material)
        }
      } else if (geom.type === 'LineString') {
        this.addLineString(group, geom.coordinates)
      } else if (geom.type === 'MultiLineString') {
        for (const line of geom.coordinates) {
          this.addLineString(group, line)
        }
      }
    }

    this.mesh.add(group)
    this.centerMesh()
  }

  private lonLatToXY(lon: number, lat: number): Vector2 {
    // Längengrad: -180..180 → -1..1
    const x = lon / 180
    // Breitengrad: -90..90 → -1..1
    const y = lat / 90

    // Optional: leicht strecken, damit es eher 2:1 wirkt
    const worldScaleX = 1.8
    const worldScaleY = 1.0

    return new Vector2(x * worldScaleX, y * worldScaleY)
  }

  private addPolygon(
    group: Group,
    rings: number[][][],
    material: MeshBasicMaterial,
  ) {
    if (!rings.length) return

    const [outerRing, ...holes] = rings
    if (outerRing.length < 3) return

    const shape = new Shape()

    outerRing.forEach(([lon, lat], index) => {
      const { x, y } = this.lonLatToXY(lon, lat)
      if (index === 0) {
        shape.moveTo(x, y)
      } else {
        shape.lineTo(x, y)
      }
    })
    shape.closePath()

    for (const hole of holes) {
      if (hole.length < 3) continue
      const path = new Path()
      hole.forEach(([lon, lat], index) => {
        const { x, y } = this.lonLatToXY(lon, lat)
        if (index === 0) {
          path.moveTo(x, y)
        } else {
          path.lineTo(x, y)
        }
      })
      path.closePath()
      shape.holes.push(path)
    }

    const geometry = new ShapeGeometry(shape)
    const mesh = new Mesh(geometry, material)
    group.add(mesh)

    // Füge Grenzen als Linien hinzu
    this.addPolygonBorders(group, outerRing)
    for (const hole of holes) {
      this.addPolygonBorders(group, hole)
    }
  }

  private addPolygonBorders(group: Group, ring: number[][]) {
    if (ring.length < 2) return

    const positions: number[] = []
    ring.forEach(([lon, lat]) => {
      const { x, y } = this.lonLatToXY(lon, lat)
      positions.push(x, y, 0.01) // Leicht über der Oberfläche
    })
    // Schließe den Ring
    const [firstLon, firstLat] = ring[0]
    const { x, y } = this.lonLatToXY(firstLon, firstLat)
    positions.push(x, y, 0.01)

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))

    const line = new Line(
      geometry,
      new LineBasicMaterial({
        color: DEFAULT_BORDER_COLOR,
        linewidth: 1,
      }),
    )

    group.add(line)
  }

  private addLineString(group: Group, coords: number[][]) {
    if (coords.length < 2) return

    const positions: number[] = []
    coords.forEach(([lon, lat]) => {
      const { x, y } = this.lonLatToXY(lon, lat)
      positions.push(x, y, 0.01)
    })

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))

    const line = new Line(
      geometry,
      new LineBasicMaterial({
        color: DEFAULT_BORDER_COLOR,
        linewidth: 1,
      }),
    )

    group.add(line)
  }

  private centerMesh() {
    const box = new Box3().setFromObject(this.mesh)
    const center = box.getCenter(new Vector3())
    this.mesh.position.sub(center)
    this.baseSize = box.getSize(new Vector3())
  }

  /**
   * Skaliert die Karte so, dass sie den sichtbaren Bereich der Kamera füllt.
   * Sollte aufgerufen werden, sobald die SVG geladen ist und nach jedem Resize.
   */
  fitToCamera(camera: PerspectiveCamera) {
    if (!this.baseSize) return

    const distance = Math.abs(camera.position.z - this.mesh.position.z)
    const verticalFovInRad = (camera.fov * Math.PI) / 180
    const visibleHeight = 2 * Math.tan(verticalFovInRad / 2) * distance
    const visibleWidth = visibleHeight * camera.aspect

    // Füge einen kleinen Rand hinzu (90% der sichtbaren Fläche)
   
    const scaleFactor = Math.min(visibleWidth / this.baseSize.x, visibleHeight / this.baseSize.y);

    this.mesh.scale.setScalar(scaleFactor)
  }
}

