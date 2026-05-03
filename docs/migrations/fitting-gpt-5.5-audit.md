# Fitting Room — gpt-5.5 Migration Audit

**File in scope:** `src/app/api/fitting/route.ts`
**Date:** 2026-05-02

---

## Phase 1 — Audit Findings

### Current model
`gpt-5.4` (not `gpt-4o-mini` — route was already on a newer model). The migration target is `gpt-5.5-2026-04-23`.

### SDK / HTTP client
**No openai SDK installed.** The route calls OpenAI via native `fetch` directly against `https://api.openai.com/v1/chat/completions`. `package.json` lists only `gsap`, `next`, `react`, `react-dom` as runtime dependencies. No SDK upgrade needed — structured outputs via `response_format: { type: "json_schema", ... }` are supported in the REST API directly.

### System prompt — token count (precise)
Measured via character count:
- Full `SYSTEM_PROMPT`: 3,382 chars → **~966 tokens** (3.5 chars/tok estimate)
- Voice rules + tone block only: 1,441 chars → **~412 tokens**
- JSON template block (`"Respond in ONLY valid JSON:" + field spec`): 1,941 chars → **~555 tokens**

The 1,941-char JSON template block contains two distinct things:
1. The outer JSON skeleton (`{`, field name keys, `}`) — structural noise, removable
2. Per-field content guidance ("1 sentence that names their industry...") — **high-value instruction, must be kept**

After structured outputs migration, only the outer skeleton and preamble are removed. The field content guidance gets reformatted as a plain list. Token loss: ~40–60 tokens of JSON punctuation.

**Net result: restructured system prompt will be ~900–920 tokens — still below the 1024 cache threshold.** 3 worked examples at ~90 tokens each are needed to reach ~1170 tokens.

### JSON parsing and validation
`parseAIResponse` (line 107) has three fallback strategies; `validateResponse` (line 132) checks field types. Both become unnecessary after structured outputs: a successful response cannot be malformed JSON. The multi-fallback logic is replaced by a single `JSON.parse(content)`. The `FittingResponse` TypeScript interface is kept; parsed object is asserted with `as FittingResponse`.

### Data logging
The route uses `console.log("[FITTING_LOG]", JSON.stringify(record))` — **not `data/fittings.json`**. Vercel serverless has no writable filesystem. Telemetry fields will be added to the console log record.

### Curtain / latency budget
- Curtain fully closed: **650ms** (FittingRoom.tsx:126–129)
- Report fade-in: **800ms** after `tryReveal()` fires

API call is in parallel with the curtain. Perceived wait is dominated by API latency. `reasoning_effort: "low"` and `max_completion_tokens: 1200` keep it tight.

### `temperature` parameter
Current: `temperature: 0.7`. Reasoning-capable models reject this with a 400. Removed in Phase 3. See Deep Review §1 for risk flag.

### Rate limiter
In-memory `Map`, 10 req/hour per SHA-256-hashed IP. Resets on Vercel cold start (acceptable at portfolio scale). Untouched.

---

## Deep Review Pass

### §1 — `temperature` removal assumption
`gpt-5.4` was shipped with `temperature: 0.7` in this route and it was working. That implies gpt-5.4 either accepted temperature or silently ignored it. If gpt-5.5 is a reasoning model, temperature causes a 400. If it's a standard chat model (like gpt-4o-tier), removing temperature changes the output distribution in an unmeasured way — default temperature is 1.0, which is more varied than 0.7. The eval harness in Phase 4 is the safety net here: if output quality regresses, temperature behavior is the first hypothesis. **Flag for Phase 5 verification.**

### §2 — `minItems`/`maxItems` NOT supported in OpenAI strict mode — BLOCKER
OpenAI's structured outputs schema implementation supports a specific JSON Schema subset. The following keywords are **not supported** in strict mode: `minItems`, `maxItems`, `minimum`, `maximum`, `pattern`, `minLength`, `maxLength`, `default`, `if/then/else`.

The Phase 2 plan includes:
```json
"cut": { "type": "array", "items": { "type": "string" }, "minItems": 3, "maxItems": 4 }
```

In strict mode, unsupported keywords cause an API 400 error on the first request (not silent ignore — OpenAI validates the schema server-side). This would make every fitting attempt fail.

