"use client";

import { useEffect, useState, useCallback } from "react";
import { Zap, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/components/user-context";
import { buildNewsQueryParams } from "@/lib/news-params";
import type { PulseNarrative, NarrativeTier } from "@/lib/pulse-engine";
import { XVoices } from "@/components/x-voices";
import { cachedFetchJson, readCachedJson } from "@/lib/client-fetch-cache";

const TIER_LABELS: Record<NarrativeTier, string> = {
  early: "Early Candidate",
  spark: "Spark",
  story: "Story",
  saga: "Saga",
};

const CATEGORY_FILTERS = ["All", "M&A", "Venture & Raises", "Technology", "Macro", "Markets", "Energy"];

export default function PulsePage() {
  const { user } = useUser();
  const [narratives, setNarratives] = useState<PulseNarrative[]>([]);
  const [pulseDate, setPulseDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState<"all" | NarrativeTier>("all");
  const [catFilter, setCatFilter] = useState("All");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedNarrative, setSelectedNarrative] = useState<PulseNarrative | null>(null);
  const [symbolQuote, setSymbolQuote] = useState<{
    symbol: string;
    price: number;
    change: number;
  } | null>(null);

  const pulseCacheKey = [
    "pulse",
    user.interests.join("|"),
    user.location,
    user.resolvedLocation?.countryCode ?? "",
    user.internationalMarkets.join("|"),
  ].join(":");

  const fetchPulse = useCallback(async () => {
    if (!readCachedJson(pulseCacheKey)) setLoading(true);
    try {
      const newsQs = buildNewsQueryParams({
        interests: user.interests,
        location: user.location,
        resolvedLocation: user.resolvedLocation,
        markets: user.internationalMarkets,
      });
      const params = new URLSearchParams(newsQs.replace("?", ""));
      const data = await cachedFetchJson<{ narratives?: PulseNarrative[]; date?: string }>(
        pulseCacheKey,
        `/api/pulse?${params.toString()}`
      );
      setNarratives(data.narratives || []);
      setPulseDate(data.date || "");
    } catch {
      setNarratives([]);
    } finally {
      setLoading(false);
    }
  }, [pulseCacheKey, user.interests, user.location, user.resolvedLocation, user.internationalMarkets]);

  useEffect(() => {
    fetchPulse();
  }, [fetchPulse, user.feedVersion]);

  useEffect(() => {
    if (!selectedSymbol) {
      setSymbolQuote(null);
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch(
          `/api/market-data?symbols=${encodeURIComponent(selectedSymbol)}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = await res.json();
        const q = data.tickers?.[0] ?? null;
        if (!cancelled) setSymbolQuote(q);
      } catch {
        if (!cancelled) setSymbolQuote(null);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [selectedSymbol]);

  const filtered = narratives.filter((n) => {
    if (tierFilter !== "all" && n.tier !== tierFilter) return false;
    if (catFilter !== "All" && n.category !== catFilter) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto w-full font-sans">
      <header className="mb-10 border-b border-border pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Public Markets · {pulseDate || "Today"}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tight text-foreground flex items-center gap-3">
              Pulse <Zap className="w-6 h-6 text-foreground/60" />
            </h1>
            <p className="text-muted-foreground max-w-2xl font-light mt-3 text-sm leading-relaxed">
              Live narratives from WSJ, Reuters, FT, BBC, MarketWatch, TechCrunch, and more —
              categorized by story type. Stock prices update in the ticker above via Polygon &
              Alpha Vantage.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          {(["all", "early", "spark", "story", "saga"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-medium border transition-colors ${
                tierFilter === t
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground"
              }`}
            >
              {t === "all" ? "All tiers" : TIER_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1 text-[10px] uppercase tracking-widest border transition-colors ${
                catFilter === c
                  ? "bg-muted text-foreground border-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 border border-border animate-pulse bg-muted/20" />
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="border border-border divide-y divide-border lg:col-span-8">
            {filtered.length === 0 && (
              <div className="p-8 text-sm text-muted-foreground font-light">
                No narratives for this filter yet. Try changing tier/category.
              </div>
            )}
            {filtered.map((n) => (
              <a
                key={n.id}
                href={n.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 md:p-6 hover:bg-muted/20 transition-colors group"
              >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[9px] uppercase tracking-widest text-background bg-foreground px-2 py-0.5">
                  {TIER_LABELS[n.tier]}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                  {n.category}
                </span>
                <span className="text-[9px] text-muted-foreground">Heat {(n.heat * 100).toFixed(0)}%</span>
                <span className="text-[9px] text-muted-foreground ml-auto">{n.date}</span>
              </div>
              <h2 className="font-serif text-xl text-foreground group-hover:underline decoration-1 underline-offset-4 leading-snug">
                {n.title}
              </h2>
              <div className="flex flex-wrap gap-2 mt-3">
                  {(n.symbols && n.symbols.length > 0
                    ? n.symbols
                    : []
                  ).map((s) => (
                    <button
                      key={`${n.id}-${s}`}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSymbol(s);
                        setSelectedNarrative(null);
                      }}
                      className="text-[10px] uppercase tracking-widest border px-2 py-1 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedNarrative(n);
                      setSelectedSymbol(null);
                    }}
                    className="text-[10px] uppercase tracking-widest border px-2 py-1 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                  >
                    Insight
                  </button>
                </div>
              {n.summary && (
                <p className="text-sm text-muted-foreground font-light mt-2 line-clamp-2">
                  {n.summary}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-2 italic flex items-center gap-1">
                via {n.source}
                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
              </p>
              </a>
            ))}
          </div>

          <aside className="lg:col-span-4 border border-border bg-card p-6 rounded-3xl space-y-4">
            {!selectedSymbol && !selectedNarrative && (
              <div className="text-sm text-muted-foreground font-light leading-relaxed">
                Click a ticker pill to preview price, or “Insight” to open Oasis’ structured analysis.
              </div>
            )}

            {selectedSymbol && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-semibold text-foreground">
                    {selectedSymbol}
                  </span>
                  {symbolQuote && (
                    <span
                      className={
                        symbolQuote.change < 0
                          ? "text-red-400 font-mono text-sm"
                          : "text-emerald-400 font-mono text-sm"
                      }
                    >
                      {symbolQuote.price.toFixed(2)}{" "}
                      {symbolQuote.change > 0 ? "+" : ""}
                      {symbolQuote.change.toFixed(2)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Live quote from `/api/market-data` (Yahoo → Polygon/Alpha fallback if configured).
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedSymbol(null)}
                  className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
            )}

            {selectedNarrative && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Oasis Insight · {selectedNarrative.category}
                  </p>
                  <p className="text-sm text-foreground font-medium leading-snug">
                    {selectedNarrative.title}
                  </p>
                </div>

                {selectedNarrative.insight?.triggers?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedNarrative.insight.triggers.map((t) => (
                      <span
                        key={`${selectedNarrative.id}-tr-${t}`}
                        className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Mechanism
                  </p>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {selectedNarrative.insight?.mechanism}
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      What to watch next
                    </p>
                    <ul className="space-y-2">
                      {(selectedNarrative.insight?.whatToWatch ?? []).slice(0, 3).map((w, idx) => (
                        <li key={`${selectedNarrative.id}-w-${idx}`} className="text-sm text-foreground/90">
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
                      {(selectedNarrative.insight?.risks ?? []).slice(0, 3).map((r, idx) => (
                        <li key={`${selectedNarrative.id}-r-${idx}`} className="text-sm text-foreground/90">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href={selectedNarrative.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
                  >
                    Open source
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedNarrative(null)}
                    className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      <div className="mt-16">
        <XVoices title="X Voices by Topic" showTopicTabs />
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link href="/signals" className="hover:text-foreground underline underline-offset-2">
          Full signal feed →
        </Link>
      </p>
    </div>
  );
}
