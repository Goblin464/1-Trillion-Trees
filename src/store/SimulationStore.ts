import { create } from "zustand"

type SimulationStore = {
  co2: number
  reforestationBudget: number
  timeSpeed: number
  setCO2: (value: number) => void
  setReforestationBudget: (value: number) => void
  setTimeSpeed: (value: number) => void
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  co2: 30,
  reforestationBudget: 50,
  timeSpeed: 1,

  setCO2: (value: number) => set({ co2: value }),
  setReforestationBudget: (value: number) => set({ reforestationBudget: value }),
  setTimeSpeed: (value: number) => set({ timeSpeed: value }),
}))
