import { useEffect } from "react";
import Papa from "papaparse";
import temperatureDataRaw from '../assets/temperatureData.csv?raw'
import coEmissionsPerCapitaRaw from '../assets/co-emissions-per-capita.csv?raw'
import for_ref_tco2e_adm0Raw from '../assets/for_ref_tco2e_adm0.csv?raw'
import { useSimulationStore } from "./SimulationStore";

export function useLoadData() {
  const setBaseTemperatures = useSimulationStore(s => s.setBaseTemperatures);
  const setTemperatures = useSimulationStore(s => s.setTemperatures);
  const setCoEmissionsPerCapita = useSimulationStore(s => s.setCoEmissionsPerCapita);
  const setBaseCoEmissionsPerCapita = useSimulationStore(s => s.setBaseCoEmissionsPerCapita);
  const setForestationPotential = useSimulationStore(s => s.setForestationPotentials);
  // load temperature data
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
 // load co2emissions for every country
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

 // load tree data for 10 countries
  useEffect(() => {
    const relevantISOs = [
      "BRA", "COL", "IDN", "COD", "USA",
      "RUS", "CIV", "VEN", "BOL", "PHL"
    ];
    Papa.parse(for_ref_tco2e_adm0Raw, {
      download: false,
      header: false,
      skipEmptyLines: true,
      complete(result) {
        const rows = result.data as string[][];
        const baseMap: Record<string, { tco2e: number; ha: number }> = {};

        rows.forEach(row => {
          const iso = row[0];      // ISO3 Code
          const tco2e = Number(row[3]); // for_ref_tco2e
          const ha = Number(row[4]);    // for_ref_ha

          if (relevantISOs.includes(iso)) {
            baseMap[iso] = { tco2e, ha };
          }
        });
        setForestationPotential(baseMap);

      }
    });

  }, []);
}
