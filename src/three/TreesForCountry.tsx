import { useEffect, useRef, type RefObject } from "react";
import { BufferGeometry, Group, Mesh, Vector3, Raycaster, Box3 } from "three";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { useSimulationStore } from "../store/SimulationStore";
import { calculateTreeObjects } from "../calculations/SimulationCalculator";
import { MTLLoader } from "three/examples/jsm/Addons.js";

// --- Zufälliger Punkt innerhalb Mesh mit Raycasting ---
function getRandomPointOnMesh(mesh: Mesh): Vector3 {
  const geom = mesh.geometry as BufferGeometry;
  const pos = geom.attributes.position;

  // Bounding Box
  geom.computeBoundingBox();
  const box = geom.boundingBox!;
  const min = box.min;
  const max = box.max;

  const raycaster = new Raycaster();
  let point = new Vector3();
  let attempts = 0;

  while (attempts < 100) { // max 100 Versuche
    attempts++;


    const x = Math.random() * (max.x - min.x) + min.x;
    const y = Math.random() * (max.y - min.y) + min.y;
    const z = max.z + 1; // Startpunkt oberhalb des Meshes

    raycaster.set(new Vector3(x, y, z), new Vector3(0, 0, -1)); // nach unten

    const intersects = raycaster.intersectObject(mesh, true);
    if (intersects.length > 0) {
      point.copy(intersects[0].point);
      break;
    }
  }

  return point;
}


interface UseTreesProps {
  worldGroupRef: RefObject<Group>;
  treeGroupRef: RefObject<Group>;
}

export function useTrees({ worldGroupRef, treeGroupRef }: UseTreesProps) {
  const treeMaterials = useLoader(MTLLoader, '/Lowpoly_tree_sample.mtl')
  const treeObj = useLoader(OBJLoader, "/Lowpoly_tree_sample.obj",  loader => {
    treeMaterials.preload()
    loader.setMaterials(treeMaterials)
  });
  const treesByIso = useRef<Map<string, Group[]>>(new Map())
  const forestationCountries = useSimulationStore(s => s.forestationPotentials);
  const liveSettings = useSimulationStore(s => s.liveSettings);
  const treesPlantedInHa = useSimulationStore(s => s.yearlyResult.treesPlantedInHa);

  const forestationCountriesIso = new Set(
    Object.keys(forestationCountries).slice(0, 10)
  );

  function meshAreaApprox(mesh: Mesh) {
    const box = new Box3().setFromObject(mesh)
    const size = box.getSize(new Vector3())
    return size.x * size.y
  }

  function pickWeightedRandomMesh(meshes: Mesh[]) {
    const weighted = meshes.map(m => ({
      mesh: m,
      weight: meshAreaApprox(m)
    }))

    const total = weighted.reduce((s, w) => s + w.weight, 0)
    let r = Math.random() * total

    for (const w of weighted) {
      r -= w.weight
      if (r <= 0) return w.mesh
    }

    return weighted[0].mesh
  }
  useEffect(() => {
    const worldGroup = worldGroupRef.current
    const treeGroup = treeGroupRef.current
    if (!worldGroup || !treeGroup) return

    const countryMeshesByIso = new Map<string, Mesh[]>()

    worldGroup.traverse(obj => {
      const mesh = obj as Mesh
      const props = mesh.userData?.properties
      if (!props) return

      const iso = props.iso || props.ISO3
      if (!iso) return

      if (!countryMeshesByIso.has(iso)) {
        countryMeshesByIso.set(iso, [])
      }
      countryMeshesByIso.get(iso)!.push(mesh)
    })

    for (const [iso, meshes] of countryMeshesByIso.entries()) {
      if (!forestationCountriesIso.has(iso)) continue

      const targetCount = Math.min(
        calculateTreeObjects(treesPlantedInHa),
        100
      )

      const existing = treesByIso.current.get(iso) ?? []
      const delta = targetCount - existing.length

      // 🌱 Mehr Bäume nötig
      if (delta > 0) {
        const countryMesh = pickWeightedRandomMesh(meshes)

        for (let i = 0; i < delta; i++) {
          const tree = treeObj.clone()
          tree.position.copy(getRandomPointOnMesh(countryMesh))
          tree.scale.setScalar(0.002)
          tree.rotateX(0.8)

          treeGroup.add(tree)
          existing.push(tree)
        }
      }

      // 🌲 Zu viele Bäume → entfernen
      if (delta < 0) {
        for (let i = 0; i < Math.abs(delta); i++) {
          const tree = existing.pop()
          if (!tree) break
          treeGroup.remove(tree)
        }
      }

      treesByIso.current.set(iso, existing)
    }
  }, [treesPlantedInHa])

}
