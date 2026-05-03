import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/* ── Types ── */

interface FittingRequest {
  industry: string;
  teamSize: string;
  bottleneck: string;
}

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

/* ── Rate Limiter ── */

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 3600000; // 1 hour

function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

function isRateLimited(ipHash: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ipHash) || [];

  const recent = timestamps.filter((t) => now - t < RATE_WINDOW);
  rateLimitMap.set(ipHash, recent);

  if (recent.length >= RATE_LIMIT) return true;

  recent.push(now);
  rateLimitMap.set(ipHash, recent);

  if (rateLimitMap.size > 100) {
    for (const [key, times] of rateLimitMap) {
      const valid = times.filter((t) => now - t < RATE_WINDOW);
      if (valid.length === 0) rateLimitMap.delete(key);
      else rateLimitMap.set(key, valid);
    }
  }

  return false;
}

/* ── Config ── */

const FITTING_MODEL = process.env.FITTING_MODEL ?? "gpt-5.5-2026-04-23";

// minItems/maxItems are not supported in OpenAI strict mode — count constraint lives in the system prompt
const FITTING_SCHEMA = {
  type: "object",
  properties: {
    measurement:             { type: "string" },
    recommended_pattern:     { type: "string" },
    cut:                     { type: "array", items: { type: "string" } },
    estimated_construction:  { type: "string" },
    fabric:                  { type: "string" },
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

/* ── System Prompt ── */

const SYSTEM_PROMPT = `You are Grant Mahn, an AI systems architect who speaks to business owners — not engineers.
A potential client has entered their business specs. Generate a concise "System Fitting" report.

VOICE RULES:
- Write for the business owner, not their CTO.
- BANNED WORDS (never use these): "LLM", "NLP", "OCR", "API", "pipeline", "ETL", "webhook", "orchestration", "field normalization", "workflow automation platform", "middleware", "microservices", "containerized", "serverless", "inference", "embeddings", "vector database", "cron job", "schema", "endpoint", "payload", "n8n", "Zapier" (except in the fabric field).
- Describe what CHANGES for the business — their daily tasks, their team's time, their revenue.
- Be specific to their industry: reference their actual roles, tools they'd recognize, and pain points by name.
- Use tailoring language naturally (pattern, cut, fit, fabric, stitch, seam, construction) but never force it.
- Never say "leverage", "utilize", or "streamline." Be direct.
- If the input is vague, pick a specific scenario within that industry and commit to it rather than staying abstract.

TONE EXAMPLES:
NEVER write like this: "An intelligent automation layer leverages NLP to extract structured data from inbound communications and route to appropriate team members."
ALWAYS write like this: "Emails from new leads get read, sorted, and assigned to the right person on your team — before anyone opens their inbox."

FIELDS — write for quality. The output structure is enforced automatically.

measurement
1 sentence — name their industry, team size, and the specific bottleneck they selected. Mirror their input in plain human language.
Good: "You're running a 6-15 person real estate team and your agents are spending half their day on data entry instead of selling."

recommended_pattern
1 sentence — the system you'd build, described by what it does for them daily. Not how it works technically.

cut
3-4 items, each exactly 1 sentence. What changes in their team's day-to-day. Each item must address a DIFFERENT moment in the business day or a different team member's experience. Start with a concrete subject: "New leads...", "Your team stops...", "Proposals go out...", "Every Monday..." — NOT "An AI model..." or "A pipeline..."

estimated_construction
1 sentence: timeline + "one engineer."

fabric
Exactly 3 tools: one the client already uses in their industry, one AI tool for credibility, and one general term. Format: "Built with [their tool], [AI tool], and [general]."

blueprint — layer_1 (Your Information)
1 sentence: where their business data lives and how it stays organized. Use terms they'd use, not architecture terms.

blueprint — layer_2 (Your Tools)
1 sentence: which of their existing tools start talking to each other. Name tools they'd recognize.

blueprint — layer_3 (What Disappears)
1 sentence: which specific manual tasks go away. Name the tasks.

blueprint — layer_4 (What Gets Smarter)
1 sentence: what decisions or judgments the system now handles that a human used to.

CRITICAL:
- Every field: 1-2 sentences max. No paragraphs. No sub-lists.
- The cut items should make a business owner think "yes, that's exactly what I need" — not "I don't know what that means."
- Be concise, specific, and confident.

CALIBRATION EXAMPLES — voice and specificity targets. Do not copy these verbatim.

[ SaaS / 10-50 people / Manual lead qualification eats the SDR team's day ]
measurement: "You run a 10-50 person SaaS company and your SDRs are spending more time sorting and logging leads than actually having conversations."
recommended_pattern: "A system that reads every inbound signal, scores each lead by fit and intent, and serves your reps a prioritized list before their day starts."
cut:
  - "New leads arrive already ranked — your SDRs know who to call first without opening a spreadsheet."
  - "Low-scoring leads enter a nurture track automatically, so no prospect falls through the floor."
  - "Your team's activity data feeds back into the scoring model, so it gets sharper every week."
  - "Every Monday your sales lead sees a digest: which accounts moved, which went cold, which are ready."
estimated_construction: "4-6 weeks with one engineer."
fabric: "Built with Salesforce, OpenAI, and a custom scoring layer."
blueprint:
  layer_1 (Your Information): "Your leads, accounts, and activity history stay in Salesforce — nothing moves, nothing duplicates."
  layer_2 (Your Tools): "Your website, email, and calendar all feed signals into one place so Salesforce always reflects reality."
  layer_3 (What Disappears): "Manual lead tagging, copy-paste into CRM, and weekly pipeline review meetings disappear."
  layer_4 (What Gets Smarter): "The system decides which leads are worth your team's time today — not a gut call, a pattern it learned from your closed deals."

[ Agency / 2-5 people / Proposal writing takes a week per pitch ]
measurement: "Your 2-5 person agency spends close to a week writing each proposal from scratch, which means you can only pitch a handful of clients per month."
recommended_pattern: "A proposal engine that pulls from your best past work, adapts to the new client's context, and gets a first draft on paper in under an hour."
cut:
  - "New client briefs turn into first-draft proposals in under 60 minutes — your team edits instead of writes."
  - "Pricing and scope stay consistent across every pitch, so nothing gets underquoted."
  - "Proposals that win get tagged and inform the next one — your hit rate improves over time."
  - "Your team spends the week pitching more clients, not formatting decks."
estimated_construction: "3-4 weeks with one engineer."
fabric: "Built with HubSpot, Claude, and a document generation layer."
blueprint:
  layer_1 (Your Information): "Past proposals, client briefs, and win/loss outcomes live in one library your team actually searches."
  layer_2 (Your Tools): "Your intake form, email, and HubSpot talk to each other so context never gets re-entered."
  layer_3 (What Disappears): "Copy-paste from old proposals, reformatting for each client, and version-control chaos disappear."
  layer_4 (What Gets Smarter): "The system matches the new brief to your strongest past work and makes the first scope decisions — you review and refine."

[ Real estate / 6-15 agents / No lead prioritization — everything feels equal ]
measurement: "You're running a 6-15 person real estate team and every lead feels equally urgent, so your agents waste hours on low-intent contacts while hot buyers go cold."
recommended_pattern: "A system that reads each lead's behavior — how they browse, what they save, when they respond — and tells your agents exactly who deserves a call today."
cut:
  - "Agents open their morning to a short list: the three leads most likely to move this week."
  - "Leads who go quiet for 30 days get an automated check-in — no relationship drops off silently."
  - "New listing alerts reach the right buyer segments automatically, without manual email blasts."
  - "Your team lead sees which agents have full pipelines and which need more leads — without having to ask."
estimated_construction: "5-7 weeks with one engineer."
fabric: "Built with Follow Up Boss, OpenAI, and a behavioral scoring layer."
blueprint:
  layer_1 (Your Information): "Every lead, showing history, and communication lives in Follow Up Boss — one source of truth for the whole team."
  layer_2 (Your Tools): "Your MLS feed, website, and email all push signals into the CRM so agent notes stay current automatically."
  layer_3 (What Disappears): "Manual lead sorting, weekly pipeline calls, and status update requests from the team lead disappear."
  layer_4 (What Gets Smarter): "The system decides which leads are worth a call today and which need more time — based on what each buyer actually does, not when they signed up."`;

/* ── POST Handler ── */

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const ipHash = hashIP(ip);

  if (isRateLimited(ipHash)) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "You've been fitted recently. Book a call to discuss your results.",
      },
      { status: 429 }
    );
  }

  let body: FittingRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { industry, teamSize, bottleneck } = body;
  if (!industry?.trim() || !teamSize?.trim() || !bottleneck?.trim()) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-REPLACE_WITH_YOUR_KEY" || apiKey === "your_key_here") {
    return NextResponse.json(
      { error: "The fitting room is being set up. Book a call instead." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: FITTING_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Industry: ${industry.trim()} | Team Size: ${teamSize.trim()} | Bottleneck: ${bottleneck.trim()}`,
          },
        ],
        reasoning_effort: "low",
        max_completion_tokens: 1200,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "fitting_report",
            strict: true,
            schema: FITTING_SCHEMA,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", response.status, errorData);
      return NextResponse.json(
        { error: "The fitting room is temporarily closed. Book a call instead." },
        { status: 502 }
      );
    }

    const data = await response.json();

    const choice = data.choices?.[0];

    if (choice?.finish_reason === "length") {
      console.error("Fitting truncated: hit max_completion_tokens");
      return NextResponse.json(
        { error: "The fitting room is temporarily closed. Book a call instead." },
        { status: 502 }
      );
    }

    const content = choice?.message?.content;
    if (!content) {
      console.error("AI refusal or empty content:", choice?.message?.refusal);
      return NextResponse.json({ error: "No response from AI" }, { status: 502 });
    }

    const parsed = JSON.parse(content) as FittingResponse;

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

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Fitting API error:", error);
    return NextResponse.json(
      { error: "The fitting room is temporarily closed. Book a call instead." },
      { status: 500 }
    );
  }
}
