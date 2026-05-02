---
name: evaluate-design
description: "Evaluate a section of grantmahn.com against its spec with a cold, skeptical design review. Runs in a forked context with no memory of the build session. Use when the user types /evaluate-design [section-name] or asks to evaluate, review, or grade a section."
context: fork
allowed-tools: Read, Grep, Glob, Bash, Write
---

# Evaluate Design

Perform a cold design evaluation of a section of grantmahn.com. You have never seen this code before. You have no memory of how or why it was built. You judge only what exists.

The user provides a section name as an argument (e.g., `hero`, `work`, `services`, `about`, `contact`, `footer`, `suit-spec`, `fitting-room`).

## Workflow

1. **Read brand context.** Read `CLAUDE.md` at the project root. Understand the brand identity, color system, typography, and what this site is trying to be.

2. **Read the section spec.** Read `docs/section-specs/{name}.md`. Understand what was INTENDED — the product context, design direction, and success criteria. This is the contract the builder was working against. Internalize the intent before forming any opinions.

3. **Adopt the reviewer persona.** Read `.claude/agents/design-qa.md`. Adopt its standards, biases, and approach. You are now a skeptical senior design critic who has reviewed thousands of developer portfolios and is exhausted by AI-generated sameness.

4. **Read the implementation cold.** Read the actual code:
   - `src/app/page.tsx` — find the section's markup
   - `src/app/globals.css` — find the section's styles
   - Any animation files in `src/animations/` referenced by the spec

5. **Grade on 4 criteria** (each scored 0-10):

   ### Design Quality (3x weight)
   Does it look intentional, premium, and distinctive? Evaluate typography choices, color usage, spacing composition, and visual hierarchy. Is there a clear aesthetic point of view?

   ### Originality (3x weight)
   Would this pass the AI Slop Test from CLAUDE.md? Does it avoid generic patterns (uniform card grids, default Tailwind spacing, predictable animations)? Is it recognizably "Systems Tailor" — could you identify the brand from this section alone?

   ### Craft (2x weight)
   Micro-interactions, transitions, hover states, responsive behavior, animation timing, attention to detail. Are there moments of delight or surprise? Does the code show care?

   ### Functionality (2x weight)
   Does it work? Semantic HTML, accessibility, responsive behavior, no obvious bugs, performance. Would it survive a real user on a real device?

6. **Compute the weighted score.**
   ```
   DQ×3 + O×3 + C×2 + F×2 = total out of 100
   ```

7. **Apply the quality gate.** If NO individual criterion scores 8 or higher, the verdict is ITERATE regardless of the weighted total. A flat 7 across the board means "works but nobody would remember it" — exactly what the AI Slop Test catches.

8. **Classify the result:**
   - **PASS** (70+ AND at least one criterion >= 8): Ship it. Minor polish only.
   - **ITERATE** (50-69, or all scores < 8): Good bones, needs targeted work. List the top 3 fixable issues.
   - **FAIL** (< 50): Fundamental problems. Rebuild against the spec.

9. **Write the evaluation** to `docs/eval-logs/{name}-eval-{YYYY-MM-DD}.md` using this format:

```markdown
# Evaluation: {SECTION NAME}
**Date:** {YYYY-MM-DD}
**Verdict:** {PASS / ITERATE / FAIL}
**Weighted Score:** {total}/100

## Scores
| Criterion | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Design Quality | {X}/10 | 3x | {X*3} |
| Originality | {X}/10 | 3x | {X*3} |
| Craft | {X}/10 | 2x | {X*2} |
| Functionality | {X}/10 | 2x | {X*2} |

## Design Quality — {X}/10
{Specific evidence with file:line references. What works. What doesn't.}

## Originality — {X}/10
{AI Slop Test results. What's distinctive. What's generic.}

## Craft — {X}/10
{Micro-interactions, transitions, responsive behavior. Specific selectors.}

## Functionality — {X}/10
{Accessibility, performance, bugs. Specific issues with file:line.}

## Success Criteria Check
{Go through the spec's Success Criteria one by one. Pass/fail each with evidence.}

## Top Issues to Fix
1. {Most impactful issue — criterion, specific problem, suggested fix}
2. {Second issue}
3. {Third issue}

## What's Working Well
{Acknowledge what scored 8+. These should NOT be touched in iteration.}
```

## Scoring Anchors — Use These Exactly

- **10:** Best-in-class. Would win a design award. You'd study how it was built.
- **9:** "I would screenshot this to show a colleague." Genuinely memorable.
- **8:** Impressive in this specific dimension. A deliberate creative choice you respect.
- **7:** Competent but unremarkable. This is where untuned LLM output lands. Not bad — just not memorable.
- **5-6:** Forgettable. Generic. Could appear on 1,000 other developer portfolios.
- **3-4:** Actively detracts from the brand. Makes the site feel cheaper.
- **1-2:** Broken or hostile to the user experience.

## Anti-Leniency Rules

- Default assumption: most AI-generated code starts at 5-6 and needs iteration to reach 8+.
- If you cannot identify a specific memorable detail for a criterion, the score is 6 or below.
- Every score requires a concrete justification pointing to a specific selector, line number, or interaction.
- "It looks clean" is not a justification. "The 0.25em letter-spacing on .hero-role creates the tracked-out garment-tag feel specified in the brand" is.
- Do not grade on effort or intent. Grade on what exists in the code right now.
