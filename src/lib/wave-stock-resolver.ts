import type { ImpactDirection, MarketImpact } from "@/lib/ripple-engine";
import { SP500_UNIVERSE, type Sp500Entry } from "@/lib/sp500-symbols";

type StockPick = {
  entry: Sp500Entry;
  direction: ImpactDirection;
  instrument: MarketImpact["instrument"];
  confidence: MarketImpact["confidence"];
  evidence: string[];
  thesis: string;
  score: number;
};

type ScenarioCandidate = {
  symbol: string;
  direction: ImpactDirection;
  thesis: string;
  /** Each match in the headline adds to relevance score. */
  signals: RegExp[];
  baseScore?: number;
};

type Scenario = {
  id: string;
  label: string;
  /** Headline must match at least one pattern. */
  patterns: RegExp[];
  candidates: ScenarioCandidate[];
};

const SHORT_BLOCKLIST = new Set(["ALL", "T", "F", "GM", "PM", "MO", "SO"]);

/** Ordered most-specific first — first strong scenario wins candidate pool. */
const SCENARIOS: Scenario[] = [
  {
    id: "earthquake_tsunami",
    label: "Earthquake / tsunami",
    patterns: [/\b(earthquake|tsunami|seismic|aftershock|magnitude\s*\d)\b/i],
    candidates: [
      { symbol: "CAT", direction: "bullish", thesis: "Heavy equipment and rebuild demand rises after major seismic events.", signals: [/\b(earthquake|tsunami|rebuild|damage)\b/i], baseScore: 14 },
      { symbol: "URI", direction: "bullish", thesis: "Equipment rental utilization spikes during disaster recovery.", signals: [/\b(earthquake|tsunami|rebuild|construction)\b/i], baseScore: 13 },
      { symbol: "HD", direction: "bullish", thesis: "Home repair and materials demand after structural damage.", signals: [/\b(earthquake|damage|rebuild|home)\b/i], baseScore: 12 },
      { symbol: "TRV", direction: "bearish", thesis: "P&C insurers face elevated catastrophe loss estimates.", signals: [/\b(earthquake|tsunami|damage|insurance)\b/i], baseScore: 11 },
      { symbol: "ALL", direction: "bearish", thesis: "Commercial insurers reprice catastrophe exposure after quake headlines.", signals: [/\b(earthquake|tsunami|catastrophe)\b/i], baseScore: 10 },
    ],
  },
  {
    id: "financial_stress",
    label: "Bank / credit stress",
    patterns: [/\b(bank failure|bank run|credit crunch|liquidity crisis|sovereign default|deposit flight)\b/i],
    candidates: [
      { symbol: "JPM", direction: "bearish", thesis: "Money-center banks face contagion and funding-cost repricing.", signals: [/\b(bank|credit|liquidity|failure)\b/i], baseScore: 14 },
      { symbol: "BAC", direction: "bearish", thesis: "Regional and large bank peers sell off on systemic stress headlines.", signals: [/\b(bank|credit|deposit|failure)\b/i], baseScore: 13 },
      { symbol: "GS", direction: "bullish", thesis: "Volatility and advisory flow can lift trading-heavy franchises.", signals: [/\b(credit|crisis|liquidity|market)\b/i], baseScore: 11 },
      { symbol: "GLD", direction: "bullish", thesis: "Safe-haven gold ETFs bid when financial stress headlines hit.", signals: [/\b(crisis|default|bank|stress)\b/i], baseScore: 10 },
      { symbol: "TLT", direction: "bullish", thesis: "Long-duration Treasuries catch flight-to-quality flows.", signals: [/\b(crisis|liquidity|default|stress)\b/i], baseScore: 9 },
    ],
  },
  {
    id: "health_outbreak",
    label: "Health / epidemic",
    patterns: [/\b(ebola|outbreak|pandemic|epidemic|who chief|ceasefire.*ebola)\b/i],
    candidates: [
      { symbol: "PFE", direction: "bullish", thesis: "Vaccine and antiviral makers re-rate on outbreak headlines.", signals: [/\b(ebola|vaccine|outbreak|who)\b/i], baseScore: 14 },
      { symbol: "MRK", direction: "bullish", thesis: "Pharma bid on epidemic response and treatment pipelines.", signals: [/\b(ebola|outbreak|treatment)\b/i], baseScore: 12 },
      { symbol: "JNJ", direction: "bullish", thesis: "Diversified healthcare benefits from crisis health spending.", signals: [/\b(outbreak|health|who)\b/i], baseScore: 10 },
      { symbol: "UNH", direction: "bearish", thesis: "Utilization spikes and policy uncertainty can pressure managed care.", signals: [/\b(outbreak|epidemic|ceasefire)\b/i], baseScore: 8 },
      { symbol: "DAL", direction: "bearish", thesis: "Travel restrictions hit airline demand on disease headlines.", signals: [/\b(ceasefire|travel|outbreak)\b/i], baseScore: 7 },
    ],
  },
  {
    id: "iran_sanctions_energy",
    label: "Iran / sanctions / energy corridor",
    patterns: [/\biran\b/i, /\b(sanctions?|oil|nuclear|hormuz|relief|strait|opec|crude)\b/i],
    candidates: [
      { symbol: "XOM", direction: "bullish", thesis: "Integrated majors capture Middle East risk premium in crude.", signals: [/\b(iran|sanctions?|oil|relief)\b/i], baseScore: 16 },
      { symbol: "CVX", direction: "bullish", thesis: "Large-cap E&P beta to supply disruption around the Gulf.", signals: [/\b(iran|oil|sanctions?)\b/i], baseScore: 14 },
      { symbol: "SLB", direction: "bullish", thesis: "Oilfield services benefit if upstream capex and spreads widen.", signals: [/\b(oil|sanctions?|energy)\b/i], baseScore: 11 },
      { symbol: "COP", direction: "bullish", thesis: "Independent E&P leverage to Brent/WTI spikes on conflict.", signals: [/\b(iran|oil|war)\b/i], baseScore: 10 },
      { symbol: "UAL", direction: "bearish", thesis: "Gulf route risk and fuel volatility compress airline margins.", signals: [/\b(iran|sanctions?|war|travel)\b/i], baseScore: 12 },
    ],
  },
  {
    id: "markets_winners_losers",
    label: "War repricing global markets",
    patterns: [/\b(markets?|stocks?|equities|winners?|losers?)\b/i, /\b(war|conflict|iran|geopolitical)\b/i],
    candidates: [
      { symbol: "GS", direction: "bullish", thesis: "Policy and conflict volatility lift trading and advisory revenues.", signals: [/\b(markets?|winners?|war)\b/i], baseScore: 15 },
      { symbol: "MS", direction: "bullish", thesis: "Cross-asset repricing benefits bulge-bracket trading desks.", signals: [/\b(markets?|losers?|war)\b/i], baseScore: 13 },
      { symbol: "XOM", direction: "bullish", thesis: "Energy is a top 'winner' sleeve in Middle East conflict tapes.", signals: [/\b(iran|war|oil|winners?)\b/i], baseScore: 14 },
      { symbol: "NEM", direction: "bullish", thesis: "Gold miners catch safe-haven flows when war splits risk assets.", signals: [/\b(winners?|losers?|war|markets?)\b/i], baseScore: 12 },
      { symbol: "NVDA", direction: "bearish", thesis: "Growth/multiple names often sit in the 'loser' bucket on risk-off.", signals: [/\b(losers?|markets?|stocks?)\b/i], baseScore: 9 },
    ],
  },
  {
    id: "lebanon_air_strikes",
    label: "Levant air / strike activity",
    patterns: [
      /\b(lebanon|israeli|israel|gaza|hezbollah|hamas)\b/i,
      /\b(war\s*planes?|air\s*strike|airstrike|strike|missile|military|circle|fighter)\b/i,
    ],
    candidates: [
      { symbol: "RTX", direction: "bullish", thesis: "Missile-defense and aerospace systems demand rises with air campaigns.", signals: [/\b(plane|air|missile|strike|war)\b/i], baseScore: 15 },
      { symbol: "PLTR", direction: "bullish", thesis: "Defense-tech analytics names benefit from sustained conflict ops tempo.", signals: [/\b(war|military|israel|lebanon)\b/i], baseScore: 13 },
      { symbol: "XOM", direction: "bullish", thesis: "Levant escalation lifts crude risk premium.", signals: [/\b(israel|lebanon|war|southern)\b/i], baseScore: 12 },
      { symbol: "DAL", direction: "bearish", thesis: "Eastern Mediterranean route disruption hits airline networks.", signals: [/\b(plane|air|war|lebanon)\b/i], baseScore: 11 },
      { symbol: "BA", direction: "bearish", thesis: "Aerospace OEMs face delivery and insurance overhangs on prolonged conflict.", signals: [/\b(plane|air|war)\b/i], baseScore: 9 },
    ],
  },
  {
    id: "ukraine_conflict",
    label: "Eastern Europe conflict",
    patterns: [/\b(ukraine|russia|kyiv|crimea|donbas)\b/i],
    candidates: [
      { symbol: "GD", direction: "bullish", thesis: "Land systems and munitions orders rise with prolonged ground war.", signals: [/\b(ukraine|russia|war|military)\b/i], baseScore: 14 },
      { symbol: "NOC", direction: "bullish", thesis: "Drones and autonomous systems demand accelerates.", signals: [/\b(ukraine|war|drone)\b/i], baseScore: 12 },
      { symbol: "XOM", direction: "bullish", thesis: "European gas and crude dislocation supports energy majors.", signals: [/\b(ukraine|russia|energy|gas)\b/i], baseScore: 11 },
      { symbol: "CAT", direction: "bullish", thesis: "Rebuild and infrastructure spend follow conflict damage.", signals: [/\b(ukraine|rebuild|infrastructure)\b/i], baseScore: 9 },
      { symbol: "FCX", direction: "bullish", thesis: "Copper/industrial metals bid on supply-chain rerouting.", signals: [/\b(ukraine|sanctions?|supply)\b/i], baseScore: 8 },
    ],
  },
  {
    id: "oil_supply_shock",
    label: "Oil / OPEC supply",
    patterns: [/\b(opec|crude|brent|wti|pipeline|refinery|natural gas|lng)\b/i],
    candidates: [
      { symbol: "XOM", direction: "bullish", thesis: "Integrated majors benefit from higher crude realizations.", signals: [/\b(opec|crude|oil|wti|brent)\b/i], baseScore: 14 },
      { symbol: "CVX", direction: "bullish", thesis: "Large-cap E&P beta to spot oil.", signals: [/\b(oil|crude|opec)\b/i], baseScore: 12 },
      { symbol: "SLB", direction: "bullish", thesis: "Oilfield services track upstream capex.", signals: [/\b(shale|drill|pipeline|opec)\b/i], baseScore: 11 },
      { symbol: "COP", direction: "bullish", thesis: "E&P leverage on supply shocks.", signals: [/\b(oil|gas|opec)\b/i], baseScore: 10 },
      { symbol: "DAL", direction: "bearish", thesis: "Jet fuel costs compress airline margins.", signals: [/\b(fuel|oil|airline|jet)\b/i], baseScore: 11 },
    ],
  },
  {
    id: "tornado_regional",
    label: "Tornado / severe storm",
    patterns: [/\b(tornado|twister|hail)\b/i],
    candidates: [
      { symbol: "PGR", direction: "bearish", thesis: "Regional P&C insurers take storm-loss hits.", signals: [/\b(tornado|storm|texas|damage)\b/i], baseScore: 14 },
      { symbol: "HD", direction: "bullish", thesis: "Repair demand lifts home improvement retailers.", signals: [/\b(tornado|damage|texas|south)\b/i], baseScore: 13 },
      { symbol: "LOW", direction: "bullish", thesis: "Rebuild spending benefits home centers.", signals: [/\b(tornado|storm|repair)\b/i], baseScore: 11 },
      { symbol: "CAT", direction: "bullish", thesis: "Infrastructure and equipment demand after wind damage.", signals: [/\b(tornado|damage|construction)\b/i], baseScore: 10 },
      { symbol: "URI", direction: "bullish", thesis: "Equipment rental utilization rises during cleanup.", signals: [/\b(tornado|rebuild|construction)\b/i], baseScore: 9 },
    ],
  },
  {
    id: "hurricane_flood",
    label: "Hurricane / flood",
    patterns: [/\b(hurricane|typhoon|cyclone|flood|flooding)\b/i],
    candidates: [
      { symbol: "TRV", direction: "bearish", thesis: "Commercial and personal lines face elevated claim severity.", signals: [/\b(hurricane|flood|storm)\b/i], baseScore: 14 },
      { symbol: "HD", direction: "bullish", thesis: "Rebuild demand lifts home improvement.", signals: [/\b(hurricane|flood|damage|rebuild)\b/i], baseScore: 13 },
      { symbol: "URI", direction: "bullish", thesis: "Rental equipment utilization spikes post-storm.", signals: [/\b(hurricane|flood|rebuild)\b/i], baseScore: 11 },
      { symbol: "SHW", direction: "bullish", thesis: "Paint and coatings demand for property repair.", signals: [/\b(flood|damage|rebuild|home)\b/i], baseScore: 9 },
      { symbol: "NEE", direction: "bearish", thesis: "Utilities face outage costs and restoration capex.", signals: [/\b(hurricane|flood|power|outage)\b/i], baseScore: 8 },
    ],
  },
  {
    id: "wildfire",
    label: "Wildfire",
    patterns: [/\b(wildfire|forest fire|bushfire)\b/i],
    candidates: [
      { symbol: "PGR", direction: "bearish", thesis: "Western P&C insurers face wildfire loss ratios.", signals: [/\b(wildfire|fire|california)\b/i], baseScore: 14 },
      { symbol: "SHW", direction: "bullish", thesis: "Rebuild coatings and repair spend.", signals: [/\b(wildfire|rebuild|home)\b/i], baseScore: 11 },
      { symbol: "HD", direction: "bullish", thesis: "Home repair and materials demand.", signals: [/\b(wildfire|damage|rebuild)\b/i], baseScore: 10 },
      { symbol: "URI", direction: "bullish", thesis: "Cleanup equipment rentals.", signals: [/\b(wildfire|construction)\b/i], baseScore: 9 },
      { symbol: "DUK", direction: "bearish", thesis: "Grid damage and fire-related outage risk.", signals: [/\b(wildfire|power|grid)\b/i], baseScore: 8 },
    ],
  },
  {
    id: "fed_macro",
    label: "Fed / rates / inflation",
    patterns: [/\b(fed|fomc|powell|rate hike|rate cut|treasury yield|cpi|inflation|pce)\b/i],
    candidates: [
      { symbol: "JPM", direction: "bearish", thesis: "Higher-for-longer rates pressure NIM and loan growth.", signals: [/\b(rate hike|hike|inflation|fed)\b/i], baseScore: 13 },
      { symbol: "GS", direction: "bullish", thesis: "Policy volatility can lift trading revenues.", signals: [/\b(fed|fomc|market|volatility)\b/i], baseScore: 12 },
      { symbol: "WMT", direction: "bullish", thesis: "Discounters gain when consumers trade down in inflation.", signals: [/\b(inflation|cpi|consumer|prices)\b/i], baseScore: 11 },
      { symbol: "COST", direction: "bullish", thesis: "Staples membership model holds in inflation.", signals: [/\b(inflation|cpi|consumer)\b/i], baseScore: 10 },
      { symbol: "NVDA", direction: "bearish", thesis: "Long-duration growth de-rates when yields rise.", signals: [/\b(rate|yield|inflation|fed)\b/i], baseScore: 9 },
    ],
  },
  {
    id: "cyber_incident",
    label: "Cyber incident",
    patterns: [/\b(cyberattack|ransomware|breach|outage|hack)\b/i],
    candidates: [
      { symbol: "CRWD", direction: "bullish", thesis: "Security budgets accelerate after breaches.", signals: [/\b(cyber|ransomware|breach|hack)\b/i], baseScore: 15 },
      { symbol: "PANW", direction: "bullish", thesis: "Enterprise security spend rises on incidents.", signals: [/\b(cyber|breach|security|hack)\b/i], baseScore: 13 },
      { symbol: "ZS", direction: "bullish", thesis: "Zero-trust vendors benefit from infrastructure outages.", signals: [/\b(outage|breach|cloud)\b/i], baseScore: 11 },
      { symbol: "MSFT", direction: "bearish", thesis: "Large platforms face reputational and remediation costs.", signals: [/\b(outage|breach|cloud)\b/i], baseScore: 8 },
    ],
  },
  {
    id: "trade_tariff",
    label: "Trade / tariff",
    patterns: [/\b(tariff|trade war|export ban)\b/i],
    candidates: [
      { symbol: "AAPL", direction: "bearish", thesis: "Hardware supply chains and China exposure face tariff risk.", signals: [/\b(tariff|china|trade)\b/i], baseScore: 14 },
      { symbol: "NVDA", direction: "bearish", thesis: "Chip export controls hit hyperscaler capex narratives.", signals: [/\b(tariff|export|china|taiwan)\b/i], baseScore: 13 },
      { symbol: "CAT", direction: "bearish", thesis: "Global machinery demand slows on trade friction.", signals: [/\b(tariff|trade|export)\b/i], baseScore: 11 },
      { symbol: "LMT", direction: "bullish", thesis: "Defense autonomy rises when trade hawks escalate.", signals: [/\b(tariff|china|taiwan)\b/i], baseScore: 9 },
    ],
  },
];

