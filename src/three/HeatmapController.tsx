import { useEffect } from "react";
import { Group, Mesh, MeshBasicMaterial } from "three";
import { useSimulationStore } from "../store/SimulationStore";

interface HeatmapProps {
    group: Group;
    temperatures: Record<string, number>;
}

export function useHeatmap({ group, temperatures }: HeatmapProps) {
    const heatmapEnabled = useSimulationStore(s => s.liveSettings.heatmapEnabled);
    useEffect(() => {
        if (!group) return;

        group.traverse((obj) => {
            if (!(obj as Mesh).isMesh) return;

            const mesh = obj as Mesh;
            if (mesh.userData.isHovered) return;
            const props = mesh.userData?.properties || {};
            const iso = props.iso || props.ISO3;
            const temperature = iso ? temperatures[iso] ?? 0 : 0;
            const baseColor =  "#b4c309";//;'#ff7003'
            (mesh.material as MeshBasicMaterial).color.set(
                heatmapEnabled ? getHeatmapColor(temperature) : baseColor
            );
            mesh.userData.baseColor = getHeatmapColor(temperature);
        });
    }, [group, temperatures, heatmapEnabled]);
}

function getHeatmapColor(temp: number): string {
    const min = -20;
    const max = 45;

    const clamped = Math.max(min, Math.min(max, temp));

    let r = 0, g = 0, b = 0;

    if (clamped <= 0) {
        // 🔵 Dunkelblau → Weiß (-20 → 0)
        const t = (clamped - min) / (0 - min); // 0..1

        r = 255 * t;
        g = 255 * t;
        b = 150 + 105 * t; // von dunklem Blau zu Weiß
    }
    else if (clamped <= 30) {
        // ⚪ Weiß → Rot (0 → 35)
        const t = clamped / 30; // 0..1

        r = 255;
        g = 255 * (1 - t * 0.85); // langsamer Abfall für viele Abstufungen
        b = 255 * (1 - t);
    }
    else {
        // 🔴 Rot → Dunkelrot (35 → 45)
        const t = (clamped - 35) / 10; // 0..1

        r = 180 - t * 80; // 180 → 100 (dunkles Rot)
        g = 0;
        b = 0;
    }

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}
