import { useTour } from "@reactour/tour"
import { useState } from "react"

type Props = {
  onClose: () => void
}

export function IntroDialog({ onClose }: Props) {
  const { setIsOpen } = useTour()
  const [hovered, setHovered] = useState<"start" | "skip" | null>(null)

  const buttonBase: React.CSSProperties = {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #000",
    background: "#fff",
    color: "#000",
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s ease",
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: 28,
          borderRadius: 20,
          width: 400,
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          color: "#000",
        }}
      >
        <h2 style={{ marginBottom: 12 }}>Welcome 🌍</h2>

        <p style={{ fontSize: 14, lineHeight: 1.5 }}>
          This Simulation includes a short tutorial that will guide you through
          the most important features.
        </p>

        <div style={{ display: "flex", gap: 30, marginTop: 28 }}>
          <button
            style={{
              ...buttonBase,
              background:
                hovered === "start" ? "#b4c309" : "#fff",
              color:
                hovered === "start" ? "#fff" : "#000",
              scale: hovered === "start" ? 1.09: 1,
              
            }}
            onMouseEnter={() => setHovered("start")}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {
              setIsOpen(true)
              onClose()
            }}
          >
            Start tutorial
          </button>

          <button
           style={{
              ...buttonBase,
              background:
                hovered === "skip" ? "#b4c309" : "#fff",
              color:
                hovered === "skip" ? "#fff" : "#000",
                 scale: hovered === "skip" ? 1.09: 1,
            }}
            onMouseEnter={() => setHovered("skip")}
            onMouseLeave={() => setHovered(null)}
            onClick={onClose}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
