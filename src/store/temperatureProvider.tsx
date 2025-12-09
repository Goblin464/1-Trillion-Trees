import { useEffect } from "react";
import Papa from "papaparse";
import temperatureDataRaw from '../assets/temperatureData.csv?raw'
import coEmissionsPerCapitaRaw from '../assets/co-emissions-per-capita.csv?raw'
import { useSimulationStore } from "../store/SimulationStore";

export function useLoadBaseTemperatures() {
  const setBaseTemperatures = useSimulationStore(s => s.setBaseTemperatures);
  const setTemperatures = useSimulationStore(s => s.setTemperatures);
  const setCoEmissionsPerCapita = useSimulationStore(s => s.setCoEmissionsPerCapita);
  const setBaseCoEmissionsPerCapita = useSimulationStore( s => s.setBaseCoEmissionsPerCapita);
  useEffect(() => {
    Papa.parse(temperatureDataRaw, {
      download: false,
      header: false,
      skipEmptyLines: true,
      complete(result) {
        const rows = result.data as string[][];
        const baseMap: Record<string, number> = {};
        rows.forEach(row => {
          const iso = row[5];        // ISO3
          const year = row[23];      // Jahr
          const temp = row[24];      // Temperatur
          if (year === "2022") {
            baseMap[iso] = Number(temp);
          }
        });
        setBaseTemperatures(baseMap);
        setTemperatures(baseMap); 
      }
    });
  }, []);
   useEffect(() => {
    Papa.parse(coEmissionsPerCapitaRaw, {
      download: false,
      header: false,
      skipEmptyLines: true,
      complete(result) {
        const rows = result.data as string[][];
        const baseMap: Record<string, number> = {};
        rows.forEach(row => {
          const iso = row[1];        // ISO3
          const year = row[2];      // Jahr
          const emissions = row[3];      // Temperatur
          if (year === "2024") {
            baseMap[iso] = Number(emissions);
          }
        });
       setCoEmissionsPerCapita(baseMap);
       setBaseCoEmissionsPerCapita(baseMap);
      }
    });
  }, []);
}
