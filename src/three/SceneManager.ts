import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  AmbientLight,
  Object3D,
} from 'three'

type UpdateCallback = (dt: number, elapsedTime: number) => void
type ResizeCallback = (width: number, height: number) => void

export class SceneManager {
  public readonly scene: Scene
  public readonly camera: PerspectiveCamera
  public readonly renderer: WebGLRenderer

  private updateCallbacks: UpdateCallback[] = []
  private resizeCallbacks: ResizeCallback[] = []
  private lastTime = 0
  private isRunning = false

  constructor(container: HTMLElement) {
    // Renderer
    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    container.innerHTML = ''
    container.appendChild(this.renderer.domElement)

    // Scene
    this.scene = new Scene()
    this.scene.background = new Color('#1597E8')

    // Camera
    this.camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    this.camera.position.set(0, 0, 5)

    // Basic ambient light (hilft später bei 3D-Objekten)
    const ambientLight = new AmbientLight(0xffffff, 1)
    this.scene.add(ambientLight)

    // Resize handling
    window.addEventListener('resize', this.handleResize)
  }

  add(object: Object3D) {
    this.scene.add(object)
  }

  onUpdate(callback: UpdateCallback) {
    this.updateCallbacks.push(callback)
  }

  onResize(callback: ResizeCallback) {
    this.resizeCallbacks.push(callback)
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.lastTime = performance.now()
    requestAnimationFrame(this.animate)
  }

  private animate = (time: number) => {
    if (!this.isRunning) return

    const dt = (time - this.lastTime) / 1000
    this.lastTime = time

    for (const cb of this.updateCallbacks) {
      cb(dt, time / 1000)
    }

    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.animate)
  }

  private handleResize = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)

    for (const cb of this.resizeCallbacks) {
      cb(width, height)
    }
  }
}


