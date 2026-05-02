# THE SYSTEMS TAILOR — grantmahn.com

## Identity

This is a portfolio site for Grant Mahn — self-taught software engineer, former tailor, AI systems builder. The brand metaphor is TAILORING = SOFTWARE ENGINEERING. Every visual element, interaction, and piece of vocabulary is drawn from high-end bespoke tailoring — Savile Row, measurement, precision, cutting, fitting, thread, fabric. This tailoring language is applied to AI systems architecture.

**The theme is FELT before it's understood.** A visitor experiences the visual language for 30+ seconds before they consciously realize it's tailoring-themed. Then they read "Former tailor. Same discipline, different material." in the about section and the entire site recontextualizes. That's the reveal.

**References:** Dior / Saint Laurent / Tom Ford web presence (luxury restraint), Linear.app / Vercel (clean tech, ambient effects), latimer.me (total thematic commitment — every pixel serves one identity).

---

## Stack

- **Framework:** Next.js 16.1, React 19, TypeScript
- **Styling:** Tailwind CSS v4 (CSS-first config, `@theme` block for tokens)
- **Animation:** GSAP 3.14 + ScrollTrigger (thread, suit blueprint, stitch counter, services unfold ONLY). All other animations are CSS transitions + IntersectionObserver.
- **Fonts:** Syne (headings, 400-800) + Outfit (body, 300-600) via next/font/google
- **Email:** Mailgun via native fetch + FormData (not SDK)
- **Deploy:** Vercel

**NO Inter, Roboto, Arial, Space Grotesk, Poppins, or system fonts. Ever.**

---

## Color System

```
--color-bg:           #080808    (near-black — dark workshop, late at night)
--color-elevated:     #111111    (elevated surfaces)
--color-amber:        #C4943D    (warm gold — thread, brass, gold stitching)
--color-amber-light:  #D4A96A    (closers, highlights)
--color-amber-glow:   #C4943D50  (hover glows)
--color-amber-dim:    #C4943D15  (subtle borders)
--color-amber-trace:  #C4943D08  (barely-visible lines)
--color-text:         #ECECEC    (chalk on dark fabric)
--color-text-muted:   #ECECEC90
--color-text-faint:   #ECECEC45
--color-divider:      #ECECEC12
```

Amber = the thread, the brass of a measuring tape, the gold stitching on a bespoke lining. Used SPARINGLY — like hand-stitching on a suit. Everywhere else: monochrome.

---

## Typography Scale

| Element | Font | Size | Weight | Extra |
|---------|------|------|--------|-------|
| Hero name | Syne | clamp(3.2rem, 8vw, 6.5rem) | 800 | line-height 1.05, letter-spacing -0.04em |
| Role "SYSTEMS TAILOR" | Outfit | 0.75rem | 500 | letter-spacing 0.25em, uppercase, amber |
| Section headings | Syne | clamp(1.8rem, 3.5vw, 2.5rem) | 700 | |
| Contact heading | Syne | clamp(2rem, 4vw, 3rem) | 700 | |
| Card titles | Syne | 1.4rem | 600 | |
| Body | Outfit | 0.95rem | 400 | line-height 1.7 |
| Section labels | Outfit | 0.68rem | 500 | garment tag style |
| Metrics | Outfit | 0.78rem | 400 | line-height 2 |
| Nav | Outfit | 0.78rem | 500 | uppercase, 0.07em spacing |

---

## Page Structure (Scroll Order)

```
1. HERO              — full viewport, particles, breathing gradient, name, role, tagline, CTA, clock
2. WORK              — "The Pattern Book", three case study cards
3. SUIT SPEC SHEET   — standalone SVG blueprint, draws on scroll
4. TICKER            — full-width scrolling credential tape
5. SERVICES          — unfolding pattern piece, scroll-driven reveal
6. ABOUT             — text + photo, THE REVEAL ("Former tailor. Same discipline, different material.")
7. FITTING ROOM      — AI-powered interactive form
8. CONTACT           — "Request a Fitting" intake form with Mailgun
9. FOOTER            — links, colophon ("0 templates. 0 plugins. Handbuilt.")
```

---

## Per-Section Fabric Texture Backgrounds

Every section has a unique suiting pattern at 0.025 opacity via CSS ::before pseudo-elements. These are subliminal — felt but not consciously seen.

| Section | Pattern | Implementation |
|---------|---------|---------------|
| Hero | Pinstripes | repeating-linear-gradient, vertical |
| Pattern Book | Houndstooth | SVG data URI |
| Suit Blueprint | Windowpane | repeating-linear-gradient, grid |
| Ticker | SKIP | too narrow |
| Services | Sharkskin | micro diagonal cross-hatch |
| About | Herringbone | SVG data URI, V-shaped |
| Fitting Room | Bird's eye | SVG data URI, diamond dots |
| Contact | Glen plaid | overlapping checks at two scales |
| Footer | Twill | repeating-linear-gradient, 45deg diagonal |

