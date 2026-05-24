export type RippleCategory =
  | "geopolitical"
  | "natural_disaster"
  | "energy"
  | "weather"
  | "macro"
  | "cyber";

export type ImpactDirection = "bullish" | "bearish";

export type MarketImpact = {
  ticker: string;
  name: string;
  direction: ImpactDirection;
  instrument: "call" | "put" | "equity" | "etf";
  thesis: string;
  confidence: "high" | "medium" | "low";
};

export type RippleAnalysis = {
  headline: string;
  category: RippleCategory;
  categoryLabel: string;
  summary: string;
  impacts: MarketImpact[];
  scannedAt: string;
};

type Rule = {
  category: RippleCategory;
  label: string;
  patterns: RegExp[];
  impacts: MarketImpact[];
};

const RULES: Rule[] = [
  {
    category: "geopolitical",
    label: "Geopolitical conflict",
    patterns: [
      /\b(war|conflict|invasion|strike|missile|military|sanctions|ceasefire|hostage|nato|iran|israel|gaza|ukraine|russia|taiwan strait)\b/i,
    ],
    impacts: [
      { ticker: "LMT", name: "Lockheed Martin", direction: "bullish", instrument: "call", thesis: "Defense spending and order backlog typically re-rate on conflict escalation.", confidence: "high" },
      { ticker: "RTX", name: "RTX Corp", direction: "bullish", instrument: "call", thesis: "Missile defense and aerospace demand rises with geopolitical tension.", confidence: "high" },
      { ticker: "XLE", name: "Energy Select SPDR", direction: "bullish", instrument: "call", thesis: "Middle East conflict often lifts oil risk premium and energy equities.", confidence: "medium" },
      { ticker: "JETS", name: "US Global Jets ETF", direction: "bearish", instrument: "put", thesis: "Air travel demand and airline margins compress on route disruption.", confidence: "medium" },
      { ticker: "GLD", name: "SPDR Gold", direction: "bullish", instrument: "call", thesis: "Flight-to-safety flows into gold on geopolitical shocks.", confidence: "medium" },
    ],
  },
  {
    category: "energy",
    label: "Energy shock",
    patterns: [
      /\b(oil|opec|gasoline|pipeline|refinery|brent|wti|crude|lng|natural gas|energy prices)\b/i,
    ],
    impacts: [
      { ticker: "XOM", name: "Exxon Mobil", direction: "bullish", instrument: "call", thesis: "Integrated majors benefit from higher crude realizations.", confidence: "high" },
      { ticker: "USO", name: "US Oil Fund", direction: "bullish", instrument: "call", thesis: "Direct crude exposure for short-term supply shocks.", confidence: "medium" },
      { ticker: "UAL", name: "United Airlines", direction: "bearish", instrument: "put", thesis: "Fuel is a major cost line; jet fuel spikes compress margins.", confidence: "high" },
    ],
  },
  {
    category: "natural_disaster",
    label: "Natural disaster",
    patterns: [
      /\b(earthquake|tsunami|volcano|wildfire|flood|hurricane|typhoon|cyclone|landslide)\b/i,
    ],
    impacts: [
      { ticker: "URI", name: "United Rentals", direction: "bullish", instrument: "call", thesis: "Reconstruction demand lifts equipment rental utilization.", confidence: "medium" },
      { ticker: "HD", name: "Home Depot", direction: "bullish", instrument: "call", thesis: "Repair and rebuild spending spikes after major disasters.", confidence: "medium" },
      { ticker: "ALL", name: "Allstate", direction: "bearish", instrument: "put", thesis: "Catastrophe losses hit P&C insurers near affected regions.", confidence: "high" },
      { ticker: "TRV", name: "Travelers", direction: "bearish", instrument: "put", thesis: "Commercial and personal lines face elevated claim severity.", confidence: "medium" },
    ],
  },
  {
    category: "weather",
    label: "Severe weather",
    patterns: [
      /\b(tornado|blizzard|heat wave|drought|freeze|storm|flooding|hail)\b/i,
    ],
    impacts: [
      { ticker: "ADM", name: "Archer-Daniels-Midland", direction: "bearish", instrument: "put", thesis: "Crop damage and transport disruption weigh on ag processors.", confidence: "medium" },
      { ticker: "UNG", name: "US Natural Gas Fund", direction: "bullish", instrument: "call", thesis: "Cold snaps and heat waves move gas demand and power prices.", confidence: "medium" },
    ],
  },
  {
    category: "macro",
    label: "Macro policy",
    patterns: [
      /\b(fed|rate cut|rate hike|inflation|cpi|jobs report|recession|tariff|stimulus|debt ceiling)\b/i,
    ],
    impacts: [
      { ticker: "TLT", name: "20+ Year Treasury", direction: "bullish", instrument: "call", thesis: "Rate-cut expectations lift long-duration bonds.", confidence: "medium" },
      { ticker: "XLF", name: "Financial Select", direction: "bearish", instrument: "put", thesis: "Higher-for-longer rates pressure bank margins and credit.", confidence: "medium" },
      { ticker: "QQQ", name: "Nasdaq 100", direction: "bullish", instrument: "call", thesis: "Growth multiples expand when rates fall and liquidity improves.", confidence: "medium" },
    ],
  },
  {
    category: "cyber",
    label: "Cyber / infrastructure",
    patterns: [
      /\b(cyberattack|ransomware|outage|grid failure|pipeline hack|data breach)\b/i,
    ],
    impacts: [
      { ticker: "CRWD", name: "CrowdStrike", direction: "bullish", instrument: "call", thesis: "High-profile breaches accelerate security budget allocation.", confidence: "high" },
      { ticker: "PANW", name: "Palo Alto Networks", direction: "bullish", instrument: "call", thesis: "Enterprise security spend rises after infrastructure incidents.", confidence: "medium" },
      { ticker: "CYBR", name: "WisdomTree Cyber", direction: "bullish", instrument: "etf", thesis: "Basket exposure to cybersec vendors on systemic risk events.", confidence: "medium" },
    ],
  },
];

