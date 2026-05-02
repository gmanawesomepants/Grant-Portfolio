# Evaluation: SUIT SPEC SHEET
**Date:** 2026-03-29
**Verdict:** PASS
**Weighted Score:** 79/100

## Scores
| Criterion | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Design Quality | 8/10 | 3x | 24 |
| Originality | 9/10 | 3x | 27 |
| Craft | 8/10 | 2x | 16 |
| Functionality | 6/10 | 2x | 12 |

---

## Design Quality — 8/10

The decision to render technical credentials as a bespoke jacket technical drawing is a genuine creative position — one that no template would ever produce. The visual grammar is disciplined: pure linework at `stroke-opacity: 0.22` (`suitBlueprint.ts:147`) is dim enough to read as a schematic rather than an illustration, avoiding the trap of over-rendering. The asymmetric stroke weights — body outline at `stroke-width: 1.5` vs callout lines at `stroke-width: 1` vs inner lapels at `stroke-width: 1.0` — create the kind of technical drawing hierarchy that a human drafter would use. The cuff lines at `stroke-opacity: 0.5` (`suitBlueprint.ts:268`) and inner buttons at `stroke-opacity: 0.35` demonstrate deliberate depth layering.

The garment tag (`globals.css:365`) is exactly right: Outfit 0.68rem, weight 500, tracked uppercase, amber trace background — matches the brand scale precisely. `REVENUEOS · PATTERN I/III` is a strong label; it reads as authentic tailor's notation rather than developer-speak.

What holds this from a 9: the section's centered layout (`globals.css:1024`) means the SVG sits in a conventional centered container. The callout labels extend to the SVG margin edges, which is correct, but the overall page composition is functionally centered content over a dark background — the section doesn't break the layout grid the way the spec's ambition suggests it should. The windowpane texture (`globals.css:2042`) is properly implemented with the intended asymmetry (vertical lines at `0.025`, horizontal at `0.012`), but on a dark background with a near-invisible SVG, it operates at the edge of perceptibility — which is the right call, but means the section's atmospheric layer contributes minimally to its visual weight.

---

## Originality — 9/10

This section would fail the AI Slop Test on every point that matters:

1. "Would a human designer recognize deliberate creative choices?" — Yes. A dinner jacket SVG as a system architecture diagram is not a pattern that emerges from prompting an AI with "make a portfolio section."
2. No rounded card grids. No drop shadows. No icon arrays. The anti-patterns from the spec (`suit-spec.md:81-91`) are all successfully avoided.
3. The callout system — anchor dot → extending line → endpoint dot → text label, revealing sequentially on scroll — maps directly to how technical illustrators annotate garment patterns. This is not a portfolio convention.
4. The `REVENUEOS · PATTERN I/III` label treats a software product as garment pattern notation. That's the kind of thematic commitment that makes a site memorable.
5. The closer text "Solo build. Currently in production." in italic amber (`globals.css:1035`) reads like a quality mark stamped on the lining — economical, confident, on-brand.

The one element that slightly dilutes the originality score: the mobile fallback (`globals.css:1091`) is a conventional amber-border list. Correct and functional, but generic. It's the right call for mobile UX — the spec demands it — but a visitor on mobile sees nothing that distinguishes this from any other credential list.

---

## Craft — 8/10

Several genuinely careful details:

**Hover system gating** (`suitBlueprint.ts:441-458`): the `progress >= 0.98` check before activating `blueprint-hover-active` class is exactly right — hover interactions are disabled during scroll animation, preventing accidental triggers. This is a subtle but important UX decision that most implementations would skip.

**Hover dimming via CSS filter** (`suitBlueprint.ts:392-394`): using `filter: opacity(0.3)` rather than modifying GSAP-managed opacity properties avoids animation conflicts. The comment "avoids conflicting with GSAP's inline opacity" (`suitBlueprint.ts:392`) shows the builder understood the problem and solved it correctly.

**Sequential callout reveal timing** (`suitBlueprint.ts:504-533`): each callout at `t = 2.2 + i * 0.9` with anchor dot (0.15s) → line extension (0.5s, `power2.out`) → endpoint dot + label (0.25s, 0.2s offset) is choreographed with real attention to pacing. The `power2.out` on line extension — making it start fast and decelerate — mimics how a drafter's pen would move.

**Detail group hierarchy**: pockets at `stroke-width: 1`, cuffs at `stroke-width: 0.9` and `stroke-opacity: 0.5`, inner button circles at `stroke-width: 0.6` and `stroke-opacity: 0.35` — three distinct layers of detail refinement in what could have been a single `stroke-width: 1` group.

**`scrub: 0.5`** gives the scroll-driven animation slight momentum — not instant, not laggy. The choice over `scrub: true` (which would be instant/mechanical) shows awareness of what makes scroll animation feel physical.

What prevents a 9: the callout labels use `white-space: nowrap` (`globals.css:1050`) which is correct, but there's no explicit overflow-guard or responsive check for narrower desktop viewports where long labels like "Thompson Sampling ML Engine" could clip against the SVG. The transition on `.callout-label` is `filter 0.3s ease, color 0.3s ease` (`globals.css:1052`) — correct for hover — but all-ease timing is the default; a custom cubic-bezier here would push this toward 9 territory.

---

## Functionality — 6/10

**What works:** The `initBlueprint` / `cleanupBlueprint` export pattern (`suitBlueprint.ts:101, 550`) is clean. Cleanup kills all ScrollTrigger instances from the `triggers` array and nulls the timeline. The `window.innerWidth <= 768` guard (`suitBlueprint.ts:103`) prevents GSAP from running on mobile. The `prefers-reduced-motion` check in `page.tsx:493` prevents the animation from running for users who have requested it — this is correct and important.

