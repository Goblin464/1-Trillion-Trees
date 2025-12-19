import { useSimulationStore } from "../store/SimulationStore";
import { CountryInfoPanelAnimation } from "./animations/CountryInfoPanelAnimation";

interface CountryInfoPanelProps {
  country: any;
  position: { x: number; y: number } | null;
  onClose?: () => void; // optionales Callback
}


export function CountryInfoPanel({ country, position, onClose }: CountryInfoPanelProps) {
  const temperatures = useSimulationStore((s) => s.temperatures);
  const emissions = useSimulationStore((s) => s.coEmissionsPerCapita);

  if (!country || !position) return null;

  const iso = country.iso;
  const temperature = iso ? temperatures[iso] : undefined;
  const emission = iso ? emissions[iso] : undefined;

  const facts = [
    { label: "Population", value: country.population?.toLocaleString() ?? "N/A" },
    { label: "Temperature", value: iso && temperature != null ? `${temperature.toFixed(2)}°C` : "N/A" },
    { label: "CO₂ per Capita", value: iso && emission != null ? `${emission.toFixed(2)} t` : "N/A" },
  ];

  return (
    <CountryInfoPanelAnimation position={position}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: "40px",
          padding: "24px",
          textAlign: "center",
          color: "#000",
          fontFamily: "sans-serif",
          fontSize: "18px",
          lineHeight: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          pointerEvents: "auto",
          position: "relative",
        }}
      >
        {/* Close-Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              border: "none",
              background: "transparent",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        )}

        <h2 style={{ margin: "0 0 16px 0" }}>{country.name}</h2>

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