const REGION_BOOSTS: Record<string, { pattern: RegExp; tickers: string[] }[]> = {
  USA: [
    { pattern: /\b(tornado|hurricane|gulf|texas|florida|california)\b/i, tickers: ["ALL", "HD", "URI"] },
    { pattern: /\b(fed|treasury|congress|white house)\b/i, tickers: ["TLT", "XLF", "SPY"] },
  ],
  "Middle East": [
    { pattern: /\b(israel|iran|gaza|red sea|hormuz|saudi|gulf)\b/i, tickers: ["XLE", "LMT", "GLD"] },
  ],
  Japan: [
    { pattern: /\b(japan|tokyo|osaka|typhoon|earthquake|nikkei)\b/i, tickers: ["EWJ", "TM"] },
  ],
};

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function classifyRipple(text: string): RippleCategory {
  const t = normalize(text);
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(t))) return rule.category;
  }
  return "macro";
}

export function analyzeRipple(
  headline: string,
  opts?: { region?: string; interests?: string[] }
): RippleAnalysis {
  const text = headline.trim();
  const t = normalize(text);
  const rule =
    RULES.find((r) => r.patterns.some((p) => p.test(t))) ??
    RULES.find((r) => r.category === "macro")!;

  const impactsMap = new Map<string, MarketImpact>();
  for (const impact of rule.impacts) {
    impactsMap.set(impact.ticker, { ...impact });
  }

  const regionRules = REGION_BOOSTS[opts?.region ?? ""] ?? [];
  for (const boost of regionRules) {
    if (boost.pattern.test(t)) {
      for (const ticker of boost.tickers) {
        const existing = impactsMap.get(ticker);
        if (existing && existing.confidence === "medium") {
          impactsMap.set(ticker, { ...existing, confidence: "high" });
        }
      }
    }
  }

  if (opts?.interests?.length) {
    for (const interest of opts.interests) {
      const i = interest.toLowerCase();
      if (i.includes("defense") && impactsMap.has("LMT")) {
        const x = impactsMap.get("LMT")!;
        impactsMap.set("LMT", { ...x, confidence: "high" });
      }
      if (i.includes("energy") && impactsMap.has("XLE")) {
        const x = impactsMap.get("XLE")!;
        impactsMap.set("XLE", { ...x, confidence: "high" });
      }
    }
  }

  const impacts = Array.from(impactsMap.values()).slice(0, 6);

  return {
    headline: text,
    category: rule.category,
    categoryLabel: rule.label,
    summary: buildSummary(rule.category, text),
    impacts,
    scannedAt: new Date().toISOString(),
  };
}

function buildSummary(category: RippleCategory, headline: string): string {
  const base: Record<RippleCategory, string> = {
    geopolitical: "Conflict and sanctions reprice defense, energy, and safe-haven assets.",
    natural_disaster: "Physical damage shifts capital toward rebuild plays and away from regional insurers.",
    energy: "Supply disruptions flow through crude, refiners, airlines, and transport.",
    weather: "Extreme weather hits crops, utilities, and regional consumption patterns.",
    macro: "Policy and growth signals move rates, banks, and growth vs. value.",
    cyber: "Infrastructure breaches pull forward cybersecurity and resilience spending.",
  };
  return `${base[category]} Scanned: "${headline.slice(0, 120)}${headline.length > 120 ? "…" : ""}"`;
}

export const MACRO_SCAN_QUERIES = [
  "earthquake OR tsunami OR wildfire",
  "war OR military conflict OR sanctions",
  "oil prices OR OPEC OR pipeline",
  "tornado OR hurricane OR flood",
  "Federal Reserve OR inflation OR recession",
];
