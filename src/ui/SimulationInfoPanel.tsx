
import { useSimulationStore } from "../store/SimulationStore";


export function SimulationInfoPanel() {
  const result = useSimulationStore((s) => s.yearlyResult);
  if (!result) {
        return;
    }
    return (
        <div
            className="panel"
            style={{
                width: "auto",
                top: "5vh",
                left: "5vh",
                flexDirection: "row",
                display: "flex"
            }}
        >
        <div style={{flexDirection: "column", display: "flex", alignItems: "center", gap: "1vh"}}>
            <label>Trees Planted </label>
            <span> {result.treesPlantedInHa}</span>
        </div>
        <div style={{flexDirection: "column", display: "flex", alignItems: "center", gap: "1vh"}}>
            <label>GlobalWarming </label>
            <span> {result.temperatureIncrease.toFixed(4)}</span>
        </div>
        </div>
    )
}