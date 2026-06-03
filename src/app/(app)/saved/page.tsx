"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { mockThemes } from "@/lib/data";
import {
  buildSavedLibrary,
  filterSignalsForProfile,
  type SavedThemeProfile,
} from "@/lib/saved-theme-registry";
import { buildNewsQueryParams } from "@/lib/news-params";
import { useUser } from "@/components/user-context";
import {
  Search,
  ArrowRight,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  Bookmark,
  Layers,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { XVoices } from "@/components/x-voices";

type LiveSignal = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  category: string;
  summary: string;
};

type TickerQuote = {
  symbol: string;
  price: number;
  change: number;
};

export default function SavedThemesPage() {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signals, setSignals] = useState<LiveSignal[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(true);
  const [quotes, setQuotes] = useState<TickerQuote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);

  const savedItems = useMemo(
    () => buildSavedLibrary(user.interests, mockThemes),
    [user.interests]
  );

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return savedItems;
    return savedItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
    );
  }, [savedItems, query]);

  const selected = useMemo(
    () => filteredItems.find((i) => i.id === selectedId) ?? filteredItems[0] ?? null,
    [filteredItems, selectedId]
  );

  useEffect(() => {
    if (!selectedId && filteredItems[0]) {
      setSelectedId(filteredItems[0].id);
    }
  }, [filteredItems, selectedId]);

  const fetchSignals = useCallback(async () => {
    setSignalsLoading(true);
    try {
      const qs = buildNewsQueryParams({
        interests: user.interests.length > 0 ? user.interests : ["markets"],
        location: user.location,
        resolvedLocation: user.resolvedLocation,
        markets: user.internationalMarkets,
      });
      const res = await fetch(`/api/news${qs}`);
      if (!res.ok) throw new Error("news failed");
      const data = await res.json();
      setSignals(data.signals || []);
    } catch {
      setSignals([]);
    } finally {
      setSignalsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  useEffect(() => {
    if (!selected?.relatedTickers.length) {
      setQuotes([]);
      return;
    }
    let cancelled = false;
    setQuotesLoading(true);
    const symbols = selected.relatedTickers.slice(0, 5).join(",");
    fetch(`/api/market-data?symbols=${encodeURIComponent(symbols)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setQuotes(data?.tickers ?? []);
      })
      .catch(() => {
        if (!cancelled) setQuotes([]);
      })
      .finally(() => {
        if (!cancelled) setQuotesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected?.id, selected?.relatedTickers]);

  const topicSignals = useMemo(
    () => (selected ? filterSignalsForProfile(signals, selected) : []),
    [signals, selected]
  );

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full font-sans">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 border-b border-border pb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <Bookmark className="w-5 h-5 text-foreground" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Personal library
          </span>
        </div>
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground mb-4">
          Saved Intelligence
        </h1>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <p className="text-muted-foreground max-w-xl font-light">
            {savedItems.length} active topic{savedItems.length !== 1 ? "s" : ""}
            {user.interests.length > 0
              ? ` from onboarding`
              : " — select interests in onboarding or explore themes to expand this library"}
            . Select any topic for thesis, watchlist names, live headlines, and where to go next in Oasis.
          </p>
          <div className="relative w-full lg:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border-b border-border bg-transparent placeholder-muted-foreground focus:outline-none focus:border-foreground text-sm transition-colors rounded-none"
              placeholder="Search saved topics..."
            />
          </div>
        </div>
      </motion.header>

      {filteredItems.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">No saved topics match your search.</p>
          <Link href="/explore" className="text-sm underline underline-offset-4">
            Browse themes in Explore →
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Topic list */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-2">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 pb-2 border-b border-border">
              Your topics ({filteredItems.length})
            </h2>
            <div className="border border-border divide-y divide-border max-h-[70vh] overflow-y-auto">
              {filteredItems.map((item, idx) => (
                <TopicRow
                  key={item.id}
                  item={item}
                  index={idx}
                  active={selected?.id === item.id}
                  onSelect={() => setSelectedId(item.id)}
                />
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-7 xl:col-span-8">
            <AnimatePresence mode="wait">
              {selected && (
                <TopicDetailPanel
                  key={selected.id}
                  profile={selected}
                  signals={topicSignals}
                  signalsLoading={signalsLoading}
                  quotes={quotes}
                  quotesLoading={quotesLoading}
                  onRefresh={fetchSignals}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function TopicRow({
  item,
  index,
  active,
  onSelect,
}: {
  item: SavedThemeProfile;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-5 transition-colors ${
        active ? "bg-foreground text-background" : "bg-background hover:bg-muted/40"
      }`}
    >
      <div className="flex gap-4 items-start">
        <span
          className={`text-xs font-mono pt-0.5 shrink-0 ${
            active ? "text-background/50" : "text-muted-foreground/40"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className={`text-[9px] font-bold uppercase tracking-widest border px-1.5 py-0.5 ${
                active ? "border-background/30" : "border-border"
              }`}
            >
              {item.category}
            </span>
            {item.lastUpdated && (
              <span
                className={`text-[9px] uppercase tracking-widest ${
                  active ? "text-background/60" : "text-muted-foreground"
                }`}
              >
                {item.lastUpdated}
              </span>
            )}
          </div>
          <h3 className="font-serif text-lg leading-snug truncate">{item.title}</h3>
          <p
            className={`text-xs mt-1 line-clamp-2 ${
              active ? "text-background/70" : "text-muted-foreground"
            }`}
          >
            {item.subtitle}
          </p>
          <div className="flex gap-0.5 mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                className={`h-0.5 w-5 ${
                  star <= (item.interestScore ?? 3)
                    ? active
                      ? "bg-background"
                      : "bg-foreground"
                    : active
                      ? "bg-background/25"
                      : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

function TopicDetailPanel({
  profile,
  signals,
  signalsLoading,
  quotes,
  quotesLoading,
  onRefresh,
}: {
  profile: SavedThemeProfile;
  signals: LiveSignal[];
  signalsLoading: boolean;
  quotes: TickerQuote[];
  quotesLoading: boolean;
  onRefresh: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <div className="border border-border p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border border-border px-2 py-0.5">
              {profile.category}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-foreground mt-4 mb-2">
              {profile.title}
            </h2>
            <p className="text-muted-foreground font-serif italic">{profile.subtitle}</p>
          </div>
          <Link
            href={`/theme/${profile.id}`}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-colors shrink-0"
          >
            Full theme page <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <section className="mb-8">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Investment thesis
          </h3>
          <p className="font-serif text-lg leading-relaxed text-foreground">{profile.thesis}</p>
        </section>

        <section className="mb-8 bg-muted/30 border-l-4 border-foreground p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground mb-2">
            Transmission mechanism
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{profile.mechanism}</p>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground mb-3">
              What to watch
            </h3>
            <ul className="space-y-2.5">
              {profile.whatToWatch.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-foreground font-mono text-xs shrink-0">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" /> Risks
            </h3>
            <ul className="space-y-2.5">
              {profile.risks.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mb-8">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground mb-3 border-b border-border pb-2">
            Related equities
          </h3>
          {quotesLoading ? (
            <div className="flex flex-wrap gap-2">
              {profile.relatedTickers.slice(0, 5).map((sym) => (
                <span key={sym} className="h-8 w-24 bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.relatedTickers.slice(0, 5).map((sym) => {
                const q = quotes.find((x) => x.symbol === sym);
                return (
                  <Link
                    key={sym}
                    href="/public-markets"
                    className="inline-flex items-center gap-2 border border-border px-3 py-1.5 text-xs hover:border-foreground transition-colors"
                  >
                    <span className="font-mono font-medium">{sym}</span>
                    {q ? (
                      <>
                        <span className="text-muted-foreground">{q.price.toFixed(2)}</span>
                        <span className={q.change < 0 ? "text-red-400" : "text-emerald-400"}>
                          {q.change > 0 ? "+" : ""}
                          {q.change.toFixed(2)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">
            Names tied to this theme — add any to your watchlist via Oasis AI or Public Markets
          </p>
        </section>

        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground mb-4 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" /> Where to go in Oasis
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {profile.features.map((feat) => (
              <Link
                key={feat.href + feat.label}
                href={feat.href}
                className="group border border-border p-4 hover:border-foreground hover:bg-muted/20 transition-colors"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-1.5 group-hover:underline underline-offset-4">
                  {feat.label}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.why}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="border border-border p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-6 border-b border-border pb-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Live headlines for {profile.title}
          </h3>
          <button
            type="button"
            onClick={onRefresh}
            className="text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Refresh feed
          </button>
        </div>

        {signalsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse" />
            ))}
          </div>
        ) : signals.length > 0 ? (
          <div className="space-y-6">
            {signals.map((signal) => (
              <a
                key={signal.id}
                href={signal.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-background bg-foreground px-2 py-0.5">
                    {signal.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {signal.date}
                  </span>
                </div>
                <h4 className="font-serif text-base text-foreground leading-snug group-hover:underline decoration-1 underline-offset-4">
                  {signal.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  via {signal.source}
                  <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            No headlines matched this topic yet — check Pulse or ask Oasis AI to refine your interests.
          </p>
        )}
      </div>

      <XVoices
        title={`X voices · ${profile.title}`}
        themeId={profile.id}
        themeCategory={profile.category}
        lockTopic
        maxPosts={8}
      />
    </motion.div>
  );
}
