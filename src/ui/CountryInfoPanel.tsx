import { useSimulationStore } from "../store/SimulationStore";
import { CountryInfoPanelAnimation } from "./animations/CountryInfoPanelAnimation";

export function CountryInfoPanel() {
  const panelCountry = useSimulationStore((s) => s.panelCountry);
  const panelPosition = useSimulationStore((s) => s.panelPosition);
  const temperatures = useSimulationStore((s) => s.temperatures);
  const emissions = useSimulationStore((s) => s.coEmissionsPerCapita);

  if (!panelCountry || !panelPosition) return null;

  const iso = panelCountry.iso;
  const temperature = iso ? temperatures[iso] : undefined;
  const emission = iso ? emissions[iso] : undefined;

  const facts = [
    { label: "Population", value: panelCountry.population?.toLocaleString() ?? "N/A" },
    { label: "Avg. Temperature", value: iso && temperature != null ? `${temperature.toFixed(2)}°C` : "N/A" },
    { label: "CO₂ per Capita", value: iso && emission != null ? `${emission.toFixed(2)} t` : "N/A" },
  ];

  return (
    <CountryInfoPanelAnimation position={panelPosition}>
      <div
        onMouseLeave={() => {
        }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "12px 14px",
          textAlign: "center",
          color: "#000",
          fontFamily: "sans-serif",
          fontSize: "13px",
          lineHeight: "16px",
          boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
          position: "relative",
          pointerEvents: "none",
          minWidth: "160px",
        }}

      >


        <h2 style={{ margin: "0 0 16px 0" }}>{panelCountry.name}</h2>

        <div style={{ display: "grid", gap: "8px", textAlign: "left" }}>
          {facts.map((fact) => (
            <div key={fact.label} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <span style={{ fontWeight: 600 }}>{fact.label}:</span>
              <span>{fact.value}</span>
            </div>
          ))}
        </div>
      </div>
    </CountryInfoPanelAnimation>
  );
}
