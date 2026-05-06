// Architecture diagrams for work section case study cards.
// Pure static SVG — no client directive needed.
// pathLength={1} normalizes every path length to 1 so stroke-dasharray/offset
// animation works uniformly across shapes of different actual lengths.

import { Crosshair } from "./marks/Crosshair";
import { CornerMarks } from "./marks/CornerMarks";
import { LedgerRule } from "./marks/LedgerRule";

export function DiagramOrchestration() {
  return (
    <svg
      className="case-card-diagram"
      viewBox="0 0 360 280"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* arch-g1 — primary structure: ticks, stamp underline, section dividers */}
      <g className="arch-g1">
        {/* Tape-measure ticks across top */}
        <line x1="20" y1="18" x2="340" y2="18" stroke="var(--color-amber)" strokeOpacity="0.5" strokeWidth="0.5" pathLength={1} />
        <line x1="20"  y1="18" x2="20"  y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="52"  y1="18" x2="52"  y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="84"  y1="18" x2="84"  y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="116" y1="18" x2="116" y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="148" y1="18" x2="148" y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="180" y1="18" x2="180" y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="212" y1="18" x2="212" y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="244" y1="18" x2="244" y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="276" y1="18" x2="276" y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="308" y1="18" x2="308" y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="340" y1="18" x2="340" y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        {/* Section dividers */}
        <line x1="20"  y1="60"  x2="340" y2="60"  stroke="var(--color-amber)" strokeOpacity="0.25" strokeWidth="0.4" pathLength={1} />
        <line x1="190" y1="65"  x2="190" y2="225" stroke="var(--color-amber)" strokeOpacity="0.3"  strokeWidth="0.4" pathLength={1} />
        {/* Stamp underline */}
        <line x1="20" y1="44" x2="120" y2="44" stroke="var(--color-amber)" strokeOpacity="0.5" strokeWidth="0.4" pathLength={1} />
      </g>

      {/* arch-g2 — secondary detail: registration crosshair, ledger row separators */}
      <g className="arch-g2">
        {/* Top-right registration crosshair */}
        <Crosshair cx={328} cy={38} />
        {/* Ledger row separators — left column */}
        <LedgerRule y={100} x1={20} x2={170} />
        <LedgerRule y={120} x1={20} x2={170} />
        <LedgerRule y={140} x1={20} x2={170} />
        <LedgerRule y={160} x1={20} x2={170} />
        <LedgerRule y={180} x1={20} x2={170} />
        {/* Ledger row separators — right column */}
        <LedgerRule y={100} x1={200} x2={340} />
        <LedgerRule y={120} x1={200} x2={340} />
        <LedgerRule y={140} x1={200} x2={340} />
        <LedgerRule y={160} x1={200} x2={340} />
        <LedgerRule y={180} x1={200} x2={340} />
        {/* Bottom corner registration marks */}
        <CornerMarks width={360} height={280} />
      </g>

      {/* arch-g3 — text labels: stamp, headers, table names, parameters, legend */}
      <g className="arch-g3" fontFamily="ui-monospace, monospace">
        {/* Stamp */}
        <text x="20" y="40" fontSize="9.5" fill="var(--color-amber)" fillOpacity="0.7" letterSpacing="0.25em">SPEC NO. 01 — REVENUEOS</text>

        {/* Column headers */}
        <text x="20"  y="73" fontSize="8" fill="var(--color-amber)" fillOpacity="0.5" letterSpacing="0.25em">SCHEMA — 6 OF 37</text>
        <text x="200" y="73" fontSize="8" fill="var(--color-amber)" fillOpacity="0.5" letterSpacing="0.25em">θ TS-BANDIT</text>

        {/* Left column — table names + type hints */}
        <text x="20"  y="96"  fontSize="11" fill="var(--color-amber)" fillOpacity="0.75" letterSpacing="0.05em">Lead</text>
        <text x="170" y="96"  fontSize="11" fill="var(--color-amber)" fillOpacity="0.45" textAnchor="end" letterSpacing="0.05em">.csv</text>

        <text x="20"  y="116" fontSize="11" fill="var(--color-amber)" fillOpacity="0.75" letterSpacing="0.05em">FeatureStore</text>
        <text x="170" y="116" fontSize="11" fill="var(--color-amber)" fillOpacity="0.45" textAnchor="end" letterSpacing="0.05em">300+</text>

        <text x="20"  y="136" fontSize="11" fill="var(--color-amber)" fillOpacity="0.75" letterSpacing="0.05em">MLModel</text>
        <text x="170" y="136" fontSize="11" fill="var(--color-amber)" fillOpacity="0.45" textAnchor="end" letterSpacing="0.05em">v34</text>

        <text x="20"  y="156" fontSize="11" fill="var(--color-amber)" fillOpacity="0.75" letterSpacing="0.05em">AIGeneration</text>
        <text x="170" y="156" fontSize="11" fill="var(--color-amber)" fillOpacity="0.45" textAnchor="end" letterSpacing="0.05em">gpt-5.5</text>

        <text x="20"  y="176" fontSize="11" fill="var(--color-amber)" fillOpacity="0.75" letterSpacing="0.05em">Email</text>
        <text x="170" y="176" fontSize="11" fill="var(--color-amber)" fillOpacity="0.45" textAnchor="end" letterSpacing="0.05em">→</text>

        <text x="20"  y="196" fontSize="11" fill="var(--color-amber)" fillOpacity="0.75" letterSpacing="0.05em">FeedbackLoop</text>
        <text x="170" y="196" fontSize="11" fill="var(--color-amber)" fillOpacity="0.45" textAnchor="end" letterSpacing="0.05em">∞</text>

        {/* Right column — bandit parameters */}
        <text x="200" y="96"  fontSize="11" fill="var(--color-amber)" fillOpacity="0.75" letterSpacing="0.05em">α prior</text>
        <text x="340" y="96"  fontSize="11" fill="var(--color-amber)" fillOpacity="0.45" textAnchor="end" letterSpacing="0.05em">Beta(1,1)</text>

        <text x="200" y="116" fontSize="11" fill="var(--color-amber)" fillOpacity="0.75" letterSpacing="0.05em">arms</text>
        <text x="340" y="116" fontSize="11" fill="var(--color-amber)" fillOpacity="0.45" textAnchor="end" letterSpacing="0.05em">k=10</text>

        <text x="200" y="136" fontSize="11" fill="var(--color-amber)" fillOpacity="0.75" letterSpacing="0.05em">features</text>
        <text x="340" y="136" fontSize="11" fill="var(--color-amber)" fillOpacity="0.45" textAnchor="end" letterSpacing="0.05em">300</text>

        <text x="200" y="156" fontSize="11" fill="var(--color-amber)" fillOpacity="0.75" letterSpacing="0.05em">canary</text>
        <text x="340" y="156" fontSize="11" fill="var(--color-amber)" fillOpacity="0.45" textAnchor="end" letterSpacing="0.05em">0.05</text>

        <text x="200" y="176" fontSize="11" fill="var(--color-amber)" fillOpacity="0.75" letterSpacing="0.05em">test cov</text>
        <text x="340" y="176" fontSize="11" fill="var(--color-amber)" fillOpacity="0.45" textAnchor="end" letterSpacing="0.05em">5,300+</text>

        <text x="200" y="196" fontSize="11" fill="var(--color-amber)" fillOpacity="0.75" letterSpacing="0.05em">CRMs</text>
        <text x="340" y="196" fontSize="11" fill="var(--color-amber)" fillOpacity="0.45" textAnchor="end" letterSpacing="0.05em">15+</text>

        {/* Bottom legend */}
        <text x="20" y="245" fontSize="8" fill="var(--color-amber)" fillOpacity="0.5" letterSpacing="0.25em">LEARNS · LOOPS · SHIPS</text>
      </g>
    </svg>
  );
}

