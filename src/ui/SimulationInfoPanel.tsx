
import { Sprout, Thermometer } from "lucide-react";
import { useSimulationStore } from "../store/SimulationStore";


type SimulationInfoPanelProps = {
    className?: string;
};
function formatMillions(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} Mio`
  }
  return value.toLocaleString()
}
export function SimulationInfoPanel({ className = "" }: SimulationInfoPanelProps) {
    const result = useSimulationStore((s) => s.yearlyResult);
    if (!result) {
        return null;
    }
    return (
        <div
            className={`panel ${className}`}
            style={{
                borderRadius:"20px",
                width: "auto",
                top: "5vh",
                left: "7vh",
                flexDirection: "row",
                display: "flex"
            }}
        >
            <div style={{ flexDirection: "column", display: "flex", alignItems: "center", gap: "1vh" }}
            className="sproud">
                <Sprout
                    size={28}
                    style={{ color: "green" }}
                />
                <span> {formatMillions(result.treesPlantedInHa)}</span>
            </div>
            <div style={{ flexDirection: "column", display: "flex", alignItems: "center", gap: "1vh" }}
            className="thermometer">
                <Thermometer
                    size={28}
                    style={{ color: "F2630A"}}
                />
                <span> {result.temperatureIncrease.toFixed(4)}</span>
            </div>
        </div>
    )
}