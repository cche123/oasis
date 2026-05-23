"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Landmark, ExternalLink, Rocket } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/components/user-context";
import { buildNewsQueryParams } from "@/lib/news-params";

type Deal = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  category: string;
  summary: string;
  company?: string;
};

const FILTERS = ["All", "Venture", "Seed & Series A", "Private Equity", "AI & Defense", "Space & Defense", "Unicorns"];

export default function PrivateMarketsPage() {
  const { user } = useUser();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

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

  const regionalHint = user.resolvedLocation?.valid
    ? user.resolvedLocation.displayName
    : null;

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
      </motion.header>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 border border-border animate-pulse bg-muted/20" />
          ))}
        </div>
      ) : (
        <div className="border border-border divide-y divide-border">
          {filtered.map((deal, i) => (
            <motion.a
              key={deal.id}
              href={deal.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="block p-6 hover:bg-muted/20 transition-colors group"
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
                    <span className="text-[10px] text-muted-foreground ml-auto">{deal.date}</span>
                  </div>
                  <h2 className="font-serif text-xl text-foreground group-hover:underline decoration-1 underline-offset-4 leading-snug">
                    {deal.title}
                  </h2>
                  {deal.summary && (
                    <p className="text-sm text-muted-foreground font-light mt-2 line-clamp-2">
                      {deal.summary}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-2 italic flex items-center gap-1">
                    via {deal.source}
                    <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
                  </p>
                </div>
              </div>
            </motion.a>
          ))}
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
