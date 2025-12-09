import { create } from "zustand"
import { SimulationCalculator } from "../calculations/SimulationCalculator"

export type YearlyData = {
  co2: number;
  treesPlanted: number;
  temperatureIncrease: number;
};

type LiveSettings = {
  year: number;
  co2GrowthRate: number;
  reforestationBudget: number;
  heatmapEnabled: boolean;
};

export const INITIAL_YEAR_DATA = {
  co2: 415,
  treesPlanted: 0,
  temperatureIncrease: SimulationCalculator.calculateTemperatureIncrease(415),
};

type SimulationStore = {
  liveSettings: LiveSettings;
  yearlyResult: YearlyData;

  temperatures: Record<string, number>; // ISO3 -> aktualisierte Temperatur
  baseTemperatures: Record<string, number>; // ISO3 -> Basis-Temperatur

  coEmissionsPerCapita: Record<string ,number>;
  baseCoEmissionsPerCapita: Record<string ,number>; // Basiswerte

  setTemperatures: (temps: Record<string, number>) => void;
  setBaseTemperatures: (temps: Record<string, number>) => void;

  setCoEmissionsPerCapita: (emissions: Record<string, number>) => void;
  setBaseCoEmissionsPerCapita: (emissions: Record<string, number>) => void;

  setYear: (year: number) => void;
  setCo2GrowthRate: (v: number) => void;
  setReforestationBudget: (v: number) => void;
  setHeatmapEnabled: (v: boolean) => void;

  computeYear: (year: number) => YearlyData;
  updateTemperatures: () => void;
  updateCoEmissionsPerCapita: () => void;
  update: () => void;
};

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  liveSettings: {
    year: 2025,
    co2GrowthRate: 1.5,
    reforestationBudget: 50,
    heatmapEnabled: false,
  },

  yearlyResult: INITIAL_YEAR_DATA,

  temperatures: {},
  baseTemperatures: {},

  coEmissionsPerCapita: {},
  baseCoEmissionsPerCapita: {},

  setBaseTemperatures: (temps) => set({ baseTemperatures: temps }),
  setTemperatures: (temps) => set({ temperatures: temps }),

  setBaseCoEmissionsPerCapita: (emissions) => set({ baseCoEmissionsPerCapita: emissions }),
  setCoEmissionsPerCapita: (emissions) => set({ coEmissionsPerCapita: emissions }),

  setYear: (year: number) => {
    set(state => ({ liveSettings: { ...state.liveSettings, year } }));
    get().update();
  },

  setCo2GrowthRate: (value: number) => {
    set(state => ({ liveSettings: { ...state.liveSettings, co2GrowthRate: value } }));
    if (get().liveSettings.year > 2025) get().update();
  },

  setReforestationBudget: (value: number) => {
    set(state => ({ liveSettings: { ...state.liveSettings, reforestationBudget: value } }));
    if (get().liveSettings.year > 2025) get().update();
  },

  setHeatmapEnabled: (value: boolean) => {
    set((state) => ({ liveSettings: { ...state.liveSettings, heatmapEnabled: value } }));
    if (get().liveSettings.year > 2025) get().update();
  },

  computeYear: (year: number): YearlyData => {
    const { liveSettings } = get();
    let previous = INITIAL_YEAR_DATA;

    if (year === 2025) return previous;

    for (let y = 2026; y <= year; y++) {
      previous = SimulationCalculator.simulateYear(
        previous,
        liveSettings.co2GrowthRate,
        liveSettings.reforestationBudget
      );
    }

    return previous;
  },

  updateTemperatures: () => {
    const { baseTemperatures, yearlyResult } = get();
    const updated: Record<string, number> = {};
    for (const iso in baseTemperatures) {
      updated[iso] = baseTemperatures[iso] + yearlyResult.temperatureIncrease;
    }
    set({ temperatures: updated });
  },

  updateCoEmissionsPerCapita: () => {
    const { baseCoEmissionsPerCapita, liveSettings } = get();
    const updated: Record<string, number> = {};
    const yearsSinceBase = liveSettings.year - 2025;
    const growthFactor = 1 + liveSettings.co2GrowthRate / 100;

    for (const iso in baseCoEmissionsPerCapita) {
      // exponentielles Wachstum über die Jahre
      updated[iso] = baseCoEmissionsPerCapita[iso] * Math.pow(growthFactor, yearsSinceBase);
    }

    set({ coEmissionsPerCapita: updated });
  },

  update: () => {
    const year = get().liveSettings.year;
    const result = get().computeYear(year);
    set({ yearlyResult: result });
    get().updateTemperatures();
    get().updateCoEmissionsPerCapita();
  },
}));
