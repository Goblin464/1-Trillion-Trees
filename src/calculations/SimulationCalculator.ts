import type { YearlyData } from "../store/SimulationStore";

export class SimulationCalculator {
  // CO2 nächstes Jahr
  static calculateNextYearCO2(currentCO2: number, co2GrowthRate: number): number {
    return currentCO2 * (1 + co2GrowthRate / 100);
  }

  // Anzahl neu gepflanzter Bäume pro Jahr
  static calculateTreesPlantedThisYear(budget: number, costPerTree: number = 0.8): number {
    return budget / costPerTree;
  }

  // CO2-Absorption durch alle bisher gepflanzten Bäume
  static applyReforestationEffect(currentCO2: number, totalTreesPlanted: number, absorptionPerTree: number = 0.002): number {
    return currentCO2 - totalTreesPlanted * absorptionPerTree;
  }

 
  static calculateTemperatureIncrease(currentCO2: number): number {
    const climateSensitivity = 0.5;
    const preIndustrialCO2 = 280 // ppm
    const scalar = 5.35; //5.35, is derived from “radiative transfer calculations with three-dimensional climatological meteorological input data”
    const radiativeForcing = scalar * Math.log(currentCO2 / preIndustrialCO2);
    return climateSensitivity * radiativeForcing; 
}


  
  static simulateYear(
    previousYearData: YearlyData,  
    co2GrowthRate: number,
    reforestationBudget: number
  ): YearlyData {
    // 1️⃣ CO₂ kumulativ berechnen
    const nextCO2 = this.calculateNextYearCO2(previousYearData.co2, co2GrowthRate);

    // 2️⃣ Bäume für dieses Jahr pflanzen
    const newTrees = this.calculateTreesPlantedThisYear(reforestationBudget);

    // 3️⃣ Alle bisher gepflanzten Bäume aufsummieren
    const totalTrees = previousYearData.treesPlanted + newTrees;

    // 4️⃣ CO2 nach Aufforstung berechnen (alle bisherigen Bäume)
    const co2AfterReforestation = this.applyReforestationEffect(nextCO2, totalTrees);

    // 5️⃣ Temperaturanstieg basierend auf aktuellem CO2
    const tempIncrease = this.calculateTemperatureIncrease(co2AfterReforestation);

    return {
      co2: co2AfterReforestation,
      treesPlanted: totalTrees,
      temperatureIncrease: tempIncrease,
    };
  }
}
