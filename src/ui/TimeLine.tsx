import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { useSimulationStore } from "../store/SimulationStore";
import "./TimeLine.css";
import { getTippingPointYearsGroups } from "./TippingPointsPanel";
import { color, motion } from "framer-motion";
import React from "react";

const START_YEAR = 2025;
const END_YEAR = 2125;



export function TimeLine() {
    const year = useSimulationStore((s) => s.liveSettings.year);
    const simulationPlaying = useSimulationStore(state => state.simulationPlaying);
    const setYear = useSimulationStore((s) => s.setYear);
    const toggleSimulationPlaying = useSimulationStore((s) => s.toggleSimulationPlaying)
    const [highlightedTP, setHighlightedTP] = useState<string | null>(null);
    const rafSimulationRef = useRef<number | null>(null);


    const trackRef = useRef<HTMLDivElement>(null);
    const trackRectRef = useRef<DOMRect | null>(null);
    const rafRef = useRef<number | null>(null);

    const [dragging, setDragging] = useState(false);

    const percent = ((year - START_YEAR) / (END_YEAR - START_YEAR)) * 100;
    const lastUpdateRef = useRef<number>(0);
    const yearDuration = 250; // 500ms = 0,5s pro Jahr

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

    //playhead distance so year display is not stacked
    const trackWidth = trackRef.current?.offsetWidth ?? 0;
    const playheadX = (percent / 100) * trackWidth;
    const MIN_DISTANCE = 60; // minimale Pixel-Distanz

    const showStartYear = playheadX > MIN_DISTANCE;
    const showEndYear = playheadX < trackWidth - MIN_DISTANCE;

    return (
        <div className="timeline">

            <div
                ref={trackRef}
                className="timeline__track"
                onPointerDown={(e) => {
                    if (!trackRef.current) return;

                    trackRef.current.setPointerCapture(e.pointerId);
                    trackRectRef.current = trackRef.current.getBoundingClientRect();

                    setDragging(true);
                    updateFromClientX(e.clientX);

                    if (simulationPlaying) {
                        toggleSimulationPlaying();
                    }
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
                {/* Start / End Labels */}
                <div
                    className="timeline__label timeline__label--start"
                    style={{ opacity: showStartYear ? 1 : 0 }}
                >
                    {START_YEAR}
                </div>

                <div
                    className="timeline__label timeline__label--end"
                    style={{ opacity: showEndYear ? 1 : 0 }}
                >
                    {END_YEAR}
                </div>


                {/* Progress */}
                <div
                    className={`timeline__progress ${dragging ? "timeline__progress--dragging" : ""}`}
                    style={{ width: `${percent}%` }}
                />

                {/* Playhead */}
                <div
                    className={`timeline__playhead ${dragging ? "timeline__playhead--active" : ""}`}
                    style={{ left: `${percent}%` }}
                />

                {/* Aktuelles Jahr */}
                <div
                    className="timeline__current-year"
                    style={{ left: `${percent}%` }}
                >
                    {year}
                </div>



                {/* Tipping Points (gruppiert) */}
                {/* Tipping Points (gruppiert) */}
                {tippingPointsWithYearGroups.map((group) => {
                    const groupYear = group.tippingPoints.find(tp => tp.year)?.year;
                    if (!groupYear) return null;

                    const leftPercent =
                        ((groupYear - START_YEAR) / (END_YEAR - START_YEAR)) * 100;

                    const isActive = year >= groupYear;

                    // Abstand zum Playhead in Jahren
                    const YEAR_DISTANCE = 3;
                    const showTPYear = Math.abs(year - groupYear) >= YEAR_DISTANCE;

                    const eventVariants = {
                        rest: { scale: 1, y: "-50%" ,x:"-50%", backgroundColor: "#008528ff" },
                        hover: { scale: 1.2 },
                        reached: { scale: 1.3, backgroundColor: "#a00000" }
                    };

                    return (
                        <React.Fragment key={group.threshold}>
                            {/* Animiertes Event */}
                            <motion.div
                                className={`timeline__event ${isActive ? "active" : ""}`}
                                style={{ left: `${leftPercent}%` }}
                                initial="rest"
                                animate={isActive ? "reached" : "rest"}
                                whileHover="hover"
                                variants={eventVariants}
                            >
                                {/* Tooltip */}
                                <motion.div
                                    className="timeline__tooltip"
                                    initial="rest"
                                    whileHover="hover"
                                >
                                    <div className="tooltip-title">{group.threshold}°C</div>
                                    <div className="tooltip-list">
                                        {group.tippingPoints.map((tp) => (
                                            <div
                                                key={tp.id}
                                                className={`tooltip-item ${highlightedTP === tp.id ? "highlighted" : ""}`}
                                                onMouseEnter={() => setHighlightedTP(tp.id)}
                                                onMouseLeave={() => setHighlightedTP(null)}
                                            >
                                                <span className="tooltip-emoji">{tp.icon}</span>
                                                <span className="tooltip-name">{tp.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Tipping Point Year auf gleicher horizontalen Position */}
                            <div
                                className="timeline__tipping-point-year"
                                style={{
                                    left: `${leftPercent}%`,
                                    opacity: showTPYear ? 1 : 0
                                }}
                            >
                                {groupYear}
                            </div>
                        </React.Fragment>
                    );
                })}




            </div>
        </div>
    );
}