import { useEffect, useState, useMemo } from "react";
import { useSimulationStore } from "../store/SimulationStore";
import { TippingPointsToast } from "./animations/TippingPointsToast";


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
];



export function TippingPointsPanel() {
  const allYearlyResults = useSimulationStore((s) => s.allYearlyResults);
  const temperatureIncrease = useSimulationStore(
    (s) => s.yearlyResult.temperatureIncrease
  );

  const [triggered, setTriggered] = useState<string[]>([]);
  const [active, setActive] = useState<string[]>([]);

  // Berechne die Jahre, in denen jeder Tipping Point überschritten wird
  const tippingPointsWithYear = useMemo(() => {
    if (!allYearlyResults) return [];

    return TIPPING_POINTS_GROUPS.map((group) => {
      // group: { threshold, tippingPoints: [...] }
      const updatedTippingPoints = group.tippingPoints.map((tp) => {
        const yearReached = Object.entries(allYearlyResults).find(
          ([year, data]) => data.temperatureIncrease >= group.threshold
        )?.[0]; // string

        return { ...tp, year: yearReached ? parseInt(yearReached) : null };
      });

      return {
        threshold: group.threshold,
        tippingPoints: updatedTippingPoints,
      };
    });
  }, [allYearlyResults]);

  //Toast trigger for UI
  useEffect(() => {
    tippingPointsWithYear.forEach((group) => {
      group.tippingPoints.forEach((tp) => {
        if (!tp.year) return;

        const shouldTrigger = temperatureIncrease >= group.threshold;
        const alreadyTriggered = triggered.includes(tp.id);

        if (shouldTrigger && !alreadyTriggered) {
          setTriggered((prev) => [...prev, tp.id]);
          setActive((prev) => [...prev, tp.id]);
        }
      });
    });
  }, [temperatureIncrease, tippingPointsWithYear, triggered]);


  return (
    <div
      style={{
        position: "fixed",
        top: "5vh",
        right: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {active.map((id) => {
        let tpFound;
        let groupThreshold = 0;

        // Durchlaufe die Gruppen
        for (const group of TIPPING_POINTS_GROUPS) {
          // Suche den Tipping Point innerhalb der Gruppe
          const tp = group.tippingPoints.find((tp) => tp.id === id);
          if (tp) {
            tpFound = tp;
            groupThreshold = group.threshold; // threshold kommt aus der Gruppe
            break;
          }
        }

        if (!tpFound) return null; // Falls nicht gefunden, einfach überspringen

        return (
          <TippingPointsToast
            key={id}
            name={tpFound.name}
            icon={tpFound.icon}
            threshold={groupThreshold}
            active={temperatureIncrease >= groupThreshold}
          />
        );
      })}

    </div>
  );
}


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


