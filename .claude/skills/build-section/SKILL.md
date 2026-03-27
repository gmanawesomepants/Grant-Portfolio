---
name: build-section
description: "Build or iterate on a section of grantmahn.com. Reads the section spec and most recent eval log, then implements changes surgically. Use when the user types /build-section [section-name] or asks to build, implement, or fix a section."
---

# Build Section

Build or iterate on a section of grantmahn.com based on its spec and any evaluation feedback. This skill handles both initial builds and iteration passes after evaluation.

The user provides a section name as an argument (e.g., `hero`, `work`, `services`, `about`, `contact`, `footer`, `suit-spec`, `fitting-room`).

## Workflow

1. **Read brand rules.** Read `CLAUDE.md` at the project root. Internalize the DO NOT TOUCH list, color system, typography scale, and AI Slop Test.

2. **Read the section spec.** Read `docs/section-specs/{name}.md`.
   - **If the file does not exist, STOP.** Tell the user: "No spec found for '{name}'. Run `/plan-section {name}` first." Do not attempt to build without a spec.

3. **Check for evaluation feedback.** Scan `docs/eval-logs/` for files matching `{name}-eval-*.md`. If any exist, read the most recent one.
   - Extract issues scored below 7 — these are the priority fixes.
   - Note any issues scored 7+ — do not regress these.
   - If you disagree with a specific evaluator finding, note the disagreement in your commit message with reasoning. The human (Grant) is the tiebreaker. Never silently ignore eval feedback.

4. **Read current implementation.** Read the relevant files:
   - `src/app/page.tsx` — find the section's markup
   - `src/app/globals.css` — find the section's styles
   - Any animation files in `src/animations/` referenced by the spec

5. **Build surgically.** Implement the spec's requirements:
   - Only modify code within the target section's selectors and markup
   - Never modify code outside the target section
   - Follow the DO NOT TOUCH list from both CLAUDE.md and the section spec
   - Reference the spec's Success Criteria as a build checklist — every criterion should be addressed

6. **Apply the AI Slop Test.** Before finishing, run through all 6 questions from CLAUDE.md. If any answer is FAIL, fix it before proceeding.

7. **Verify the build.** Run `npm run build`. Fix any TypeScript errors. Do not commit code that doesn't compile.

8. **Commit.** Stage only the files you modified. Commit with message: `build: {section-name} — [brief description of what changed]`

## Key Constraints

- **Scope discipline.** The builder modifies only the target section. If you notice issues elsewhere, note them but do not fix them.
- **Spec fidelity.** The spec is the contract. If you think the spec is wrong, build what it says anyway and note your concern — the evaluator and the user will catch real issues.
- **No creative improvisation.** The planner makes creative decisions. The builder executes them precisely. If the spec doesn't specify something, use the simplest approach that matches the brand.
- **Iteration awareness.** On iteration passes (when eval logs exist), focus on the specific issues identified. Do not refactor unrelated code or "improve" things that scored well.
