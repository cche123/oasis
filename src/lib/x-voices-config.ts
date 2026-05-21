export type XTopic =
  | "all"
  | "ai"
  | "vc"
  | "ma"
  | "macro"
  | "crypto"
  | "founders"
  | "markets";

export type XTopicConfig = {
  id: XTopic;
  label: string;
  handles: string[];
};

/** Curated X accounts by topic — not limited to 3 handles */
export const X_TOPIC_VOICES: XTopicConfig[] = [
  {
    id: "all",
    label: "All Voices",
    handles: [],
  },
  {
    id: "ai",
    label: "AI & Tech",
    handles: [
      "sama",
      "elonmusk",
      "demishassabis",
      "ylecun",
      "GaryMarcus",
      "DrJimFan",
      "emollick",
      "gdb",
      "karpathy",
      "AnthropicAI",
    ],
  },
  {
    id: "founders",
    label: "Founders & CEOs",
    handles: [
      "elonmusk",
      "sama",
      "JeffBezos",
      "satyanadella",
      "tim_cook",
      "sundarpichai",
      "brian_armstrong",
      "pmarca",
    ],
  },
  {
    id: "vc",
    label: "VC & Raises",
    handles: [
      "joshkushner",
      "rabois",
      "cdixon",
      "a16z",
      "sequoia",
      "sarahguo",
      "Jason",
      "bgurley",
      "semil",
      "HarryStebbings",
    ],
  },
  {
    id: "ma",
    label: "M&A & Deals",
    handles: [
      "DeItaone",
      "unusual_whales",
      "WallStJesus",
      "zerohedge",
      "business",
      "FT",
      "Reuters",
      "DealBook",
    ],
  },
  {
    id: "macro",
    label: "Macro & Markets",
    handles: [
      "DeItaone",
      "markets",
      "Reuters",
      "WSJ",
      "Bloomberg",
      "federalreserve",
      "LizAnnSonders",
      "NorthmanTrader",
    ],
  },
  {
    id: "crypto",
    label: "Crypto",
    handles: [
      "saylor",
      "VitalikButerin",
      "cz_binance",
      "APompliano",
      "lookonchain",
      "WuBlockchain",
    ],
  },
  {
    id: "markets",
    label: "Market Signals",
    handles: [
      "DeItaone",
      "unusual_whales",
      "zerohedge",
      "markets",
      "StockMKTNewz",
      "Fxhedgers",
    ],
  },
];

export function getHandlesForTopic(topic: XTopic, userHandle?: string): string[] {
  const cfg = X_TOPIC_VOICES.find((t) => t.id === topic);
  let handles = cfg?.handles.length ? [...cfg.handles] : [];

  if (topic === "all") {
    const seen = new Set<string>();
    handles = [];
    for (const t of X_TOPIC_VOICES) {
      if (t.id === "all") continue;
      for (const h of t.handles) {
        if (!seen.has(h.toLowerCase())) {
          seen.add(h.toLowerCase());
          handles.push(h);
        }
      }
    }
  }

  if (userHandle) {
    const u = userHandle.replace("@", "");
    handles = [u, ...handles.filter((h) => h.toLowerCase() !== u.toLowerCase())];
  }

  return handles.slice(0, 12);
}
