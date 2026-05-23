import { GoogleGenerativeAI, type Content } from "@google/generative-ai";

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"] as const;

export function getGeminiApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key || undefined;
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

export function normalizeChatHistory(
  messages: Array<{ role: string; content: string }>
): Content[] {
  const mapped: Content[] = [];

  for (const msg of messages) {
    const text = msg.content?.trim();
    if (!text) continue;
    const role = msg.role === "ai" || msg.role === "model" ? "model" : "user";
    mapped.push({ role, parts: [{ text }] });
  }

  while (mapped.length > 0 && mapped[0].role === "model") {
    mapped.shift();
  }

  const merged: Content[] = [];
  for (const msg of mapped) {
    const last = merged[merged.length - 1];
    if (last && last.role === msg.role) {
      const prev = last.parts[0];
      if ("text" in prev) {
        prev.text = `${prev.text}\n\n${(msg.parts[0] as { text: string }).text}`;
      }
      continue;
    }
    merged.push(msg);
  }

  if (merged.length > 0 && merged[merged.length - 1].role === "model") {
    merged.pop();
  }

  return merged;
}

export async function generateGeminiReply(
  systemInstruction: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_NOT_CONFIGURED");
  }

  const contents = normalizeChatHistory(messages);
  if (contents.length === 0) {
    throw new Error("No messages to send");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: Error | null = null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });
      const result = await model.generateContent({ contents });
      const text = result.response.text();
      if (text?.trim()) return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[Gemini] ${modelName} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("All Gemini models failed");
}
