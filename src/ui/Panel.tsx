import { useState, useRef, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type PanelProps = {
    title: string;
    children: React.ReactNode;
    defaultCollapsed?: boolean;
    style?: React.CSSProperties;
};

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
    ({ title, children, defaultCollapsed = true, style }, ref) => {
        const [collapsed, setCollapsed] = useState(defaultCollapsed);
        const contentRef = useRef<HTMLDivElement>(null);
        const panelRef = useRef<HTMLDivElement>(null);

    
        useGSAP(
            () => {
                const el = contentRef.current;
                if (!el) return;

                if (collapsed) {
                    // AUSKLAPPEN
                    const height = el.scrollHeight;
                    gsap.to(el, {
                        height: height,
                        opacity: 1,
                        duration: 0.5,
                        filter: "blur(0px)",
                        ease: "power3.inOut",
                        onComplete: () => {
                            el.style.height = "auto";
                        },
                    });
                } else {
                    // EINKLAPPEN
                    gsap.to(el, {
                        height: 0,
                        opacity: 0,
                        duration: 0.5,
                        filter: "blur(6px)",
                        ease: "power3.inOut",
                    });
                }
            },
            {
                dependencies: [collapsed],
                scope: panelRef,
            }
        );

        return (
            <div
                ref={ref || panelRef} // ✅ forwardRef unterstützt
                className="panel"
                style={{
                    ...style,
                }}
            >
                {/* Header */}
                <div
                    onClick={() => setCollapsed((c) => !c)}
                    style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        userSelect: "none",
                        cursor: "pointer",
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            flex: 1,
                            textAlign: "center",
                        }}
                    >
                        {title || "\u00A0"} {/* Leerzeichen, wenn kein Titel */}
                    </h2>

                    <ChevronDown
                        size={40}
                        style={{
                            position: "relative",
                            right: 0,
                            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                            transition: "transform 0.5s ease",
                            opacity: 0.7,
                        }}
                    />
                </div>

                {/* Content – IMMER gerendert */}
                <div
                    ref={contentRef}
                    style={{
                        overflow: "hidden",
                        height: collapsed ? 0 : "auto",
                        opacity: collapsed ? 0 : 1,
                        marginTop: "0.5rem",
                    }}
                >
                    <div
                        style={{
                            padding: "12px 16px",
                            overflow: "visible",
                        }}
                    >
                        {children}
                    </div>
                </div>

            </div>
        );
    }
);

Panel.displayName = "Panel"; // wichtig für DevTools