export function DiagramFullStack() {
  return (
    <svg
      className="case-card-diagram"
      viewBox="0 0 360 280"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden="true"
    >
      {/* arch-g1 — primary structure: ticks, stamp underline, checkboxes */}
      <g className="arch-g1">
        {/* Tape-measure ticks across top */}
        <line x1="20" y1="18" x2="340" y2="18" stroke="var(--color-amber)" strokeOpacity="0.5" strokeWidth="0.5" pathLength={1} />
        <line x1="20"  y1="18" x2="20"  y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="52"  y1="18" x2="52"  y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="84"  y1="18" x2="84"  y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="116" y1="18" x2="116" y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="148" y1="18" x2="148" y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="180" y1="18" x2="180" y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="212" y1="18" x2="212" y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="244" y1="18" x2="244" y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="276" y1="18" x2="276" y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="308" y1="18" x2="308" y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="340" y1="18" x2="340" y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        {/* Stamp underline */}
        <line x1="20" y1="44" x2="124" y2="44" stroke="var(--color-amber)" strokeOpacity="0.5" strokeWidth="0.4" pathLength={1} />
        {/* Stage checkboxes + checkmarks */}
        <rect x="24" y="92"  width="9" height="9" fill="none" stroke="var(--color-amber)" strokeOpacity="0.7" strokeWidth="0.6" pathLength={1} />
        <path d="M 26 97 L 29 100 L 32 94"   fill="none" stroke="var(--color-amber)" strokeOpacity="0.85" strokeWidth="0.6" pathLength={1} />
        <rect x="24" y="111" width="9" height="9" fill="none" stroke="var(--color-amber)" strokeOpacity="0.7" strokeWidth="0.6" pathLength={1} />
        <path d="M 26 116 L 29 119 L 32 113" fill="none" stroke="var(--color-amber)" strokeOpacity="0.85" strokeWidth="0.6" pathLength={1} />
        <rect x="24" y="130" width="9" height="9" fill="none" stroke="var(--color-amber)" strokeOpacity="0.7" strokeWidth="0.6" pathLength={1} />
        <path d="M 26 135 L 29 138 L 32 132" fill="none" stroke="var(--color-amber)" strokeOpacity="0.85" strokeWidth="0.6" pathLength={1} />
        <rect x="24" y="159" width="9" height="9" fill="none" stroke="var(--color-amber)" strokeOpacity="0.7" strokeWidth="0.6" pathLength={1} />
        <path d="M 26 164 L 29 167 L 32 161" fill="none" stroke="var(--color-amber)" strokeOpacity="0.85" strokeWidth="0.6" pathLength={1} />
        <rect x="24" y="178" width="9" height="9" fill="none" stroke="var(--color-amber)" strokeOpacity="0.7" strokeWidth="0.6" pathLength={1} />
        <path d="M 26 183 L 29 186 L 32 180" fill="none" stroke="var(--color-amber)" strokeOpacity="0.85" strokeWidth="0.6" pathLength={1} />
        <rect x="24" y="197" width="9" height="9" fill="none" stroke="var(--color-amber)" strokeOpacity="0.7" strokeWidth="0.6" pathLength={1} />
        <path d="M 26 202 L 29 205 L 32 199" fill="none" stroke="var(--color-amber)" strokeOpacity="0.85" strokeWidth="0.6" pathLength={1} />
        <rect x="24" y="216" width="9" height="9" fill="none" stroke="var(--color-amber)" strokeOpacity="0.7" strokeWidth="0.6" pathLength={1} />
        <path d="M 26 221 L 29 224 L 32 218" fill="none" stroke="var(--color-amber)" strokeOpacity="0.85" strokeWidth="0.6" pathLength={1} />
      </g>

      {/* arch-g2 — secondary detail: registration crosshair, row separators, corner marks */}
      <g className="arch-g2">
        {/* Top-right registration crosshair */}
        <Crosshair cx={328} cy={38} />
        {/* Row separators between stages */}
        <LedgerRule y={106} x1={24} x2={336} />
        <LedgerRule y={125} x1={24} x2={336} />
        <LedgerRule y={154} x1={24} x2={336} />
        <LedgerRule y={173} x1={24} x2={336} />
        <LedgerRule y={192} x1={24} x2={336} />
        <LedgerRule y={211} x1={24} x2={336} />
        {/* Bottom corner registration marks */}
        <CornerMarks width={360} height={280} />
      </g>

      {/* arch-g3 — text labels (fade in last) */}
      <g className="arch-g3" fontFamily="ui-monospace, monospace">
        {/* Top stamp */}
        <text x="20" y="40" fontSize="9.5" fill="var(--color-amber)" fillOpacity="0.7" letterSpacing="0.25em">SPEC NO. 02 — JOB DOCKET</text>
        {/* Section header */}
        <text x="20" y="73" fontSize="8" fill="var(--color-amber)" fillOpacity="0.5" letterSpacing="0.25em">ORDER NO. 0027 — STATUS · COMPLETE</text>
        {/* Stage 01 — FRONTEND */}
        <text x="42"  y="100" fontSize="7.5" fill="var(--color-amber)" fillOpacity="0.7"  letterSpacing="0.15em">01 · FRONTEND</text>
        <text x="156" y="100" fontSize="7"   fill="var(--color-amber)" fillOpacity="0.5"  letterSpacing="0.1em">NEXT.JS / TS</text>
        <text x="336" y="100" fontSize="7"   fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.2em" textAnchor="end">✓ SHIPPED</text>
        {/* Stage 02 — API LAYER */}
        <text x="42"  y="119" fontSize="7.5" fill="var(--color-amber)" fillOpacity="0.7"  letterSpacing="0.15em">02 · API LAYER</text>
        <text x="156" y="119" fontSize="7"   fill="var(--color-amber)" fillOpacity="0.5"  letterSpacing="0.1em">EXPRESS · RATE LIMIT</text>
        <text x="336" y="119" fontSize="7"   fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.2em" textAnchor="end">✓ SHIPPED</text>
        {/* Stage 03 — AI ENGINE — emphasized through brighter text only */}
        <text x="42"  y="138" fontSize="7.5" fill="var(--color-amber)" fillOpacity="0.9"  letterSpacing="0.15em">03 · AI ENGINE</text>
        <text x="156" y="138" fontSize="7"   fill="var(--color-amber)" fillOpacity="0.7"  letterSpacing="0.1em">GPT-5.4 MINI · 2 TOOLS</text>
        <text x="336" y="138" fontSize="7"   fill="var(--color-amber)" fillOpacity="0.7"  letterSpacing="0.2em" textAnchor="end">✓ SHIPPED</text>
        {/* AI sub-row */}
        <text x="42" y="148" fontSize="6" fill="var(--color-amber)" fillOpacity="0.48" letterSpacing="0.15em">↳ INFRA ANALYZER · PROPOSAL GEN</text>
        {/* Stage 04 — CMS */}
        <text x="42"  y="167" fontSize="7.5" fill="var(--color-amber)" fillOpacity="0.7"  letterSpacing="0.15em">04 · CMS</text>
        <text x="156" y="167" fontSize="7"   fill="var(--color-amber)" fillOpacity="0.5"  letterSpacing="0.1em">STRAPI · HEADLESS</text>
        <text x="336" y="167" fontSize="7"   fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.2em" textAnchor="end">✓ SHIPPED</text>
        {/* Stage 05 — DATA */}
        <text x="42"  y="186" fontSize="7.5" fill="var(--color-amber)" fillOpacity="0.7"  letterSpacing="0.15em">05 · DATA</text>
        <text x="156" y="186" fontSize="7"   fill="var(--color-amber)" fillOpacity="0.5"  letterSpacing="0.1em">DASHBOARD · PIPELINE</text>
        <text x="336" y="186" fontSize="7"   fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.2em" textAnchor="end">✓ SHIPPED</text>
        {/* Stage 06 — DESIGN */}
        <text x="42"  y="205" fontSize="7.5" fill="var(--color-amber)" fillOpacity="0.7"  letterSpacing="0.15em">06 · DESIGN</text>
        <text x="156" y="205" fontSize="7"   fill="var(--color-amber)" fillOpacity="0.5"  letterSpacing="0.1em">5 PG · CUSTOM GRAPHICS</text>
        <text x="336" y="205" fontSize="7"   fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.2em" textAnchor="end">✓ SHIPPED</text>
        {/* Stage 07 — DEVOPS */}
        <text x="42"  y="224" fontSize="7.5" fill="var(--color-amber)" fillOpacity="0.7"  letterSpacing="0.15em">07 · DEVOPS</text>
        <text x="156" y="224" fontSize="7"   fill="var(--color-amber)" fillOpacity="0.5"  letterSpacing="0.1em">CI / CD · RENDER</text>
        <text x="336" y="224" fontSize="7"   fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.2em" textAnchor="end">✓ SHIPPED</text>
        {/* Bottom legend */}
        <text x="24"  y="245" fontSize="8" fill="var(--color-amber)" fillOpacity="0.5" letterSpacing="0.25em">EVERY LAYER · ONE PASS · SHIPPED</text>
        {/* Bottom-right state stamp */}
        <text x="340" y="245" fontSize="8" fill="var(--color-amber)" fillOpacity="0.5" letterSpacing="0.25em" textAnchor="end">PROD LOCKED</text>
      </g>
    </svg>
  );
}

