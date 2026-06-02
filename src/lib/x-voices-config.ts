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
