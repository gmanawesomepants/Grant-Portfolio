import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let triggers: ScrollTrigger[] = [];
let timeline: gsap.core.Timeline | null = null;

// ViewBox: 0 0 400 500
const VB_WIDTH = 400;
const VB_HEIGHT = 500;

// ── SVG Path Data ──

const BODY_OUTLINE = `
  M 165,38
  C 175,42 190,44 200,44
  C 210,44 225,42 235,38
  C 262,48 300,56 330,64
  C 324,88 316,118 310,148
  C 305,168 300,180 294,188
  L 292,268
  C 294,308 298,342 302,372
  L 98,372
  C 102,342 106,308 108,268
  L 106,188
  C 100,180 95,168 90,148
  C 84,118 76,88 70,64
  C 100,56 138,48 165,38
  Z
`;

const SLEEVE_LEFT = `
  M 70,64
  C 64,90 58,135 54,185
  C 50,235 52,295 58,350
  C 60,365 64,378 70,390
  L 120,390
  C 118,380 116,368 114,350
  C 110,300 108,242 106,192
  L 106,188
`;

const SLEEVE_RIGHT = `
  M 330,64
  C 336,90 342,135 346,185
  C 350,235 348,295 342,350
  C 340,365 336,378 330,390
  L 280,390
  C 282,380 284,368 286,350
  C 290,300 292,242 294,192
  L 294,188
`;

const COLLAR = `
  M 165,38
  C 170,33 182,29 200,28
  C 218,29 230,33 235,38
`;

const LAPEL_LEFT = `
  M 165,38 L 152,52 L 140,45 L 155,58
  C 162,72 168,92 174,116
  C 180,145 186,175 192,200
  L 200,215
`;

const LAPEL_LEFT_INNER = `
  M 165,38
  C 170,50 176,68 180,88
  C 186,115 191,148 195,180
  L 200,215
`;

const LAPEL_RIGHT = `
  M 235,38 L 248,52 L 260,45 L 245,58
  C 238,72 232,92 226,116
  C 220,145 214,175 208,200
  L 200,215
`;

const LAPEL_RIGHT_INNER = `
  M 235,38
  C 230,50 224,68 220,88
  C 214,115 209,148 205,180
  L 200,215
`;

// ── Callout definitions — mapped to real suit anatomy, reveal order top→bottom ──
const CALLOUTS = [
  { anchor: [100, 64], end: [10, 64], text: "TypeScript / Prisma / Node.js", side: "left", gap: 20 },
  { anchor: [227, 90], end: [390, 90], text: "Kubernetes Deployment", side: "right", gap: 20 },
  { anchor: [280, 160], end: [390, 160], text: "Full CI/CD Pipeline", side: "right", gap: 20 },
  { anchor: [200, 242], end: [10, 242], text: "Thompson Sampling ML Engine", side: "left", gap: 44 },
  { anchor: [280, 290], end: [390, 290], text: "15+ CRM Integrations", side: "right", gap: 20 },
  { anchor: [120, 290], end: [10, 290], text: "Redis / BullMQ Processing", side: "left", gap: 20 },
  { anchor: [300, 390], end: [390, 390], text: "GDPR-Compliant Architecture", side: "right", gap: 20 },
];

