import { useEffect, useRef } from "react"
import { useSimulationStore } from "../store/SimulationStore"
import { animatePanelEnter } from "./animations/UiAnimations"

export function ControlsPanel() {
  const panelRef = useRef<HTMLDivElement | null>(null)

  const co2 = useSimulationStore((s) => s.co2)
  const setCO2 = useSimulationStore((s) => s.setCO2)

  const reforestationBudget = useSimulationStore((s) => s.reforestationBudget)
  const setReforestationBudget = useSimulationStore((s) => s.setReforestationBudget)

  const timeSpeed = useSimulationStore((s) => s.timeSpeed)
  const setTimeSpeed = useSimulationStore((s) => s.setTimeSpeed)

  useEffect(() => {
    if (panelRef.current) animatePanelEnter(panelRef.current)
  }, [])

  return (
    <div
      ref={panelRef}
      style={{
        width: "280px",
        padding: "18px",
        background: "rgba(218, 218, 243, 0.34)",
        color: "white",
        borderRadius: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        zIndex: 1,
        bottom: "5vh",
        left: "5vh",
        position: "absolute"
      }}
    >
      <h2 style={{ margin: 0, fontSize: "20px" }}>Simulation Controls</h2>

      <div>
        <label>CO₂ Ausstoß (Gt / Jahr): {co2}</label>
        <input
          type="range"
          min={0}
          max={60}
          step={1}
          value={co2}
          onChange={(e) => setCO2(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

      <div>
        <label>Aufforstungsbudget (Mrd $ / Jahr): {reforestationBudget}</label>
        <input
          type="range"
          min={0}
          max={200}
          step={5}
          value={reforestationBudget}
          onChange={(e) => setReforestationBudget(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

      <div>
        <label>Zeitraffer: {timeSpeed}x</label>
        <input
          type="range"
          min={1}
          max={50}
          step={1}
          value={timeSpeed}
          onChange={(e) => setTimeSpeed(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  )
}
