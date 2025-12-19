import { useEffect, useState } from "react";
import { useSimulationStore } from "../store/SimulationStore";
import { TippingPointsToast } from "./animations/TippingPointsToast";


const TIPPING_POINTS = [
  {
    id: "coral",
    name: "Warm-water coral reef collapse",
    threshold: 1.5,
  },
  {
    id: "greenland",
    name: "Greenland Ice Sheet instability",
    threshold: 1.5,
  },
  {
    id: "west_antarctica",
    name: "West Antarctic Ice Sheet collapse",
    threshold: 1.5,
  },
  {
    id: "Labrador_see",
    name: "SPG Convection collapse",
    threshold: 1.8,
  },
  {
    id: "amazon",
    name: "Amazon rainforest dieback",
    threshold: 3.5,
  },
  {
    id: "amoc",
    name: "AMOC (Atlantic circulation) collapse",
    threshold: 4.0,
  },
  {
    id: "permafrost",
    name: "Boreal Permafrost collapse",
    threshold: 4.0,
  },
  {
    id: "Arctic",
    name: "Arctic Winter Sea Ice Collapse",
    threshold: 6.3,
  },
];

export function TippingPointsPanel() {
  const temperatureIncrease = useSimulationStore(
    (s) => s.yearlyResult.temperatureIncrease
  );

  const [triggered, setTriggered] = useState<string[]>([]);
  const [active, setActive] = useState<string[]>([]);

  useEffect(() => {
    TIPPING_POINTS.forEach((tp) => {
      const alreadyTriggered = triggered.includes(tp.id);
      const shouldTrigger = temperatureIncrease >= tp.threshold;

      if (shouldTrigger && !alreadyTriggered) {
        setTriggered((prev) => [...prev, tp.id]);
        setActive((prev) => [...prev, tp.id]);
      }
    });
  }, [temperatureIncrease, triggered]);

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
        const tp = TIPPING_POINTS.find((t) => t.id === id)!;

        return (
          <TippingPointsToast
            key={id}
            name={tp.name}
            threshold={tp.threshold}
            active = {temperatureIncrease >= tp.threshold}
          />
        );
      })}
    </div>
  );
}