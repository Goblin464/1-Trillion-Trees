import { useSimulationStore } from "../store/SimulationStore";


interface CountryInfoPanelProps {
  country: any; // Typisieren z. B. mit interface CountryProperties
  position: {x: number, y : number} | null
  onClose?: () => void;
}

export function CountryInfoPanel({ country, position, onClose }: CountryInfoPanelProps) {
 const temperatures = useSimulationStore(s => s.temperatures); // aktuelle dynamische Temperaturen

  if (!country || !position) return null;

  // ISO-Code aus den Properties
  const iso = country.iso;
  const temperature = iso ? temperatures[iso] : undefined;
  return (

    <div
      style={{
        position: 'absolute',
        top: position.y,
        left: position.x,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '8px',
        minWidth: '200px'
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        
      </button>

      <h2>{country.name}</h2>
      {country.population && <p>Population: {country.population.toLocaleString()}</p>}
       {iso && <p>Average Temperature: {temperature?.toFixed(2) ?? "N/A"}°C</p>}
      {country.iso && <p>ISO-Code: {country.iso}</p>}
    </div>
  );
}
