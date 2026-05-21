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
};

type NewsItem = {
  title: string;
  summary: string;
  sourceUrl: string;
  source: string;
  category: string;
  date?: string;
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
  if (item.date?.includes("Just now") || item.date?.includes("hour")) h += 0.25;
  if (item.source === "Wall Street Journal" || item.source === "Reuters") h += 0.1;
  if (item.title.length > 50) h += 0.05;
  h -= index * 0.02;
  return Math.min(0.95, Math.max(0.35, h));
}

/** Live narrative feed — no guessed stock tickers */
export function buildPulseNarratives(news: NewsItem[]): PulseNarrative[] {
  return news
    .filter((n) => n.title && n.sourceUrl)
    .slice(0, 24)
    .map((item, index) => {
      const text = `${item.title} ${item.summary}`;
      const heat = scoreHeat(item, index);
      return {
        id: crypto.randomUUID(),
        title: item.title,
        summary: item.summary.slice(0, 220) + (item.summary.length > 220 ? "…" : ""),
        tier: inferTier(text, heat),
        category: inferCategory(text, item.category),
        sourceUrl: item.sourceUrl,
        source: item.source,
        heat,
        date: item.date || "Today",
      };
    })
    .sort((a, b) => b.heat - a.heat);
}