**Issues:**

1. **No `role` or `aria-label` on the SVG** (`suitBlueprint.ts:116-121`). The SVG is injected programmatically with no accessible name. Screen readers will encounter a nameless SVG. The spec's success criteria don't mention ARIA, but a functional score must account for real users.

2. **Mobile fallback missing "Kubernetes Deployment"** (`page.tsx:658-673`). The CALLOUTS array in `suitBlueprint.ts` defines 8 specs; the mobile fallback JSX lists only 7. "Kubernetes Deployment" is absent. This is a content parity failure — mobile visitors see an incomplete spec.

3. **`hitarea` pointer-events set to `none` by default** (`suitBlueprint.ts:302-303`) but then later toggled to `auto` via `onUpdate`. However the `hitarea.addEventListener` calls (`suitBlueprint.ts:428-430`) attach `mouseenter`/`mouseleave` to the SVG circle element — this is fine in principle but SVG circles with `pointer-events: none` will not fire mouse events. The hover activation only works when `container.classList.contains("blueprint-hover-active")` is true, at which point `hitarea.style.pointerEvents = "auto"` is set. This logic is correct, but the guard in `highlightCallout` checks for the class (`suitBlueprint.ts:385`) — not the individual element's pointer-events. If the class is set but the element's inline style hasn't propagated, events could fire prematurely. This is a low-probability edge case but not zero.

4. **No `font-display` or explicit handling for label rendering** before GSAP sets opacity. Labels start at `opacity: 0` via inline style (`suitBlueprint.ts:342`) — no FOUC risk here, but the Syne font must be loaded before labels are legible. Since next/font handles this globally, it's fine in practice, but there's no explicit dependency.

5. **`npm run build` compliance**: cannot verify from static analysis, but no TypeScript errors are visible in the code read.

---

## Success Criteria Check

1. **Jacket SVG draws completely before callouts appear** — PASS. Body outline draws from `t=0` to `t=1.4`; callouts begin at `t=2.2`. Gap of 0.8 units ensures outline is complete before callouts start.

2. **All 8 callout lines extend from correct anatomical points** — PASS. The CALLOUTS array (`suitBlueprint.ts:91-99`) matches the spec table exactly: anchor points, end points, and side assignments align.

3. **Hover dims all others, brightens active — only at ≥98% progress** — PASS. The `progress >= 0.98` gate (`suitBlueprint.ts:443`) and `blueprint-hover-active` class guard (`suitBlueprint.ts:385`) implement this correctly.

4. **Closer text invisible until final phase** — PASS. `.suit-spec-closer` has `opacity: 0` in CSS (`globals.css:1039`) and GSAP animates it to 1 at `t=9.2` (`suitBlueprint.ts:539`).

5. **Mobile: SVG hidden, fallback visible** — PARTIAL PASS. SVG is `display: none` on mobile via `globals.css:1080`. Fallback is shown (`globals.css:1083`). However the fallback list is missing "Kubernetes Deployment" — content is incomplete.

6. **Section pins during scroll, unpins cleanly** — PASS by code inspection. `pin: true` with `end: "+=400%"` is the standard correct ScrollTrigger pinning pattern. The `scrub: 0.5` prevents hard snapping.

7. **Windowpane texture visible but subordinate to SVG linework** — PASS. Asymmetric opacity values (`0.025` vertical, `0.012` horizontal) at `globals.css:2057-2065` ensure texture is subliminal.

8. **`npm run build` passes** — ASSUMED PASS (cannot run from this context).

9. **Garment tag reads `REVENUEOS · PATTERN I/III`, heading reads `System Blueprint`** — PASS. Confirmed at `page.tsx:649-650`.

10. **`cleanupBlueprint()` kills all ScrollTrigger instances, clears container** — PASS. `suitBlueprint.ts:550-563` kills the timeline, iterates and kills all triggers, clears `container.innerHTML`, and removes `blueprint-hover-active` class.

---

## Top Issues to Fix

1. **Functionality — Missing "Kubernetes Deployment" from mobile fallback** (`page.tsx:659-672`). The mobile spec list has 7 items; the desktop SVG has 8. Add "Kubernetes Deployment" to the mobile fallback array. This is a content parity failure affecting all mobile visitors.

2. **Functionality — No accessible name on the injected SVG** (`suitBlueprint.ts:116`). Add `svg.setAttribute("role", "img")` and `svg.setAttribute("aria-label", "System blueprint: dinner jacket schematic annotated with RevenueOS technical specifications")` immediately after the SVG element is created. The callout labels are invisible to screen readers as-is.

3. **Craft — Callout label overflow risk at narrow desktop widths** (`globals.css:1043-1053`). "Thompson Sampling ML Engine" is the longest label on the left side. At viewports near 769px (just above the mobile cutoff), it may overlap the jacket SVG. Add `max-width: 38%` or a responsive clamp to `.callout-label` to guard against collision without breaking the wider layout.

---

## What's Working Well

**Originality (9/10):** The dinner jacket as system architecture diagram is the most conceptually distinctive element on the site. The callout annotation pattern maps 1:1 to how tailors annotate technical specification sheets. No template could produce this.

**Design Quality (8/10):** The multi-weight stroke hierarchy across body, lapels, inner lapels, pockets, cuffs, and buttons creates a depth of detail that rewards close inspection. The garment tag implementation (`globals.css:365-376`) is precise — the 0.2em tracking, amber trace background, and amber-dim borders are all correct spec-brand matches.

**Craft (8/10):** The hover gating at `progress >= 0.98`, the CSS filter approach for dimming, the `power2.out` easing on callout line extension, and the `scrub: 0.5` choice all demonstrate that the implementation was thought through rather than defaulted. These should not be touched in iteration.
