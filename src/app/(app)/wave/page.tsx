"use client";

import { useCallback, useEffect, useState } from "react";
import { Scan, ArrowUpRight, ArrowDownRight, Loader2, ExternalLink } from "lucide-react";
import { useUser } from "@/components/user-context";
import type { RippleAnalysis } from "@/lib/ripple-engine";
import { cn } from "@/lib/utils";

type NewsItem = {
  id: string;
  headline: string;
  source: string;
  sourceUrl: string;
  date: string;
  summary?: string;
};

export default function WavePage() {
  const { user } = useUser();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [analysis, setAnalysis] = useState<RippleAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const region =
    user.resolvedLocation?.valid && user.resolvedLocation.country
      ? user.resolvedLocation.country === "US"
        ? "USA"
        : user.resolvedLocation.country
      : "USA";

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ripple?limit=40", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
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
      setAnalysis(data.analysis);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full font-sans pb-24">
      <header className="space-y-3 mb-8">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          <Scan className="w-3.5 h-3.5" />
          Oasis Wave
        </div>
        <h1 className="text-4xl font-serif tracking-tight">Macro wave scan</h1>
        <p className="text-muted-foreground font-light max-w-2xl leading-relaxed">
          Select any live headline to see how it waves through markets — calls, puts,
          and sector moves based on your profile.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <section className="border border-border bg-card min-h-[520px] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Live news
            </p>
            <button
              type="button"
              onClick={() => void fetchNews()}
              className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Refresh
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[70vh]">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading feeds…
              </div>
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
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        {item.source} · {item.date}
                      </p>
                      <p className="text-sm font-medium text-foreground leading-snug pr-6">
                        {item.headline}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section
          className="border border-border bg-card min-h-[520px] p-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            const item = items.find((i) => i.id === dragId);
            if (item) void analyzeItem(item);
            setDragId(null);
          }}
        >
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16">
              <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-xs">
                Click a headline or drag one here to scan market waves.
              </p>
            </div>
          ) : analyzing ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning…
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  {analysis.categoryLabel}
                </p>
                <a
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium text-foreground hover:underline leading-snug inline-flex gap-2 items-start"
                >
                  {selected.headline}
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-1 opacity-50" />
                </a>
                <p className="text-xs text-muted-foreground mt-2">{selected.source}</p>
              </div>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                {analysis.summary}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {analysis.impacts.map((impact) => (
                  <div
                    key={impact.ticker}
                    className="border border-border p-4 space-y-2 bg-background/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold">{impact.ticker}</span>
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-widest flex items-center gap-1",
                          impact.direction === "bullish" ? "text-emerald-500" : "text-red-400"
                        )}
                      >
                        {impact.direction === "bullish" ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {impact.instrument} · {impact.confidence}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {impact.thesis}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <p className="text-[10px] text-muted-foreground/70 leading-relaxed max-w-3xl mt-8">
        Wave uses a rules-based sector map — not financial advice. Headlines link to original
        sources. Always verify before trading.
      </p>
    </div>
  );
}
