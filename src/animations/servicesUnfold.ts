import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let triggers: ScrollTrigger[] = [];
let timeline: gsap.core.Timeline | null = null;

export function initServicesUnfold() {
  if (typeof window === "undefined") return;
  if (window.innerWidth <= 768) return;

  const section = document.getElementById("services");
  if (!section) return;

  const panels = section.querySelectorAll<HTMLElement>(".service-panel");
  const foldLines = section.querySelectorAll<HTMLElement>(".fold-line");
  const cta = section.querySelector<HTMLElement>(".services-cta");

  if (panels.length < 3 || foldLines.length < 2 || !cta) return;

  const [, panel2, panel3] = panels;
  const [foldLine1, foldLine2] = foldLines;

  // ── Initial state ──
  // All panels at their final CSS flex widths from the start.
  // Panel 1 is visible at its final narrow width.
  // Panels 2+3 are rotated edge-on and invisible — they occupy
  // flex space but are visually absent (dark background fills the gap).

  gsap.set(panel2, { rotateY: -90, opacity: 0, pointerEvents: "none" });
  gsap.set(panel3, { rotateY: -90, opacity: 0, pointerEvents: "none" });
  gsap.set(foldLine1, { opacity: 0 });
  gsap.set(foldLine2, { opacity: 0 });
  gsap.set(cta, { opacity: 0, y: 12 });

  // ── Scrubbed timeline with ScrollTrigger pinning ──

  timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=250%",
      pin: true,
      scrub: 0.5,
    },
  });

  triggers.push(timeline.scrollTrigger!);

  // ── Phase 1: Panel 2 unfolds (0.1 – 0.35) ──

  timeline.to(panel2, {
    rotateY: 0,
    opacity: 1,
    duration: 0.25,
    ease: "power2.out",
  }, 0.1);

  timeline.to(foldLine1, { opacity: 1, duration: 0.1 }, 0.3);
  timeline.set(panel2, { pointerEvents: "auto" }, 0.35);

  // ── Phase 2: Panel 3 unfolds (0.4 – 0.65) — same timing ──

  timeline.to(panel3, {
    rotateY: 0,
    opacity: 1,
    duration: 0.25,
    ease: "power2.out",
  }, 0.4);

  timeline.to(foldLine2, { opacity: 1, duration: 0.1 }, 0.6);
  timeline.set(panel3, { pointerEvents: "auto" }, 0.65);

  // ── CTA fade in ──

  timeline.to(cta, {
    opacity: 1,
    y: 0,
    duration: 0.15,
    ease: "power2.out",
  }, 0.7);

  // ── Hold: all content readable before section unpins ──
  timeline.to({}, { duration: 1.3 }, 0.85);
}

export function cleanupServicesUnfold() {
  if (timeline) {
    timeline.kill();
    timeline = null;
  }
  triggers.forEach((t) => t.kill());
  triggers = [];
}
