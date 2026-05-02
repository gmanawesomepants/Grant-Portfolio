import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let triggers: ScrollTrigger[] = [];

export function initContactReveal() {
  const section = document.querySelector("#contact");
  if (!section) return;

  const heading = section.querySelector(".contact-heading");
  const sub = section.querySelector(".contact-sub");
  const ticketHeader = section.querySelector(".contact-ticket-header");
  const fields = section.querySelectorAll(".contact-step");
  const button = section.querySelector(".contact-submit");
  const stitchLine = section.querySelector(".stitch-line");
  const stitchDots = section.querySelectorAll(".stitch-dot");

  // Initial states (CSS handles pre-GSAP hidden state, GSAP takes over here)
  if (stitchLine) gsap.set(stitchLine, { scaleY: 0, transformOrigin: "top" });
  if (stitchDots.length) gsap.set(stitchDots, { scale: 0, opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 75%",
      once: true,
    },
  });

  if (heading) tl.to(heading, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
  if (sub) tl.to(sub, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3");
  if (ticketHeader) tl.to(ticketHeader, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, "-=0.2");
  if (stitchLine) tl.to(stitchLine, { scaleY: 1, duration: 0.8, ease: "power2.inOut" }, "-=0.2");

  fields.forEach((field, i) => {
    tl.to(field, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.3");
    if (stitchDots[i]) {
      tl.to(stitchDots[i], { scale: 1, opacity: 0.6, duration: 0.25, ease: "back.out(2)" }, "-=0.35");
    }
  });

  if (button) tl.to(button, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.2");

  // After reveal completes, clear GSAP inline styles so CSS classes can take control
  tl.call(() => {
    stitchDots.forEach(dot => {
      gsap.set(dot, { clearProps: "opacity,scale,transform" });
    });
  });

  if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);
}

export function cleanupContactReveal() {
  triggers.forEach((t) => t.kill());
  triggers = [];
}
