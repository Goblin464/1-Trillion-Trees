import { gsap } from "gsap"

export function animatePanelEnter(element: HTMLElement) {
  gsap.fromTo(
    element,
    { x: -40, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
  )
}
