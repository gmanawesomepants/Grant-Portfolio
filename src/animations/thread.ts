import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let triggers: ScrollTrigger[] = [];
let resizeObserver: ResizeObserver | null = null;

interface Junction {
  y: number;
  label: string;
}

// Each label sits at the TOP of its associated section
const SECTION_LABELS: { sectionId: string; label: string }[] = [
  { sectionId: "work", label: "MEASURE" },
  { sectionId: "suit-spec", label: "CUT" },
  { sectionId: "services", label: "FIT" },
  { sectionId: "contact", label: "DELIVER" },
];

const BRANCH_LEN = 12;
const MIN_VIEWPORT = 1300;

function getThreadX(): number {
  const wrapper = document.querySelector(".section-wrapper");
  if (!wrapper) return 30;
  const rect = wrapper.getBoundingClientRect();
  return rect.left - 35;
}

function getJunctions(): Junction[] {
  const junctions: Junction[] = [];

  SECTION_LABELS.forEach((s) => {
    const el = document.getElementById(s.sectionId);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const y = rect.top + window.scrollY;

    junctions.push({ y, label: s.label });
  });

  return junctions;
}

function buildMainPath(junctions: Junction[], docHeight: number, threadX: number): string {
  if (junctions.length === 0) return "";

  const startY = junctions[0].y - 200;
  const endY = Math.min(junctions[junctions.length - 1].y + 300, docHeight);

  const points = [startY, ...junctions.map((j) => j.y), endY];

  let d = `M ${threadX} ${points[0]}`;

  for (let i = 1; i < points.length; i++) {
    d += ` L ${threadX} ${points[i]}`;
  }

  return d;
}

function buildBranchPath(junctions: Junction[], threadX: number): string {
  let d = "";
  for (const j of junctions) {
    d += `M ${threadX} ${j.y} L ${threadX + BRANCH_LEN} ${j.y} `;
  }
  return d.trim();
}