function initBlueprintMobile(section: HTMLElement, container: HTMLElement) {
  container.innerHTML = "";

  // Hide fallback list — CSS also backs this up via display:none !important
  const fallback = section.querySelector(".blueprint-mobile-fallback") as HTMLElement | null;
  if (fallback) {
    fallback.style.display = "none";
    fallback.setAttribute("aria-hidden", "true");
  }

  // ── Two-column flex layout: jacket 65%, labels 35% ──
  const jacketCol = document.createElement("div");
  jacketCol.className = "blueprint-jacket-col";

  const labelCol = document.createElement("div");
  labelCol.className = "blueprint-label-col";

  const svgNS = "http://www.w3.org/2000/svg";

  // ── SVG jacket ──
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VB_WIDTH} ${VB_HEIGHT}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "RevenueOS system architecture rendered as a dinner jacket technical schematic");
  svg.style.display = "block";

  // Group 1: Outline (animated via stroke-dashoffset)
  const outlineGroup = document.createElementNS(svgNS, "g");
  outlineGroup.setAttribute("stroke", "var(--color-amber)");
  outlineGroup.setAttribute("stroke-opacity", "0.22");
  outlineGroup.setAttribute("stroke-width", "1.5");
  const outlinePaths: SVGPathElement[] = [];
  [BODY_OUTLINE, SLEEVE_LEFT, SLEEVE_RIGHT].forEach((d) => {
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", d);
    outlinePaths.push(p);
    outlineGroup.appendChild(p);
  });
  svg.appendChild(outlineGroup);

  // Group 2: Lapels (animated)
  const lapelGroup = document.createElementNS(svgNS, "g");
  lapelGroup.setAttribute("stroke", "var(--color-amber)");
  lapelGroup.setAttribute("stroke-opacity", "0.22");
  lapelGroup.setAttribute("stroke-width", "1.5");
  const lapelPaths: SVGPathElement[] = [];
  [
    { d: COLLAR },
    { d: LAPEL_LEFT },
    { d: LAPEL_LEFT_INNER, strokeWidth: "1.0" },
    { d: LAPEL_RIGHT },
    { d: LAPEL_RIGHT_INNER, strokeWidth: "1.0" },
  ].forEach((spec) => {
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", spec.d);
    if (spec.strokeWidth) p.setAttribute("stroke-width", spec.strokeWidth);
    lapelPaths.push(p);
    lapelGroup.appendChild(p);
  });
  svg.appendChild(lapelGroup);

  // Group 3: Details (fade in as a group)
  const detailGroup = document.createElementNS(svgNS, "g");
  detailGroup.setAttribute("stroke", "var(--color-amber)");
  detailGroup.setAttribute("stroke-opacity", "0.22");
  detailGroup.style.opacity = "0";
  [
    { d: "M 200,215 L 200,237", opacity: "0.7" },
    { d: "M 200,247 L 200,277", opacity: "0.7" },
    { d: "M 200,287 L 200,372", opacity: "0.7" },
  ].forEach((seg) => {
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", seg.d);
    p.setAttribute("stroke-width", "1");
    p.setAttribute("stroke-opacity", seg.opacity);
    detailGroup.appendChild(p);
  });
  ["M 240,163 L 278,159", "M 240,163 L 240,170 L 278,166 L 278,159"].forEach((d) => {
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", d);
    p.setAttribute("stroke-width", "1");
    detailGroup.appendChild(p);
  });
  [
    ["M 120,290 L 185,283", "M 120,290 L 120,302 L 185,295 L 185,283"],
    ["M 280,290 L 215,283", "M 280,290 L 280,302 L 215,295 L 215,283"],
  ].forEach((pocket) => {
    const g = document.createElementNS(svgNS, "g");
    pocket.forEach((d) => {
      const p = document.createElementNS(svgNS, "path");
      p.setAttribute("d", d);
      p.setAttribute("stroke-width", "1");
      g.appendChild(p);
    });
    detailGroup.appendChild(g);
  });
  [{ cx: 200, cy: 242 }, { cx: 200, cy: 282 }].forEach((b) => {
    const outer = document.createElementNS(svgNS, "circle");
    outer.setAttribute("cx", `${b.cx}`);
    outer.setAttribute("cy", `${b.cy}`);
    outer.setAttribute("r", "4");
    outer.setAttribute("stroke-width", "1");
    detailGroup.appendChild(outer);
    const inner = document.createElementNS(svgNS, "circle");
    inner.setAttribute("cx", `${b.cx}`);
    inner.setAttribute("cy", `${b.cy}`);
    inner.setAttribute("r", "1.5");
    inner.setAttribute("stroke-width", "0.6");
    inner.setAttribute("stroke-opacity", "0.35");
    detailGroup.appendChild(inner);
  });
  [{ d: "M 72,382 L 118,382" }, { d: "M 328,382 L 282,382" }].forEach((cuff) => {
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", cuff.d);
    p.setAttribute("stroke-width", "0.9");
    p.setAttribute("stroke-opacity", "0.5");
    detailGroup.appendChild(p);
  });
  svg.appendChild(detailGroup);

  // ── Callout lines: all redirect to right edge ──
  // Two callouts share y=290 — offset them to avoid label collision.
  const mobileEndY = [64, 90, 160, 242, 272, 316, 390];

  const calloutGroups: SVGGElement[] = [];
  CALLOUTS.forEach((co, i) => {
    const g = document.createElementNS(svgNS, "g");
    g.style.opacity = "0";

    // Anchor dot on the jacket
    const anchorDot = document.createElementNS(svgNS, "circle");
    anchorDot.setAttribute("cx", `${co.anchor[0]}`);
    anchorDot.setAttribute("cy", `${co.anchor[1]}`);
    anchorDot.setAttribute("r", "2.5");
    anchorDot.setAttribute("fill", "var(--color-amber)");
    anchorDot.setAttribute("fill-opacity", "0.55");
    g.appendChild(anchorDot);

    // Line from anchor diagonally to right edge at mobileEndY
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", `${co.anchor[0]}`);
    line.setAttribute("y1", `${co.anchor[1]}`);
    line.setAttribute("x2", "390");
    line.setAttribute("y2", `${mobileEndY[i]}`);
    line.setAttribute("stroke", "var(--color-amber)");
    line.setAttribute("stroke-opacity", "0.35");
    line.setAttribute("stroke-width", "0.8");
    g.appendChild(line);

    // End dot at right edge
    const endDot = document.createElementNS(svgNS, "circle");
    endDot.setAttribute("cx", "390");
    endDot.setAttribute("cy", `${mobileEndY[i]}`);
    endDot.setAttribute("r", "2");
    endDot.setAttribute("fill", "var(--color-amber)");
    endDot.setAttribute("fill-opacity", "0.55");
    g.appendChild(endDot);

    svg.appendChild(g);
    calloutGroups.push(g);
  });

  jacketCol.appendChild(svg);

  // ── Label items: absolutely positioned in right column ──
  // top% is set as a fallback; rAF below recalculates from actual SVG pixel height.
  const labelEls: HTMLDivElement[] = [];
  CALLOUTS.forEach((co, i) => {
    const item = document.createElement("div");
    item.className = "blueprint-label-item";
    item.style.opacity = "0";
    item.style.top = `${(mobileEndY[i] / VB_HEIGHT) * 100}%`;
    item.textContent = co.text;
    labelCol.appendChild(item);
    labelEls.push(item);
  });

  container.appendChild(jacketCol);
  container.appendChild(labelCol);

  // Sync label positions to actual SVG rendered height so dots align precisely
  requestAnimationFrame(() => {
    const svgH = svg.getBoundingClientRect().height;
    if (svgH > 0) {
      labelCol.style.height = `${svgH}px`;
      labelEls.forEach((item, i) => {
        item.style.top = `${(mobileEndY[i] / VB_HEIGHT) * svgH}px`;
      });
    }
  });

  // ── Stroke-dash setup ──
  outlinePaths.forEach((p) => {
    const len = (p as SVGGeometryElement).getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
  });
  lapelPaths.forEach((p) => {
    const len = (p as SVGGeometryElement).getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
  });

  // ── GSAP ScrollTrigger — mobile timeline ──
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=220%",
      pin: true,
      scrub: 0.5,
    },
  });

  triggers.push(tl.scrollTrigger!);

  // Phase 1: Draw jacket
  tl.to(outlinePaths[0], { strokeDashoffset: 0, duration: 1.4, ease: "none" }, 0);
  tl.to(outlinePaths[1], { strokeDashoffset: 0, duration: 1.2, ease: "none" }, 0.3);
  tl.to(outlinePaths[2], { strokeDashoffset: 0, duration: 1.2, ease: "none" }, 0.3);
  lapelPaths.forEach((p, i) => {
    tl.to(p, { strokeDashoffset: 0, duration: 1.0, ease: "none" }, 0.6 + i * 0.1);
  });
  tl.to(detailGroup, { opacity: 1, duration: 0.5, ease: "none" }, 1.4);

  // Phase 2: Callout lines + matching labels reveal sequentially
  calloutGroups.forEach((g, i) => {
    const t = 2.2 + i * 0.5;
    tl.to(g, { opacity: 1, duration: 0.2, ease: "none" }, t);
    tl.to(labelEls[i], { opacity: 1, duration: 0.2, ease: "none" }, t + 0.05);
  });

  // Hold at end
  tl.to({}, { duration: 0.5 }, 2.2 + CALLOUTS.length * 0.5 + 0.3);
}