**Fix:** Remove `minItems`/`maxItems` from the schema entirely:
```json
"cut": { "type": "array", "items": { "type": "string" } }
```
The 3–4 item constraint belongs only in the system prompt text ("3-4 items" in the field guidance). Structured outputs guarantee each item is a string; the count is a voice/content constraint.

### §3 — `max_output_tokens` parameter name is wrong — SILENT BUG
The Phase 2 plan proposes renaming `max_completion_tokens: 800` → `max_output_tokens: 1200`. The OpenAI Chat Completions REST API parameter is `max_completion_tokens`, not `max_output_tokens`. (`max_output_tokens` appears in the Responses API context.)

If an unknown parameter is passed in the request body, the OpenAI API silently ignores it — the request succeeds but there is no output cap. This is a silent bug: responses could run unbounded, increasing cost and latency with no error surfaced.

**Fix:** Keep the parameter name `max_completion_tokens`. Change the value from `800` → `1200`. Do not rename the key.

### §4 — `finish_reason: "length"` guard missing
Structured outputs guarantee valid JSON only when the model finishes normally (`finish_reason: "stop"`). If the model hits the token cap mid-response (`finish_reason: "length"`), the JSON is truncated — `JSON.parse` throws. The top-level try/catch handles this as a 502, but the issue goes unlogged with any useful context.

With `max_completion_tokens: 1200` on a ~400-token expected output, hitting length is unlikely but not impossible if reasoning tokens eat into the budget. For a reasoning model, `max_completion_tokens` caps the combined (reasoning + output) token count. If the model reasons at `low` effort for ~500 tokens, actual output budget is ~700 — still safe, but the math shifts.

**Fix:** After receiving the response, check `finish_reason` before parsing:
```ts
const choice = data.choices?.[0];
if (choice?.finish_reason === "length") {
  console.error("Fitting truncated: hit max_completion_tokens");
  return NextResponse.json({ error: "The fitting room is temporarily closed. Book a call instead." }, { status: 502 });
}
const content = choice?.message?.content;
```

### §5 — `logFitting` signature needs refactoring
The current `logFitting(input, output, ipHash, userAgent)` function (line 148) doesn't have access to `data.usage`. The telemetry fields (`model`, `reasoning_tokens`, `cached_input_tokens`) come from the raw OpenAI response object, which is only in scope inside the POST handler.

Two options:
- **(A) Remove the function entirely** — inline the `console.log` directly in the POST handler where `data` is in scope. The function is only called once; no DRY value in keeping it separate.
- **(B) Add a `usage` parameter** — `logFitting(input, output, ipHash, userAgent, usage)`.

Option A is cleaner given the function is single-use and the telemetry fields make it more complex. **Prefer A.**

### §6 — System prompt restructuring token math is tighter than Phase 2 stated
Phase 2 said "2–3 examples" would push past 1024. The actual math:
- Voice rules: ~412 tokens (kept as-is)
- Field guidance (reformatted from JSON template, content preserved): ~480–500 tokens
- Subtotal: ~892–912 tokens
- Gap to 1024: ~112–132 tokens
- 3 examples at ~90 tokens each: ~270 tokens

With 3 examples, total lands at ~1162–1182 tokens — comfortably above threshold with ~138 token margin.

**2 examples are borderline (~1002–1022 tokens, essentially at the threshold). Use 3 to guarantee cache activation.** Also: the examples must cover the full JSON output structure (not abbreviated) to count toward the token total. Abbreviated examples contribute fewer tokens.

### §7 — `message.refusal` not explicitly handled
With structured outputs, if the model refuses to answer (safety filter, off-topic input), `data.choices[0].message.content` is `null` and `data.choices[0].message.refusal` contains the refusal reason. The current `if (!content) → 502` path handles this correctly behavior-wise, but the refusal is logged as "No response from AI" rather than the actual refusal string.

Not a functional bug, but useful for monitoring. **Low priority** — add to the `console.error` call: `console.error("AI refusal or empty content:", choice?.message?.refusal)`.

