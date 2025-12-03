import React from 'react';

interface CountryInfoPanelProps {
  country: any; // Typisieren z. B. mit interface CountryProperties
  onClose?: () => void;
}

export function CountryInfoPanel({ country, onClose }: CountryInfoPanelProps) {
  if (!country) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
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
      {country.iso && <p>ISO-Code: {country.iso}</p>}
    </div>
  );
}