All patterns use `position: absolute`, full-viewport width via `left: 50%; width: 100vw; transform: translateX(-50%)`, `pointer-events: none`, `z-index: -1`. Each section has `isolation: isolate` for stacking context.

---

## Signature Elements

### Thread System
- SVG path drawn with GSAP ScrollTrigger (stroke-dashoffset animation)
- Chapter labels appear at junction points: MEASURE, CUT, FIT, DELIVER
- Stitch counter increments on scroll
- Lives in `src/animations/thread.ts` with init/cleanup exports

### Suit Blueprint (Spec Sheet)
- Dinner jacket SVG with stroke-dashoffset draw-on-scroll
- Three GSAP animation groups: (1) jacket outline, (2) callout lines extending from specific points, (3) gold text labels mapping technical features to suit anatomy
- Lives in `src/animations/suitBlueprint.ts`
- Features mapped: Thompson Sampling ML Engine, 15+ CRM Integrations, Behavioral Clustering, etc.

### Contact Form — Order Ticket Layout
- Two-column: heading+subtext left, form right
- Numbered steps (01, 02, 03, 04) in faded amber
- Vertical stitch line with circular markers
- "FITTING REQUEST" header in tiny tracked-out uppercase
- GSAP stagger reveal on scroll
- Success state: "Received. I'll be in touch." with thread flourish

### Global Effects
- Film grain: fixed SVG noise, 2.5% opacity, pointer-events none
- Custom cursor: thin amber crosshair, ~20px, 1px lines, 60% opacity. Disabled on mobile.
- Cutting grid: CSS, 1.5% opacity, hero only
- Breathing gradient: 800px radial, amber ~5%, 8s animation
- Particle field: canvas, 40-55 amber dots, cursor-reactive, no connecting lines
- Ruler-mark dividers between sections

---

## File Structure

```
src/
  app/
    globals.css        — All styles, tokens, animations, fabric textures
    layout.tsx         — Root layout, fonts, SEO metadata
    page.tsx           — All sections, effects, cursor, clock
    api/
      contact/
        route.ts       — Mailgun API route
  animations/
    thread.ts          — Thread SVG + ScrollTrigger + junction labels
    suitBlueprint.ts   — Suit SVG drawing + callout animations
    servicesUnfold.ts  — Services panel unfold + ScrollTrigger pinning
    stitchCounter.ts   — Scroll-linked counter logic
public/
  portrait.jpg         — User photo
```

Three core files. Modular animation files. No over-abstraction.

---

## The AI Slop Test

Before completing ANY visual component, apply this test:

1. "Would a human designer recognize deliberate creative choices here?" — If no, FAIL.
2. Does it use uniform card grids with rounded corners and drop shadows? — FAIL.
3. Does it use a generic hero with centered text over a gradient? — FAIL.
4. Does it use default Tailwind spacing that doesn't relate to the brand grid? — FAIL.
5. Could this pattern appear on 1,000 other developer portfolios? — FAIL.
6. Does every element reinforce the tailoring metaphor? — If no, ask why it exists.

---

## DO NOT TOUCH (Global)

These elements are locked. Do not modify without explicit approval:

- The suit jacket SVG structure and its 3 animation groups
- The needle-and-thread "t" logo in Italianno script
- The Syne + Outfit font pairing
- The dark/amber color relationship and token values
- The GSAP import and initialization patterns
- The fabric texture CSS patterns and their section assignments
- The Mailgun API route logic and form state management
- The thread animation junction points and chapter labels
- The stitch counter scroll behavior
- The CONFIG object structure in page.tsx

---

## Workflow Rules

1. **Read the section spec** in `docs/section-specs/` before modifying any section
2. **Plan before building** — use `/plan-section [name]`
3. **Build against the spec** — use surgical prompts with exact selectors
4. **Evaluate in a fresh context** — use `/evaluate-design [name]`
5. **Never self-evaluate in the same session you built in**
6. **Run `npm run build` after every change** — zero TypeScript errors tolerated
7. **Git commit after each successful phase** — `git add . && git commit -m "phase: [description]"`

---

## Commands Reference

```bash
npm run dev          # Start dev server
npm run build        # TypeScript check + production build
npm run lint         # ESLint
```

---

## What This Site Is NOT

- NOT a developer portfolio with skill bars and GitHub contribution graphs
- NOT a SaaS page with gradient blobs and floating mockups
- NOT a consultant site with stock photos and testimonials
- NOT a Framer template with generic fade-ups
- NOT a resume with education and timeline sections
- NOT half-committed to its theme. Every element is tailoring. Every detail is precision.