export function DiagramGradingGrid() {
  return (
    <svg
      className="case-card-diagram"
      viewBox="0 0 360 280"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden="true"
    >
      {/* arch-g1 — primary structure: ticks, dividers, grid, header underline */}
      <g className="arch-g1">
        {/* Tape-measure ticks across top */}
        <line x1="20" y1="18" x2="340" y2="18" stroke="var(--color-amber)" strokeOpacity="0.5" strokeWidth="0.5" pathLength={1} />
        <line x1="20"  y1="18" x2="20"  y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="52"  y1="18" x2="52"  y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="84"  y1="18" x2="84"  y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="116" y1="18" x2="116" y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="148" y1="18" x2="148" y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="180" y1="18" x2="180" y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="212" y1="18" x2="212" y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="244" y1="18" x2="244" y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="276" y1="18" x2="276" y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="308" y1="18" x2="308" y2="22" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        <line x1="340" y1="18" x2="340" y2="24" stroke="var(--color-amber)" strokeOpacity="0.4" strokeWidth="0.5" pathLength={1} />
        {/* Section dividers and stamp underline */}
        <line x1="20" y1="60"  x2="340" y2="60"  stroke="var(--color-amber)" strokeOpacity="0.25" strokeWidth="0.4" pathLength={1} />
        <line x1="20" y1="44"  x2="120" y2="44"  stroke="var(--color-amber)" strokeOpacity="0.5"  strokeWidth="0.4" pathLength={1} />
        {/* Grid header underline / top edge */}
        <line x1="76" y1="94"  x2="316" y2="94"  stroke="var(--color-amber)" strokeOpacity="0.4"  strokeWidth="0.5" pathLength={1} />
        {/* Grid — vertical lines (M and L dividers heavier — sample range) */}
        <line x1="76"  y1="94" x2="76"  y2="206" stroke="var(--color-amber)" strokeOpacity="0.3"  strokeWidth="0.5" pathLength={1} />
        <line x1="124" y1="94" x2="124" y2="206" stroke="var(--color-amber)" strokeOpacity="0.55" strokeWidth="0.7" pathLength={1} />
        <line x1="172" y1="94" x2="172" y2="206" stroke="var(--color-amber)" strokeOpacity="0.55" strokeWidth="0.7" pathLength={1} />
        <line x1="220" y1="94" x2="220" y2="206" stroke="var(--color-amber)" strokeOpacity="0.3"  strokeWidth="0.5" pathLength={1} />
        <line x1="268" y1="94" x2="268" y2="206" stroke="var(--color-amber)" strokeOpacity="0.3"  strokeWidth="0.5" pathLength={1} />
        <line x1="316" y1="94" x2="316" y2="206" stroke="var(--color-amber)" strokeOpacity="0.3"  strokeWidth="0.5" pathLength={1} />
        {/* Grid — horizontal lines */}
        <line x1="76" y1="122" x2="316" y2="122" stroke="var(--color-amber)" strokeOpacity="0.3" strokeWidth="0.5" pathLength={1} />
        <line x1="76" y1="150" x2="316" y2="150" stroke="var(--color-amber)" strokeOpacity="0.3" strokeWidth="0.5" pathLength={1} />
        <line x1="76" y1="178" x2="316" y2="178" stroke="var(--color-amber)" strokeOpacity="0.3" strokeWidth="0.5" pathLength={1} />
        <line x1="76" y1="206" x2="316" y2="206" stroke="var(--color-amber)" strokeOpacity="0.3" strokeWidth="0.5" pathLength={1} />
      </g>

      {/* arch-g2 — secondary detail: registration marks, REV A strikethroughs, golden sample */}
      <g className="arch-g2">
        {/* Top-right registration crosshair */}
        <Crosshair cx={328} cy={38} />
        {/* REV A strikethroughs — S, XL, 2XL chest cells revised in REV B */}
        <line x1="92"  y1="104" x2="108" y2="104" stroke="var(--color-amber)" strokeOpacity="0.3" strokeWidth="0.4" pathLength={1} />
        <line x1="236" y1="104" x2="252" y2="104" stroke="var(--color-amber)" strokeOpacity="0.3" strokeWidth="0.4" pathLength={1} />
        <line x1="284" y1="104" x2="300" y2="104" stroke="var(--color-amber)" strokeOpacity="0.3" strokeWidth="0.4" pathLength={1} />
        {/* Golden sample crosshair — M column / CH row, the anchor of the diagram */}
        <Crosshair cx={148} cy={113} variant="anchor" />
        {/* Bottom corner registration marks */}
        <CornerMarks width={360} height={280} />
      </g>

      {/* arch-g3 — text labels (fade in last) */}
      <g className="arch-g3" fontFamily="ui-monospace, monospace">
        {/* Top stamp */}
        <text x="20" y="40" fontSize="9.5" fill="var(--color-amber)" fillOpacity="0.7" letterSpacing="0.25em">SPEC NO. 03 — REV B</text>
        {/* Section header */}
        <text x="20" y="73" fontSize="8" fill="var(--color-amber)" fillOpacity="0.5" letterSpacing="0.25em">GRADING — Δ FROM SAMPLE</text>
        {/* Size column headers */}
        <text x="100" y="89" fontSize="9" fill="var(--color-amber)" fillOpacity="0.7" letterSpacing="0.15em" textAnchor="middle">S</text>
        <text x="148" y="89" fontSize="9" fill="var(--color-amber)" fillOpacity="0.7" letterSpacing="0.15em" textAnchor="middle">M</text>
        <text x="196" y="89" fontSize="9" fill="var(--color-amber)" fillOpacity="0.7" letterSpacing="0.15em" textAnchor="middle">L</text>
        <text x="244" y="89" fontSize="9" fill="var(--color-amber)" fillOpacity="0.7" letterSpacing="0.15em" textAnchor="middle">XL</text>
        <text x="292" y="89" fontSize="9" fill="var(--color-amber)" fillOpacity="0.7" letterSpacing="0.15em" textAnchor="middle">2XL</text>
        {/* Row labels */}
        <text x="68" y="112" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.7" letterSpacing="0.15em" textAnchor="end">CH</text>
        <text x="68" y="140" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.7" letterSpacing="0.15em" textAnchor="end">WT</text>
        <text x="68" y="168" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.7" letterSpacing="0.15em" textAnchor="end">SL</text>
        <text x="68" y="196" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.7" letterSpacing="0.15em" textAnchor="end">LN</text>
        {/* REV A ghost values — chest row only, 3 of 5 cells revised */}
        <text x="100" y="106" fontSize="6.5" fill="var(--color-amber)" fillOpacity="0.25" letterSpacing="0.05em" fontStyle="italic" textAnchor="middle">-.5</text>
        <text x="244" y="106" fontSize="6.5" fill="var(--color-amber)" fillOpacity="0.25" letterSpacing="0.05em" fontStyle="italic" textAnchor="middle">+.4</text>
        <text x="292" y="106" fontSize="6.5" fill="var(--color-amber)" fillOpacity="0.25" letterSpacing="0.05em" fontStyle="italic" textAnchor="middle">+.6</text>
        {/* REV B chest row — current values */}
        <text x="20"  y="117" fontSize="6"   fill="var(--color-amber)" fillOpacity="0.45" letterSpacing="0.2em">REV B</text>
        <text x="100" y="117" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.65" letterSpacing="0.05em" textAnchor="middle">-.3</text>
        <text x="148" y="117" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.65" letterSpacing="0.05em" textAnchor="middle">.0</text>
        <text x="196" y="117" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.65" letterSpacing="0.05em" textAnchor="middle">+.1</text>
        <text x="244" y="117" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.65" letterSpacing="0.05em" textAnchor="middle">+.2</text>
        <text x="292" y="117" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.65" letterSpacing="0.05em" textAnchor="middle">+.3</text>
        {/* Waist row */}
        <text x="100" y="140" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">-.3</text>
        <text x="148" y="140" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">.0</text>
        <text x="196" y="140" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">+.1</text>
        <text x="244" y="140" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">+.2</text>
        <text x="292" y="140" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">+.3</text>
        {/* Sleeve row — asymmetric grading, flatter than chest */}
        <text x="100" y="168" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">-.2</text>
        <text x="148" y="168" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">.0</text>
        <text x="196" y="168" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">+.1</text>
        <text x="244" y="168" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">+.15</text>
        <text x="292" y="168" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">+.2</text>
        {/* Length row — flattest scaling */}
        <text x="100" y="196" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">-.1</text>
        <text x="148" y="196" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">.0</text>
        <text x="196" y="196" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">+.05</text>
        <text x="244" y="196" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">+.1</text>
        <text x="292" y="196" fontSize="8.5" fill="var(--color-amber)" fillOpacity="0.55" letterSpacing="0.05em" textAnchor="middle">+.15</text>
        {/* Bottom legend — process flow */}
        <text x="20"  y="245" fontSize="8" fill="var(--color-amber)" fillOpacity="0.5" letterSpacing="0.25em">SAMPLE → GRADE → LOCK</text>
        {/* Tolerance corner stamp */}
        <text x="340" y="245" fontSize="8" fill="var(--color-amber)" fillOpacity="0.5" letterSpacing="0.25em" textAnchor="end">TOL ±0.2</text>
      </g>
    </svg>
  );
}
