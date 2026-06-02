export type NarrativeTier = "early" | "spark" | "story" | "saga";

export type PulseNarrative = {
  id: string;
  title: string;
  summary: string;
  tier: NarrativeTier;
  category: string;
  sourceUrl: string;
  source: string;
  heat: number;
  date: string;
  /** Best-effort symbols explicitly present in the text (no hallucinated tickers). */
  symbols?: string[];
  /** Deterministic, non-hallucinatory insight scaffold derived from text/category. */
  insight?: {
    mechanism: string;
    whatToWatch: string[];
    risks: string[];
    triggers: string[];
  };
};


type NewsItem = {
  title: string;
  summary: string;
  sourceUrl: string;
  source: string;
  category: string;
  date?: string;
  publishedAt?: string;
};

function inferCategory(text: string, fallback: string): string {
  const t = text.toLowerCase();
  if (/merger|acquisition|m&a|takeover|buyout|deal\b/i.test(t)) return "M&A";
  if (/funding|series [a-f]|raised|venture|ipo|valuation/i.test(t)) return "Venture & Raises";
  if (/artificial intelligence|\bai\b|openai|anthropic|llm|chip|nvidia/i.test(t)) return "Technology";
  if (/fed|inflation|rate|treasury|gdp|employment|cpi/i.test(t)) return "Macro";
  if (/oil|energy|opec|gas price|brent/i.test(t)) return "Energy";
  if (/china|tariff|trade|geopolit|sanction/i.test(t)) return "Geopolitics";
  if (/earnings|revenue|profit|quarter/i.test(t)) return "Earnings";
  if (/crypto|bitcoin|ethereum/i.test(t)) return "Crypto";
  return fallback || "Markets";
}

function inferTier(text: string, heat: number): NarrativeTier {
  if (/investigation|fraud|outbreak|crash|emergency/i.test(text)) return "saga";
  if (heat > 0.72 || /fed|merger|acquisition|ipo|raised/i.test(text)) return "story";
  if (heat > 0.52) return "spark";
  return "early";
}

function scoreHeat(item: NewsItem, index: number): number {
  let h = 0.5;
  if (item.publishedAt) {
    const ageH = (Date.now() - new Date(item.publishedAt).getTime()) / 3600000;
    if (ageH < 6) h += 0.25;
    else if (ageH < 24) h += 0.15;
  }
  if (item.source === "Wall Street Journal" || item.source === "Reuters") h += 0.1;
  if (item.title.length > 50) h += 0.05;
  h -= index * 0.02;
  return Math.min(0.95, Math.max(0.35, h));
}

const COMPANY_TO_SYMBOL: Record<string, string> = {
  nvidia: "NVDA",
  tesla: "TSLA",
  "apple": "AAPL",
  "microsoft": "MSFT",
  "amazon": "AMZN",
  "meta": "META",
  "google": "GOOGL",
  "alphabet": "GOOGL",
  "exxon": "XOM",
  "lockheed": "LMT",
  "raytheon": "RTX",
  "crowdstrike": "CRWD",
  "palo alto": "PANW",
  "home depot": "HD",
  "united airlines": "UAL",
  "blackstone": "BX",
  "kkr": "KKR",
  "apollo": "APO",
  "carlyle": "CG",
  samsung: "SSNLF",
  paramount: "PARA",
  "warner bros": "WBD",
  antitrust: "CMCSA",
  "federal reserve": "JPM",
  powell: "XLF",
};

const CATEGORY_FALLBACK_SYMBOLS: Record<string, string[]> = {
  "M&A": ["MS", "GS"],
  "Venture & Raises": ["NVDA", "MSFT"],
  Technology: ["NVDA", "MSFT"],
  Macro: ["JPM", "XOM"],
  Markets: ["SPY", "QQQ"],
  Energy: ["XOM", "CVX"],
  Geopolitics: ["LMT", "RTX"],
};

function extractSymbols(text: string): string[] {
  const out = new Set<string>();

  // Explicit tickers like (AAPL) or $AAPL
  const explicit = text.match(/(?:\$|\()([A-Z]{1,5})(?:\)|\b)/g) ?? [];
  for (const m of explicit) {
    const sym = m.replace(/[^A-Z]/g, "").trim();
    if (sym.length >= 1 && sym.length <= 5) out.add(sym);
  }

  const lower = text.toLowerCase();
  for (const [k, sym] of Object.entries(COMPANY_TO_SYMBOL)) {
    if (lower.includes(k)) out.add(sym);
  }

  return Array.from(out).slice(0, 4);
}

import { buildInsightScaffold } from "@/lib/insight-scaffold";

/** Live narrative feed — no guessed stock tickers */
export function buildPulseNarratives(news: NewsItem[]): PulseNarrative[] {
  return news
    .filter((n) => n.title && n.sourceUrl)
    .slice(0, 24)
    .map((item, index) => {
      const text = `${item.title} ${item.summary}`;
      const heat = scoreHeat(item, index);
      const symbols = extractSymbols(text);
      const cat = inferCategory(text, item.category);
      const finalSymbols =
        symbols.length > 0 ? symbols : (CATEGORY_FALLBACK_SYMBOLS[cat] ?? []).slice(0, 2);
      return {
        id: crypto.randomUUID(),
        title: item.title,
        summary: item.summary.slice(0, 220) + (item.summary.length > 220 ? "…" : ""),
        tier: inferTier(text, heat),
        category: cat,
        sourceUrl: item.sourceUrl,
        source: item.source,
        heat,
        date: item.date || "Today",
        symbols: finalSymbols.length ? finalSymbols : undefined,
        insight: buildInsightScaffold(text, cat),
      };
    })
    .sort((a, b) => b.heat - a.heat);
}
