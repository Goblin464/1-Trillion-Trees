import { useEffect, useRef } from "react"
import { useSimulationStore } from "../store/SimulationStore"
import { animatePanelEnter } from "./animations/UiAnimations"

export function ControlsPanel() {
  const panelRef = useRef<HTMLDivElement | null>(null)

  const liveSettings = useSimulationStore((s) => s.liveSettings)

  const setCO2 = useSimulationStore((s) => s.setCo2GrowthRate)
  const setReforestationBudget = useSimulationStore((s) => s.setReforestationBudget)
  const setYear = useSimulationStore((s) => s.setYear)

  useEffect(() => {
    if (panelRef.current) animatePanelEnter(panelRef.current)
  }, [])

  return (
    <div
      ref={panelRef}
      className="panel"
      style={{
        width: "280px",
        bottom: "5vh",
        left: "5vh",
        flexDirection: "column",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "20px" }}>Simulation Controls</h2>
      
        <div>
          <label>CO₂ Growth Rate (% / Year): {liveSettings.co2GrowthRate}</label>
          <input
            type="range"
            min={0}
            max={3}
            step={0.1}
            value={liveSettings.co2GrowthRate}
            onChange={(e) => setCO2(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label>Forrestation Budget (Mrd $ / Jahr): {liveSettings.reforestationBudget}</label>
          <input
            type="range"
            min={0}
            max={200}
            step={3}
            value={liveSettings.reforestationBudget}
            onChange={(e) => setReforestationBudget(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label>Year: {liveSettings.year}</label>
          <input
            type="range"
            min={2025}
            max={2100}
            step={1}
            value={liveSettings.year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
      </div>
      )
}
