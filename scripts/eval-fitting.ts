/**
 * Fitting room eval harness — v2.
 *
 * BASIC MODE (default)  npm run eval:fitting
 *   Hits /api/fitting at localhost:3000. Validates schema, cut count, tailoring vocab.
 *   Use this to verify the route works end-to-end after any code change.
 *
 * COMPARE MODE          npm run eval:fitting:compare
 *   Calls OpenAI directly. Tests reasoning_effort "low" vs "none" side-by-side.
 *   Guardrails:
 *     1. Cache health check — flags if cached_input_tokens is 0 after warm pass
 *     2. p50/p90/p95 latency (not mean) across 2 timed passes × 6 fixtures
 *     3. Model-as-judge scoring on coherence + blueprint specificity per response
 *   Writes decision doc to docs/eval-logs/.
 *
 * Requires: dev server running on :3000 (basic mode) or OPENAI_API_KEY in .env.local (compare mode).
 */

import * as fs from "fs";
import * as path from "path";
import * as http from "http";

// ── Load .env.local before any process.env reads ──────────────────────────────
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^"(.*)"$|^'(.*)'$/, "$1$2");
  }
}

import { DEFAULT_FITTING_MODEL, FITTING_SCHEMA, SYSTEM_PROMPT } from "../src/app/api/fitting/config.js";

const FITTING_MODEL = process.env.FITTING_MODEL ?? DEFAULT_FITTING_MODEL;
const COMPARE_MODE  = process.argv.includes("--compare");

// ── Types ─────────────────────────────────────────────────────────────────────

interface BlueprintLayer { name: string; detail: string; }

interface FittingResponse {
  measurement: string;
  recommended_pattern: string;
  cut: string[];
  estimated_construction: string;
  fabric: string;
  blueprint: {
    layer_1: BlueprintLayer;
    layer_2: BlueprintLayer;
    layer_3: BlueprintLayer;
    layer_4: BlueprintLayer;
  };
}

interface JudgeScore { coherence: number; specificity: number; rationale: string; }

interface Fixture { label: string; industry: string; teamSize: string; bottleneck: string; }

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FIXTURES: Fixture[] = [
  { label: "SaaS / 16-50 / lead prioritization",        industry: "SaaS",                 teamSize: "16-50", bottleneck: "No lead prioritization — everything feels equal" },
  { label: "Agency / 1-5 / proposal turnaround",        industry: "Creative Agency",       teamSize: "1-5",   bottleneck: "Slow proposal or quote turnaround" },
  { label: "E-commerce / 50+ / disconnected tools",     industry: "E-commerce",            teamSize: "50+",   bottleneck: "Disconnected tools that don't talk to each other" },
  { label: "Healthcare / 16-50 / manual data entry",    industry: "Healthcare Operations", teamSize: "16-50", bottleneck: "Manual data entry eating hours every week" },
  { label: "Fintech / 50+ / outreach tracking",         industry: "Fintech",               teamSize: "50+",   bottleneck: "Can't track what's working in outreach" },
  { label: "Logistics / 1-5 / scaling headcount",       industry: "Logistics",             teamSize: "1-5",   bottleneck: "Scaling operations without scaling headcount" },
];

// ── Tailoring vocab check (basic mode) ────────────────────────────────────────

const TAILORING_TERMS = [/pattern/i, /\bcut\b/i, /\bfit\b/i, /fabric/i, /stitch/i, /seam/i, /measure/i, /tailor/i, /bespoke/i];
const TAILORING_MIN_HITS = 2;

// ── JSON schemas ──────────────────────────────────────────────────────────────

const JUDGE_SCHEMA = {
  type: "object",
  properties: {
    coherence:   { type: "integer", enum: [1, 2, 3, 4, 5] },
    specificity: { type: "integer", enum: [1, 2, 3, 4, 5] },
    rationale:   { type: "string" },
  },
  required: ["coherence", "specificity", "rationale"],
  additionalProperties: false,
} as const;

// ── Judge prompt ──────────────────────────────────────────────────────────────
// Treating this as a named prose constant (not prompts.eval.judge.v3.template) is intentional:
// it reads as a design decision, not config, and surfaces in code review.
//
// SELF-PREFERENCE BIAS NOTE:
// Using gpt-5.5 to judge gpt-5.5 outputs introduces self-preference bias —
// the judge scores outputs that pattern-match its own style higher than outputs
// that are objectively equivalent but stylistically different.
//
// For THIS comparison (low vs none, same model both arms) the bias is SYMMETRIC
// and cancels out for relative ranking. It's safe to ignore here.
//
// For the NEXT comparison (gpt-5.5 vs gpt-5.4-mini cost A/B), the judge will
// systematically favor 5.5 outputs. Mitigation options at that point:
//   1. Use a different judge family (Claude or Gemini)
//   2. Build a human-rated golden set and calibrate the judge against it first
// Don't add this now — just know the workaround exists before that run.

