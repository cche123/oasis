"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { mockThemes } from "@/lib/data";
import { Bookmark, BookmarkCheck, ArrowLeft, ExternalLink, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useUser } from "@/components/user-context";
import { buildNewsQueryParams } from "@/lib/news-params";
import { resolveSavedProfile } from "@/lib/saved-theme-registry";
import { XVoices } from "@/components/x-voices";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
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

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function themeKeywords(themeId: string, title: string): string[] {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((w) => w.length > 2);

  if (themeId === "ai-enabled-roll-ups") {
    return ["ai", "roll-up", "rollups", "consolidation", "acquisition", "buyout", "software services"];
  }
  if (themeId.includes("defense")) {
    return ["defense", "aerospace", "military", "security"];
  }
  if (themeId.includes("semiconductor")) {
    return ["semiconductor", "chip", "fab", "foundry"];
  }
  return base;
}

export default function ThemeDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { user } = useUser();
  const [signals, setSignals] = useState<LiveSignal[]>([]);
  const [loading, setLoading] = useState(true);

  const mockTheme = mockThemes.find((t) => t.id === id);
  const interestTheme = user.interests.find(
    (i) => i.toLowerCase().replace(/\s+/g, "-") === id
  );
  const title = mockTheme?.title || interestTheme || slugToTitle(id);
  const subtitle =
    mockTheme?.subtitle ||
    "AI-curated intelligence from live news sources — updated continuously.";
  const category = mockTheme?.category || "Custom Topic";
  const profile = resolveSavedProfile(id, mockTheme);

  const fetchSignals = useCallback(async () => {
    setLoading(true);
    try {
      const qs = buildNewsQueryParams({
        interests: [title, ...(user.interests || [])],
        location: user.location,
        resolvedLocation: user.resolvedLocation,
        markets: user.internationalMarkets,
      });
      const res = await fetch(`/api/news${qs}`);
      if (!res.ok) throw new Error("news failed");
      const data = await res.json();
      const keys = profile.keywords.length > 0 ? profile.keywords : themeKeywords(id, title);
      const filtered = (data.signals || []).filter((s: LiveSignal) => {
        const text = `${s.title} ${s.summary}`.toLowerCase();
        return (
          keys.some((w) => text.includes(w)) ||
          s.category.toLowerCase().includes("m&a") ||
          s.category.toLowerCase().includes("venture")
        );
      });
      setSignals(filtered.length > 0 ? filtered.slice(0, 12) : (data.signals || []).slice(0, 8));
    } catch {
      setSignals([]);
    } finally {
      setLoading(false);
    }
  }, [id, title, user, profile.keywords]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full font-sans">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col md:flex-row items-start justify-between gap-6 border-b border-border pb-10"
      >
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-0.5 border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              {category}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Live feed
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-light text-foreground mb-4 leading-tight tracking-tight">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-serif italic max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>
        <button
          className={`flex items-center gap-2 px-6 py-3 border transition-colors shrink-0 text-xs uppercase tracking-widest font-medium ${
            mockTheme?.isSaved
              ? "bg-background border-foreground text-foreground"
              : "bg-foreground border-foreground text-background hover:bg-transparent hover:text-foreground"
          }`}
        >
          {mockTheme?.isSaved ? (
            <>
              <BookmarkCheck className="w-4 h-4" /> Saved
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" /> Save Theme
            </>
          )}
        </button>
      </motion.header>

      <div className="grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-16">
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Overview
            </h2>
            <p className="font-serif text-xl leading-[1.8] text-foreground font-light">
              {profile.thesis}
            </p>
          </motion.section>

          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-muted/30 p-8 border-l-4 border-foreground"
          >
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground mb-6 flex items-center gap-3">
              <TrendingUp className="w-4 h-4" /> Why this matters
            </h2>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{profile.mechanism}</p>
            <ul className="space-y-5">
              {profile.whatToWatch.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="font-serif italic text-muted-foreground text-xl leading-none mt-1">
                    {["I", "II", "III", "IV"][i] ?? String(i + 1)}.
                  </span>
                  <p className="font-serif text-lg leading-relaxed text-foreground">{item}</p>
                </li>
              ))}
            </ul>
          </motion.section>

          <XVoices
            compact
            title="X signals for this theme"
            themeId={id}
            themeCategory={category}
            lockTopic
          />
        </div>

        <div className="lg:col-span-4 space-y-12">
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground mb-6 border-b border-foreground pb-2">
              Live Signals
            </h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse" />
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
                    className="block group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-background bg-foreground px-2 py-0.5">
                        {signal.category}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                        {signal.date}
                      </span>
                    </div>
                    <h4 className="font-serif text-lg text-foreground mb-2 leading-snug group-hover:underline decoration-1 underline-offset-4">
                      {signal.title}
                    </h4>
                    <p className="text-sm text-muted-foreground font-serif italic mb-2 flex items-center gap-1">
                      via {signal.source}
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                No headlines matched yet — try Pulse or ask Oasis AI to add this topic.
              </p>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}
