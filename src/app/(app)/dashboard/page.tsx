"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ArrowRight, Rss, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useUser } from "@/components/user-context";
import { mockThemes } from "@/lib/data";
import { buildNewsQueryParams } from "@/lib/news-params";
import { Sparkles, MapPin, Zap } from "lucide-react";
import { XVoices } from "@/components/x-voices";
import { LocationBadge } from "@/components/location-display";
import { InternationalMarketPicker } from "@/components/international-market-picker";
import type { PulseNarrative } from "@/lib/pulse-engine";
import { cachedFetchJson, readCachedJson } from "@/lib/client-fetch-cache";

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVars: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

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

type TickerQuote = {
  symbol: string;
  price: number;
  change: number;
};

function SignalHeadline({ signal }: { signal: LiveSignal }) {
  const isX = signal.isXPost || signal.category === "Social";
  if (isX) {
    const handle = signal.xHandle ? `@${signal.xHandle}` : signal.source.replace(/^x\s/i, "");
    return (
      <>
        <p className="text-xs font-semibold tracking-wide text-foreground mb-1">{handle}</p>
        <h4 className="font-serif text-base text-foreground mb-1 group-hover:text-muted-foreground transition-colors leading-snug line-clamp-2">
          {signal.title}
        </h4>
      </>
    );
  }
  return (
    <h4 className="font-serif text-lg text-foreground mb-1 group-hover:text-muted-foreground transition-colors leading-snug">
      {signal.title}
    </h4>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useUser();
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>([]);
  const [loadingSignals, setLoadingSignals] = useState(true);
  const [feedPulse, setFeedPulse] = useState(false);
  const [pulsePreview, setPulsePreview] = useState<PulseNarrative[]>([]);
  const [trackedQuotes, setTrackedQuotes] = useState<TickerQuote[]>([]);

  const regionLabel = user.resolvedLocation?.valid
    ? user.resolvedLocation.displayName
    : user.location || "Global (US default)";

  const activeThemes =
    user.interests.length > 0
      ? user.interests.map((interest) => {
          const existing = mockThemes.find(
            (t) =>
              t.title.toLowerCase() === interest.toLowerCase() ||
              t.id === interest
          );
          if (existing) return existing;
          return {
            id: interest.toLowerCase().replace(/\s+/g, "-"),
            title: interest,
            subtitle:
              "AI-curated intelligence stream based on your custom interest.",
            category: "Custom Topic",
            interestScore: 3,
            lastUpdated: "Live feed",
            tags: ["Personalized", "AI Curated"],
            isSaved: true,
          };
        })
      : mockThemes.filter((t) => t.isSaved);

  const dashboardNewsKey = [
    "dashboard:news",
    user.interests.join("|"),
    user.location,
    user.resolvedLocation?.countryCode ?? "",
    user.internationalMarkets.join("|"),
  ].join(":");

  const fetchLiveSignals = useCallback(async () => {
    if (!readCachedJson(dashboardNewsKey)) setLoadingSignals(true);
    try {
      const qs = buildNewsQueryParams({
        interests: user.interests,
        location: user.location,
        resolvedLocation: user.resolvedLocation,
        markets: user.internationalMarkets,
      });
      let data = await cachedFetchJson<{ signals?: LiveSignal[] }>(
        dashboardNewsKey,
        `/api/news${qs}`
      );
      if (!data.signals?.length) {
        data = await cachedFetchJson<{ signals?: LiveSignal[] }>(
          "dashboard:news:global",
          "/api/news"
        );
      }
      setLiveSignals(data.signals ?? []);
    } catch (err) {
      console.warn("Live news fetch failed:", err);
    } finally {
      setLoadingSignals(false);
    }
  }, [
    dashboardNewsKey,
    user.interests,
    user.location,
    user.resolvedLocation,
    user.internationalMarkets,
  ]);

  useEffect(() => {
    fetchLiveSignals();
    const interval = setInterval(fetchLiveSignals, 3 * 60_000);
    return () => clearInterval(interval);
  }, [fetchLiveSignals, user.feedVersion]);

  useEffect(() => {
    if (!user.feedVersion) return;
    setFeedPulse(true);
    const t = setTimeout(() => setFeedPulse(false), 1200);
    return () => clearTimeout(t);
  }, [user.feedVersion]);

  useEffect(() => {
    const qs = buildNewsQueryParams({
      interests: user.interests,
      location: user.location,
      resolvedLocation: user.resolvedLocation,
      markets: user.internationalMarkets,
    });
    const pulseKey = `dashboard:pulse:${dashboardNewsKey}`;
    cachedFetchJson<{ narratives?: PulseNarrative[] }>(
      pulseKey,
      `/api/pulse?${qs.replace("?", "")}`
    )
      .then((d) => setPulsePreview((d.narratives || []).slice(0, 5)))
      .catch(() => {});
  }, [dashboardNewsKey, user.interests, user.location, user.resolvedLocation, user.internationalMarkets, user.feedVersion]);

  useEffect(() => {
    const symbols = (user.trackedTickers ?? []).map((s) => s.trim()).filter(Boolean);
    if (symbols.length === 0) {
      setTrackedQuotes([]);
      return;
    }
    const query = encodeURIComponent(symbols.join(","));
    fetch(`/api/market-data?symbols=${query}`)
      .then((r) => r.json())
      .then((d) => setTrackedQuotes((d.tickers || []).slice(0, 8)))
      .catch(() => setTrackedQuotes([]));
  }, [user.trackedTickers, user.feedVersion]);

  const locTerms = [
    user.location,
    user.resolvedLocation?.city,
    user.resolvedLocation?.country,
  ]
    .filter(Boolean)
    .map((s) => s!.toLowerCase());

  const prioritizedSignals = [...liveSignals].sort((a, b) => {
    const interests = (user.interests || []).map((i) => i.toLowerCase());
    let aScore = 0;
    let bScore = 0;
    const aText = `${a.title} ${a.summary} ${a.category}`.toLowerCase();
    const bText = `${b.title} ${b.summary} ${b.category}`.toLowerCase();

    for (const term of locTerms) {
      if (term && aText.includes(term)) aScore += 5;
      if (term && bText.includes(term)) bScore += 5;
    }
    for (const interest of interests) {
      const words = interest.split(/\s+/).filter((w) => w.length > 3);
      for (const w of words) {
        if (aText.includes(w)) aScore += 2;
        if (bText.includes(w)) bScore += 2;
      }
    }
    if (a.category === "Regional") aScore += 4;
    if (b.category === "Regional") bScore += 4;
    return bScore - aScore;
  });

  const regionalSignals = prioritizedSignals
    .filter((s) => s.category === "Regional")
    .slice(0, 3);
  const displaySignals = prioritizedSignals.slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full font-sans">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16 border-b border-border pb-8"
      >
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground mb-2">
          {getGreeting()}, {user.name || "Analyst"}.
        </h1>
        <p className="text-sm text-muted-foreground font-light mb-4">
          Briefing for{" "}
          <span className="text-foreground font-medium">
            {user.resolvedLocation?.valid ? (
              <LocationBadge name={regionLabel} variant="light" />
            ) : (
              regionLabel
            )}
          </span>
          {user.internationalMarkets?.length > 0 && (
            <>
              {" "}
              · Watching{" "}
              <span className="text-foreground font-medium">
                {user.internationalMarkets.join(", ")}
              </span>
            </>
          )}
        </p>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <p className="text-muted-foreground max-w-xl font-light">
            Your curated intelligence hub. Tracking the signals, shifts, and
            themes that matter.
          </p>

          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border-b border-border bg-transparent placeholder-muted-foreground focus:outline-none focus:border-foreground text-sm transition-colors rounded-none"
              placeholder="Search intelligence..."
            />
          </div>
        </div>
      </motion.header>

      {(user.trackedTickers?.length ?? 0) > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border border-border p-5 bg-card/40"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">
              Tracked Symbols
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Ask Oasis AI to add/remove tickers
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(user.trackedTickers ?? []).map((symbol) => {
              const quote = trackedQuotes.find((q) => q.symbol === symbol);
              return (
                <span
                  key={symbol}
                  className="inline-flex items-center gap-2 border border-border px-2.5 py-1 text-xs"
                >
                  <span className="font-mono text-foreground">{symbol}</span>
                  {quote ? (
                    <>
                      <span className="text-muted-foreground">{quote.price.toFixed(2)}</span>
                      <span className={quote.change < 0 ? "text-red-400" : "text-emerald-400"}>
                        {quote.change > 0 ? "+" : ""}
                        {quote.change.toFixed(2)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </span>
              );
            })}
          </div>
        </motion.section>
      )}

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 border border-border p-6 bg-card/50 rounded-2xl"
      >
        <InternationalMarketPicker />
      </motion.section>

      <motion.section
        animate={feedPulse ? { boxShadow: "0 0 0 2px rgba(255,255,255,0.15)" } : { boxShadow: "0 0 0 0px transparent" }}
        transition={{ duration: 0.6 }}
        className="mb-12 border border-border p-6 bg-card/50"
      >
        <div className="flex items-start gap-4">
          <MapPin className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground mb-2">
              Your Region
            </h2>
            {!user.resolvedLocation?.valid && user.location ? (
              <p className="text-sm text-amber-600/90 dark:text-amber-400/90 mb-3">
                Location not recognized — using US news. Tell Oasis AI your city to refine.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground font-light mb-3">
                Live news prioritized for {regionLabel}
                {user.interests.length > 0 && ` and ${user.interests.slice(0, 3).join(", ")}${user.interests.length > 3 ? "…" : ""}`}.
              </p>
            )}
            {regionalSignals.length > 0 ? (
              <ul className="space-y-3">
                {regionalSignals.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-serif text-foreground hover:underline flex items-center gap-1.5"
                    >
                      {s.title}
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : loadingSignals ? (
              <p className="text-xs text-muted-foreground">Loading regional signals…</p>
            ) : null}
            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Tell Oasis AI to personalize anything — your feed updates in real time.
            </p>
          </div>
        </div>
      </motion.section>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-16">
          {/* Saved Themes */}
          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVars}
          >
            <div className="flex items-center justify-between mb-8 border-b border-foreground pb-2">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">
                Saved Themes
              </h2>
              <Link
                href="/saved"
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center"
              >
                View all <ArrowRight className="w-3 h-3 ml-2" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {activeThemes.map((theme) => (
                <motion.div key={theme.id} variants={itemVars}>
                  <Link
                    href={`/theme/${theme.id}`}
                    className="block group bg-card border border-border p-6 hover:border-foreground transition-all duration-500"
                  >
                    <div className="flex gap-2 mb-4">
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-widest border border-border px-2 py-0.5">
                        {theme.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-serif text-foreground group-hover:underline decoration-1 underline-offset-4 mb-2">
                      {theme.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-light line-clamp-2">
                      {theme.subtitle}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVars}
          >
            <div className="flex items-center justify-between mb-8 border-b border-foreground pb-2">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" /> Public Markets Pulse
              </h2>
              <Link
                href="/pulse"
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Full pulse <ArrowRight className="w-3 h-3 inline ml-1" />
              </Link>
            </div>
            <div className="border border-border divide-y divide-border">
              {pulsePreview.map((p) => (
                <a
                  key={p.id}
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 hover:bg-muted/30 transition-colors group"
                >
                  <p className="font-serif text-foreground text-sm group-hover:underline line-clamp-2">
                    {p.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {p.category} · via {p.source}
                  </p>
                </a>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVars}
          >
            <XVoices title="X Market Voices" showTopicTabs />
          </motion.section>
        </div>

        <div className="lg:col-span-4 space-y-16">
          <motion.section variants={containerVars} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <XVoices compact maxPosts={8} title="X Signals" showTopicTabs />
          </motion.section>
          {/* Live Signals Feed */}
          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVars}
          >
            <div className="flex items-center justify-between mb-8 border-b border-foreground pb-2">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                Live Signals
                {!loadingSignals && liveSignals.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-emerald-500/70 font-medium normal-case tracking-widest">
                      Live
                    </span>
                  </span>
                )}
              </h2>
            </div>
            <div className="space-y-6">
              {loadingSignals ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-3 bg-muted rounded w-16" />
                      <div className="h-5 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-24" />
                    </div>
                  ))}
                </div>
              ) : displaySignals.length > 0 ? (
                displaySignals.map((signal) => (
                  <motion.div key={signal.id} variants={itemVars}>
                    <a
                      href={signal.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-bold text-background bg-foreground px-2 py-0.5 uppercase tracking-widest">
                          {signal.category}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                          {signal.date}
                        </span>
                      </div>
                      <SignalHeadline signal={signal} />
                      <p className="text-xs text-muted-foreground font-serif italic flex items-center gap-1.5">
                        via {signal.source}{" "}
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                    </a>
                  </motion.div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground font-light">
                  <Rss className="w-4 h-4 mb-2 opacity-50" />
                  Unable to load live signals. Showing cached data.
                </div>
              )}
              <motion.div variants={itemVars}>
                <Link
                  href="/signals"
                  className="block text-center text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground pt-4 border-t border-border mt-4 transition-colors"
                >
                  View full feed
                </Link>
              </motion.div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
