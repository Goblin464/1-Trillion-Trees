import { useEffect } from "react";
import Papa from "papaparse";
import temperatureDataRaw from '../assets/temperatureData.csv?raw'
import { useSimulationStore } from "../store/SimulationStore";

export function useLoadBaseTemperatures() {
  const setBaseTemperatures = useSimulationStore(s => s.setBaseTemperatures);
  const setTemperatures = useSimulationStore(s => s.setTemperatures);

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
        setTemperatures(baseMap); // initial auch direkt die aktuelle Temperatur setzen
      }
    });
  }, []);
}
