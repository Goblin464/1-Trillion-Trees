import { useEffect } from "react";
import { Group, Mesh, MeshBasicMaterial} from "three";
import { useSimulationStore } from "../store/SimulationStore";

interface HeatmapProps {
    group: Group;
    temperatures: Record<string, number>;
}

export function useHeatmap({ group, temperatures}: HeatmapProps) {
    const heatmapEnabled = useSimulationStore(s => s.liveSettings.heatmapEnabled);
    useEffect(() => {
        if (!group) return;

        group.traverse((obj) => {
            if (!(obj as Mesh).isMesh) return;
            const mesh = obj as Mesh;

            const props = mesh.userData?.properties || {};
            const iso = props.iso || props.ISO3;
            const temperature = iso ? temperatures[iso] ?? 0 : 0;
            const baseColor = props.color ?? "#1B7319";
            (mesh.material as MeshBasicMaterial).color.set(
                heatmapEnabled ? getHeatmapColor(temperature) : baseColor
            );
        });
    }, [group, temperatures, heatmapEnabled]);
}

function getHeatmapColor(temp: number): string {
    // Temperaturbereich kappen
    const min = -5;
    const max = 35;
    const clamped = Math.max(min, Math.min(max, temp));

    // Normalisieren auf 0..1
    const t = (clamped - min) / (max - min);

    // Farbverlauf Blue → Cyan → Green → Yellow → Red
    // 0.0 = Blau, 0.25 = Cyan, 0.5 = Grün, 0.75 = Gelb, 1.0 = Rot
    let r = 0, g = 0, b = 0;

    if (t < 0.25) {
        // Blau → Cyan
        const k = t / 0.25;
        r = 0;
        g = k * 255;
        b = 255;
    } else if (t < 0.5) {
        // Cyan → Grün
        const k = (t - 0.25) / 0.25;
        r = 0;
        g = 255;
        b = (1 - k) * 255;
    } else if (t < 0.75) {
        // Grün → Gelb
        const k = (t - 0.5) / 0.25;
        r = k * 255;
        g = 255;
        b = 0;
    } else {
        // Gelb → Rot
        const k = (t - 0.75) / 0.25;
        r = 255;
        g = (1 - k) * 255;
        b = 0;
    }

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}


