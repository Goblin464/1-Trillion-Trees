import { create } from "zustand"
import { SimulationCalculator } from "../calculations/SimulationCalculator"


export type YearlyData = {
  co2: number;
  treesPlantedInHa: number;
  globalEmissions: number;
  temperatureIncrease: number;
};

type LiveSettings = {
  year: number;
  co2GrowthRate: number;
  reforestationInHa: number;
  heatmapEnabled: boolean;
};


type TemperatureMap = Record<string, number>;
type EmissionsMap = Record<string, number>;
type ForestationPotentialMap = Record<string, { tco2e: number; ha: number }>;


export const INITIAL_YEAR_DATA = {
  co2: 3_295_500_000_000, //  äquivalent to 422.5ppm * 7.8 (umrechnungsfaktor)
  treesPlantedInHa: 0,
  globalEmissions: 37_800_000_000, // emissions 2025 in t
  temperatureIncrease: SimulationCalculator.calculateTemperatureIncrease(3_241_150_000_000),
};

type SimulationStore = {
  allYearlyResults: Record<number, YearlyData>;
  liveSettings: LiveSettings;
  yearlyResult: YearlyData;

  temperatures: TemperatureMap; // ISO3 -> aktualisierte Temperatur
  baseTemperatures: TemperatureMap; // ISO3 -> Basis-Temperatur

  coEmissionsPerCapita: EmissionsMap
  baseCoEmissionsPerCapita: EmissionsMap;

  forestationPotentials: ForestationPotentialMap;

  isHoveringPanel: boolean;
  panelCountry: any | null;
  panelPosition: { x: number; y: number } | null;

  simulationPlaying: Boolean;


  setPanel: (country: any, position: { x: number; y: number }) => void;
  clearPanel: () => void;
 

  setTemperatures: (temps: Record<string, number>) => void;
  setBaseTemperatures: (temps: Record<string, number>) => void;

  setCoEmissionsPerCapita: (emissions: Record<string, number>) => void;
  setBaseCoEmissionsPerCapita: (emissions: Record<string, number>) => void;

  setForestationPotentials: (potential: Record<string, { tco2e: number; ha: number }>) => void;

  setYear: (year: number) => void;
  setCo2GrowthRate: (v: number) => void;
  setReforestationInHa: (v: number) => void;
  setHeatmapEnabled: (v: boolean) => void;
  toggleSimulationPlaying: () => void;
  updateTemperatures: () => void;
  updateCoEmissionsPerCapita: () => void;
  update: () => void;
};


export const useSimulationStore = create<SimulationStore>((set, get) => {

  const store = {
    liveSettings: {
      year: 2025,
      co2GrowthRate: 1.5,
      reforestationInHa: 50,
      heatmapEnabled: false,
    },
    allYearlyResults: {},
    yearlyResult: INITIAL_YEAR_DATA,

    temperatures: {},
    baseTemperatures: {},

    coEmissionsPerCapita: {},
    baseCoEmissionsPerCapita: {},

    forestationPotentials: {},

    simulationPlaying: false,

    panelCountry: null,
    panelPosition: null,
    isHoveringPanel: false,

    setPanel: (country: string, position: { x: number; y: number }) => {
      set({ panelCountry: country, panelPosition: position });
    },

    clearPanel: () =>
      set({ panelCountry: null, panelPosition: null }),

    setBaseTemperatures: (temps: TemperatureMap) =>
      set({ baseTemperatures: temps }),

    setTemperatures: (temps: TemperatureMap) =>
      set({ temperatures: temps }),

    setBaseCoEmissionsPerCapita: (emissions: EmissionsMap) =>
      set({ baseCoEmissionsPerCapita: emissions }),

    setCoEmissionsPerCapita: (emissions: EmissionsMap) =>
      set({ coEmissionsPerCapita: emissions }),

    setForestationPotentials: (potential: ForestationPotentialMap) =>
      set({ forestationPotentials: potential }),

    toggleSimulationPlaying: () =>
      set((s) => ({ simulationPlaying: !s.simulationPlaying })),

    setYear: (year: number) => {
      set((state) => ({ liveSettings: { ...state.liveSettings, year } }));
      get().update();
    },


    setCo2GrowthRate: (value: number) => {
      set((state) => ({ liveSettings: { ...state.liveSettings, co2GrowthRate: value } }));
      if (get().liveSettings.year > 2025) get().update();
    },

    setReforestationInHa: (value: number) => {
      set((state) => ({ liveSettings: { ...state.liveSettings, reforestationInHa: value } }));
      if (get().liveSettings.year > 2025) get().update();
    },

    setHeatmapEnabled: (value: boolean) => {
      set((state) => ({ liveSettings: { ...state.liveSettings, heatmapEnabled: value } }));
      if (get().liveSettings.year > 2025) get().update();
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
        updated[iso] = baseCoEmissionsPerCapita[iso] * Math.pow(growthFactor, yearsSinceBase);
      }

      set({ coEmissionsPerCapita: updated });
    },

    update: () => {
      const { liveSettings } = get();
      const results: Record<number, YearlyData> = {};
      let previous = INITIAL_YEAR_DATA;

      for (let year = 2025; year <= 2125; year++) {
        if (year > 2025) {
          previous = SimulationCalculator.simulateYear(
            previous,
            liveSettings.co2GrowthRate,
            liveSettings.reforestationInHa,
            get().forestationPotentials
          );
        }
        results[year] = previous;
      }

      set({
        yearlyResult: results[liveSettings.year],
        allYearlyResults: results,
      });

      get().updateTemperatures();
      get().updateCoEmissionsPerCapita();
    },
  };

  // Direkt am Anfang die Simulation für das Startjahr berechnen
  setTimeout(() => get().update(), 0);

  return store;
});
