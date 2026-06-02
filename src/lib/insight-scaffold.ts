export type InsightScaffold = {
  mechanism: string;
  whatToWatch: string[];
  risks: string[];
  triggers: string[];
};

export function extractTriggers(text: string): string[] {
  const t = text.toLowerCase();
  const triggerRules: Array<[RegExp, string]> = [
    [/\b(fed|fomc|powell)\b/, "Fed / rates"],
    [/\b(cpi|inflation|jobs report|nonfarm|payrolls|gdp)\b/, "Macro print"],
    [/\b(earnings|guidance|beat|miss|margin)\b/, "Earnings signal"],
    [/\b(merger|acquisition|m&a|buyout|takeover)\b/, "Deal / M&A"],
    [/\b(funding|raised|round|series [a-f]|valuation|ipo)\b/, "Capital markets"],
    [/\b(oil|brent|wti|opec|lng|natural gas|pipeline|refinery)\b/, "Energy complex"],
    [/\b(sanctions|war|conflict|missile|iran|israel|ukraine|russia|taiwan)\b/, "Geopolitical risk"],
    [/\b(ai|llm|chip|semiconductor|compute)\b/, "AI supply chain"],
  ];

  const out: string[] = [];
  for (const [re, label] of triggerRules) {
    if (re.test(t)) out.push(label);
  }
  return out.slice(0, 4);
}

export function buildInsightScaffold(text: string, category: string): InsightScaffold {
  const triggers = extractTriggers(text);
  const cats = category || "Markets";

  const mechanismByCat: Record<string, string> = {
    "M&A":
      "Deal headlines typically transmit via (1) price discovery (takeout premium / comps), (2) financing conditions, and (3) regulatory probability.",
    "Venture & Raises":
      "Funding headlines transmit via private→public comps, risk appetite, and second-order supplier/customer exposure once the round implies demand.",
    "Technology":
      "Tech narratives transmit via duration (rates), capex cycles (compute/networking), and competitive positioning (platform vs. supplier).",
    "Macro":
      "Macro headlines transmit via rates/FX first, then sector rotation (banks, growth, defensives), then single-name dispersion.",
    "Energy":
      "Energy headlines transmit via spot pricing → term structure → margins (E&P/refiners/airlines/chemicals) → inflation expectations.",
    "Geopolitics":
      "Geopolitical headlines transmit via risk premia (energy, defense), safe-havens, and supply chain rerouting costs.",
    "Markets":
      "Markets headlines transmit via positioning + liquidity first, then fundamental repricing if the narrative persists across sources.",
    Social:
      "Social signals transmit via narrative velocity: repeated high-signal posts can move positioning before fundamentals show up in price.",
  };

  const mechanism = mechanismByCat[cats] ?? mechanismByCat.Markets;
  const whatToWatchBase = [
    "Whether the same trigger shows up across multiple independent sources within 6–12 hours",
    "If the narrative shifts from ‘headline’ → ‘numbers’ (rates print, guidance, deal terms)",
    "Cross-asset confirmation (rates/FX/commodities) before single-name moves",
  ];

  const risksBase = [
    "Headline overfitting: keywords match, but the driver isn’t large enough to matter",
    "Timing risk: the market waits for confirmation (policy, earnings, deal terms)",
    "Positioning risk: crowded narratives reverse fast when incremental news fades",
  ];

  return {
    mechanism,
    whatToWatch: whatToWatchBase,
    risks: risksBase,
    triggers,
  };
}

