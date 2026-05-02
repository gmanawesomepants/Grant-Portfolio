# Evaluation: SERVICES
**Date:** 2026-03-30
**Verdict:** ITERATE
**Weighted Score:** 69/100

## Scores
| Criterion | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Design Quality | 7/10 | 3x | 21 |
| Originality | 7/10 | 3x | 21 |
| Craft | 7/10 | 2x | 14 |
| Functionality | 6.5/10 | 2x | 13 |

## Design Quality — 7/10

The typography hierarchy is correctly implemented and reads well. `.service-number` at Syne 1.2rem/600/amber/0.45 opacity (globals.css:942-948) creates quiet structural anchors exactly as specified. `.service-title` at Syne 1.25rem/600 (line 951-956) and `.service-body` at Outfit 0.95rem/400 with 1.75 line-height and 540px max-width (line 958-965) produce readable, well-proportioned text blocks.

The `.service-note` italic treatment (line 967-972) at 0.82rem in `--color-text-faint` is appropriately subordinate.

However, the section feels visually flat. Three text blocks in a grid with no top-border on the cards creates a "three paragraphs" feeling rather than "three pages from a house order book." The spec called for a 1px solid `--color-amber-trace` top border on each card (spec Success Criteria #2), which would have provided the stitch-like separation that anchors each card as a discrete unit. This is missing entirely from `.service-card` (line 882-886). The stitch-line (`service-number-wrap::before`, line 901-910) running between cards is an interesting substitute but uses `--color-amber-dim` (stronger than the spec's `--color-amber-trace`), and a dashed pattern instead of solid, which reads more "technical diagram" than "tailoring stitch."

The section heading "How I Work" with `.clip-reveal` is standard for this site. Nothing about the overall composition creates spatial tension or surprise. The 2rem inline margin-top on the grid (page.tsx:694) and 3rem grid gap produce even, predictable spacing.

## Originality — 7/10

**AI Slop Test results:**
1. "Would a human designer recognize deliberate creative choices here?" — The stitch-dot and dashed stitch-line connecting cards (lines 894-936) is a deliberate choice that a template wouldn't make. Passes.
2. Uniform card grids with rounded corners and drop shadows? — No backgrounds, no rounded corners, no rest-state shadows. Passes.
3. Generic hero? — N/A.
4. Default Tailwind spacing? — The spacing feels composed but unremarkable. The 3rem gap is reasonable but not distinctively chosen.
5. Could this appear on 1,000 other developer portfolios? — Strip the stitch-line, and yes. Three service cards with numbers, titles, and descriptions is a common consulting/freelance pattern. The tailoring language in the copy is the primary differentiator, but copy is not design.

The stitch-dot hover interaction (`.service-card:hover .stitch-dot`, line 932-936) — filling from outline to solid amber with a glow — is the one genuinely brand-specific micro-interaction. The mobile stitch-line rotation to vertical (globals.css:1926-1934) shows responsive awareness of the threading metaphor across breakpoints. These two details push the score from a 6 to a 7 — they're not template-derived, they're deliberate brand decisions.

What prevents an 8: structurally, this is still three numbered cards in a grid. The stitch system is decorative rather than structural. There's no spatial or compositional decision that makes this section immediately identifiable as "Systems Tailor" without reading the copy.

## Craft — 7/10

**Hover state:** The card hover at `translateY(-2px)` with 6% amber box-shadow (line 888-891) is restrained and appropriate. The stitch-dot fill animation on hover is the highlight — it goes from hollow amber circle to filled with glow, using the same `0.35s cubic-bezier(0.16, 1, 0.3, 1)` easing as the card lift. The number opacity shifts from 0.45 to 0.8 on hover (line 938-940). These three changes fire together and create a coherent hover moment.

**CTA:** The `.services-cta` (line 974-1018) is well-crafted. The `::after` thread-pull underline animating from `width: 0` to `width: 100%` on hover (line 990-1008) with a slightly slower 0.4s timing is a nice touch. Letter-spacing expanding from 0.12em to 0.16em on hover (line 1001-1004) is a subtle breathing effect. Focus-visible state (line 1010-1018) shows keyboard accessibility care. This CTA hover is significantly improved from a previous iteration (the prior eval noted it was just an opacity bump).

**Stagger:** The `80ms` delay increment between cards (globals.css:294-296) is fast enough to feel sequential without being sluggish. Standard but effective.

**What's missing:** No transition on the dashed stitch-line itself. No color shift on the line when a card is hovered. The stitch-dot "lights up" but the line connecting them doesn't respond — this is a missed opportunity where the threading metaphor could come alive through the connection animating, not just the endpoints.

## Functionality — 6.5/10

**Semantic HTML:** Uses `<article>` elements for cards (page.tsx:695, 712, 726) and `<h3>` for titles — correct nesting under the `<h2>` section heading. Good.

**Accessibility gaps:**
- The service cards have no `tabIndex` or `aria-label`, unlike the work section cards (page.tsx:562 has `tabIndex={0} aria-label="..."`). Since service cards have hover states with visual changes (dot fill, number brightening, lift), keyboard users should be able to trigger these states — but there's no focus target and no `.service-card:focus-visible` style. This is a gap.
- The CTA has proper `focus-visible` styling (line 1010-1018) with amber outline and underline. Good.

**Responsive:** Grid collapses to single column via `grid-template-columns: 1fr` at the breakpoint (line 1921-1923). The vertical stitch-line adaptation (line 1926-1934) repositions the dashed line from horizontal to vertical using `border-left` instead of `border-top`, running down through subsequent cards. Last card hides its line (line 1936-1938). This is smart responsive craft.

**Reduced motion:** The global `prefers-reduced-motion` block (line 1989-2011) disables transitions and resets `.fade-in` to visible state. Functional.

**Stacking context:** The `#services` element uses `.section-wrapper` which has `isolation: isolate` (line 161). The sharkskin texture `::before` pseudo (line 2189-2200) is correctly positioned with `z-index: -1`. Correct.

**Minor issues:**
- The stitch-line `right: -3rem` on `.service-number-wrap::before` (line 906) extends 3rem into the grid gap — works visually between adjacent cards but is a magic number.
- Mobile vertical line uses `height: calc(100% + 5rem)` (line 1931) which may misalign with varying content heights across different text lengths or font rendering.
- Inline `style={{ marginTop: "2rem" }}` on the grid container (page.tsx:694) should be in CSS for separation of concerns.

## Success Criteria Check

1. **Three service cards in responsive grid** — PASS. `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` (line 878), collapses to `1fr` on mobile (line 1922).
2. **Faint amber top-border (1px amber-trace)** — FAIL. No `border-top` on `.service-card`. The stitch-line is a creative substitute but does not match the spec's intent of a per-card border.
3. **Numbers amber at 0.45 opacity, 1.2rem Syne** — PASS. Exactly as specified (lines 942-948).
4. **Card hover: -2px lift + amber glow** — PASS. Exactly as specified (lines 888-891).
5. **Stagger animation fires in sequence** — PASS. `.stagger > .fade-in:nth-child(n)` with 80ms increments (lines 294-296).
6. **Service note italic, faint text** — PASS. `.service-note` at italic, `--color-text-faint` (lines 967-972).
7. **Body text max-width 540px** — PASS. (line 964).
8. **Sharkskin fabric texture** — PASS. `#services::before` with diagonal cross-hatch SVG (lines 2189-2200).
9. **Clip-reveal on heading** — PASS. `<h2 className="section-heading clip-reveal">` (page.tsx:692).
10. **Tailoring language natural** — PASS. "measurement", "pattern cut", "cut from your requirements", "stitched into", "the fit is right", "alterations", "first wear" all present.
11. **CTA "Request a Fitting" below grid** — PASS. (page.tsx:740), amber text, no button chrome, links to #contact.
12. **Thread system FIT alignment** — NOT VERIFIED (requires runtime scroll testing).
13. **No GSAP dependency** — PASS. All animations are CSS transitions + IntersectionObserver.

## Top Issues to Fix

1. **Design Quality: Add card top-borders per spec.** Each `.service-card` should have `border-top: 1px solid var(--color-amber-trace)` (globals.css:882). This is the missing stitch-line that separates "three paragraphs" from "three order book pages." The existing dashed stitch-line connecting cards can coexist with per-card borders — the border marks the beginning of each card as a discrete unit, the stitch-line threads them together. Together they complete the tailoring metaphor.

2. **Functionality: Add keyboard focus states to service cards.** Cards have hover interactions (lift, dot fill, number brightening) but no `tabIndex={0}`, no `aria-label`, and no `:focus-visible` style. Add `tabIndex={0}` with descriptive `aria-label` attributes in page.tsx, and add `.service-card:focus-visible` styles mirroring the hover state in globals.css.

3. **Craft: Animate the stitch-line on card hover.** When a card is hovered and the stitch-dot fills with amber, the connecting dashed line should also respond — either increasing in opacity, shifting to amber tint, or transitioning from dashed to solid. Currently the dot lights up but the line is inert, breaking the metaphor of a connected thread. Add something like `.service-card:hover .service-number-wrap::before { border-color: var(--color-amber); opacity: 0.5; transition: border-color 0.35s ease; }`.

## What's Working Well

No individual criterion scored 8 or above, which triggers the ITERATE gate regardless of total. The closest details to 8-level work:

- **CTA hover interaction** (globals.css:974-1018): The thread-pull underline + letter-spacing expansion is the standout micro-interaction in this section. Memorable, on-brand, and well-timed with the slightly slower 0.4s draw.
- **Stitch-dot hover** (globals.css:917-936): Hollow-to-filled with glow is distinctly tailoring-themed. A template would never produce this detail.
- **Mobile stitch-line rotation** (globals.css:1926-1938): Thoughtful responsive adaptation that maintains the connecting-thread metaphor in vertical layout.
- **Typography execution**: Every text element matches the spec's font, size, weight, and color precisely. No shortcuts.
- **Copy quality**: The tailoring metaphors in service descriptions are natural and unforced. These should not be touched.
