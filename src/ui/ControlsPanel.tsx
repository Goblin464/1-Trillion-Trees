import { useRef } from "react";
import { useSimulationStore } from "../store/SimulationStore";

import { Panel } from "./Panel";
import { FormControlLabel, Slider } from "@mui/material";
import { Switch } from "@mui/material";

export function ControlsPanel() {
  const panelRef = useRef<HTMLDivElement | null>(null);

  const liveSettings = useSimulationStore((s) => s.liveSettings);

  const setCO2 = useSimulationStore((s) => s.setCo2GrowthRate);
  const setReforestationBudget = useSimulationStore((s) => s.setReforestationInHa);
  const setYear = useSimulationStore((s) => s.setYear);
  const setHeatmapEnabled = useSimulationStore((s) => s.setHeatmapEnabled);



  return (
    <Panel
      ref={panelRef} 
      title="Simulation Controls"
      defaultCollapsed={true}
      style={{
        width: "280px",
        position: "absolute",
        bottom: "5vh",
        left: "5vh",
        flexDirection: "column",
      }}
    >
      {/* Heatmap Toggle */}
      <div style={{ marginBottom: "10px" }}>
        <FormControlLabel
          control={
            <Switch
              checked={liveSettings.heatmapEnabled}
              onChange={(e) => setHeatmapEnabled(e.target.checked)}
              color="grey"
              sx={{
            ml: 1,
            mr: 2,
          }}
            />
          }
          label="Heatmap"
        />
      </div>

      {/* CO2 Slider */}
      <div style={{ marginBottom: "10px" }}>
        <label>Emissions: {liveSettings.co2GrowthRate}</label>
        <Slider
          value={liveSettings.co2GrowthRate}
          min={-3}
          max={3}
          step={0.1}
          onChange={(e, val) => setCO2(val as number)}
          sx={{
            color: "grey",
            ml: 1,
            mr: 2,
          }}
        />
      </div>

      {/* Reforestation Slider */}
      <div style={{ marginBottom: "10px" }}>
        <label>Forestation: {liveSettings.reforestationInHa}</label>
        <Slider
          min={0}
          max={14_000_000}
          step={100}
          value={liveSettings.reforestationInHa}
          onChange={(e, val) => setReforestationBudget(val as number)}
          sx={{
            color: "grey",
            ml: 1,
            mr: 2,

          }}

        />
      </div>

      {/* Year Slider */}
      <div>
        <label>TimeLine: {liveSettings.year}</label>
        <Slider
          min={2025}
          max={2125}
          step={1}
          value={liveSettings.year}
          onChange={(e, val) => setYear(val as number)}
          sx={{
            color: "grey",
            ml: 1,
            mr: 2,
          }}
        />
      </div>
    </Panel>
  );
}
