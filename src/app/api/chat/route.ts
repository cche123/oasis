export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { OASIS_UPDATE_MARKER, type OasisFeedUpdate } from "@/lib/chat-types";
import { generateGeminiReply, isGeminiConfigured } from "@/lib/gemini";
import { loadOasisEnv } from "@/lib/load-env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

loadOasisEnv();

function parseFeedUpdate(text: string): { cleanText: string; updates?: OasisFeedUpdate } {
  const match = OASIS_UPDATE_MARKER.exec(text);
  if (!match) return { cleanText: text.trim() };

  try {
    const updates = JSON.parse(match[1]) as OasisFeedUpdate;
    const cleanText = text.replace(OASIS_UPDATE_MARKER, "").trim();
    return { cleanText, updates };
  } catch {
    return { cleanText: text.replace(OASIS_UPDATE_MARKER, "").trim() };
  }
}

function buildSystemInstruction(userContext?: {
  name?: string;
  interests?: string[];
  location?: string;
  resolvedLocation?: { valid?: boolean; displayName?: string; country?: string };
  internationalMarkets?: string[];
}): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const loc = userContext?.resolvedLocation;
  const locationContext = loc?.valid
    ? `The user is based in ${loc.displayName} (${loc.country}). Tailor analysis to their regional market.`
    : userContext?.location
      ? `The user entered "${userContext.location}" but it could not be verified. Use general US/global context unless they clarify.`
      : "";

  const interestsContext =
    (userContext?.interests?.length ?? 0) > 0
      ? `Active interests: ${userContext!.interests!.join(", ")}.`
      : "";

  const marketsContext =
    (userContext?.internationalMarkets?.length ?? 0) > 0
      ? `Tracking markets: ${userContext!.internationalMarkets!.join(", ")}.`
      : "";

  return `
You are Oasis, an institutional-grade AI assistant embedded in a market intelligence platform. Respond like ChatGPT or Google Gemini: natural, helpful, conversational, and sharp on markets.

RULES:
- Answer the user's actual question directly (greetings get a friendly greeting back).
- Use markdown bullets or short headers when helpful.
- Be concise unless they ask for depth.

CONTEXT:
- Date: ${today}
- User: ${userContext?.name || "Analyst"}
${locationContext}
${interestsContext}
${marketsContext}

PERSONALIZATION: If the user asks to add topics, change their feed, or focus regions (e.g. "add AI roll-ups", "focus on Japan"), append at the END of your reply:
<!--OASIS_UPDATE:{"addInterests":["topic"],"addMarkets":["Japan"],"location":"London"}-->
Only include fields that change. Valid markets: USA, India, China, Japan, Europe, Singapore, Emerging Markets, Middle East.
  `.trim();
}

export async function POST(req: Request) {
  let body: { messages?: unknown[]; userContext?: Record<string, unknown> } = {};

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const chatMessages = (body.messages ?? []).filter(
    (m): m is { role: string; content: string } =>
      typeof m === "object" &&
      m !== null &&
      "content" in m &&
      typeof (m as { content: unknown }).content === "string" &&
      Boolean((m as { content: string }).content.trim())
  );

  if (!isGeminiConfigured()) {
    return NextResponse.json(
      {
        error: "AI_NOT_CONFIGURED",
        text: "Oasis AI could not find GEMINI_API_KEY. Put your key in `.env.local` (recommended) or `.env.example`, then restart with `npm run dev`. On Vercel, add GEMINI_API_KEY under Project → Settings → Environment Variables and redeploy.",
        ai: false,
      },
      { status: 503 }
    );
  }

  try {
    const systemInstruction = buildSystemInstruction(
      body.userContext as Parameters<typeof buildSystemInstruction>[0]
    );
    const rawText = await generateGeminiReply(systemInstruction, chatMessages);
    const { cleanText, updates } = parseFeedUpdate(rawText);

    return NextResponse.json({
      text: cleanText || "I couldn't generate a response. Please try again.",
      updates,
      ai: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("CHAT API ERROR:", message);
    return NextResponse.json(
      {
        error: "AI_FAILED",
        text: `I hit an error talking to Gemini: ${message}. Please try again.`,
        details: message,
        ai: false,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const configured = isGeminiConfigured();
  return NextResponse.json({
    configured,
    status: configured ? "ready" : "missing_key",
  });
}
