import { NextResponse } from "next/server";
import { OASIS_UPDATE_MARKER, type OasisFeedUpdate } from "@/lib/chat-types";

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

export async function POST(req: Request) {
  try {
    const { messages, userContext } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const lastUserMsg =
      [...messages].reverse().find((m: { role: string }) => m.role === "user")?.content || "";

    if (!apiKey) {
      const mockReply = getMockReply(lastUserMsg, userContext);
      return NextResponse.json(mockReply);
    }

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
      userContext?.interests?.length > 0
        ? `Active interests: ${userContext.interests.join(", ")}.`
        : "";

    const marketsContext =
      userContext?.internationalMarkets?.length > 0
        ? `Tracking markets: ${userContext.internationalMarkets.join(", ")}.`
        : "";

    const systemInstruction = `
You are Oasis, an institutional-grade AI assistant embedded in a market intelligence platform. Behave like ChatGPT or Gemini: helpful, conversational, and analytically sharp.

PERSONALITY: Authoritative, concise, insightful. Use headers or bullets for complex answers.

CONTEXT:
- Date: ${today}
- User: ${userContext?.name || "Analyst"}
${locationContext}
${interestsContext}
${marketsContext}

PERSONALIZATION: When the user asks to add topics, change their feed, focus on regions/markets, or personalize content (e.g. "add AI roll-ups", "show Japanese market news", "I'm in London now"), you MUST append this exact block at the END of your response (after your natural reply):
<!--OASIS_UPDATE:{"addInterests":["topic1"],"addMarkets":["Japan"],"location":"London"}-->
Only include fields that should change. Use addInterests for new topics. Valid markets: USA, Japan, Europe, Emerging Markets, Middle East, China.

Always ground answers in real market knowledge. Be honest about uncertainty on very recent events.
    `.trim();

    const geminiMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Gemini API failure");
    }

    const data = await response.json();
    const rawText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate a response. Please try again.";

    const { cleanText, updates } = parseFeedUpdate(rawText);
    return NextResponse.json({ text: cleanText, updates });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("CHAT API ERROR:", message);
    return NextResponse.json(
      { error: "Failed to generate response.", details: message },
      { status: 500 }
    );
  }
}

function getMockReply(
  userMsg: string,
  userContext?: {
    name?: string;
    interests?: string[];
    location?: string;
  }
): { text: string; updates?: OasisFeedUpdate } {
  const lower = userMsg.toLowerCase();
  const updates: OasisFeedUpdate = {};

  if (
    lower.includes("add") ||
    lower.includes("include") ||
    lower.includes("personalize") ||
    lower.includes("focus on")
  ) {
    if (lower.includes("ai roll") || lower.includes("roll-up") || lower.includes("rollup")) {
      updates.addInterests = ["AI-enabled roll-ups"];
    }
    if (lower.includes("japan")) {
      updates.addInterests = [...(updates.addInterests || []), "Japan Markets"];
      updates.addMarkets = ["Japan"];
    }
    if (lower.includes("japanese market")) {
      updates.addMarkets = ["Japan"];
    }
  }

  const hasUpdates = Object.keys(updates).length > 0;
  const text = hasUpdates
    ? `Done — I've updated your feed${userContext?.name ? `, ${userContext.name}` : ""}. Your dashboard and signals will refresh with the new topics.`
    : `I'm Oasis${userContext?.name ? `, ${userContext.name}'s` : ""} intelligence assistant. Ask me about markets, deals, or say "add AI roll-ups to my feed" to personalize in real time. Configure GEMINI_API_KEY for full AI capabilities.`;

  return hasUpdates ? { text, updates } : { text };
}
