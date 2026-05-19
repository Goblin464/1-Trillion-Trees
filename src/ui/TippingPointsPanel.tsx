
import { useSimulationStore } from "../store/SimulationStore";



export const TIPPING_POINTS_GROUPS = [
  {
    threshold: 1.5,
    tippingPoints: [
      {
        id: "coral",
        name: "Warm-water coral reef collapse",
        icon: "🪸",
      },
      {
        id: "greenland",
        name: "Greenland Ice Sheet instability",
        icon: "🧊",
      },
      {
        id: "west_antarctica",
        name: "West Antarctic Ice Sheet collapse",
        icon: "❄️",
      },
    ],
  },
  {
    threshold: 1.8,
    tippingPoints: [
      {
        id: "labrador_sea",
        name: "SPG Convection collapse",
        icon: "🌊",
      },
    ],
  },
  {
    threshold: 3.5,
    tippingPoints: [
      {
        id: "amazon",
        name: "Amazon rainforest dieback",
        icon: "🌳",
      },
    ],
  },
  {
    threshold: 4.0,
    tippingPoints: [
      {
        id: "amoc",
        name: "AMOC (Atlantic circulation) collapse",
        icon: "🌍",
      },
      {
        id: "permafrost",
        name: "Boreal Permafrost collapse",
        icon: "🥶",
      },
    ],
  },
  {
    threshold: 6.3,
    tippingPoints: [
      {
        id: "arcitc",
        name: "Arctic Ice collapse",
        icon: "🐻‍❄️",
      },
    ],
  },
];


export function getTippingPointYearsGroups(): {
  threshold: number;
  tippingPoints: {
    id: string;
    name: string;
    icon: string;
    year: number | null;
  }[];
}[] {
  const allYearlyResults = useSimulationStore.getState().allYearlyResults;
  if (!allYearlyResults) return [];

  return TIPPING_POINTS_GROUPS.map(group => {
    const yearReached = Object.entries(allYearlyResults).find(
      ([, data]) => data.temperatureIncrease >= group.threshold
    )?.[0];

    return {
      threshold: group.threshold,
      tippingPoints: group.tippingPoints.map(tp => ({
        id: tp.id,
        name: tp.name,
        icon: tp.icon,
        year: yearReached ? parseInt(yearReached) : null,
      })),
    };
  });
}


