import { resolveXHandleAlias } from "@/lib/x-handle-aliases";

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

/** Verified market-signal accounts — individuals and aggregators that post linkable status URLs. */
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
      "demishassabis",
      "ylecun",
      "DrJimFan",
      "emollick",
      "gdb",
      "karpathy",
      "GaryMarcus",
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
      "a16z",
      "sequoia",
      "benchmark",
      "KhoslaVentures",
      "sarahguo",
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
      "StockMKTNewz",
      "Fxhedgers",
    ],
  },
  {
    id: "macro",
    label: "Macro & Markets",
    handles: [
      "DeItaone",
      "unusual_whales",
      "federalreserve",
      "LizAnnSonders",
      "NorthmanTrader",
      "Fxhedgers",
    ],
  },
  {
    id: "crypto",
    label: "Crypto",
    handles: [
      "saylor",
      "VitalikButerin",
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
      "StockMKTNewz",
      "Fxhedgers",
      "NorthmanTrader",
    ],
  },
];

export function getHandlesForTopic(topic: XTopic, userHandle?: string): string[] {
  const cfg = X_TOPIC_VOICES.find((t) => t.id === topic);
  let handles = cfg?.handles.length ? [...cfg.handles] : [];
  handles = handles.map((h) => resolveXHandleAlias(h));

  if (topic === "all") {
    const seen = new Set<string>();
    handles = [];
    for (const t of X_TOPIC_VOICES) {
      if (t.id === "all") continue;
      for (const h of t.handles) {
        const resolved = resolveXHandleAlias(h);
        const key = resolved.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          handles.push(resolved);
        }
      }
    }
  }

  if (userHandle) {
    const u = resolveXHandleAlias(userHandle);
    handles = [u, ...handles.filter((h) => h.toLowerCase() !== u.toLowerCase())];
  }

  return handles.slice(0, 12);
}

/** Map a theme slug or title to the most relevant X voice topic. */
export function resolveXTopicForTheme(themeId: string, category?: string): XTopic {
  const id = themeId.toLowerCase();

  if (id.includes("crypto") || id.includes("digital-asset")) return "crypto";
  if (
    id.includes("roll-up") ||
    id.includes("private-equity") ||
    id.includes("venture") ||
    id.includes("sovereign-wealth") ||
    id.includes("middle-east-sovereign")
  ) {
    return "vc";
  }
  if (id.includes("m-a") || id.includes("ma-activity")) return "ma";
  if (
    id.includes("semiconductor") ||
    id.includes("data-center") ||
    id.includes("ai-enabled") ||
    id.includes("oceanic")
  ) {
    return "ai";
  }
  if (
    id.includes("defense") ||
    id.includes("geopolit") ||
    id.includes("glp") ||
    id.includes("energy") ||
    id.includes("gold") ||
    id.includes("macro") ||
    id.includes("pharma")
  ) {
    return "macro";
  }
  if (
    id.includes("founder") ||
    id.includes("ceo") ||
    category === "Consumer"
  ) {
    return "founders";
  }

  if (category === "Technology") return "ai";
  if (category === "Private Markets") return "vc";
  if (category === "Geopolitics" || category === "Energy") return "macro";
  if (category === "Financial Services") return "macro";
  if (category === "Healthcare") return "macro";

  return "markets";
}

/** Map explore category pills to X topic tabs. */
export function resolveXTopicForCategory(category: string): XTopic {
  switch (category) {
    case "Technology":
      return "ai";
    case "Private Markets":
      return "vc";
    case "Geopolitics":
    case "Energy":
    case "Financial Services":
      return "macro";
    case "Healthcare":
    case "Consumer":
    case "Industrials":
    case "Media":
    case "International Markets":
      return "markets";
    default:
      return "all";
  }
}

/** Map onboarding interest label to X topic. */
export function resolveXTopicForInterest(interest: string): XTopic {
  return resolveXTopicForTheme(
    interest.toLowerCase().replace(/\s+/g, "-"),
    undefined
  );
}
