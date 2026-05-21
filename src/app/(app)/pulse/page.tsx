"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, Variants } from "framer-motion";
import { Zap, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/components/user-context";
import { buildNewsQueryParams } from "@/lib/news-params";
import type { PulseNarrative, NarrativeTier } from "@/lib/pulse-engine";
import { XVoices } from "@/components/x-voices";

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVars: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

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

  const fetchPulse = useCallback(async () => {
    setLoading(true);
    try {
      const newsQs = buildNewsQueryParams({
        interests: user.interests,
        location: user.location,
        resolvedLocation: user.resolvedLocation,
        markets: user.internationalMarkets,
      });
      const params = new URLSearchParams(newsQs.replace("?", ""));
      const res = await fetch(`/api/pulse?${params.toString()}`);
      if (!res.ok) throw new Error("pulse failed");
      const data = await res.json();
      setNarratives(data.narratives || []);
      setPulseDate(data.date || "");
    } catch {
      setNarratives([]);
    } finally {
      setLoading(false);
    }
  }, [user.interests, user.location, user.resolvedLocation, user.internationalMarkets, user.feedVersion]);

  useEffect(() => {
    fetchPulse();
  }, [fetchPulse]);

  const filtered = narratives.filter((n) => {
    if (tierFilter !== "all" && n.tier !== tierFilter) return false;
    if (catFilter !== "All" && n.category !== catFilter) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto w-full font-sans">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 border-b border-border pb-8"
      >
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
      </motion.header>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 border border-border animate-pulse bg-muted/20" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="border border-border divide-y divide-border"
        >
          {filtered.map((n) => (
            <motion.a
              key={n.id}
              href={n.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVars}
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
              {n.summary && (
                <p className="text-sm text-muted-foreground font-light mt-2 line-clamp-2">
                  {n.summary}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-2 italic flex items-center gap-1">
                via {n.source}
                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
              </p>
            </motion.a>
          ))}
        </motion.div>
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
