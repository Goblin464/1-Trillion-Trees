
import type { YearlyData } from "../store/SimulationStore";

export function calculateTreeObjectsPerCountry(
  treesPlantedInHa: number,
  forestationPotentials: Record<string, { tco2e: number; ha: number }>
): Record<string, number> {
  const result: Record<string, number> = {};

  // Alle Länder, die bepflanzt werden können
  let remainingCountries = Object.keys(forestationPotentials);
  const haPerTree = 1000000;
  let remainingTrees = Math.floor(treesPlantedInHa / haPerTree);

  while (remainingTrees > 0 && remainingCountries.length > 0) {
    const treesPerCountry = Math.floor(
      remainingTrees / remainingCountries.length
    );
    if (treesPerCountry === 0) break;
    const nextRound: string[] = [];

    for (const iso of remainingCountries) {

      const potential = forestationPotentials[iso];
      const trees = treesPerCountry;
      const maxTrees = Math.floor(potential.ha / haPerTree);

      // WIE VIEL PLATZ IST NOCH?
      const alreadyAssigned = result[iso] ?? 0;
      const spaceLeft = maxTrees - alreadyAssigned;

      // WIE VIEL DARF DIESES LAND DIESE RUNDE BEKOMMEN?
      const treesForThisCountry = Math.min(trees, spaceLeft);

      if (treesForThisCountry > 0) {
        result[iso] = alreadyAssigned + treesForThisCountry;
        remainingTrees -= treesForThisCountry;
      }

      //  Land nur weiter berücksichtigen, wenn noch Platz ist
      if (result[iso] < maxTrees) {
        nextRound.push(iso);
      }

    }
    console.log("remaining trees" + remainingTrees)
    remainingCountries = nextRound;

    // Falls keine Länder mehr übrig → Abbruch
    if (remainingCountries.length === 0) break;
  }

  return result;
}

export class SimulationCalculator {
  // CO2 nächstes Jahr
  static calculateNextYearCO2AndEmissions(currentCO2: number, co2GrowthRate: number, globalEmissions: number): { nextCO2: number, nextGlobalEmissions: number } {
    const growthFactor = 1 + co2GrowthRate / 100;
    const nextGlobalEmissions = globalEmissions * growthFactor;
    const nextCO2 = currentCO2 + nextGlobalEmissions;
    return { nextCO2, nextGlobalEmissions };
  }

  // Anzahl neu gepflanzter Bäume pro Jahr
  static calculateTreesPlantedThisYear(budget: number, costPerTree: number = 0.8): number {
    return budget / costPerTree;
  }

  // CO2-Absorption durch alle bisher gepflanzten Bäume
  static applyReforestationEffect(
    currentCO2: number,
    totalHa: number,
    forestationPotentials: Record<string, { tco2e: number; ha: number }>
  ): number {
    let co2After = currentCO2;

    const potentials = Object.values(forestationPotentials);

    const totalPotentialHa = potentials.reduce((sum, p) => sum + p.ha, 0);

    // Mehr als globales Potenzial bringt nichts
    const effectiveHa = Math.min(totalHa, totalPotentialHa);

    for (const p of potentials) {
      const absorptionPerHa = p.tco2e / p.ha;

      const share = p.ha / totalPotentialHa;          // prozentualer Anteil
      const allocatedHa = effectiveHa * share;        // proportional verteilt

      co2After -= absorptionPerHa * allocatedHa;
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
