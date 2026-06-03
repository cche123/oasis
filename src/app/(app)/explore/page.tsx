"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { categories, mockThemes, type Theme } from "@/lib/data";
import {
  resolveSavedProfile,
  filterSignalsForProfile,
  type SavedThemeProfile,
} from "@/lib/saved-theme-registry";
import { resolveXTopicForCategory } from "@/lib/x-voices-config";
import { buildNewsQueryParams } from "@/lib/news-params";
import { useUser } from "@/components/user-context";
import { XVoices } from "@/components/x-voices";
import { InternationalMarketPicker } from "@/components/international-market-picker";
import { Search, Filter, ArrowRight, ExternalLink, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type LiveSignal = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  category: string;
  summary: string;
};

type TickerQuote = { symbol: string; price: number; change: number };

export default function ExplorePage() {
  const { user } = useUser();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signals, setSignals] = useState<LiveSignal[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(true);
  const [quotes, setQuotes] = useState<TickerQuote[]>([]);

  const filteredThemes = useMemo(() => {
    let list = mockThemes;
    if (activeCategory !== "All") {
      list = list.filter((t) => t.category === activeCategory);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.subtitle.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategory, search]);

  const selectedTheme = useMemo(
    () => filteredThemes.find((t) => t.id === selectedId) ?? filteredThemes[0] ?? null,
    [filteredThemes, selectedId]
  );

  const profile = useMemo(
    () => (selectedTheme ? resolveSavedProfile(selectedTheme.id, selectedTheme) : null),
    [selectedTheme]
  );

  useEffect(() => {
    if (filteredThemes.length > 0) {
      const stillVisible = filteredThemes.some((t) => t.id === selectedId);
      if (!stillVisible) setSelectedId(filteredThemes[0].id);
    }
  }, [filteredThemes, selectedId]);

  const fetchSignals = useCallback(async () => {
    setSignalsLoading(true);
    try {
      const interests = profile
        ? [profile.title, ...user.interests]
        : user.interests.length > 0
          ? user.interests
          : ["markets"];
      const qs = buildNewsQueryParams({
        interests,
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
  }, [user, profile]);

  useEffect(() => {
    void fetchSignals();
  }, [fetchSignals]);

  useEffect(() => {
    if (!profile?.relatedTickers.length) {
      setQuotes([]);
      return;
    }
    let cancelled = false;
    const symbols = profile.relatedTickers.slice(0, 5).join(",");
    fetch(`/api/market-data?symbols=${encodeURIComponent(symbols)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setQuotes(data?.tickers ?? []);
      })
      .catch(() => {
        if (!cancelled) setQuotes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [profile?.id, profile?.relatedTickers]);

  const topicSignals = useMemo(
    () => (profile ? filterSignalsForProfile(signals, profile) : []),
    [signals, profile]
  );

  const categoryXTopic = resolveXTopicForCategory(
    activeCategory === "All" ? "" : activeCategory
  );

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full font-sans">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 border-b border-border pb-8"
      >
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground mb-4">
          Explore Markets
        </h1>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <p className="text-muted-foreground max-w-xl font-light">
            Pick a theme to open thesis, live headlines, related equities, and X voices
            matched to that topic — every category and card has substance behind it.
          </p>
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative w-full lg:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border-b border-border bg-transparent placeholder-muted-foreground focus:outline-none focus:border-foreground text-sm transition-colors rounded-none"
                placeholder="Search themes..."
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                "px-4 py-2 border flex items-center gap-2 transition-colors text-xs uppercase tracking-widest font-medium shrink-0",
                showFilters ? "border-foreground bg-muted" : "border-border hover:border-foreground"
              )}
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>
      </motion.header>

      <div className="grid lg:grid-cols-12 gap-8 mb-10">
        <div className="lg:col-span-8">
          <div className="flex flex-wrap gap-2">
            <CategoryPill
              label="All"
              active={activeCategory === "All"}
              onClick={() => setActiveCategory("All")}
            />
            {categories.map((category) => (
              <CategoryPill
                key={category}
                label={category}
                active={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {filteredThemes.length} theme{filteredThemes.length === 1 ? "" : "s"}
            {activeCategory !== "All" ? ` in ${activeCategory}` : ""} — click any row for full intel.
          </p>
        </div>
        {showFilters && (
          <div className="lg:col-span-4 border border-border p-5 rounded-2xl bg-card/40">
            <InternationalMarketPicker />
          </div>
        )}
      </div>

      {filteredThemes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center border border-border">
          No themes match — try another category or search term.
        </p>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-4 xl:col-span-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 pb-2 border-b border-border">
              Themes
            </h2>
            <div className="border border-border divide-y divide-border max-h-[75vh] overflow-y-auto">
              {filteredThemes.map((theme) => (
                <ThemeRow
                  key={theme.id}
                  theme={theme}
                  active={selectedTheme?.id === theme.id}
                  onSelect={() => setSelectedId(theme.id)}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-8">
            <AnimatePresence mode="wait">
              {selectedTheme && profile && (
                <ExploreDetail
                  key={selectedTheme.id}
                  theme={selectedTheme}
                  profile={profile}
                  signals={topicSignals}
                  signalsLoading={signalsLoading}
                  quotes={quotes}
                  onRefresh={fetchSignals}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="mt-16">
        <XVoices
          title={
            activeCategory === "All"
              ? "X Voices Across Markets"
              : `X Voices · ${activeCategory}`
          }
          showTopicTabs
          defaultTopic={categoryXTopic}
        />
      </div>
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 border text-xs uppercase tracking-widest font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-foreground hover:border-foreground bg-transparent"
      )}
    >
      {label}
    </button>
  );
}

function ThemeRow({
  theme,
  active,
  onSelect,
}: {
  theme: Theme;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left p-5 transition-colors",
        active ? "bg-foreground text-background" : "bg-background hover:bg-muted/40"
      )}
    >
      <div className="flex justify-between items-start gap-3 mb-2">
        <span
          className={cn(
            "text-[9px] font-bold uppercase tracking-widest border px-1.5 py-0.5",
            active ? "border-background/30" : "border-border"
          )}
        >
          {theme.category}
        </span>
        {!theme.isSaved && (
          <span
            className={cn(
              "text-[9px] uppercase tracking-widest",
              active ? "text-background/60" : "text-muted-foreground"
            )}
          >
            Explore
          </span>
        )}
      </div>
      <h3 className="font-serif text-lg leading-snug">{theme.title}</h3>
      <p
        className={cn(
          "text-xs mt-1 line-clamp-2",
          active ? "text-background/70" : "text-muted-foreground"
        )}
      >
        {theme.subtitle}
      </p>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {theme.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className={cn(
              "text-[9px] uppercase tracking-widest",
              active ? "text-background/50" : "text-muted-foreground"
            )}
          >
            #{tag.replace(/\s+/g, "")}
          </span>
        ))}
      </div>
    </button>
  );
}

function ExploreDetail({
  theme,
  profile,
  signals,
  signalsLoading,
  quotes,
  onRefresh,
}: {
  theme: Theme;
  profile: SavedThemeProfile;
  signals: LiveSignal[];
  signalsLoading: boolean;
  quotes: TickerQuote[];
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
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border border-border px-2 py-0.5">
              {theme.category}
            </span>
            <h2 className="text-3xl font-serif font-light text-foreground mt-4 mb-2">
              {theme.title}
            </h2>
            <p className="text-muted-foreground font-serif italic max-w-2xl">{theme.subtitle}</p>
          </div>
          <Link
            href={`/theme/${theme.id}`}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-colors shrink-0"
          >
            Full page <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <section className="mb-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground mb-2 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Thesis
          </h3>
          <p className="font-serif text-lg leading-relaxed">{profile.thesis}</p>
        </section>

        <section className="mb-6 bg-muted/30 border-l-4 border-foreground p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{profile.mechanism}</p>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2">What to watch</h3>
            <ul className="space-y-2">
              {profile.whatToWatch.map((w, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="font-mono text-xs text-foreground">{i + 1}.</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Risks
            </h3>
            <ul className="space-y-2">
              {profile.risks.map((r, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {profile.relatedTickers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 border-b border-border pb-2">
              Related equities
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.relatedTickers.slice(0, 5).map((sym) => {
                const q = quotes.find((x) => x.symbol === sym);
                return (
                  <Link
                    key={sym}
                    href="/public-markets"
                    className="inline-flex items-center gap-2 border border-border px-3 py-1.5 text-xs hover:border-foreground"
                  >
                    <span className="font-mono">{sym}</span>
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
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-3">
          {profile.features.map((feat) => (
            <Link
              key={feat.href + feat.label}
              href={feat.href}
              className="border border-border p-3 hover:border-foreground transition-colors group"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest group-hover:underline">
                {feat.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{feat.why}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="border border-border p-6 md:p-8">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Live headlines</h3>
          <button
            type="button"
            onClick={onRefresh}
            className="text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Refresh
          </button>
        </div>
        {signalsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse" />
            ))}
          </div>
        ) : signals.length > 0 ? (
          <div className="space-y-5">
            {signals.slice(0, 6).map((s) => (
              <a
                key={s.id}
                href={s.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold uppercase bg-foreground text-background px-2 py-0.5">
                    {s.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{s.date}</span>
                </div>
                <h4 className="font-serif text-base group-hover:underline">{s.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  via {s.source}
                  <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
                </p>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No headlines matched yet — try Pulse or broaden your interests in Settings.
          </p>
        )}
      </div>

      <XVoices
        title={`X voices · ${theme.title}`}
        themeId={theme.id}
        themeCategory={theme.category}
        lockTopic
        maxPosts={8}
      />
    </motion.div>
  );
}
