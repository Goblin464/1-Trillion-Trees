import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface Props {
  position: { x: number; y: number };
  children: React.ReactNode;
  onExit?: () => void;
}

export function CountryInfoPanelAnimation({ position, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  console.log("position x" + position.x)
  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 20, scale: 0.96 },
      {
        opacity: 0.9,
        y: 0,
        scale: 1,
        duration: 0.25,
        ease: "power3.out",
      }
    );
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        transform: "translate(-50%, -100%)",
        zIndex: 1000,
      }}
    >
      {children}
    </div>
  );
}
