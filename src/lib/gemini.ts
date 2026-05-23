import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { GoogleGenerativeAI, type Content } from "@google/generative-ai";

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"] as const;

let resolvedKey: string | undefined;

/** Resolve API key from process.env, then .env.local (dev), then .env */
function resolveGeminiApiKey(): string | undefined {
  if (resolvedKey) return resolvedKey;

  const fromEnv = process.env.GEMINI_API_KEY?.trim();
  if (fromEnv) {
    resolvedKey = fromEnv;
    return resolvedKey;
  }

  for (const filename of [".env.local", ".env"]) {
    try {
      const envPath = join(process.cwd(), filename);
      if (!existsSync(envPath)) continue;
      const text = readFileSync(envPath, "utf8");
      for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        if (key === "GEMINI_API_KEY" && value) {
          resolvedKey = value;
          process.env.GEMINI_API_KEY = value;
          return resolvedKey;
        }
      }
    } catch {
      // continue
    }
  }

  return undefined;
}

export function getGeminiApiKey(): string | undefined {
  return resolveGeminiApiKey();
}

export function isGeminiConfigured(): boolean {
  return Boolean(resolveGeminiApiKey());
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
  const apiKey = resolveGeminiApiKey();
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
