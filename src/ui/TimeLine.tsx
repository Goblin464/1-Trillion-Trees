import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { useSimulationStore } from "../store/SimulationStore";
import "./TimeLine.css";
import { getTippingPointYearsGroups } from "./TippingPointsPanel";
import { motion } from "framer-motion";

const START_YEAR = 2025;
const END_YEAR = 2125;



export function TimeLine() {
    const year = useSimulationStore((s) => s.liveSettings.year);
    const simulationPlaying = useSimulationStore(state => state.simulationPlaying);
    const setYear = useSimulationStore((s) => s.setYear);
    const [highlightedTP, setHighlightedTP] = useState<string | null>(null);
    const rafSimulationRef = useRef<number | null>(null);


    const trackRef = useRef<HTMLDivElement>(null);
    const trackRectRef = useRef<DOMRect | null>(null);
    const rafRef = useRef<number | null>(null);

    const [dragging, setDragging] = useState(false);

    const percent = ((year - START_YEAR) / (END_YEAR - START_YEAR)) * 100;
const lastUpdateRef = useRef<number>(0);
const yearDuration = 500; // 500ms = 0,5s pro Jahr

    const stepSimulation = useCallback((timestamp: number) => {
        const state = useSimulationStore.getState();

        if (!state.simulationPlaying) {
            rafSimulationRef.current = null;
            return;
        }

        if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;

        const elapsed = timestamp - lastUpdateRef.current;

        if (elapsed >= yearDuration) {
            const currentYear = state.liveSettings.year;

            if (currentYear >= END_YEAR) {
                rafSimulationRef.current = null;
                return;
            }

            state.setYear(currentYear + 1);
            lastUpdateRef.current = timestamp;
        }

        rafSimulationRef.current = requestAnimationFrame(stepSimulation);
    }, []);



useEffect(() => {
    if (simulationPlaying && rafSimulationRef.current === null) {
        requestAnimationFrame(stepSimulation);
    } else if (!simulationPlaying && rafSimulationRef.current !== null) {
        cancelAnimationFrame(rafSimulationRef.current);
        rafSimulationRef.current = null;
    }

    return () => {
        if (rafSimulationRef.current !== null) {
            cancelAnimationFrame(rafSimulationRef.current);
            rafSimulationRef.current = null;
        }
    };
}, [simulationPlaying, stepSimulation]);



    const updateFromClientX = useCallback(
        (clientX: number) => {
            if (rafRef.current !== null) return;

            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;

                const rect = trackRectRef.current;
                if (!rect) return;

                const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
                const p = x / rect.width;
                const y = START_YEAR + p * (END_YEAR - START_YEAR);

                setYear(Math.round(y));
            });
        },
        [setYear]
    );


    const tippingPointsWithYearGroups = getTippingPointYearsGroups()

    return (
        <div className="timeline">
            <div className="timeline__year">{START_YEAR}</div>

            <div
                ref={trackRef}
                className="timeline__track"
                onPointerDown={(e) => {
                    if (!trackRef.current) return;

                    trackRef.current.setPointerCapture(e.pointerId);
                    trackRectRef.current = trackRef.current.getBoundingClientRect();

                    setDragging(true);
                    updateFromClientX(e.clientX);

                    // Verhindere Textauswahl
                    document.body.style.userSelect = "none";
                    document.body.style.webkitUserSelect = "none";
                }}
                onPointerMove={(e) => {
                    if (!dragging) return;
                    updateFromClientX(e.clientX);
                }}
                onPointerUp={(e) => {
                    trackRef.current?.releasePointerCapture(e.pointerId);
                    setDragging(false);

                    document.body.style.userSelect = "auto";
                    document.body.style.webkitUserSelect = "auto";
                }}
                onPointerCancel={() => setDragging(false)}
            >
                <div
                    className={`timeline__progress ${dragging ? "timeline__progress--dragging" : ""
                        }`}
                    style={{ width: `${percent}%` }}
                />

                <div
                    className={`timeline__playhead ${dragging ? "timeline__playhead--active" : ""
                        }`}
                    style={{ left: `${percent}%` }}
                />


                {/* Tipping Points (gruppiert) */}
                {tippingPointsWithYearGroups.map((group) => {
                    // Jahr der Gruppe bestimmen (z. B. erstes TP mit year)
                    const groupYear = group.tippingPoints.find(tp => tp.year)?.year;
                    if (!groupYear) return null;

                    const leftPercent =
                        ((groupYear - START_YEAR) / (END_YEAR - START_YEAR)) * 100;

                    const isActive = year >= groupYear;

                    return (
                        <motion.div
                            key={group.threshold}
                            className={`timeline__event ${isActive ? "active" : ""}`}
                            style={{ left: `${leftPercent}%` }}
                            initial="rest"
                            whileHover="hover"
                        >
                            {/* Tooltip mit ALLEN Tipping Points der Gruppe */}
                            <motion.div
                                className="timeline__tooltip"
                                initial="rest"
                                whileHover="hover"
                            >
                                {<div className="tooltip-title">
                                    {group.threshold}°C
                                </div>}
                                <div className="tooltip-icons">
                                    {group.tippingPoints.map((tp) => {
                                        const isHighlighted = highlightedTP === tp.id;

                                        return (

                                            <div
                                                key={tp.id}
                                                className={`tooltip-item ${isHighlighted ? "highlighted" : ""}`}
                                                onMouseEnter={() => setHighlightedTP(tp.id)}
                                                onMouseLeave={() => setHighlightedTP(null)}
                                            >
                                                <span className="tooltip-emoji">{tp.icon}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })}


            </div>
        </div>
    );
}
