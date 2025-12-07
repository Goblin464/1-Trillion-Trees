import { useState, useEffect } from "react";
import Papa from "papaparse";
import temperatureDataRaw from '../assets/temperatureData.csv?raw'

export function useTemperatures() {
  const [temperatures, setTemperatures] = useState<Record<string, number>>({})

  useEffect(() => {
    Papa.parse(temperatureDataRaw, {
      download: false,
      header: false,     // weil deine CSV keine Header hat
      skipEmptyLines: true,
      complete(result) {
        const rows = result.data as string[][]
        const map: Record<string, number> = {}

        rows.forEach((row) => {
          const iso = row[5]      // Spalte ISO3 Code
          const year = row[23]    // Spalte Jahr
          const value = row[24]   // Spalte Temperatur
          
          if (year === "2022") {
            map[iso] = Number(value)
          }
        })

        setTemperatures(map)
      }
    })
  }, [])

  return temperatures
}