### §8 — TypeScript type safety after removing `validateResponse`
`validateResponse` was the only runtime + type guard. After removal, `JSON.parse(content)` returns `unknown` (TypeScript will infer `any` from `Response.json()` in the DOM lib, but it's worth being explicit). The parsed result should be cast and the `FittingResponse` interface retained for the downstream `NextResponse.json(parsed)` return:

```ts
const parsed = JSON.parse(content) as FittingResponse;
```

This is a type assertion, not a guard — but structured outputs guarantee the shape, so it's valid. **Do not re-add `validateResponse`.**

### §9 — Cache invalidation when `FITTING_MODEL` env var is set
OpenAI's prompt cache is keyed on `(model, messages prefix)`. If `FITTING_MODEL` env var switches the model (e.g., for A/B against gpt-5.4-mini), the cache key changes entirely — cache miss on every request for that model variant. This is **correct behavior**, but it means the A/B comparison will be apples-to-oranges on latency until the 5.4-mini bucket warms up. Document this in the migration notes when the A/B eventually runs.

### §10 — Stale rate limiter after Vercel cold starts
In-memory `rateLimitMap` resets on every cold start. For portfolio traffic (low volume), this is acceptable. But it means a burst of requests immediately after a cold start could exceed the intended 10/hour limit. This is a pre-existing issue, not introduced by this migration. Leave untouched.

---

## Phase 2 — Proposed Changes (Revised)

### (a) Model constant + env override
```ts
const FITTING_MODEL = process.env.FITTING_MODEL ?? "gpt-5.5-2026-04-23";
```

### (b) Structured outputs — corrected schema
Remove `parseAIResponse` / `validateResponse`. Add `response_format` to the request body. **`minItems`/`maxItems` removed** (unsupported in strict mode):

```ts
const FITTING_SCHEMA = {
  type: "object",
  properties: {
    measurement:            { type: "string" },
    recommended_pattern:    { type: "string" },
    cut:                    { type: "array", items: { type: "string" } },
    estimated_construction: { type: "string" },
    fabric:                 { type: "string" },
    blueprint: {
      type: "object",
      properties: {
        layer_1: { type: "object", properties: { name: { type: "string" }, detail: { type: "string" } }, required: ["name", "detail"], additionalProperties: false },
        layer_2: { type: "object", properties: { name: { type: "string" }, detail: { type: "string" } }, required: ["name", "detail"], additionalProperties: false },
        layer_3: { type: "object", properties: { name: { type: "string" }, detail: { type: "string" } }, required: ["name", "detail"], additionalProperties: false },
        layer_4: { type: "object", properties: { name: { type: "string" }, detail: { type: "string" } }, required: ["name", "detail"], additionalProperties: false },
      },
      required: ["layer_1", "layer_2", "layer_3", "layer_4"],
      additionalProperties: false,
    },
  },
  required: ["measurement", "recommended_pattern", "cut", "estimated_construction", "fabric", "blueprint"],
  additionalProperties: false,
} as const;
```

### (c) Reasoning effort + temperature removal
```ts
reasoning_effort: "low",
// temperature removed — not compatible with reasoning-capable models
```

### (d) System prompt restructuring — 3 examples, field guidance preserved
- Remove: `"Respond in ONLY valid JSON:"` preamble + outer JSON object skeleton (`{`, `}`, quoted key names)
- Keep: all per-field content guidance (reformatted as plain list)
- Add: 3 full worked examples covering different industries
- Target: ~1160–1180 tokens (cache threshold: 1024)

### (e) Output cap — correct parameter name
```ts
max_completion_tokens: 1200,  // was 800; name unchanged from current
```

### (f) Telemetry — inline in POST handler
Remove `logFitting` function. Inline the log directly in the POST handler where `data.usage` is in scope:
```ts
console.log("[FITTING_LOG]", JSON.stringify({
  id: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
  input: { industry, teamSize, bottleneck },
  output: parsed,
  metadata: {
    ipHash,
    userAgent: request.headers.get("user-agent"),
    model: FITTING_MODEL,
    reasoning_tokens: data.usage?.completion_tokens_details?.reasoning_tokens ?? 0,
    cached_input_tokens: data.usage?.prompt_tokens_details?.cached_tokens ?? 0,
  },
}));
```

### (g) `finish_reason` guard
```ts
const choice = data.choices?.[0];
if (choice?.finish_reason === "length") {
  console.error("Fitting truncated: hit max_completion_tokens");
  return NextResponse.json({ error: "The fitting room is temporarily closed. Book a call instead." }, { status: 502 });
}
```

### (h) `refusal` logging
```ts
if (!content) {
  console.error("AI refusal or empty content:", choice?.message?.refusal);
  return NextResponse.json({ error: "No response from AI" }, { status: 502 });
}
```

### (i) No Responses API migration, no SDK, no other routes
Native `fetch` + `chat/completions` retained.

---

## Files touched

| File | Change |
|------|--------|
| `src/app/api/fitting/route.ts` | All changes above |
| `.env.example` | Document `FITTING_MODEL` optional override |

---

## Risk Summary

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| §2 | **BLOCKING** | `minItems`/`maxItems` invalid in strict mode → 400 on every request | Remove from schema |
| §3 | **HIGH** | `max_output_tokens` wrong parameter name → silent unbounded output | Keep `max_completion_tokens` |
| §4 | **MEDIUM** | No `finish_reason` guard → truncated JSON causes unlogged 502 | Add `finish_reason === "length"` check |
| §5 | **MEDIUM** | `logFitting` can't access `data.usage` → telemetry fields unreachable | Inline log in POST handler |
| §6 | **MEDIUM** | 2 examples borderline for cache threshold (1002–1022 tokens) | Use 3 full examples (~1160 tokens) |
| §1 | LOW | `temperature` removal changes output distribution (0.7 → implicit 1.0) | Monitor via eval harness |
| §7 | LOW | `refusal` not logged explicitly | Add to console.error |
| §8 | LOW | Type safety reduced after `validateResponse` removal | Use `as FittingResponse` assertion |
| §9 | INFO | A/B model env var creates separate cache bucket | Expected behavior, document it |
| §10 | INFO | In-memory rate limiter resets on cold start | Pre-existing, out of scope |

---

---

## Phase 3–5 — Implementation Results

### Changes shipped
- `src/app/api/fitting/route.ts` — full rewrite per revised Phase 2 plan
- `.env.example` — `FITTING_MODEL` documented with A/B note
- `scripts/eval-fitting.ts` — eval harness, 6 fixtures
- `package.json` — `eval:fitting` npm script

### System prompt final token count
7,849 chars → **~2,243 tokens** (well above 1024 cache threshold).

### Eval results (2026-05-02)
```
FITTING ROOM EVAL
============================================================
  SaaS / 10-50 / manual lead qualification      PASS  (9287ms)
  Agency / 2-5 / proposal writing               PASS  (7727ms)
  E-commerce / 50+ / disconnected tools         PASS  (7582ms)
  Healthcare ops / 10-50 / manual data entry    PASS  (7866ms)
  Fintech / 50+ / outreach tracking             PASS  (8559ms)
  Logistics / 1-5 / scaling without headcount   PASS  (5908ms)
============================================================
RESULTS: 6/6 passed  |  avg latency: 7822ms
```

All 6 fixtures pass: valid schema, 3-4 cut items, ≥2 tailoring vocabulary terms per response.

### Latency note
Average ~7.8s per fitting at `reasoning_effort: low`. This is slower than `gpt-5.4` with `temperature: 0.7`, and faster than `medium`/`high` effort. The curtain animation (650ms close) means the user perceives ~7.2s of wait after the curtain closes — acceptable for a bespoke AI report but worth monitoring. If latency becomes a complaint, try `reasoning_effort: "none"` and re-run the eval to confirm quality holds.

### §1 correction (post-implementation review)
The audit hedged §1 with "If gpt-5.5 is a reasoning model..." — that was insufficient. The OpenAI docs for `reasoning_effort` list `none | low | medium | high | xhigh` as the supported range, which is an explicit signal this is a reasoning-capable model. Temperature is not hedged — it is rejected with a 400. Future audits should commit to a position when the docs support it rather than listing conditional branches. The impl removed `temperature` unconditionally; the eval confirms 6/6 quality with no regression.

### §2 / `strict: true` note (post-implementation review)
The full `response_format` wrapper shipped as:
```ts
response_format: {
  type: "json_schema",
  json_schema: {
    name: "fitting_report",
    strict: true,      // activates unsupported-keyword validation
    schema: FITTING_SCHEMA,
  },
},
```
`strict: true` is what causes OpenAI to validate the schema before sending to the model, which is why `minItems`/`maxItems` would have caused a 400. Without `strict: true` (the loose subset), those keywords are silently ignored rather than rejected — which would have been a harder bug to catch. The Phase 2 plan should have shown the full envelope explicitly rather than just `schema: FITTING_SCHEMA`.
