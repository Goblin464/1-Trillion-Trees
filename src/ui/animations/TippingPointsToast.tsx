import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { TriangleAlert } from "lucide-react";
import gsap from "gsap";

export const TippingPointsToast = ({
    name,
    threshold,
    active
}: {
    name: string;
    threshold: number;
    active: boolean
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);
    useGSAP(
        () => {
            tl.current = gsap.timeline({ paused: true })

            tl.current.fromTo(
                ref.current,
                { x: 400, top: 0, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
            )

        },
        { scope: ref }
    );
    useGSAP(() => {
        if (!tl.current) return;

        active ? tl.current.play() : tl.current.reverse();
    }, [active]);

    return (
        <div
            ref={ref}
            style={{
                background: "#ffdddd",
                color: "#a00000",
                padding: "0.3rem 1rem",
                alignItems: "center",
                gap: "0.5rem",
                display: "flex",
                borderRadius: "8px",
                minWidth: "280px",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
        >
            <TriangleAlert></TriangleAlert>   {name} ({threshold.toFixed(1)}°C)
        </div>
    );
};
