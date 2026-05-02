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

  // Filter to last hour
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW);
  rateLimitMap.set(ipHash, recent);

  if (recent.length >= RATE_LIMIT) return true;

  recent.push(now);
  rateLimitMap.set(ipHash, recent);

  // Cleanup stale entries periodically
  if (rateLimitMap.size > 100) {
    for (const [key, times] of rateLimitMap) {
      const valid = times.filter((t) => now - t < RATE_WINDOW);
      if (valid.length === 0) rateLimitMap.delete(key);
      else rateLimitMap.set(key, valid);
    }
  }

  return false;
}

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

Respond in ONLY valid JSON:

{
  "measurement": "1 sentence that names their industry, team size, and the specific bottleneck they selected — mirror their input back in plain human language. Example: 'You're running a 6-15 person real estate team and your agents are spending half their day on data entry instead of selling.'",
  "recommended_pattern": "1 sentence: the system you'd build, described by what it does for them daily — not how it works technically",
  "cut": ["3-4 items, each 1 sentence — what changes in their team's day-to-day. Each item must address a DIFFERENT moment in the business day or a different team member's experience. Start with a concrete subject: 'New leads...', 'Your team stops...', 'Proposals go out...', 'Every Monday...' — NOT 'An AI model...' or 'A pipeline...'"],
  "estimated_construction": "timeline + 'one engineer' — 1 sentence",
  "fabric": "Exactly 3 tools: one the client already uses in their industry, one AI tool for credibility, and one general term. Format: 'Built with [their tool], [AI tool], and [general].' — 1 sentence.",
  "blueprint": {
    "layer_1": { "name": "Your Information", "detail": "1 sentence: where their business data lives and how it stays organized — use terms they'd use, not architecture terms" },
    "layer_2": { "name": "Your Tools", "detail": "1 sentence: which of their existing tools start talking to each other — name the tools they'd recognize" },
    "layer_3": { "name": "What Disappears", "detail": "1 sentence: what specific manual tasks go away — name the tasks" },
    "layer_4": { "name": "What Gets Smarter", "detail": "1 sentence: what decisions or judgments the system now handles that a human used to" }
  }
}

CRITICAL:
- Every field: 1-2 sentences max. No paragraphs. No sub-lists.
- The "cut" items should make a business owner think "yes, that's exactly what I need" — not "I don't know what that means."
- Be concise, specific, and confident.`;

/* ── JSON Parsing ── */

function parseAIResponse(text: string): FittingResponse | null {
  // Try 1: Direct parse
  try {
    return JSON.parse(text);
  } catch {}

  // Try 2: Extract from markdown fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {}
  }

  // Try 3: Find bare JSON object
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch {}
  }

  return null;
}

function validateResponse(data: unknown): data is FittingResponse {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.measurement === "string" &&
    typeof d.recommended_pattern === "string" &&
    Array.isArray(d.cut) &&
    typeof d.estimated_construction === "string" &&
    typeof d.fabric === "string" &&
    d.blueprint !== null &&
    typeof d.blueprint === "object"
  );
}

/* ── Data Logging ── */

function logFitting(
  input: FittingRequest,
  output: FittingResponse,
  ipHash: string,
  userAgent: string | null
) {
  try {
    const record = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      input,
      output,
      metadata: { ipHash, userAgent },
    };
    console.log("[FITTING_LOG]", JSON.stringify(record));
  } catch {
    // Logging failure must never affect the response
  }
}

/* ── POST Handler ── */

export async function POST(request: NextRequest) {
  // Extract and hash IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const ipHash = hashIP(ip);

  // Rate limit check
  if (isRateLimited(ipHash)) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message:
          "You've been fitted recently. Book a call to discuss your results.",
      },
      { status: 429 }
    );
  }

  // Parse and validate input
  let body: FittingRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { industry, teamSize, bottleneck } = body;
  if (
    !industry?.trim() ||
    !teamSize?.trim() ||
    !bottleneck?.trim()
  ) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-REPLACE_WITH_YOUR_KEY" || apiKey === "your_key_here") {
    return NextResponse.json(
      { error: "The fitting room is being set up. Book a call instead." },
      { status: 503 }
    );
  }

  // Call OpenAI
  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-5.4",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Industry: ${industry.trim()} | Team Size: ${teamSize.trim()} | Bottleneck: ${bottleneck.trim()}`,
            },
          ],
          temperature: 0.7,
          max_completion_tokens: 800,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", response.status, errorData);
      return NextResponse.json(
        {
          error:
            "The fitting room is temporarily closed. Book a call instead.",
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 502 }
      );
    }

    const parsed = parseAIResponse(content);

    if (!parsed || !validateResponse(parsed)) {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json(
        { error: "Failed to generate your fitting. Please try again." },
        { status: 502 }
      );
    }

    // Log the fitting (fire and forget)
    const userAgent = request.headers.get("user-agent");
    logFitting({ industry, teamSize, bottleneck }, parsed, ipHash, userAgent);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Fitting API error:", error);
    return NextResponse.json(
      {
        error:
          "The fitting room is temporarily closed. Book a call instead.",
      },
      { status: 500 }
    );
  }
}
