"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, ExternalLink, Rss } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useUser } from "@/components/user-context";
import { buildNewsQueryParams } from "@/lib/news-params";
import { XVoices } from "@/components/x-voices";

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVars: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

type LiveSignal = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  category: string;
  summary: string;
};

const CATEGORIES = ["All Signals", "Markets", "M&A", "Macro", "Geopolitics", "Energy"];

export default function SignalsPage() {
  const { user } = useUser();
  const [signals, setSignals] = useState<LiveSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Signals");

  const fetchSignals = useCallback(async () => {
    try {
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
      const res = await fetch(`/api/news${base}${categoryParam}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      if (data.signals) {
        setSignals(data.signals);
      }
    } catch (err) {
      console.warn("Failed to fetch live signals:", err);
    } finally {
      setLoading(false);
    }
  }, [
    activeCategory,
    user.interests,
    user.location,
    user.resolvedLocation,
    user.internationalMarkets,
    user.feedVersion,
  ]);

  useEffect(() => {
    setLoading(true);
    fetchSignals();
  }, [fetchSignals]);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full font-sans">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12 border-b border-border pb-8"
      >
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
      </motion.header>

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
        <motion.div
          variants={containerVars}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-4"
        >
          {signals.map((signal) => (
            <motion.div key={signal.id} variants={itemVars}>
              <a
                href={signal.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-card border border-border p-6 hover:border-foreground transition-all duration-500 group"
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
                  {signal.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  {signal.summary}
                </p>
              </a>
            </motion.div>
          ))}
        </motion.div>
      ) : null}

      <div className="mt-16">
        <XVoices title="X Market Voices" showTopicTabs />
      </div>

      {signals.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Rss className="w-8 h-8 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground font-light mb-2">
            No live signals available for this category.
          </p>
          <p className="text-xs text-muted-foreground">
            RSS feeds may be temporarily unavailable. Try again shortly.
          </p>
        </div>
      )}
    </div>
  );
}