const JUDGE_SYSTEM = `You are a calibration judge for an AI-generated System Fitting report.
Score the report on two dimensions (1-5 each). Be honest — a 4 is good; a 5 means unusually sharp.

SCORING DIMENSIONS:

(a) BOTTLENECK-TO-PATTERN COHERENCE
Does the recommended_pattern directly target the stated bottleneck?
Do the cut items describe specific changes that would eliminate that exact bottleneck, or are they generic benefits any business could claim?
  1 = Pattern ignores the bottleneck; cut items are vague business-speak
  3 = Pattern is relevant but cut items are somewhat generic; not causally linked
  5 = Pattern precisely matches the bottleneck; every cut item is concrete and causally addresses it

(b) BLUEPRINT SPECIFICITY
Does the blueprint name tools and describe tasks that a business owner in THIS exact industry would recognize?
Would they say "yes, that's our stack" or "this could be for anyone"?
  1 = Generic tool names or no tools; layer descriptions could apply to any business
  3 = Some industry-relevant tools named; some specific tasks mentioned
  5 = Names tools this exact industry uses; layer descriptions are business-owner legible and industry-specific`;

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function postLocal(payload: object): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      { hostname: "localhost", port: 3000, path: "/api/fitting", method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
      }
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("Timed out after 30s")));
    req.write(data);
    req.end();
  });
}

async function callOpenAI(body: object, apiKey: string): Promise<{ data: Record<string, unknown>; latencyMs: number }> {
  const start = Date.now();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  const data = await res.json() as Record<string, unknown>;
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${JSON.stringify((data as Record<string,unknown>).error ?? data)}`);
  return { data, latencyMs: Date.now() - start };
}

// ── Validation (basic mode) ───────────────────────────────────────────────────

function validate(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data || typeof data !== "object") return { valid: false, errors: ["Not an object"] };
  const d = data as Record<string, unknown>;

  for (const f of ["measurement", "recommended_pattern", "estimated_construction", "fabric"]) {
    if (typeof d[f] !== "string" || !(d[f] as string).trim()) errors.push(`"${f}" missing or empty`);
  }
  if (!Array.isArray(d.cut)) {
    errors.push(`"cut" is not an array`);
  } else {
    if (d.cut.length < 3 || d.cut.length > 4) errors.push(`"cut" has ${d.cut.length} items (expected 3-4)`);
    d.cut.forEach((item, i) => { if (typeof item !== "string" || !item.trim()) errors.push(`cut[${i}] empty`); });
  }
  if (!d.blueprint || typeof d.blueprint !== "object") {
    errors.push(`"blueprint" missing`);
  } else {
    const bp = d.blueprint as Record<string, unknown>;
    for (const key of ["layer_1", "layer_2", "layer_3", "layer_4"]) {
      const l = bp[key] as Record<string, unknown> | undefined;
      if (!l || typeof l.name !== "string" || !l.name.trim() || typeof l.detail !== "string" || !l.detail.trim())
        errors.push(`blueprint.${key} invalid`);
    }
  }

  const allText = JSON.stringify(data);
  const hits = TAILORING_TERMS.filter((re) => re.test(allText)).length;
  if (hits < TAILORING_MIN_HITS) errors.push(`Tailoring vocab thin: ${hits}/${TAILORING_MIN_HITS} terms`);

  return { valid: errors.length === 0, errors };
}

// ── Percentile helper ─────────────────────────────────────────────────────────

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

// ── Basic mode ────────────────────────────────────────────────────────────────

async function runBasic() {
  console.log("\nFITTING ROOM EVAL — BASIC\n" + "=".repeat(60));
  const results: { label: string; pass: boolean; ms: number; errors: string[] }[] = [];

  for (const fixture of FIXTURES) {
    process.stdout.write(`  ${fixture.label.padEnd(45)} `);
    const start = Date.now();
    try {
      const { status, body } = await postLocal({ industry: fixture.industry, teamSize: fixture.teamSize, bottleneck: fixture.bottleneck });
      const ms = Date.now() - start;
      if (status !== 200) {
        console.log(`FAIL  (${ms}ms)`);
        results.push({ label: fixture.label, pass: false, ms, errors: [`HTTP ${status}: ${body.slice(0, 100)}`] });
        continue;
      }
      let parsed: unknown;
      try { parsed = JSON.parse(body); } catch {
        console.log(`FAIL  (${ms}ms)`);
        results.push({ label: fixture.label, pass: false, ms, errors: ["Invalid JSON"] });
        continue;
      }
      const { valid, errors } = validate(parsed);
      console.log(valid ? `PASS  (${ms}ms)` : `FAIL  (${ms}ms)`);
      results.push({ label: fixture.label, pass: valid, ms, errors });
    } catch (err) {
      const ms = Date.now() - start;
      console.log(`ERROR (${ms}ms)`);
      results.push({ label: fixture.label, pass: false, ms, errors: [err instanceof Error ? err.message : String(err)] });
    }
  }

  const passed = results.filter((r) => r.pass).length;
  const avgMs = Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length);
  console.log("\n" + "=".repeat(60));
  console.log(`RESULTS: ${passed}/${results.length} passed  |  avg latency: ${avgMs}ms`);
  if (passed < results.length) {
    console.log("\nFAILURES:");
    for (const r of results.filter((r) => !r.pass)) {
      console.log(`  ✗ ${r.label}`);
      for (const e of r.errors) console.log(`      → ${e}`);
    }
    console.log("");
    process.exit(1);
  }
  console.log("\nAll fixtures passed.\n");
}

// ── Compare mode ──────────────────────────────────────────────────────────────

async function runFitting(
  fixture: Fixture,
  effort: "low" | "none",
  apiKey: string
): Promise<{ response: FittingResponse; latencyMs: number; cachedInputTokens: number; reasoningTokens: number }> {
  const { data, latencyMs } = await callOpenAI({
    model: FITTING_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Industry: ${fixture.industry} | Team Size: ${fixture.teamSize} | Bottleneck: ${fixture.bottleneck}` },
    ],
    reasoning_effort: effort,
    max_completion_tokens: 1200,
    response_format: { type: "json_schema", json_schema: { name: "fitting_report", strict: true, schema: FITTING_SCHEMA } },
  }, apiKey);

  const choice = (data.choices as Record<string, unknown>[])?.[0] as Record<string, unknown> | undefined;
  const content = (choice?.message as Record<string, unknown>)?.content as string | null;
  if (!content) throw new Error("Empty content from model");

  const usage = data.usage as Record<string, Record<string, number>> | undefined;
  return {
    response: JSON.parse(content) as FittingResponse,
    latencyMs,
    cachedInputTokens: usage?.prompt_tokens_details?.cached_tokens ?? 0,
    reasoningTokens:   usage?.completion_tokens_details?.reasoning_tokens ?? 0,
  };
}

