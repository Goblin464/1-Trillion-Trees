import { forwardRef } from "react";

type PanelProps = {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className: string
};

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ title, children, style, className }, ref) => {
    return (
      <div
        ref={ref}
        className={`panel ${className}`} 
        style={{
          ...style,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            userSelect: "none",
          }}
        >
          <h2
            style={{
              margin: 0,
              flex: 1,
              textAlign: "center",
            }}
          >
            {title || "\u00A0"}
          </h2>
        </div>

        {/* Content – IMMER sichtbar */}
        <div
          style={{
            marginTop: "0.5rem",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Panel.displayName = "Panel";
