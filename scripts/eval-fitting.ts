/**
 * Fitting room eval harness.
 * Hits /api/fitting for 6 fixture inputs, validates schema + brand voice.
 * Run: npm run eval:fitting  (requires dev server at localhost:3000)
 */

import * as http from "http";

/* ── Types ── */

interface BlueprintLayer {
  name: string;
  detail: string;
}

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

interface Fixture {
  label: string;
  industry: string;
  teamSize: string;
  bottleneck: string;
}

/* ── Fixtures ── */

const FIXTURES: Fixture[] = [
  {
    label: "SaaS / 10-50 / manual lead qualification",
    industry: "SaaS",
    teamSize: "16-50",
    bottleneck: "No lead prioritization — everything feels equal",
  },
  {
    label: "Agency / 2-5 / proposal writing",
    industry: "Creative Agency",
    teamSize: "1-5",
    bottleneck: "Slow proposal or quote turnaround",
  },
  {
    label: "E-commerce / 50+ / disconnected tools",
    industry: "E-commerce",
    teamSize: "50+",
    bottleneck: "Disconnected tools that don't talk to each other",
  },
  {
    label: "Healthcare ops / 10-50 / manual data entry",
    industry: "Healthcare Operations",
    teamSize: "16-50",
    bottleneck: "Manual data entry eating hours every week",
  },
  {
    label: "Fintech / 50+ / outreach tracking",
    industry: "Fintech",
    teamSize: "50+",
    bottleneck: "Can't track what's working in outreach",
  },
  {
    label: "Logistics / 1-5 / scaling without headcount",
    industry: "Logistics",
    teamSize: "1-5",
    bottleneck: "Scaling operations without scaling headcount",
  },
];

/* ── Tailoring vocabulary check ── */

const TAILORING_TERMS = [
  /pattern/i,
  /\bcut\b/i,
  /\bfit\b/i,
  /fabric/i,
  /stitch/i,
  /seam/i,
  /measure/i,
  /tailor/i,
  /bespoke/i,
];
const TAILORING_MIN_HITS = 2;

/* ── Helpers ── */

function post(payload: object): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/fitting",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
      }
    );
    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy(new Error("Request timed out after 30s"));
    });
    req.write(data);
    req.end();
  });
}

function isValidLayer(layer: unknown): layer is BlueprintLayer {
  if (!layer || typeof layer !== "object") return false;
  const l = layer as Record<string, unknown>;
  return typeof l.name === "string" && l.name.length > 0 &&
         typeof l.detail === "string" && l.detail.length > 0;
}

function validate(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Response is not an object"] };
  }

  const d = data as Record<string, unknown>;

  // Required string fields
  for (const field of ["measurement", "recommended_pattern", "estimated_construction", "fabric"]) {
    if (typeof d[field] !== "string" || (d[field] as string).trim().length === 0) {
      errors.push(`Field "${field}" is missing or empty`);
    }
  }

  // cut array: 3-4 non-empty strings
  if (!Array.isArray(d.cut)) {
    errors.push("Field \"cut\" is not an array");
  } else {
    if (d.cut.length < 3 || d.cut.length > 4) {
      errors.push(`Field "cut" has ${d.cut.length} items (expected 3-4)`);
    }
    d.cut.forEach((item, i) => {
      if (typeof item !== "string" || item.trim().length === 0) {
        errors.push(`cut[${i}] is empty or not a string`);
      }
    });
  }

  // blueprint layers
  if (!d.blueprint || typeof d.blueprint !== "object") {
    errors.push("Field \"blueprint\" is missing");
  } else {
    const bp = d.blueprint as Record<string, unknown>;
    for (const key of ["layer_1", "layer_2", "layer_3", "layer_4"]) {
      if (!isValidLayer(bp[key])) {
        errors.push(`blueprint.${key} is missing or invalid`);
      }
    }
  }

  // Tailoring vocabulary: check across all string content
  const allText = JSON.stringify(data);
  const hits = TAILORING_TERMS.filter((re) => re.test(allText)).length;
  if (hits < TAILORING_MIN_HITS) {
    errors.push(`Tailoring vocabulary too thin: ${hits}/${TAILORING_MIN_HITS} terms found`);
  }

  return { valid: errors.length === 0, errors };
}

/* ── Runner ── */

async function runEval() {
  console.log("\nFITTING ROOM EVAL\n" + "=".repeat(60));

  const results: { label: string; pass: boolean; ms: number; errors: string[] }[] = [];

  for (const fixture of FIXTURES) {
    process.stdout.write(`  ${fixture.label.padEnd(45)} `);
    const start = Date.now();

    try {
      const { status, body } = await post({
        industry: fixture.industry,
        teamSize: fixture.teamSize,
        bottleneck: fixture.bottleneck,
      });

      const ms = Date.now() - start;

      if (status !== 200) {
        const msg = `HTTP ${status}: ${body.slice(0, 120)}`;
        console.log(`FAIL  (${ms}ms)`);
        results.push({ label: fixture.label, pass: false, ms, errors: [msg] });
        continue;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(body);
      } catch {
        console.log(`FAIL  (${ms}ms)`);
        results.push({ label: fixture.label, pass: false, ms, errors: ["Response is not valid JSON"] });
        continue;
      }

      const { valid, errors } = validate(parsed);

      if (valid) {
        console.log(`PASS  (${ms}ms)`);
        results.push({ label: fixture.label, pass: true, ms, errors: [] });
      } else {
        console.log(`FAIL  (${ms}ms)`);
        results.push({ label: fixture.label, pass: false, ms, errors });
      }
    } catch (err) {
      const ms = Date.now() - start;
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`ERROR (${ms}ms)`);
      results.push({ label: fixture.label, pass: false, ms, errors: [msg] });
    }
  }

  // Summary
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  const avgMs = Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length);

  console.log("\n" + "=".repeat(60));
  console.log(`RESULTS: ${passed}/${results.length} passed  |  avg latency: ${avgMs}ms`);

  if (failed > 0) {
    console.log("\nFAILURES:");
    for (const r of results.filter((r) => !r.pass)) {
      console.log(`  ✗ ${r.label}`);
      for (const e of r.errors) {
        console.log(`      → ${e}`);
      }
    }
    console.log("");
    process.exit(1);
  }

  console.log("\nAll fixtures passed.\n");
}

runEval().catch((err) => {
  console.error("Eval harness error:", err);
  process.exit(1);
});
