"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, ExternalLink, Rss } from "lucide-react";
import { useUser } from "@/components/user-context";
import { buildNewsQueryParams } from "@/lib/news-params";
import { XVoices } from "@/components/x-voices";
import { buildInsightScaffold } from "@/lib/insight-scaffold";
import { cachedFetchJson, readCachedJson } from "@/lib/client-fetch-cache";
import type { XTopic } from "@/lib/x-voices-config";

type LiveSignal = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  category: string;
  summary: string;
  xHandle?: string;
  isXPost?: boolean;
};

const CATEGORIES = ["All Signals", "Markets", "M&A", "Macro", "Geopolitics", "Energy"];

function categoryToXTopic(cat: string): XTopic {
  switch (cat) {
    case "M&A":
      return "ma";
    case "Macro":
    case "Geopolitics":
    case "Energy":
      return "macro";
    case "Markets":
      return "markets";
    default:
      return "all";
  }
}

export default function SignalsPage() {
  const { user } = useUser();
  const [signals, setSignals] = useState<LiveSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Signals");
  const [selectedSignal, setSelectedSignal] = useState<LiveSignal | null>(null);

  const feedKey = [
    activeCategory,
    user.interests.join("|"),
    user.location,
    user.resolvedLocation?.countryCode ?? "",
    user.internationalMarkets.join("|"),
    String(user.feedVersion ?? 0),
  ].join(":");

  const fetchSignals = useCallback(async () => {
    const base = buildNewsQueryParams({
      interests: user.interests,
      location: user.location,
      resolvedLocation: user.resolvedLocation,
      markets: user.internationalMarkets,
    });
    const sep = base ? "&" : "?";
    const categoryParam =
      activeCategory === "All Signals"
        ? ""
        : `${base ? sep : "?"}category=${encodeURIComponent(activeCategory)}`;
    const url = `/api/news${base}${categoryParam}`;
    const cacheKey = `news:${feedKey}`;

    if (!readCachedJson(cacheKey)) setLoading(true);

    try {
      let data = await cachedFetchJson<{ signals?: LiveSignal[] }>(cacheKey, url);

      if (!data.signals?.length && base) {
        const globalCat =
          activeCategory === "All Signals"
            ? ""
            : `?category=${encodeURIComponent(activeCategory)}`;
        data = await cachedFetchJson<{ signals?: LiveSignal[] }>(
          `news:global:${activeCategory}`,
          `/api/news${globalCat}`
        );
      }

      if (data.signals?.length) {
        setSignals(data.signals);
        setSelectedSignal((prev) => {
          if (prev && data.signals!.some((s) => s.id === prev.id)) return prev;
          return data.signals![0] ?? null;
        });
      } else {
        setSignals([]);
        setSelectedSignal(null);
      }
    } catch (err) {
      console.warn("Failed to fetch live signals:", err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, feedKey, user.interests, user.location, user.resolvedLocation, user.internationalMarkets]);

  useEffect(() => {
    void fetchSignals();
    const interval = setInterval(fetchSignals, 3 * 60_000);
    return () => clearInterval(interval);
  }, [fetchSignals, user.feedVersion]);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full font-sans">
      <header className="mb-12 border-b border-border pb-8">
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground mb-4 flex items-center gap-3">
          Signal Feed <Activity className="w-5 h-5 text-muted-foreground" />
          {!loading && signals.length > 0 && (
            <span className="inline-flex items-center gap-1.5 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-500/70 font-medium uppercase tracking-widest font-sans">
                Live
              </span>
            </span>
          )}
        </h1>
        <p className="text-muted-foreground max-w-xl font-light mb-6">
          Real-time intelligence aggregated from WSJ, CNBC, Google News, and
          financial RSS feeds.
        </p>

        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-medium border transition-colors ${
                activeCategory === cat
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-foreground border-border hover:border-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-card border border-border p-6 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
              <div className="h-6 w-3/4 bg-muted rounded mb-2" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : signals.length > 0 ? (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="space-y-4 lg:col-span-8">
            {signals.map((signal) => (
              <button
                key={signal.id}
                type="button"
                onClick={() => setSelectedSignal(signal)}
                className={`block w-full text-left bg-card border p-6 transition-all duration-500 group ${
                  selectedSignal?.id === signal.id
                    ? "border-foreground/60"
                    : "border-border hover:border-foreground"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-background bg-foreground px-2 py-0.5">
                      {signal.category}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">
                      {signal.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-serif italic text-muted-foreground">
                      {signal.source}
                    </span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <h3 className="text-xl font-serif text-foreground mb-2 leading-snug group-hover:underline decoration-1 underline-offset-4">
                  {signal.isXPost || signal.category === "Social" ? (
                    <span className="block">
                      <span className="text-sm font-sans font-semibold not-italic tracking-wide">
                        {signal.xHandle ? `@${signal.xHandle}` : signal.source}
                      </span>
                      <span className="block mt-1 text-lg font-serif font-normal line-clamp-2">
                        {signal.title}
                      </span>
                    </span>
                  ) : (
                    signal.title
                  )}
                </h3>
                {signal.summary && !(signal.isXPost || signal.category === "Social") && (
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {signal.summary}
                  </p>
                )}
                <a
                  href={signal.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex mt-3 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground items-center gap-1"
                >
                  Open source <ExternalLink className="w-3 h-3" />
                </a>
              </button>
            ))}
          </div>

          <aside className="lg:col-span-4 border border-border bg-card p-6 rounded-3xl space-y-4">
            {!selectedSignal ? (
              <div className="text-sm text-muted-foreground font-light leading-relaxed">
                Select a signal to open Oasis’ structured analysis.
              </div>
            ) : (
              (() => {
                const insight = buildInsightScaffold(
                  `${selectedSignal.title} ${selectedSignal.summary ?? ""}`,
                  selectedSignal.category === "Social" ? "Social" : selectedSignal.category
                );
                return (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Oasis Insight · {selectedSignal.category}
                      </p>
                      <p className="text-sm text-foreground font-medium leading-snug">
                        {selectedSignal.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedSignal.source}</p>
                    </div>

                    {insight.triggers.length ? (
                      <div className="flex flex-wrap gap-2">
                        {insight.triggers.map((t) => (
                          <span
                            key={`sig-tr-${selectedSignal.id}-${t}`}
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
                        {insight.mechanism}
                      </p>
                    </div>

                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          What to watch next
                        </p>
                        <ul className="space-y-2">
                          {insight.whatToWatch.slice(0, 3).map((w, idx) => (
                            <li key={`sig-w-${selectedSignal.id}-${idx}`} className="text-sm text-foreground/90">
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
                            <li key={`sig-r-${selectedSignal.id}-${idx}`} className="text-sm text-foreground/90">
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <a
                      href={selectedSignal.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
                    >
                      Open source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })()
            )}
          </aside>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-border bg-card/30">
          <Rss className="w-8 h-8 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground font-light mb-4">
            No signals loaded for this filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void fetchSignals();
            }}
            className="px-4 py-2 text-xs uppercase tracking-widest border border-border hover:border-foreground"
          >
            Retry feed
          </button>
        </div>
      )}

      <div className="mt-16">
        <XVoices
          title={`X Market Voices · ${activeCategory}`}
          showTopicTabs
          defaultTopic={categoryToXTopic(activeCategory)}
        />
      </div>

    </div>
  );
}
