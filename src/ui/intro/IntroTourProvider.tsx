// ui/IntroTourProvider.tsx
import type { ReactNode } from "react";

import { TourProvider} from "@reactour/tour";
import { IntroTourSteps } from "./IntroTourSteps.tsx";

interface IntroTourProviderProps {
  children: ReactNode;
}

const radius = 16;



export function IntroTourProvider({ children }: IntroTourProviderProps) {
  return (
    <TourProvider
      steps={IntroTourSteps}
      showDots
      showBadge={false}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: radius,
          padding: 30,
          backgroundColor: "white",
          color: "#111",
          fontSize: 14,
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          transition: "all 0.5s ease"
        }),
        arrow: (base) => ({ ...base, color: "grey" }),
        maskArea: (base) => ({
          ...base,
          rx: radius,
          ry: radius,
          transition: "all 0.3s ease",
          backgroundColor: "rgba(0,0,0,0.65)",
        }),
        maskWrapper: (base) => ({ ...base, transition: "all 0.5s ease"}),
      }}
    >
     
      {children}
    </TourProvider>
  );
}