async function judge(fixture: Fixture, response: FittingResponse, apiKey: string): Promise<JudgeScore> {
  const userMsg = [
    `INPUT:`,
    `Industry: ${fixture.industry}  |  Team Size: ${fixture.teamSize}  |  Bottleneck: ${fixture.bottleneck}`,
    ``,
    `REPORT:`,
    JSON.stringify(response, null, 2),
  ].join("\n");

  const { data } = await callOpenAI({
    model: FITTING_MODEL,
    messages: [
      { role: "system", content: JUDGE_SYSTEM },
      { role: "user", content: userMsg },
    ],
    reasoning_effort: "none",
    max_completion_tokens: 300,
    response_format: { type: "json_schema", json_schema: { name: "judge_score", strict: true, schema: JUDGE_SCHEMA } },
  }, apiKey);

  const content = ((data.choices as Record<string, unknown>[])?.[0] as Record<string, unknown> | undefined);
  const raw = ((content?.message as Record<string, unknown>)?.content) as string | null;
  if (!raw) throw new Error("Empty judge response");
  return JSON.parse(raw) as JudgeScore;
}

async function runCompare() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    console.error("OPENAI_API_KEY not set in .env.local");
    process.exit(1);
  }

  const efforts: ("low" | "none")[] = ["low", "none"];
  type PassResult = { latencyMs: number; cachedInputTokens: number; score: JudgeScore };
  const results: Record<"low" | "none", PassResult[][]> = { low: [], none: [] };

  console.log("\nFITTING ROOM EVAL — COMPARE (low vs none)\n" + "=".repeat(70));
  console.log(`Model: ${FITTING_MODEL}\n`);

  // Two passes: first warms the OpenAI prefix cache, second is timed + judged
  for (let pass = 1; pass <= 2; pass++) {
    const label = pass === 1 ? "PASS 1 — CACHE WARM (timings informational)" : "PASS 2 — TIMED + JUDGED";
    console.log(`${label}\n${"-".repeat(70)}`);

    for (const fixture of FIXTURES) {
      process.stdout.write(`  ${fixture.label.padEnd(46)}`);

      for (const effort of efforts) {
        try {
          const fit = await runFitting(fixture, effort, apiKey);
          const score = pass === 2 ? await judge(fixture, fit.response, apiKey) : { coherence: 0, specificity: 0, rationale: "" };

          if (!results[effort][pass - 1]) results[effort][pass - 1] = [];
          results[effort][pass - 1].push({ latencyMs: fit.latencyMs, cachedInputTokens: fit.cachedInputTokens, score });

          process.stdout.write(`  ${effort}:${(fit.latencyMs / 1000).toFixed(1)}s`);
          if (pass === 2) process.stdout.write(`(${fit.cachedInputTokens > 0 ? "⚡cached" : "cold"})`);
        } catch (err) {
          process.stdout.write(`  ${effort}:ERR`);
          console.error(`\n    Error on ${fixture.label} / ${effort}:`, err instanceof Error ? err.message : err);
        }
      }
      console.log();
    }
    console.log();
  }

  // ── Analysis ──────────────────────────────────────────────────────────────

  // GUARDRAIL 1: Cache health check
  const warmResults = results["low"][1] ?? [];
  const cachedCount = warmResults.filter((r) => r.cachedInputTokens > 0).length;
  const cacheHealthy = cachedCount >= Math.ceil(FIXTURES.length * 0.5); // ≥50% showing cache hits
  const cacheStatus = cacheHealthy
    ? `HEALTHY — ${cachedCount}/${FIXTURES.length} fixtures showed cached_input_tokens > 0`
    : `WARNING — only ${cachedCount}/${FIXTURES.length} fixtures showed cached_input_tokens > 0. Prefix may not be stable.`;

  // GUARDRAIL 2: p50/p90/p95 latency (not mean)
  function latencyStats(passResults: PassResult[]) {
    const sorted = passResults.map((r) => r.latencyMs / 1000).sort((a, b) => a - b);
    return {
      p50:  +percentile(sorted, 50).toFixed(2),
      p90:  +percentile(sorted, 90).toFixed(2),
      p95:  +percentile(sorted, 95).toFixed(2),
      mean: +(sorted.reduce((s, v) => s + v, 0) / sorted.length).toFixed(2),
      n:    sorted.length,
    };
  }

  const latLow  = latencyStats(results["low"][1]  ?? []);
  const latNone = latencyStats(results["none"][1] ?? []);

  // Pass 1 vs Pass 2 mean delta — measures cache effectiveness within the run
  const pass1MeanLow  = results["low"][0]  ? results["low"][0].reduce((s, r) => s + r.latencyMs, 0) / results["low"][0].length / 1000  : 0;
  const pass2MeanLow  = latLow.mean;
  const cacheSpeedup  = pass1MeanLow > 0 ? +((1 - pass2MeanLow / pass1MeanLow) * 100).toFixed(1) : 0;

  // GUARDRAIL 3: Judge score analysis
  function judgeStats(passResults: PassResult[]) {
    const scores = passResults.map((r) => r.score).filter((s) => s.coherence > 0);
    if (!scores.length) return { coherence: 0, specificity: 0, combined: 0, n: 0 };
    const avgC = scores.reduce((s, j) => s + j.coherence, 0) / scores.length;
    const avgS = scores.reduce((s, j) => s + j.specificity, 0) / scores.length;
    return { coherence: +avgC.toFixed(2), specificity: +avgS.toFixed(2), combined: +((avgC + avgS) / 2).toFixed(2), n: scores.length };
  }

  const jLow  = judgeStats(results["low"][1]  ?? []);
  const jNone = judgeStats(results["none"][1] ?? []);

  const latSavings  = +(latLow.p50 - latNone.p50).toFixed(2);
  const judgeDelta  = +(jNone.combined - jLow.combined).toFixed(2);

  // Decision logic
  const SWAP_IF  = latSavings >= 2.0 && judgeDelta >= -0.3 && jNone.specificity >= 3.5;
  const STAY_IF  = judgeDelta < -0.5 || jNone.specificity < 3.0;
  const decision = STAY_IF ? "STAY ON 'low'" : SWAP_IF ? "SWAP TO 'none'" : "INCONCLUSIVE — borderline, human review needed";

  // ── Print report ──────────────────────────────────────────────────────────

  const lines: string[] = [
    "=".repeat(70),
    "GUARDRAIL 1 — CACHE HEALTH",
    `  ${cacheStatus}`,
    `  Cache speedup (pass1→pass2, low effort): ${cacheSpeedup}% ${cacheSpeedup < 10 ? "— LOW. Fix caching before interpreting latency." : "— healthy."}`,
    "",
    "GUARDRAIL 2 — LATENCY (p50/p90/p95, n=" + latLow.n + " per mode)",
    `  Mode  │ p50    │ p90    │ p95    │ mean`,
    `  low   │ ${latLow.p50}s  │ ${latLow.p90}s  │ ${latLow.p95}s  │ ${latLow.mean}s`,
    `  none  │ ${latNone.p50}s  │ ${latNone.p90}s  │ ${latNone.p95}s  │ ${latNone.mean}s`,
    `  p50 savings: ${latSavings}s`,
    "",
    "GUARDRAIL 3 — JUDGE SCORES (coherence / specificity / combined, 1-5 each, n=" + jLow.n + ")",
    `  Mode  │ coherence │ specificity │ combined`,
    `  low   │ ${jLow.coherence}       │ ${jLow.specificity}         │ ${jLow.combined}`,
    `  none  │ ${jNone.coherence}       │ ${jNone.specificity}         │ ${jNone.combined}`,
    `  combined delta (none-low): ${judgeDelta > 0 ? "+" : ""}${judgeDelta}`,
    "",
    "PER-FIXTURE JUDGE RATIONALES",
    ...(results["low"][1] ?? []).map((r, i) => {
      const nR = (results["none"][1] ?? [])[i];
      return [
        `  ${FIXTURES[i].label}`,
        `    low:  (${r.score.coherence}/${r.score.specificity}) ${r.score.rationale}`,
        `    none: (${nR?.score.coherence ?? "?"}/${nR?.score.specificity ?? "?"}) ${nR?.score.rationale ?? "n/a"}`,
      ].join("\n");
    }),
    "",
    "=".repeat(70),
    `DECISION: ${decision}`,
    "",
    "CRITERIA:",
    `  SWAP if: p50 savings ≥ 2s (${latSavings}s) AND judge delta ≥ -0.3 (${judgeDelta}) AND none specificity ≥ 3.5 (${jNone.specificity})`,
    `  STAY if: judge delta < -0.5 OR none specificity < 3.0`,
    "",
    `NOTE: n=${latLow.n} per mode. p95 of small samples approaches max — interpret p50 and p90 as the signal.`,
    ...(cacheHealthy ? [] : [
      "",
      "ACTION REQUIRED: Cache is not activating reliably. Audit common cache-killers:",
      "  - Dynamic content interpolated into SYSTEM_PROMPT",
      "  - FITTING_MODEL env var causing cache-key mismatch",
      "  - System prompt changed since last deploy (new cache bucket, needs warm-up)",
      "Fix caching before drawing latency conclusions — a cold prefix adds ~1-2s on every call.",
    ]),
  ];

  console.log(lines.join("\n"));

  // ── Write decision doc ────────────────────────────────────────────────────

  const date  = new Date().toISOString().slice(0, 10);
  const outPath = path.join(process.cwd(), "docs", "eval-logs", `reasoning-effort-comparison-${date}.md`);
  const md = [
    `# Reasoning Effort Comparison — ${date}`,
    ``,
    `**Model:** ${FITTING_MODEL}`,
    `**Modes compared:** \`reasoning_effort: "low"\` vs \`"none"\``,
    `**Fixtures:** ${FIXTURES.length}  |  **Passes:** 2 (warm + timed)`,
    ``,
    `## Decision`,
    ``,
    `**${decision}**`,
    ``,
    `## Results`,
    ``,
    "```",
    lines.join("\n"),
    "```",
    ``,
    `## Judge prompt`,
    ``,
    "```",
    JUDGE_SYSTEM,
    "```",
    ``,
    `## Judge schema`,
    ``,
    "```json",
    JSON.stringify(JUDGE_SCHEMA, null, 2),
    "```",
  ].join("\n");

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, md);
  console.log(`\nDecision doc written to: ${outPath}\n`);
}

// ── Entry point ────────────────────────────────────────────────────────────────

if (COMPARE_MODE) {
  runCompare().catch((err) => { console.error("Eval error:", err); process.exit(1); });
} else {
  runBasic().catch((err) => { console.error("Eval error:", err); process.exit(1); });
}
