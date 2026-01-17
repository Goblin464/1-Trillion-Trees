import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {  Settings2 } from "lucide-react";


type SideControlsPanelProps = {
  children: React.ReactNode;
  className: string,
};

export function SideControlsPanel({ children , className = "",}: SideControlsPanelProps) {
  const [open, setOpen] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!panelRef.current) return;

    gsap.to(panelRef.current, {
      x: open ? 0 : -400, // Panelbreite
      duration: 0.5,
      ease: "power3.inOut",
    });
  }, [open]);

  return (
    <>
      {/* TAB / BOX */}
      <div className={`side-controls-panel ${className}`}
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          left: 0,
          top: "40%",
          width: "40px",
          height: "120px",
          backgroundColor: open ? "#757575" : "#ffffffff",
          borderTopRightRadius: "20px",
          borderBottomRightRadius: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1001,
          transition: "box-shadow 0.25s ease, transform 0.25s ease, background-color 0.3s ease",

        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow =
            "0 8px 20px rgba(0,0,0,0.25)";
        }}

        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = open
            ? "0 6px 14px rgba(0,0,0,0.3)"
            : "0 0 0 rgba(0,0,0,0)";
        }}

      >

        <Settings2
          size={28}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
            color: open ? "white" : "gray",
          }}
        />
      </div>

      {/* PANEL */}
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          left: 0,
          top: "30%",
          width: "280px",
          transform: "translateX(-300px)",
          zIndex: 1000,
        }}
      >
        {children}
      </div>
    </>
  );
}
