// POST /api/rationale: asks Claude to explain a decision (docs/03-architecture.md §8).
// Consultant view only. The API key is read here and never sent to the browser.

import Anthropic from "@anthropic-ai/sdk"
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod"
import { aiRationaleSchema, buildUserMessage, cleanRationale, MODEL, notesTryToSetOutcome, rationaleRequestSchema, SYSTEM_PROMPT } from "@/lib/ai/rationale"
import { evaluate } from "@/lib/rules/evaluate"

const UNAVAILABLE = { error: "rationale unavailable" }

// Simple per-IP limit: 5 requests per minute. In memory, so best effort on serverless.
const WINDOW_MS = 60_000
const LIMIT = 5
const hits = new Map<string, number[]>()
function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > LIMIT
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
  if (rateLimited(ip)) return Response.json({ error: "Too many requests. Try again later." }, { status: 429 })

  const body = await request.json().catch(() => null)
  const parsed = rationaleRequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 })
  }
  const req = parsed.data

  // Recompute on the server so the browser can't send a different outcome.
  const decision = evaluate({ ...req, role: "consultant" })
  const notesWarning = notesTryToSetOutcome(req.notes)

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set")
    return Response.json({ ...UNAVAILABLE, outcome: decision.outcome, notesWarning }, { status: 503 })
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 45_000, maxRetries: 1 })
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default", // if a safety classifier declines, retry on Anthropic's recommended fallback model
      output_config: { effort: "medium", format: betaZodOutputFormat(aiRationaleSchema) },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(req, decision) }],
    })

    if (response.stop_reason === "refusal") {
      return Response.json({ ...UNAVAILABLE, outcome: decision.outcome, notesWarning }, { status: 502 })
    }
    const rationale = cleanRationale(response.parsed_output)
    if (!rationale) return Response.json({ ...UNAVAILABLE, outcome: decision.outcome, notesWarning }, { status: 502 })

    return Response.json({ rationale, outcome: decision.outcome, notesWarning })
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) console.error("Claude rate limit")
    else if (error instanceof Anthropic.APIError) console.error(`Claude API error ${error.status}: ${error.message}`)
    else console.error("Rationale request failed")
    return Response.json({ ...UNAVAILABLE, outcome: decision.outcome, notesWarning }, { status: 502 })
  }
}
