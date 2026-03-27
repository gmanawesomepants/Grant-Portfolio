---
name: qa-check
description: "Run a technical QA check on a section of grantmahn.com. Checks build, lint, responsive, accessibility, performance, and spec compliance. Use when the user types /qa-check [section-name] or asks for a technical check or QA pass."
context: fork
---

# QA Check

Run a technical quality assurance pass on a section of grantmahn.com. This is a mechanical check — no subjective design judgment. Does it compile, does it work, does it meet the spec's technical requirements?

The user provides a section name as an argument (e.g., `hero`, `work`, `services`, `about`, `contact`, `footer`, `suit-spec`, `fitting-room`).

## Workflow

1. **Read the section spec.** Read `docs/section-specs/{name}.md` if it exists. Note the Success Criteria — you'll check each one.

2. **Read the implementation.** Find the section in:
   - `src/app/page.tsx` — markup and logic
   - `src/app/globals.css` — styles
   - Any animation files in `src/animations/`

3. **Run technical checks:**

   ### Build
   Run `npm run build`. Must pass with zero errors. Report any TypeScript errors with file:line.

   ### Lint
   Check if `lint` script exists in `package.json`. If it does, run `npm run lint` and report warnings. If it doesn't exist, note "lint script not configured" and skip.

   ### Responsive
   Scan the CSS for mobile media queries targeting this section's selectors. Check for:
   - Breakpoint coverage (at minimum 768px)
   - Font size adjustments for mobile
   - Layout changes (flex-direction, grid columns)
   - Touch target sizes (minimum 44px for interactive elements)
   - No horizontal overflow on narrow viewports

   ### Accessibility
   Check the markup for:
   - Semantic HTML (section, nav, main, article, not just divs)
   - ARIA labels on interactive elements
   - Alt text on images
   - Color contrast (amber #C4943D on #080808 = 5.2:1, passes AA for large text but fails for body text — flag if amber is used on small body text)
   - Keyboard navigability (tabindex, focus styles)
   - Reduced motion support (prefers-reduced-motion media query)

   ### Code Quality
   Check for:
   - Unhandled promises or missing null checks
   - Console.log statements left in production code
   - Unused imports or variables
   - Event listeners without cleanup in useEffect
   - Memory leaks (setInterval/setTimeout without clear)

   ### Performance
   Check for:
   - Layout thrashing (reading then writing DOM in loops)
   - Excessive re-renders (inline objects/functions in JSX props)
   - Large DOM subtrees (>100 elements in one section)
   - Missing loading="lazy" on below-fold images
   - CSS animations using properties that trigger layout (top/left vs transform)

4. **Cross-reference Success Criteria.** Go through the spec's Success Criteria one by one. For each:
   - Can it be verified from the code? (some may require visual/runtime checking)
   - Does the implementation satisfy it?
   - Note pass/fail with specific file:line evidence

5. **Output the report:**

```markdown
# QA Report: {SECTION NAME}
**Date:** {YYYY-MM-DD}
**Overall:** {PASS / FAIL}

## Build
{PASS/FAIL} — {details if fail}

## Lint
{PASS/FAIL/SKIPPED} — {details}

## Responsive
{PASS/FAIL} — {list of issues with file:line}

## Accessibility
{PASS/FAIL} — {list of issues with file:line}

## Code Quality
{PASS/FAIL} — {list of issues with file:line}

## Performance
{PASS/FAIL} — {list of issues with file:line}

## Success Criteria
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | {from spec} | PASS/FAIL/NEEDS RUNTIME CHECK | {file:line} |

## Summary
{Count of passes and failures. Top 3 issues to fix, prioritized by severity.}
```
