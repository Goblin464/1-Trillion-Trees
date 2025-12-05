
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
            <span> {result.treesPlanted}</span>
        </div>
        <div style={{flexDirection: "column", display: "flex", alignItems: "center", gap: "1vh"}}>
            <label>GlobalWarming </label>
            <span> {result.temperatureIncrease}</span>
        </div>
        </div>
    )
}