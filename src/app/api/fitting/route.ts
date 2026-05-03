import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { DEFAULT_FITTING_MODEL, FITTING_SCHEMA, SYSTEM_PROMPT } from "./config";

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

const FITTING_MODEL = process.env.FITTING_MODEL ?? DEFAULT_FITTING_MODEL;

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