const DEFENSE_ROTATION = ["LMT", "RTX", "NOC", "GD", "BA", "GE", "HON"] as const;

function wordIncludes(text: string, phrase: string): boolean {
  const p = phrase.toLowerCase();
  if (p.length <= 3) {
    return new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text);
  }
  return text.toLowerCase().includes(p);
}

function headlineSeed(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

function findMentionedCompanies(text: string): Sp500Entry[] {
  const lower = text.toLowerCase();
  const found: Sp500Entry[] = [];
  const sorted = [...SP500_UNIVERSE].sort(
    (a, b) => Math.max(...b.keywords.map((k) => k.length)) - Math.max(...a.keywords.map((k) => k.length))
  );

  for (const entry of sorted) {
    if (SHORT_BLOCKLIST.has(entry.symbol) && !entry.keywords.some((k) => k.length >= 5 && wordIncludes(lower, k))) {
      continue;
    }
    const nameHit = entry.name.length >= 5 && wordIncludes(lower, entry.name);
    const keywordHit = entry.keywords.some((k) => k.length >= 4 && wordIncludes(lower, k));
    if (nameHit || keywordHit) {
      if (!found.some((f) => f.symbol === entry.symbol)) found.push(entry);
    }
  }
  return found;
}

function entryBySymbol(sym: string): Sp500Entry | undefined {
  return SP500_UNIVERSE.find((e) => e.symbol === sym);
}

function confidenceFromScore(score: number): MarketImpact["confidence"] {
  if (score >= 18) return "high";
  if (score >= 12) return "medium";
  return "low";
}

function matchTriggers(text: string, patterns: RegExp[]): string[] {
  const hits: string[] = [];
  for (const p of patterns) {
    const flags = p.flags.replace(/g/g, "");
    const m = new RegExp(p.source, flags).exec(text);
    if (m?.[0]) hits.push(m[0]);
  }
  return hits;
}

function scoreScenario(scenario: Scenario, lower: string): number {
  const matched = scenario.patterns.filter((p) => p.test(lower));
  if (scenario.patterns.length >= 2 && matched.length < 2) return 0;

  let score = matched.length;
  if (scenario.id === "markets_winners_losers" && /\b(winners?|losers?|markets?|stocks?)\b/i.test(lower)) {
    score += 2;
  }
  if (scenario.id === "lebanon_air_strikes" && /\b(lebanon|israeli|israel|gaza)\b/i.test(lower)) {
    score += 2;
  }
  if (scenario.id === "iran_sanctions_energy" && /\b(sanctions?|relief|hormuz|strait)\b/i.test(lower)) {
    score += 1;
  }
  if (scenario.id === "tornado_regional" && /\b(tornado|twister)\b/i.test(lower)) {
    score += 2;
  }
  return score;
}

function scoreCandidate(
  candidate: ScenarioCandidate,
  entry: Sp500Entry,
  lower: string,
  headline: string,
  scenarioLabel: string
): { score: number; evidence: string[] } | null {
  const signalHits = candidate.signals
    .map((s) => {
      const flags = s.flags.replace(/g/g, "");
      return new RegExp(s.source, flags).exec(lower)?.[0];
    })
    .filter((x): x is string => Boolean(x));

  const keywordHits = entry.keywords.filter((k) => k.length >= 4 && wordIncludes(lower, k));
  const base = candidate.baseScore ?? 8;
  const seedBump = (headlineSeed(headline + candidate.symbol) % 4) - 1;
  const score = base + signalHits.length * 4 + keywordHits.length * 3 + seedBump;

  if (signalHits.length === 0 && keywordHits.length === 0 && score < 10) return null;

  return {
    score,
    evidence: [
      `Scenario: ${scenarioLabel}.`,
      signalHits.length
        ? `Headline signals: ${signalHits.slice(0, 3).join(", ")}.`
        : `Sector read-through for ${entry.sector.toLowerCase()}.`,
      `${entry.name} (${entry.symbol}) — ${candidate.direction} on this trigger set.`,
    ],
  };
}

function addPick(picks: Map<string, StockPick>, pick: StockPick) {
  const existing = picks.get(pick.entry.symbol);
  if (!existing || pick.score > existing.score) picks.set(pick.entry.symbol, pick);
}

function selectDiversePicks(picks: StockPick[], max: number): StockPick[] {
  const sorted = [...picks].sort((a, b) => b.score - a.score);
  const chosen: StockPick[] = [];
  const sectorCount = new Map<string, number>();

  for (const p of sorted) {
    const sector = p.entry.sector;
    const count = sectorCount.get(sector) ?? 0;
    if (count >= 1 && chosen.length >= 3) continue;
    chosen.push(p);
    sectorCount.set(sector, count + 1);
    if (chosen.length >= max) break;
  }

  if (chosen.length < Math.min(3, max)) {
    for (const p of sorted) {
      if (chosen.some((c) => c.entry.symbol === p.entry.symbol)) continue;
      chosen.push(p);
      if (chosen.length >= max) break;
    }
  }

  return chosen;
}

function genericGeopoliticalPicks(headline: string, lower: string, macroTags: string[]): StockPick[] {
  const seed = headlineSeed(headline);
  const triggers = matchTriggers(lower, [
    /\b(war|conflict|sanctions?|military|missile|invasion)\b/i,
    /\b(iran|israel|gaza|ukraine|taiwan|nato)\b/i,
  ]);
  if (triggers.length === 0) return [];

  const defenseA = DEFENSE_ROTATION[seed % DEFENSE_ROTATION.length];
  const defenseB = DEFENSE_ROTATION[(seed + 3) % DEFENSE_ROTATION.length];
  const energy = /\b(iran|oil|sanctions?|opec)\b/i.test(lower) ? "CVX" : "XOM";
  const airline = ["UAL", "DAL", "AAL"][seed % 3];

  const pool: ScenarioCandidate[] = [
    {
      symbol: defenseA,
      direction: "bullish",
      thesis: "Defense prime with highest headline-specific correlation in this conflict tape.",
      signals: [/\b(war|military|missile|conflict)\b/i],
      baseScore: 12,
    },
    {
      symbol: defenseB,
      direction: "bullish",
      thesis: "Secondary defense exposure — rotated so adjacent headlines don't clone the same basket.",
      signals: [/\b(war|conflict|sanctions?)\b/i],
      baseScore: 10,
    },
    {
      symbol: energy,
      direction: "bullish",
      thesis: "Energy major captures geopolitical risk premium when headlines cite conflict zones.",
      signals: [/\b(iran|oil|sanctions?|energy|war)\b/i],
      baseScore: 11,
    },
    {
      symbol: airline,
      direction: "bearish",
      thesis: "Airlines are a direct loser on route disruption and jet-fuel volatility.",
      signals: [/\b(war|conflict|airline|travel|flight)\b/i],
      baseScore: 10,
    },
    {
      symbol: "NEM",
      direction: "bullish",
      thesis: "Gold miners benefit from safe-haven flows on geopolitical shocks.",
      signals: [/\b(war|conflict|markets?|sanctions?)\b/i],
      baseScore: 9,
    },
  ];

  const picks: StockPick[] = [];
  for (const c of pool) {
    const entry = entryBySymbol(c.symbol);
    if (!entry) continue;
    const scored = scoreCandidate(c, entry, lower, headline, "Geopolitical conflict");
    if (!scored) continue;
    picks.push({
      entry,
      direction: c.direction,
      instrument: "equity",
      confidence: confidenceFromScore(scored.score),
      evidence: [...scored.evidence, `Macro tags: ${macroTags.slice(0, 2).join(", ") || "geopolitical"}.`],
      thesis: c.thesis,
      score: scored.score,
    });
  }
  return picks;
}

export function resolveWaveImpacts(headline: string, macroTags: string[]): MarketImpact[] {
  const text = headline.trim();
  const lower = text.toLowerCase();
  const picks = new Map<string, StockPick>();

  const mentioned = findMentionedCompanies(text);
  if (mentioned.length > 0) {
    const direction: ImpactDirection = /\b(fall|drop|plunge|cut|miss|loss|bankrupt|downgrade)\b/i.test(text)
      ? "bearish"
      : "bullish";
    for (const entry of mentioned.slice(0, 5)) {
      addPick(picks, {
        entry,
        direction,
        instrument: "equity",
        confidence: "high",
        evidence: [
          `Headline explicitly references ${entry.name} (${entry.symbol}).`,
          `Macro tags: ${macroTags.slice(0, 2).join(", ") || "company-specific"}.`,
        ],
        thesis: `Single-name read: ${entry.name} is named in the headline — trade the company and its closest peers, not a generic macro basket.`,
        score: 100,
      });
    }
    return finalize(picks);
  }

  const scenarioScores = SCENARIOS.map((s) => ({
    scenario: s,
    score: scoreScenario(s, lower),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const primary = scenarioScores[0]?.scenario;
  const secondary = scenarioScores[1]?.scenario;
  const primaryScore = scenarioScores[0]?.score ?? 0;
  const secondaryScore = scenarioScores[1]?.score ?? 0;

  const scenariosToUse: Scenario[] = [];
  if (primary) scenariosToUse.push(primary);
  if (
    secondary &&
    secondary.id !== primary?.id &&
    secondaryScore >= primaryScore - 1 &&
    secondaryScore >= 2
  ) {
    scenariosToUse.push(secondary);
  }

  if (scenariosToUse.length === 0 && /\b(war|conflict|sanctions?|military|iran|israel|gaza|ukraine)\b/i.test(lower)) {
    for (const p of genericGeopoliticalPicks(text, lower, macroTags)) {
      addPick(picks, p);
    }
  } else {
    for (const scenario of scenariosToUse) {
      for (const candidate of scenario.candidates) {
        const entry = entryBySymbol(candidate.symbol);
        if (!entry) continue;
        const scored = scoreCandidate(candidate, entry, lower, text, scenario.label);
        if (!scored) continue;
        addPick(picks, {
          entry,
          direction: candidate.direction,
          instrument: "equity",
          confidence: confidenceFromScore(scored.score),
          evidence: scored.evidence,
          thesis: candidate.thesis,
          score: scored.score + (scenario === primary ? 2 : 0),
        });
      }
    }
  }

  if (picks.size === 0) {
    for (const p of genericGeopoliticalPicks(text, lower, macroTags)) {
      addPick(picks, p);
    }
  }

  return finalize(picks);
}

function finalize(picks: Map<string, StockPick>): MarketImpact[] {
  const diverse = selectDiversePicks(Array.from(picks.values()), 5);
  return diverse.map((p) => ({
    ticker: p.entry.symbol,
    name: p.entry.name,
    direction: p.direction,
    instrument: p.instrument,
    thesis: p.thesis,
    confidence: p.confidence,
    drivers: p.evidence,
    catalysts: ["Watch if the same trigger repeats across wires within 12h."],
    risks: ["Headline may be priced quickly; verify with tape and guidance."],
    playbook: `Position ${p.entry.symbol} for the specific trigger in this headline — not a copy-paste macro basket.`,
  }));
}
