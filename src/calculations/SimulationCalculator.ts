import type { YearlyData } from "../store/SimulationStore";

export function calculateTreeObjects(treesPlantedInHa: number) {
  if (treesPlantedInHa < 50_000_000) return 1;
  if (treesPlantedInHa < 200_000_000) return 3;
  if (treesPlantedInHa < 100_000_0000) return 7;
  if (treesPlantedInHa < 1_000_000_0000) return 15;
  return 30;
}
export class SimulationCalculator {
  // CO2 nächstes Jahr
  static calculateNextYearCO2AndEmissions(currentCO2: number, co2GrowthRate: number, globalEmissions: number): { nextCO2: number, nextGlobalEmissions: number } {
    const growthFactor = 1 + co2GrowthRate / 100;

    const nextGlobalEmissions = globalEmissions * growthFactor;
    //const nextGlobalEmissionsGigaTons = nextGlobalEmissions / 1000000000
    //const deltaPpm = nextGlobalEmissionsGigaTons / 7.81; // 1 ppm ≈ 7,81 Gt CO2
    const nextCO2 = currentCO2 + nextGlobalEmissions;
    return { nextCO2, nextGlobalEmissions };
  }

  // Anzahl neu gepflanzter Bäume pro Jahr
  static calculateTreesPlantedThisYear(budget: number, costPerTree: number = 0.8): number {
    return budget / costPerTree;
  }

  // CO2-Absorption durch alle bisher gepflanzten Bäume
  static applyReforestationEffect(currentCO2: number, totalTreesPlanted: number, forestationPotentials: Record<string, { tco2e: number, ha: number }>): number {
    const countries = Object.keys(forestationPotentials);
    const haPerCountry = totalTreesPlanted / countries.length;
    let co2After = currentCO2;
    for (const country of countries) {
      const potential = forestationPotentials[country];
      if (!potential) continue;
      const absorptionPerHa = potential.tco2e / potential.ha;
      co2After -= absorptionPerHa * haPerCountry;
    }
    return co2After;
  }


  static calculateTemperatureIncrease(currentCO2: number): number {
    //convert tons to ppm
    const co2Gt = currentCO2 / 1_000_000_000; // 1 Gt = 1e9 t
    const co2Ppm = co2Gt / 7.81;

    const climateSensitivity = 0.5;
    const preIndustrialCO2 = 280 // ppm
    const scalar = 5.35; //5.35, is derived from “radiative transfer calculations with three-dimensional climatological meteorological input data”

    const radiativeForcing = scalar * Math.log(co2Ppm / preIndustrialCO2);
    return climateSensitivity * radiativeForcing;
  }



  static simulateYear(
    previousYearData: YearlyData,
    co2GrowthRate: number,
    reforestationInHa: number,
    forestationPotentials: Record<string, { tco2e: number, ha: number }>
  ): YearlyData {
    // 1️⃣ CO₂ kumulativ berechnen
    const { nextCO2, nextGlobalEmissions } = this.calculateNextYearCO2AndEmissions(previousYearData.co2, co2GrowthRate, previousYearData.globalEmissions);

    // 2️⃣ Bäume für dieses Jahr pflanzen
    const newTreesInHa = reforestationInHa // <-- hectar this.calculateTreesPlantedThisYear(reforestationBudget);
    let totalTreesInHa = previousYearData.treesPlantedInHa;
    // 3️⃣ Alle bisher gepflanzten Bäume aufsummieren
    if (previousYearData.treesPlantedInHa < 566_000_000)
      totalTreesInHa += newTreesInHa;

    // 4️⃣ CO2 nach Aufforstung berechnen (alle bisherigen Bäume)
    const co2AfterReforestation = this.applyReforestationEffect(nextCO2, totalTreesInHa, forestationPotentials);

    // 5️⃣ Temperaturanstieg basierend auf aktuellem CO2
    const tempIncrease = this.calculateTemperatureIncrease(co2AfterReforestation);

    return {
      co2: co2AfterReforestation,
      treesPlantedInHa: totalTreesInHa,
      globalEmissions: nextGlobalEmissions,
      temperatureIncrease: tempIncrease,
    };
  }
}