function render() {
  const existing = document.getElementById("thread-container");
  if (existing) existing.remove();
  document.querySelectorAll(".thread-chapter-label").forEach((el) => el.remove());

  if (window.innerWidth < MIN_VIEWPORT) return;

  const junctions = getJunctions();
  if (junctions.length === 0) return;

  const threadX = getThreadX();
  if (threadX < 20) return;

  const docHeight = document.documentElement.scrollHeight;
  const mainD = buildMainPath(junctions, docHeight, threadX);
  const branchD = buildBranchPath(junctions, threadX);

  const container = document.createElement("div");
  container.id = "thread-container";
  container.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: ${docHeight}px;
    pointer-events: none;
    z-index: 5;
    overflow: visible;
  `;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", `${docHeight}`);
  svg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${docHeight}`);
  svg.style.cssText = `position: absolute; top: 0; left: 0;`;

  // ── Filters ──
  const defs = document.createElementNS(svgNS, "defs");

  // Pin glow filter (for junction dots)
  const pinFilter = document.createElementNS(svgNS, "filter");
  pinFilter.setAttribute("id", "pin-glow");
  pinFilter.setAttribute("x", "-50%");
  pinFilter.setAttribute("y", "-50%");
  pinFilter.setAttribute("width", "200%");
  pinFilter.setAttribute("height", "200%");
  const pinBlur = document.createElementNS(svgNS, "feGaussianBlur");
  pinBlur.setAttribute("in", "SourceGraphic");
  pinBlur.setAttribute("stdDeviation", "4");
  pinFilter.appendChild(pinBlur);
  defs.appendChild(pinFilter);

  // Thread glow filter (for lit path)
  const threadFilter = document.createElementNS(svgNS, "filter");
  threadFilter.setAttribute("id", "thread-glow");
  threadFilter.setAttribute("x", "-50%");
  threadFilter.setAttribute("y", "-2%");
  threadFilter.setAttribute("width", "200%");
  threadFilter.setAttribute("height", "104%");
  const threadBlur = document.createElementNS(svgNS, "feGaussianBlur");
  threadBlur.setAttribute("in", "SourceGraphic");
  threadBlur.setAttribute("stdDeviation", "4");
  threadFilter.appendChild(threadBlur);
  defs.appendChild(threadFilter);

  svg.appendChild(defs);

  // ── Base stitch path — faint dashed line ──
  const stitchPath = document.createElementNS(svgNS, "path");
  stitchPath.id = "thread-stitch";
  stitchPath.setAttribute("d", mainD);
  stitchPath.setAttribute("fill", "none");
  stitchPath.setAttribute("stroke", "var(--color-amber)");
  stitchPath.setAttribute("stroke-opacity", "0.15");
  stitchPath.setAttribute("stroke-width", "1");
  stitchPath.setAttribute("stroke-dasharray", "8 6");
  svg.appendChild(stitchPath);

  // ── Glow path — brighter overlay that lights up on scroll ──
  const glowPath = document.createElementNS(svgNS, "path");
  glowPath.id = "thread-glow-path";
  glowPath.setAttribute("d", mainD);
  glowPath.setAttribute("fill", "none");
  glowPath.setAttribute("stroke", "var(--color-amber)");
  glowPath.setAttribute("stroke-opacity", "0.6");
  glowPath.setAttribute("stroke-width", "1.5");
  glowPath.setAttribute("stroke-dasharray", "8 6");
  glowPath.setAttribute("filter", "url(#thread-glow)");
  svg.appendChild(glowPath);

  // Branch paths
  if (branchD) {
    const branches = document.createElementNS(svgNS, "path");
    branches.setAttribute("d", branchD);
    branches.setAttribute("fill", "none");
    branches.setAttribute("stroke", "var(--color-amber)");
    branches.setAttribute("stroke-opacity", "0.25");
    branches.setAttribute("stroke-width", "1");
    branches.setAttribute("stroke-dasharray", "4 3");
    svg.appendChild(branches);
  }

  // Junction dots — pin pricks with glow
  const junctionDots: SVGCircleElement[] = [];
  const junctionGlows: SVGCircleElement[] = [];

  for (const j of junctions) {
    const glow = document.createElementNS(svgNS, "circle");
    glow.setAttribute("cx", `${threadX}`);
    glow.setAttribute("cy", `${j.y}`);
    glow.setAttribute("r", "3");
    glow.setAttribute("fill", "var(--color-amber)");
    glow.setAttribute("fill-opacity", "0.3");
    glow.setAttribute("filter", "url(#pin-glow)");
    svg.appendChild(glow);
    junctionGlows.push(glow);

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", `${threadX}`);
    circle.setAttribute("cy", `${j.y}`);
    circle.setAttribute("r", "3");
    circle.setAttribute("fill", "var(--color-amber)");
    circle.setAttribute("fill-opacity", "0.4");
    svg.appendChild(circle);
    junctionDots.push(circle);
  }

  container.appendChild(svg);
  document.body.appendChild(container);

  // ── Scroll-draw animation ──
  const totalLength = (stitchPath as SVGGeometryElement).getTotalLength();

  stitchPath.style.strokeDasharray = "8 6";
  stitchPath.style.strokeDashoffset = `${totalLength}`;

  glowPath.style.strokeDasharray = "8 6";
  glowPath.style.strokeDashoffset = `${totalLength}`;

  const st = ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const offset = totalLength * (1 - self.progress);
      stitchPath.style.strokeDashoffset = `${offset}`;
      glowPath.style.strokeDashoffset = `${offset}`;

      // Junction dot proximity glow
      const scrollY = self.progress * docHeight;
      for (let i = 0; i < junctions.length; i++) {
        const dist = Math.abs(scrollY - junctions[i].y);
        const proximity = Math.max(0, 1 - dist / 250);
        // Dot: base 0.4, peaks at 1.0
        junctionDots[i].setAttribute("fill-opacity", `${0.4 + proximity * 0.6}`);
        // Glow: base 0.3, peaks at 0.85
        junctionGlows[i].setAttribute("fill-opacity", `${0.3 + proximity * 0.55}`);
        // Scale dot on proximity: 3px base → 6px peak
        const scale = 1 + proximity * 1.0;
        junctionDots[i].setAttribute("r", `${3 * scale}`);
        junctionGlows[i].setAttribute("r", `${3 * scale}`);
      }
    },
  });
  triggers.push(st);

  // Chapter labels — to the LEFT of the thread, rotated -90deg
  junctions.forEach((j) => {
    if (!j.label) return;

    const label = document.createElement("div");
    label.className = "thread-chapter-label";
    label.textContent = j.label;
    label.style.cssText = `
      position: absolute;
      left: ${threadX - 16}px;
      top: ${j.y + 8}px;
      font-family: var(--font-heading);
      font-size: 0.55rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--color-amber);
      opacity: 0.35;
      transform: rotate(-90deg);
      transform-origin: left top;
      pointer-events: none;
      white-space: nowrap;
      z-index: 5;
    `;
    document.body.appendChild(label);
  });
}

export function initThread() {
  if (typeof window === "undefined") return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      render();
    });
  });

  resizeObserver = new ResizeObserver(() => {
    triggers.forEach((t) => t.kill());
    triggers = [];
    render();
  });
  resizeObserver.observe(document.body);
}

export function cleanupThread() {
  triggers.forEach((t) => t.kill());
  triggers = [];

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  const container = document.getElementById("thread-container");
  if (container) container.remove();

  document.querySelectorAll(".thread-chapter-label").forEach((el) => el.remove());
}
