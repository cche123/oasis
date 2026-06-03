"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { ExternalLink, AtSign } from "lucide-react";
import { motion } from "framer-motion";
import type { XPost } from "@/lib/x-types";
import {
  X_TOPIC_VOICES,
  resolveXTopicForTheme,
  type XTopic,
} from "@/lib/x-voices-config";
import { cn } from "@/lib/utils";
import { formatPublishedAt } from "@/lib/publish-time";
import { isXStatusUrl } from "@/lib/x-signal-format";

function formatTime(iso: string): string {
  return formatPublishedAt(iso) || "";
}

type XVoicesProps = {
  compact?: boolean;
  maxPosts?: number;
  title?: string;
  showTopicTabs?: boolean;
  defaultTopic?: XTopic;
  /** When set, auto-selects the best X topic for this theme and refreshes on change. */
  themeId?: string;
  themeCategory?: string;
  /** Hide topic tabs and lock to theme-derived topic. */
  lockTopic?: boolean;
};

export function XVoices({
  compact = false,
  maxPosts = 12,
  title = "X Voices",
  showTopicTabs = false,
  defaultTopic = "markets",
  themeId,
  themeCategory,
  lockTopic = false,
}: XVoicesProps) {
  const derivedTopic = useMemo(
    () => (themeId ? resolveXTopicForTheme(themeId, themeCategory) : defaultTopic),
    [themeId, themeCategory, defaultTopic]
  );

  const [posts, setPosts] = useState<XPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [voices, setVoices] = useState<string[]>([]);
  const [topic, setTopic] = useState<XTopic>(derivedTopic);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    setTopic(derivedTopic);
  }, [derivedTopic]);

  useEffect(() => {
    if (!themeId && !lockTopic) {
      setTopic(defaultTopic);
    }
  }, [defaultTopic, themeId, lockTopic]);

  const activeTopic = lockTopic || themeId ? derivedTopic : topic;

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      let user = "";
      try {
        user = localStorage.getItem("oasis-x-username")?.replace("@", "") || "";
      } catch {}
      const params = new URLSearchParams({ topic: activeTopic });
      if (user) params.set("user", user);
      if (themeId) params.set("themeId", themeId);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      const res = await fetch(`/api/x-feed?${params.toString()}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      window.clearTimeout(timeout);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const merged: XPost[] = (data.posts || []).filter((p: XPost) =>
        isXStatusUrl(p.url)
      );

      if (merged.length < 3) {
        const newsRes = await fetch("/api/news?category=Social", { cache: "no-store" });
        if (newsRes.ok) {
          const newsData = await newsRes.json();
          const social = (newsData.signals || [])
            .filter(
              (s: { isXPost?: boolean; category?: string; sourceUrl?: string }) =>
                (s.isXPost || s.category === "Social") && isXStatusUrl(s.sourceUrl || "")
            )
            .map(
              (s: {
                id: string;
                title: string;
                sourceUrl: string;
                publishedAt?: string;
                xHandle?: string;
              }) => ({
                id: s.id,
                text: s.title,
                author: (s.xHandle || "x").replace(/^@/, ""),
                handle: `@${(s.xHandle || "x").replace(/^@/, "")}`,
                createdAt: s.publishedAt || new Date().toISOString(),
                url: s.sourceUrl,
              })
            );
          const seen = new Set(merged.map((p) => p.id));
          for (const p of social) {
            if (!seen.has(p.id)) merged.push(p);
          }
        }
      }

      setPosts(merged.slice(0, maxPosts));
      setVoices(data.voices || []);
    } catch {
      setFetchError(true);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [maxPosts, activeTopic, themeId]);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 3 * 60_000);
    return () => clearInterval(interval);
  }, [fetchFeed]);

  useEffect(() => {
    const onUpdated = () => {
      void fetchFeed();
    };
    window.addEventListener("oasis-x-username-updated", onUpdated);
    return () => window.removeEventListener("oasis-x-username-updated", onUpdated);
  }, [fetchFeed]);

  const topicTabs = X_TOPIC_VOICES.filter((t) => t.id !== "all");
  const topicLabel = X_TOPIC_VOICES.find((t) => t.id === activeTopic)?.label;
  const showTabs = showTopicTabs && !lockTopic && !themeId;

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-1.5">
            <AtSign className="w-3 h-3" /> {title}
          </span>
          {!loading && posts.length > 0 && (
            <span className="text-[9px] text-emerald-500/70 uppercase tracking-widest">
              Live · {topicLabel}
            </span>
          )}
        </div>
        {showTabs && (
          <div className="flex flex-wrap gap-1">
            {[{ id: "all" as XTopic, label: "All" }, ...topicTabs].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTopic(t.id)}
                className={cn(
                  "text-[9px] uppercase tracking-widest px-2 py-0.5 border",
                  activeTopic === t.id
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-2">
            {posts.slice(0, 5).map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs hover:text-foreground transition-colors group"
              >
                <span className="text-foreground font-semibold">{p.handle}</span>
                <span className="text-muted-foreground line-clamp-2"> {p.text}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              {fetchError
                ? "Feed timed out — retrying shortly."
                : `No posts loaded for ${topicLabel ?? activeTopic} yet.`}
            </p>
            <button
              type="button"
              onClick={() => void fetchFeed()}
              className="text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border px-2 py-1"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-foreground pb-2">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <AtSign className="w-4 h-4" /> {title}
        </h2>
        {!loading && posts.length > 0 && (
          <span className="text-[9px] text-emerald-500/70 uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live · {topicLabel}
          </span>
        )}
      </div>

      {showTabs && (
        <div className="flex flex-wrap gap-2">
          {[{ id: "all" as XTopic, label: "All Voices" }, ...topicTabs].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTopic(t.id)}
              className={cn(
                "px-3 py-1.5 text-[10px] uppercase tracking-widest font-medium border transition-colors",
                activeTopic === t.id
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {voices.length > 0 && (
        <p className="text-[10px] text-muted-foreground">
          Scanning @{voices.slice(0, 6).join(", @")}
          {voices.length > 6 ? ` +${voices.length - 6} more` : ""}
          {activeTopic !== "all" ? ` · ${topicLabel}` : ""}
        </p>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-border p-4 animate-pulse h-28 bg-muted/30" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {posts.map((p, i) => (
            <motion.a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="block border border-border p-4 hover:border-foreground transition-all group bg-card"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">{p.handle}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {formatTime(p.createdAt)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-3 group-hover:text-foreground transition-colors">
                {p.text}
              </p>
              <p className="text-[10px] text-muted-foreground/80 mt-2 uppercase tracking-widest flex items-center gap-1">
                Open tweet
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </motion.a>
          ))}
        </div>
      ) : (
        <div className="border border-border bg-card/40 p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
            {fetchError
              ? "Could not reach the X feed — check your connection and retry."
              : `No linkable posts for ${topicLabel ?? activeTopic} right now.`}
          </p>
          <button
            type="button"
            onClick={() => void fetchFeed()}
            className="text-[10px] uppercase tracking-widest border border-border px-4 py-2 hover:border-foreground"
          >
            Retry feed
          </button>
        </div>
      )}
    </section>
  );
}