export function initBlueprint() {
  if (typeof window === "undefined") return;

  const section = document.getElementById("suit-spec");
  if (!section) return;

  const container = section.querySelector(".blueprint-svg-container") as HTMLElement;
  if (!container) return;

  if (window.innerWidth <= 768) {
    initBlueprintMobile(section, container);
    return;
  }

  container.innerHTML = "";

  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VB_WIDTH} ${VB_HEIGHT}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "RevenueOS system architecture diagram rendered as a dinner jacket technical schematic with annotated callouts");
  svg.style.display = "block";
  svg.style.overflow = "visible";

  // ── Defs: filters ──

  const defs = document.createElementNS(svgNS, "defs");

  const hoverFilter = document.createElementNS(svgNS, "filter");
  hoverFilter.setAttribute("id", "hover-glow");
  hoverFilter.setAttribute("x", "-100%");
  hoverFilter.setAttribute("y", "-100%");
  hoverFilter.setAttribute("width", "300%");
  hoverFilter.setAttribute("height", "300%");
  const hoverBlur = document.createElementNS(svgNS, "feGaussianBlur");
  hoverBlur.setAttribute("in", "SourceGraphic");
  hoverBlur.setAttribute("stdDeviation", "8");
  hoverFilter.appendChild(hoverBlur);
  defs.appendChild(hoverFilter);

  svg.appendChild(defs);

  // ── Group 1: Suit Outline (body + sleeves) ──

  const outlineGroup = document.createElementNS(svgNS, "g");
  outlineGroup.setAttribute("stroke", "var(--color-amber)");
  outlineGroup.setAttribute("stroke-opacity", "0.22");
  outlineGroup.setAttribute("stroke-width", "1.5");

  const outlinePaths: SVGPathElement[] = [];
  [
    { d: BODY_OUTLINE, id: "body-outline" },
    { d: SLEEVE_LEFT, id: "sleeve-left" },
    { d: SLEEVE_RIGHT, id: "sleeve-right" },
  ].forEach((spec) => {
    const p = document.createElementNS(svgNS, "path");
    p.id = spec.id;
    p.setAttribute("d", spec.d);
    outlineGroup.appendChild(p);
    outlinePaths.push(p);
  });

  svg.appendChild(outlineGroup);

  // ── Group 2: Collar & Lapels ──

  const lapelPaths: SVGPathElement[] = [];

  const lapelGroup = document.createElementNS(svgNS, "g");
  lapelGroup.setAttribute("stroke", "var(--color-amber)");
  lapelGroup.setAttribute("stroke-opacity", "0.22");
  lapelGroup.setAttribute("stroke-width", "1.5");

  [
    { d: COLLAR, id: "collar" },
    { d: LAPEL_LEFT, id: "lapel-left" },
    { d: LAPEL_LEFT_INNER, id: "lapel-left-inner", strokeWidth: "1.0" },
    { d: LAPEL_RIGHT, id: "lapel-right" },
    { d: LAPEL_RIGHT_INNER, id: "lapel-right-inner", strokeWidth: "1.0" },
  ].forEach((spec) => {
    const p = document.createElementNS(svgNS, "path");
    p.id = spec.id;
    p.setAttribute("d", spec.d);
    if (spec.strokeWidth) p.setAttribute("stroke-width", spec.strokeWidth);
    lapelGroup.appendChild(p);
    lapelPaths.push(p);
  });

  svg.appendChild(lapelGroup);

  // ── Group 3: Details — fade in ──

  const detailGroup = document.createElementNS(svgNS, "g");
  detailGroup.id = "suit-details";
  detailGroup.setAttribute("stroke", "var(--color-amber)");
  detailGroup.setAttribute("stroke-opacity", "0.22");
  detailGroup.style.opacity = "0";

  // Front closure
  [
    { d: "M 200,215 L 200,237", opacity: "0.7" },
    { d: "M 200,247 L 200,277", opacity: "0.7" },
    { d: "M 200,287 L 200,372", opacity: "0.7" },
  ].forEach((seg) => {
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", seg.d);
    p.setAttribute("stroke-width", "1");
    p.setAttribute("stroke-opacity", seg.opacity);
    detailGroup.appendChild(p);
  });

  // Breast pocket
  const breastPocket = document.createElementNS(svgNS, "g");
  [
    "M 240,163 L 278,159",
    "M 240,163 L 240,170 L 278,166 L 278,159",
  ].forEach((d) => {
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", d);
    p.setAttribute("stroke-width", "1");
    breastPocket.appendChild(p);
  });
  detailGroup.appendChild(breastPocket);

  // Hip pockets
  [
    ["M 120,290 L 185,283", "M 120,290 L 120,302 L 185,295 L 185,283"],
    ["M 280,290 L 215,283", "M 280,290 L 280,302 L 215,295 L 215,283"],
  ].forEach((pocket) => {
    const g = document.createElementNS(svgNS, "g");
    pocket.forEach((d) => {
      const p = document.createElementNS(svgNS, "path");
      p.setAttribute("d", d);
      p.setAttribute("stroke-width", "1");
      g.appendChild(p);
    });
    detailGroup.appendChild(g);
  });

  // Buttons
  [
    { cx: 200, cy: 242 },
    { cx: 200, cy: 282 },
  ].forEach((b) => {
    const outer = document.createElementNS(svgNS, "circle");
    outer.setAttribute("cx", `${b.cx}`);
    outer.setAttribute("cy", `${b.cy}`);
    outer.setAttribute("r", "4");
    outer.setAttribute("stroke-width", "1");
    detailGroup.appendChild(outer);

    const inner = document.createElementNS(svgNS, "circle");
    inner.setAttribute("cx", `${b.cx}`);
    inner.setAttribute("cy", `${b.cy}`);
    inner.setAttribute("r", "1.5");
    inner.setAttribute("stroke-width", "0.6");
    inner.setAttribute("stroke-opacity", "0.35");
    detailGroup.appendChild(inner);
  });

  // Cuff lines
  [
    { d: "M 72,382 L 118,382" },
    { d: "M 328,382 L 282,382" },
  ].forEach((cuff) => {
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", cuff.d);
    p.setAttribute("stroke-width", "0.9");
    p.setAttribute("stroke-opacity", "0.5");
    detailGroup.appendChild(p);
  });

  svg.appendChild(detailGroup);

  // ── Callout elements ──

  // Hover glow circle (invisible until hovered)
  const glowCircle = document.createElementNS(svgNS, "circle");
  glowCircle.setAttribute("r", "30");
  glowCircle.setAttribute("fill", "var(--color-amber)");
  glowCircle.setAttribute("fill-opacity", "0");
  glowCircle.setAttribute("filter", "url(#hover-glow)");
  svg.appendChild(glowCircle);

  const calloutElements: {
    group: SVGGElement;
    line: SVGLineElement;
    anchorDot: SVGCircleElement;
    endDot: SVGCircleElement;
    hitarea: SVGCircleElement;
    textEl: HTMLDivElement;
  }[] = [];

  CALLOUTS.forEach((co) => {
    const group = document.createElementNS(svgNS, "g");
    group.style.transition = "filter 0.3s ease";

    // Invisible hitarea for hover targeting (larger than visible dot)
    const hitarea = document.createElementNS(svgNS, "circle");
    hitarea.setAttribute("cx", `${co.anchor[0]}`);
    hitarea.setAttribute("cy", `${co.anchor[1]}`);
    hitarea.setAttribute("r", "12");
    hitarea.setAttribute("fill", "transparent");
    hitarea.style.pointerEvents = "none";
    hitarea.style.cursor = "pointer";
    group.appendChild(hitarea);

    // Anchor dot (on the jacket)
    const anchorDot = document.createElementNS(svgNS, "circle");
    anchorDot.setAttribute("cx", `${co.anchor[0]}`);
    anchorDot.setAttribute("cy", `${co.anchor[1]}`);
    anchorDot.setAttribute("r", "2.5");
    anchorDot.setAttribute("fill", "var(--color-amber)");
    anchorDot.setAttribute("fill-opacity", "0");
    group.appendChild(anchorDot);

    // Call-out line (starts collapsed at anchor)
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", `${co.anchor[0]}`);
    line.setAttribute("y1", `${co.anchor[1]}`);
    line.setAttribute("x2", `${co.anchor[0]}`);
    line.setAttribute("y2", `${co.anchor[1]}`);
    line.setAttribute("stroke", "var(--color-amber)");
    line.setAttribute("stroke-opacity", "0.35");
    line.setAttribute("stroke-width", "1");
    group.appendChild(line);

    // Endpoint dot
    const endDot = document.createElementNS(svgNS, "circle");
    endDot.setAttribute("cx", `${co.end[0]}`);
    endDot.setAttribute("cy", `${co.end[1]}`);
    endDot.setAttribute("r", "2.5");
    endDot.setAttribute("fill", "var(--color-amber)");
    endDot.setAttribute("fill-opacity", "0");
    group.appendChild(endDot);

    svg.appendChild(group);

    // Text label (HTML, positioned absolutely)
    // top/left are set after SVG is in the DOM via getBoundingClientRect pass below.
    const textEl = document.createElement("div");
    textEl.className = "callout-label";
    textEl.textContent = co.text;
    textEl.style.opacity = "0";
    textEl.style.textAlign = co.side === "left" ? "right" : "left";
    textEl.style.transform = co.side === "left"
      ? "translateX(-100%) translateY(-50%)"
      : "translateY(-50%)";

    container.appendChild(textEl);
    calloutElements.push({ group, line, anchorDot, endDot, hitarea, textEl });
  });

  container.prepend(svg);

  // ── Position labels from actual SVG dot coordinates ──
  // getBoundingClientRect forces a synchronous reflow and returns the dot's
  // true rendered pixel position — no coordinate system conversion needed.
  {
    const cRect = container.getBoundingClientRect();
    calloutElements.forEach((el, i) => {
      const co = CALLOUTS[i];
      const dot = el.endDot.getBoundingClientRect();
      const dotX = dot.left + dot.width / 2 - cRect.left;
      const dotY = dot.top + dot.height / 2 - cRect.top;
      el.textEl.style.top = `${dotY}px`;
      el.textEl.style.left = co.side === "left"
        ? `${dotX - co.gap}px`
        : `${dotX + co.gap}px`;
    });
  }

  // ── Set up stroke-dash for outline paths ──

  outlinePaths.forEach((p) => {
    const len = (p as SVGGeometryElement).getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
  });

  // ── Set up stroke-dash for lapel paths ──

  lapelPaths.forEach((p) => {
    const len = (p as SVGGeometryElement).getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
  });

  // ── Hover system ──

  let hoveredIndex = -1;

  function highlightCallout(index: number) {
    if (!container.classList.contains("blueprint-hover-active")) return;
    if (hoveredIndex === index) return;
    hoveredIndex = index;

    calloutElements.forEach((co, i) => {
      const isActive = i === index;
      // Use CSS filter for dimming — avoids conflicting with GSAP's inline opacity
      co.textEl.style.filter = isActive ? "brightness(1.2)" : "opacity(0.3)";
      co.textEl.style.color = isActive ? "var(--color-amber-light)" : "";
      co.group.style.filter = isActive ? "" : "opacity(0.3)";
    });

    // Glow at anchor point
    glowCircle.setAttribute("cx", `${CALLOUTS[index].anchor[0]}`);
    glowCircle.setAttribute("cy", `${CALLOUTS[index].anchor[1]}`);
    gsap.to(glowCircle, {
      attr: { "fill-opacity": 0.15 },
      duration: 0.3,
      overwrite: true,
    });
  }

  function resetHover() {
    if (hoveredIndex === -1) return;
    hoveredIndex = -1;

    calloutElements.forEach((co) => {
      co.textEl.style.filter = "";
      co.textEl.style.color = "";
      co.group.style.filter = "";
    });

    gsap.to(glowCircle, {
      attr: { "fill-opacity": 0 },
      duration: 0.3,
      overwrite: true,
    });
  }

  // Attach hover listeners
  calloutElements.forEach((co, i) => {
    co.textEl.addEventListener("mouseenter", () => highlightCallout(i));
    co.textEl.addEventListener("mouseleave", () => resetHover());
    co.hitarea.addEventListener("mouseenter", () => highlightCallout(i));
    co.hitarea.addEventListener("mouseleave", () => resetHover());
  });

  // ── Scrubbed GSAP Timeline with ScrollTrigger pinning ──

  timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=400%",
      pin: true,
      scrub: 0.5,
      onLeave: () => {
        // The scrub lag (0.5s) means elements may be at partial opacity when the
        // pin releases. Jump to progress=1 instantly so the reflow frame is
        // invisible (opacity:0 on all elements, shows plain --color-bg).
        if (timeline) timeline.progress(1);
      },
      onUpdate: (self) => {
        const shouldEnable = self.progress >= 0.92 && self.progress < 0.96;
        const isEnabled = container.classList.contains("blueprint-hover-active");

        if (shouldEnable && !isEnabled) {
          container.classList.add("blueprint-hover-active");
          calloutElements.forEach((co) => {
            co.hitarea.style.pointerEvents = "auto";
            co.textEl.style.pointerEvents = "auto";
          });
        } else if (!shouldEnable && isEnabled) {
          container.classList.remove("blueprint-hover-active");
          calloutElements.forEach((co) => {
            co.hitarea.style.pointerEvents = "none";
            co.textEl.style.pointerEvents = "none";
          });
          resetHover();
        }
      },
    },
  });

  triggers.push(timeline.scrollTrigger!);

  // ── Phase 1: Draw jacket (~0 to 2.0 on the timeline) ──

  // Body outline traces first
  timeline.to(outlinePaths[0], {
    strokeDashoffset: 0,
    duration: 1.4,
    ease: "none",
  }, 0);

  // Sleeves draw simultaneously, slightly delayed
  timeline.to(outlinePaths[1], {
    strokeDashoffset: 0,
    duration: 1.2,
    ease: "none",
  }, 0.3);
  timeline.to(outlinePaths[2], {
    strokeDashoffset: 0,
    duration: 1.2,
    ease: "none",
  }, 0.3);

  // Collar + lapels draw after body starts
  lapelPaths.forEach((p, i) => {
    timeline!.to(p, {
      strokeDashoffset: 0,
      duration: 1.0,
      ease: "none",
    }, 0.6 + i * 0.1);
  });

  // Details fade in
  timeline.to(detailGroup, {
    opacity: 1,
    duration: 0.5,
    ease: "none",
  }, 1.4);

  // ── Phase 2: Callouts reveal sequentially (~2.2 to 9.5) ──

  calloutElements.forEach((co, i) => {
    const t = 2.2 + i * 0.9;

    // Anchor dot appears
    timeline!.to(co.anchorDot, {
      attr: { "fill-opacity": 0.5 },
      duration: 0.15,
      ease: "none",
    }, t);

    // Line extends outward
    timeline!.to(co.line, {
      attr: { x2: CALLOUTS[i].end[0], y2: CALLOUTS[i].end[1] },
      duration: 0.5,
      ease: "power2.out",
    }, t);

    // End dot + text label fade in
    timeline!.to(co.endDot, {
      attr: { "fill-opacity": 0.5 },
      duration: 0.25,
      ease: "none",
    }, t + 0.2);

    timeline!.to(co.textEl, {
      opacity: 1,
      duration: 0.25,
      ease: "none",
    }, t + 0.2);
  });

  // ── Phase 3: Closer fades in ──

  const closer = section.querySelector(".suit-spec-closer");
  if (closer) {
    timeline.to(closer, {
      opacity: 1,
      duration: 0.3,
      ease: "none",
    }, 9.2);
  }

  // ── Phase 4: Exit fade — blueprint + all garment chrome fade together ──
  // Runs t=10.0→10.5 (final ~5% of timeline). The pin spacer is 400% of
  // viewport, so this is the last ~20vh of scroll inside the pin window.
  // Chrome elements (header, footer, crease, tag, heading) are included so
  // they don't "materialize" perceptually when the blueprint clears.
  const docHeader = section.querySelector(".garment-doc-header");
  const docFooter = section.querySelector(".garment-doc-footer");
  const docCrease = section.querySelector(".garment-doc-crease");
  const garmentTag = section.querySelector(".garment-tag");
  const sectionHeading = section.querySelector(".section-heading");

  timeline.to(
    [container, closer, docHeader, docFooter, docCrease, garmentTag, sectionHeading].filter(Boolean),
    {
      opacity: 0,
      duration: 0.5,
      ease: "power1.in",
    },
    10
  );

  // Hold at end
  timeline.to({}, { duration: 0.3 }, 10.5);
}

export function cleanupBlueprint() {
  if (timeline) {
    timeline.kill();
    timeline = null;
  }
  triggers.forEach((t) => t.kill());
  triggers = [];

  const container = document.querySelector(".blueprint-svg-container");
  if (container) {
    container.innerHTML = "";
    container.classList.remove("blueprint-hover-active");
  }
}
