/* ============================================================
   Atelier Icon Kit — paths.ts
   Phase 0 final, ready for Phase 1 migration.

   Stroke width: 0.85 (calibrated against marks-kit primitives)
   ViewBox: 0 0 22 22 (all icons)
   Stroke: currentColor (theme-inherited via parent `color` property)
   ============================================================ */

export const ICON_PATHS = {
  // ─── Atelier marks ────────────────────────────────────────
  // The tailor half — placed on phase tags + thread junctions

  // Tape measure — MEASURE phase
  // Horizontal rail with major ticks (every 4 units) and minor ticks
  tape:    "M 3 11 L 19 11 M 3 9.5 L 3 12.5 M 19 9.5 L 19 12.5 M 7 9.5 L 7 12.5 M 11 9.5 L 11 12.5 M 15 9.5 L 15 12.5 M 9 10.5 L 9 11.5 M 13 10.5 L 13 11.5",

  // Shears — CUT phase (Phase 0 V5 locked)
  // Two finger-loops + crossed V-blades meeting at pivot
  // Path = blade Vs only; loops + pivot dot rendered as supplemental shapes
  shears:  "M 7.4 6 L 11 11 L 5 19 M 14.6 6 L 11 11 L 17 19",

  // Needle — FIT phase
  // Slim body, wider than original candidate for cleaner 12px silhouette
  // Path = needle body silhouette; eye rendered as supplemental hollow circle
  needle:  "M 11 3 L 13 11 L 11 19 L 9 11 Z",

  // Bobbin — DELIVER phase
  // Spool flanges + walls + thread crossings
  bobbin:  "M 5 7 L 17 7 M 5 15 L 17 15 M 5 7 L 5 15 M 17 7 L 17 15 M 8 7 L 8 15 M 14 7 L 14 15 M 8 11 L 14 9 M 8 11 L 14 13",

  // ─── System marks ─────────────────────────────────────────
  // The systems half — placed on work-card categories only

  // Node — AI Orchestration (dasharray "1.5 2.5" stitched edges)
  // Stitched triangle. Stitch lines stop 2px short of each pin node.
  // Pin-mark nodes rendered as supplemental filled circles.
  node:    "M 11 7 L 5 15 M 11 7 L 17 15 M 7 17 L 15 17",

  // Grid — Full-Stack (draftsman grid, horizontal corner ticks)
  // 2×2 grid with small tick marks at outer corners (drafting-paper vocabulary)
  grid:    "M 4 4 L 18 4 L 18 18 L 4 18 Z M 11 4 L 11 18 M 4 11 L 18 11 M 3 4 L 5 4 M 17 4 L 19 4 M 3 18 L 5 18 M 17 18 L 19 18",

  // Grading — AI Systems (renamed from `target`, Phase 0 V3 locked)
  // 3-row spec sheet with filled middle row = master grade among size variants
  // Path = box + dividers; filled middle row rendered as supplemental rect.
  grading: "M 5 4 L 17 4 L 17 18 L 5 18 Z M 5 9 L 17 9 M 5 14 L 17 14",
} as const;

export type IconName = keyof typeof ICON_PATHS;

/**
 * Build an SVG element's innerHTML string for a given icon name.
 * Used by vanilla-JS contexts (e.g. thread.ts) where React rendering isn't available.
 *
 * Returns a safe HTML string of <path> + supplemental shapes. No user input —
 * all values are compile-time constants — so XSS-safe by construction.
 *
 * IMPORTANT: This function and AtelierIcon.tsx must stay in sync.
 * When updating supplemental shapes (circles, rects, etc.), update both.
 */
export function buildIconSVGInnerHTML(name: IconName): string {
  const sw = 0.85;
  const sharedAttrs = `stroke="currentColor" fill="none" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  const path = `<path d="${ICON_PATHS[name]}" />`;

  switch (name) {
    case 'shears':
      // V5 locked: two finger-loop rings both at top (y=5), center pivot dot
      return `${path}
        <circle cx="5" cy="5" r="2.4" ${sharedAttrs} />
        <circle cx="17" cy="5" r="2.4" ${sharedAttrs} />
        <circle cx="11" cy="11" r="0.7" fill="currentColor" stroke="none" />`;

    case 'needle':
      // Eye uses stroke-only inner circle — works on any background
      return `${path}
        <circle cx="11" cy="6.5" r="1.2" stroke="currentColor" fill="none" stroke-width="${sw}" />`;

    case 'node':
      // Stitched dashed edges + pin-mark nodes (filled circles, not stroked rings)
      // Override path's stroke-dasharray to render edges as basting stitches
      return `<path d="${ICON_PATHS[name]}" stroke="currentColor" fill="none" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1.5 2.5" />
        <circle cx="11" cy="5" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="5" cy="17" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="17" cy="17" r="1.4" fill="currentColor" stroke="none" />`;

    case 'grading':
      // Phase 0 V3: filled middle row inside the 3-row spec sheet
      return `${path}
        <rect x="5" y="9" width="12" height="5" fill="currentColor" stroke="none" />`;

    default:
      // tape, bobbin, grid render with just the path
      return path;
  }
}
