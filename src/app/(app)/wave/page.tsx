"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Scan,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";
import { useUser } from "@/components/user-context";
import type { RippleAnalysis } from "@/lib/ripple-engine";
import { WAVE_MAX_AGE_HOURS, WAVE_MIN_SCORE } from "@/lib/wave-headline-filter";
import { cn } from "@/lib/utils";
import { cachedFetchJson, readCachedJson } from "@/lib/client-fetch-cache";

type NewsItem = {
  id: string;
  headline: string;
  source: string;
  sourceUrl: string;
  date: string;
  summary?: string;
  macroScore?: number;
  macroTags?: string[];
  macroReason?: string;
};

export default function WavePage() {
  const { user } = useUser();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [analysis, setAnalysis] = useState<RippleAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [selectedImpact, setSelectedImpact] = useState<
    RippleAnalysis["impacts"][number] | null
  >(null);
  const [impactQuotes, setImpactQuotes] = useState<
    Record<string, { symbol: string; price: number; change: number }>
  >({});

  const region =
    user.resolvedLocation?.valid && user.resolvedLocation.country
      ? user.resolvedLocation.country === "US"
        ? "USA"
        : user.resolvedLocation.country
      : "USA";

  const fetchNews = useCallback(async () => {
    const cacheKey = "wave:headlines";
    if (!readCachedJson(cacheKey)) setLoading(true);
    try {
      const data = await cachedFetchJson<{ items?: NewsItem[] }>(
        cacheKey,
        "/api/ripple?limit=12"
      );
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNews();
  }, [fetchNews]);

  const analyzeItem = async (item: NewsItem) => {
    setSelected(item);
    setAnalyzing(true);
    setAnalysis(null);
    setSelectedImpact(null);
    setImpactQuotes({});
    try {
      const res = await fetch("/api/ripple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: item.headline,
          region,
          interests: user.interests,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnalysis(null);
        return;
      }
      setAnalysis(data.analysis);
      const first = data.analysis?.impacts?.[0] ?? null;
      setSelectedImpact(first);

      const tickers = (data.analysis?.impacts ?? [])
        .map((i: { ticker: string }) => i.ticker)
        .slice(0, 5);
      if (tickers.length) {
        const qRes = await fetch(
          `/api/market-data?symbols=${encodeURIComponent(tickers.join(","))}`,
          { cache: "no-store" }
        );
        if (qRes.ok) {
          const qData = await qRes.json();
          const map: Record<string, { symbol: string; price: number; change: number }> =
            {};
          for (const t of qData.tickers ?? []) map[t.symbol] = t;
          setImpactQuotes(map);
        }
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const impactQuote = selectedImpact ? impactQuotes[selectedImpact.ticker] : null;

  return (
    <div className="p-8 max-w-[90rem] mx-auto w-full font-sans pb-24">
      <header className="mb-8 grid lg:grid-cols-12 gap-6 items-end border-b border-border pb-8">
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            <Scan className="w-3.5 h-3.5" />
            Oasis Wave · Macro transmission lab
          </div>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight">Macro wave scan</h1>
          <p className="text-muted-foreground font-light max-w-2xl leading-relaxed text-sm">
            Headlines are ranked by macro-impact score (green number). Wave keeps strict
            relevance first (score ≥ {WAVE_MIN_SCORE}) and only relaxes slightly if the feed
            gets too sparse. Each scan maps to unique equities with headline-linked evidence.
          </p>
        </div>
        <div className="lg:col-span-4 flex flex-wrap gap-2 lg:justify-end">
          <span className="inline-flex items-center gap-2 px-3 py-2 border border-border text-[10px] uppercase tracking-widest text-muted-foreground">
            <Shield className="w-3 h-3" /> {WAVE_MAX_AGE_HOURS}h recency gate
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-2 border border-border text-[10px] uppercase tracking-widest text-muted-foreground">
            <Layers className="w-3 h-3" /> Equity-specific picks
          </span>
        </div>
      </header>

      <div className="grid xl:grid-cols-12 gap-6 items-start">
        {/* Headlines */}
        <section className="xl:col-span-3 border border-border bg-card flex flex-col min-h-[560px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Macro headlines
            </p>
            <button
              type="button"
              onClick={() => void fetchNews()}
              className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Refresh
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[75vh]">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning feeds…
              </div>
            ) : items.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground font-light leading-relaxed">
                No macro-grade headlines in the last 72 hours. Check back after major policy,
                geopolitical, or energy prints.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      draggable
                      onDragStart={() => setDragId(item.id)}
                      onDragEnd={() => setDragId(null)}
                      onClick={() => void analyzeItem(item)}
                      className={cn(
                        "w-full text-left px-4 py-4 hover:bg-muted/30 transition-colors",
                        selected?.id === item.id && "bg-muted/50",
                        dragId === item.id && "opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[9px] font-mono text-emerald-500/90"
                          title={`Macro impact score (min ${WAVE_MIN_SCORE} to appear). Higher = stronger market transmission.`}
                        >
                          {item.macroScore ?? "—"}
                        </span>
                        {item.macroTags?.slice(0, 1).map((tag) => (
                          <span
                            key={tag}
                            className="text-[8px] uppercase tracking-widest text-muted-foreground border border-border px-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {item.headline}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {item.source} · {item.date}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Analysis workspace */}
        <section
          className="xl:col-span-5 border border-border bg-card min-h-[560px] p-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            const item = items.find((i) => i.id === dragId);
            if (item) void analyzeItem(item);
            setDragId(null);
          }}
        >
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 py-20">
              <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-sm">
                Select a macro headline to run the transmission model — drag from the left
                list or click any item.
              </p>
            </div>
          ) : analyzing ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-20 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              Mapping equity impacts…
            </div>
          ) : analysis ? (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  {analysis.categoryLabel}
                </p>
                <a
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-serif text-foreground hover:underline leading-snug inline-flex gap-2 items-start"
                >
                  {selected.headline}
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-1 opacity-50" />
                </a>
                {selected.macroReason && (
                  <p className="text-xs text-emerald-500/80 mt-2">{selected.macroReason}</p>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-light leading-relaxed border-l-2 border-border pl-4">
                {analysis.summary}
              </p>
              {analysis.impacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No equities met the correlation gate for this headline (needs a named company
                  or a direct sector trigger in the text).
                </p>
              ) : (
                <>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Impacted equities ({analysis.impacts.length})
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {analysis.impacts.map((impact) => (
                  <button
                    key={impact.ticker}
                    type="button"
                    onClick={() => setSelectedImpact(impact)}
                    className={cn(
                      "border p-3 rounded-xl text-left transition-colors",
                      selectedImpact?.ticker === impact.ticker
                        ? "border-foreground bg-muted/30"
                        : "border-border hover:border-foreground/40"
                    )}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-mono text-sm font-semibold">{impact.ticker}</span>
                      <span
                        className={cn(
                          "text-[9px] uppercase tracking-widest flex items-center gap-0.5",
                          impact.direction === "bullish" ? "text-emerald-500" : "text-red-400"
                        )}
                      >
                        {impact.direction === "bullish" ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {impact.confidence}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                      {impact.name}
                    </p>
                    {impactQuotes[impact.ticker] && (
                      <p className="text-[10px] font-mono mt-1 text-muted-foreground">
                        {impactQuotes[impact.ticker].price.toFixed(2)}{" "}
                        <span
                          className={
                            impactQuotes[impact.ticker].change < 0
                              ? "text-red-400"
                              : "text-emerald-400"
                          }
                        >
                          {impactQuotes[impact.ticker].change > 0 ? "+" : ""}
                          {impactQuotes[impact.ticker].change.toFixed(2)}%
                        </span>
                      </p>
                    )}
                  </button>
                ))}
              </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-12 text-center">
              This headline did not pass the macro-impact threshold.
            </p>
          )}
        </section>

        {/* Evidence panel */}
        <aside className="xl:col-span-4 border border-border bg-card/80 rounded-2xl p-6 min-h-[560px] sticky top-8">
          {!selectedImpact ? (
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Pick an equity to see evidence-backed thesis, catalysts, and risks tied to this
              headline.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Evidence & thesis
                </p>
                <h3 className="text-2xl font-mono font-semibold">{selectedImpact.ticker}</h3>
                <p className="text-sm text-muted-foreground">{selectedImpact.name}</p>
                {impactQuote && (
                  <p className="text-sm font-mono mt-2">
                    {impactQuote.price.toFixed(2)}{" "}
                    <span
                      className={
                        impactQuote.change < 0 ? "text-red-400" : "text-emerald-400"
                      }
                    >
                      {impactQuote.change > 0 ? "+" : ""}
                      {impactQuote.change.toFixed(2)}%
                    </span>
                  </p>
                )}
              </div>
              <p className="text-sm font-light leading-relaxed text-foreground/90">
                {selectedImpact.thesis}
              </p>
              {selectedImpact.drivers && selectedImpact.drivers.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Evidence
                  </p>
                  <ul className="space-y-2">
                    {selectedImpact.drivers.map((d, i) => (
                      <li key={i} className="text-xs text-foreground/90 leading-relaxed">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedImpact.playbook && (
                <p className="text-xs text-muted-foreground border-t border-border pt-4 leading-relaxed">
                  {selectedImpact.playbook}
                </p>
              )}
            </div>
          )}
        </aside>
      </div>

      <p className="text-[10px] text-muted-foreground/70 leading-relaxed max-w-3xl mt-8">
        Wave uses deterministic macro filters and headline-specific equity mapping — not
        financial advice. Verify before trading.
      </p>
    </div>
  );
}
