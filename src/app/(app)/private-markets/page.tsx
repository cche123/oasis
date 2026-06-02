"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Landmark, ExternalLink, Rocket } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/components/user-context";

type Deal = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  category: string;
  summary: string;
  company?: string;
  firms?: string[];
  sourceQuality?: "primary" | "aggregated";
};

const FILTERS = ["All", "Venture", "Seed & Series A", "Private Equity", "AI & Defense", "Space & Defense", "Unicorns"];

export default function PrivateMarketsPage() {
  const { user } = useUser();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/private-markets", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setDeals(data.deals || []);
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
    const interval = setInterval(fetchDeals, 3 * 60_000);
    return () => clearInterval(interval);
  }, [fetchDeals]);

  const filtered =
    filter === "All" ? deals : deals.filter((d) => d.category === filter);

  const activeDeal =
    selectedDeal && filtered.some((d) => d.id === selectedDeal.id)
      ? selectedDeal
      : (filtered[0] ?? null);

  const firmSpotlight = Array.from(
    filtered.reduce((acc, d) => {
      for (const f of d.firms ?? []) {
        acc.set(f, (acc.get(f) || 0) + 1);
      }
      return acc;
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const regionalHint = user.resolvedLocation?.valid
    ? user.resolvedLocation.displayName
    : null;

  const deriveDealInsight = (deal: Deal): {
    stage: string;
    sector: string;
    thesis: string;
    whatToWatch: string[];
    risks: string[];
  } => {
    const text = `${deal.title} ${deal.summary ?? ""}`.toLowerCase();
    const stage =
      /\bseries a\b/.test(text)
        ? "Series A"
        : /\bseed\b/.test(text)
          ? "Seed"
          : /\bseries b\b/.test(text)
            ? "Series B"
            : /\bipo\b/.test(text)
              ? "IPO"
              : /\bunicorn\b/.test(text)
                ? "Unicorn milestone"
                : "Growth round";

    const sector =
      /ai|llm|model|llm|agent|software/.test(text)
        ? "AI / software infrastructure"
        : /defense|aerospace|autonomous|satellite/.test(text)
          ? "Defense & autonomous systems"
          : /health|drug|pharma|biotech/.test(text)
            ? "Healthcare & biopharma"
            : /space|satellite|launch/.test(text)
              ? "Space & space-enabled services"
              : deal.category || "Cross-sector";

    const topTriggers = Array.from(
      new Set(
        (deal.title + " " + (deal.summary ?? ""))
          .split(/[^a-zA-Z0-9$]+/g)
          .map((w) => w.trim())
          .filter((w) => w.length >= 5)
          .slice(0, 6)
      )
    );

    const thesis = `A ${stage} signal inside ${sector}: the deal narrative typically indicates demand traction or strategic positioning. Based on the headline keywords (${topTriggers.slice(
      0,
      3
    ).join(", ")}), the most likely next step is either follow-on financing / partnerships or a buyer/investor re-rating if momentum persists.`;

    const whatToWatch = [
      "Follow-on activity: similar investors showing up again within 60–120 days",
      "Commercial proof: customer wins, deployments, or procurement milestones (not just press)",
      "Governance clarity: who leads the round and any strategic board/partner involvement",
    ];
    if (deal.category === "Private Equity") {
      whatToWatch.unshift("Synergy roadmap: what operational lever the buyer plans to pull first");
    }
    if (/acquisition|buyout|merger|secures|closes/.test(text)) {
      whatToWatch.unshift("Deal-to-close timeline: regulatory/credit conditions and revision risk");
    }

    const risks = [
      "Narrative risk: headlines can overstate traction until customer/payment/retention metrics show up",
      "Execution risk: integration or scale-up delays can push the value creation window out",
      "Market-risk: rate/liquidity changes compress multiples even when fundamentals improve",
    ];

    return { stage, sector, thesis, whatToWatch, risks };
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full font-sans">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 border-b border-border pb-8"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
          Private Markets Intelligence
        </p>
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground flex items-center gap-3">
          <Landmark className="w-7 h-7 text-muted-foreground" />
          Raises & Deals
        </h1>
        <p className="text-muted-foreground max-w-2xl font-light mt-3 text-sm leading-relaxed">
          Live venture rounds, PE buyouts, and mega-deal signals from TechCrunch, Crunchbase,
          and Google News — SpaceX, AI labs, defense tech, and more.
          {regionalHint && (
            <> Your global feed still prioritizes <strong className="text-foreground font-medium">{regionalHint}</strong> on the dashboard.</>
          )}
        </p>
        <div className="flex flex-wrap gap-2 mt-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-colors ${
                filter === f
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {firmSpotlight.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
              Firm Spotlight
            </p>
            <div className="flex flex-wrap gap-2">
              {firmSpotlight.map(([firm, count]) => (
                <span
                  key={firm}
                  className="px-2.5 py-1 text-[10px] uppercase tracking-widest border border-border text-muted-foreground"
                >
                  {firm} · {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.header>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 border border-border animate-pulse bg-muted/20" />
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="border border-border divide-y divide-border">
            {filtered.map((deal, i) => (
              <motion.button
                key={deal.id}
                type="button"
                onClick={() => setSelectedDeal(deal)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="block p-6 w-full text-left hover:bg-muted/20 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[9px] uppercase tracking-widest bg-foreground text-background px-2 py-0.5">
                        {deal.category}
                      </span>
                      {deal.company && (
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                          <Rocket className="w-3 h-3" /> {deal.company}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {deal.date}
                      </span>
                    </div>
                    <h2
                      className={`font-serif text-xl text-foreground group-hover:underline decoration-1 underline-offset-4 leading-snug ${
                        activeDeal?.id === deal.id ? "underline" : ""
                      }`}
                    >
                      {deal.title}
                    </h2>
                    {deal.summary && (
                      <p className="text-sm text-muted-foreground font-light mt-2 line-clamp-2">
                        {deal.summary}
                      </p>
                    )}
                    {deal.firms && deal.firms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {deal.firms.slice(0, 3).map((firm) => (
                          <span
                            key={`${deal.id}-${firm}`}
                            className="text-[9px] uppercase tracking-widest border border-border px-1.5 py-0.5 text-muted-foreground"
                          >
                            {firm}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-2 italic flex items-center gap-1">
                      via {deal.source}
                      {deal.sourceQuality === "primary" ? " · direct" : " · aggregated"}
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
                    </p>
                    <a
                      href={deal.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex mt-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground items-center gap-1"
                    >
                      Open source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <aside className="border border-border bg-card p-6 rounded-3xl space-y-4">
            {!activeDeal ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16 text-muted-foreground">
                <p className="text-sm font-light leading-relaxed">
                  Click a deal to see a structured signal preview and a “what to watch next” scan.
                </p>
              </div>
            ) : (
              (() => {
                const insight = deriveDealInsight(activeDeal);
                return (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest bg-foreground text-background px-2 py-0.5">
                          {activeDeal.category}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {insight.stage}
                        </span>
                      </div>
                      <h3 className="text-2xl font-serif text-foreground leading-snug">
                        {activeDeal.title}
                      </h3>
                      {activeDeal.summary && (
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">
                          {activeDeal.summary}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 border-t border-border pt-4">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Market signal thesis
                      </p>
                      <p className="text-sm text-muted-foreground font-light leading-relaxed">
                        {insight.thesis}
                      </p>
                    </div>

                    {activeDeal.firms && activeDeal.firms.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Referenced firms
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {activeDeal.firms.map((firm) => (
                            <span
                              key={`${activeDeal.id}-firm-${firm}`}
                              className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 text-muted-foreground"
                            >
                              {firm}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          What to watch
                        </p>
                        <ul className="space-y-2">
                          {insight.whatToWatch.slice(0, 3).map((w, idx) => (
                            <li key={`${activeDeal.id}-w-${idx}`} className="text-sm text-foreground/90">
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Key risks
                        </p>
                        <ul className="space-y-2">
                          {insight.risks.slice(0, 3).map((r, idx) => (
                            <li key={`${activeDeal.id}-r-${idx}`} className="text-sm text-foreground/90">
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <a
                      href={activeDeal.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold px-4 py-3 border border-border hover:border-foreground transition-colors"
                    >
                      Open source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })()
            )}
          </aside>
        </div>
      )}

      <p className="mt-10 text-center text-xs text-muted-foreground">
        <Link href="/pulse" className="hover:text-foreground underline underline-offset-2">
          Public markets pulse →
        </Link>
        {" · "}
        <Link href="/signals" className="hover:text-foreground underline underline-offset-2">
          Full signal feed →
        </Link>
      </p>
    </div>
  );
}
