"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ExternalLink, AtSign } from "lucide-react";
import { motion } from "framer-motion";
import type { XPost } from "@/lib/x-types";
import { X_TOPIC_VOICES, type XTopic } from "@/lib/x-voices-config";
import { cn } from "@/lib/utils";
import { formatPublishedAt } from "@/lib/publish-time";

function loadTwitterWidgets() {
  const existing = document.getElementById("twitter-wjs");
  if (existing) {
    (window as { twttr?: { widgets?: { load: () => void } } }).twttr?.widgets?.load();
    return;
  }
  const script = document.createElement("script");
  script.id = "twitter-wjs";
  script.src = "https://platform.twitter.com/widgets.js";
  script.async = true;
  document.head.appendChild(script);
}

function XTimelineEmbed({ username }: { username: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTwitterWidgets();
    const t = setTimeout(() => {
      (window as { twttr?: { widgets?: { load: (el?: Element) => void } } }).twttr?.widgets?.load(
        ref.current || undefined
      );
    }, 800);
    return () => clearTimeout(t);
  }, [username]);

  return (
    <div ref={ref} className="max-h-[240px] overflow-hidden border border-border">
      <a
        className="twitter-timeline"
        data-height="240"
        data-theme="dark"
        data-chrome="noheader nofooter noborders transparent"
        href={`https://twitter.com/${username}`}
      >
        @{username}
      </a>
    </div>
  );
}

function formatTime(iso: string): string {
  return formatPublishedAt(iso) || "";
}

type XVoicesProps = {
  compact?: boolean;
  maxPosts?: number;
  title?: string;
  showTopicTabs?: boolean;
  defaultTopic?: XTopic;
};

export function XVoices({
  compact = false,
  maxPosts = 12,
  title = "X Voices",
  showTopicTabs = false,
  defaultTopic = "all",
}: XVoicesProps) {
  const [posts, setPosts] = useState<XPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [voices, setVoices] = useState<string[]>([]);
  const [topic, setTopic] = useState<XTopic>(defaultTopic);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      let user = "";
      try {
        user = localStorage.getItem("oasis-x-username")?.replace("@", "") || "";
      } catch {}
      const params = new URLSearchParams({ topic });
      if (user) params.set("user", user);
      const res = await fetch(`/api/x-feed?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setPosts((data.posts || []).slice(0, maxPosts));
      setVoices(data.voices || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [maxPosts, topic]);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 3 * 60_000);
    return () => clearInterval(interval);
  }, [fetchFeed]);

  const topicTabs = X_TOPIC_VOICES.filter((t) => t.id !== "all");

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-1.5">
            <AtSign className="w-3 h-3" /> {title}
          </span>
          {!loading && (
            <span className="text-[9px] text-emerald-500/70 uppercase tracking-widest">Live</span>
          )}
        </div>
        {showTopicTabs && (
          <div className="flex flex-wrap gap-1">
            {[{ id: "all" as XTopic, label: "All" }, ...topicTabs].map((t) => (
              <button
                key={t.id}
                onClick={() => setTopic(t.id)}
                className={cn(
                  "text-[9px] uppercase tracking-widest px-2 py-0.5 border",
                  topic === t.id
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
                className="block text-xs hover:text-foreground transition-colors"
              >
                <span className="text-foreground font-semibold">{p.handle}</span>
                <span className="text-muted-foreground line-clamp-1"> {p.text}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {voices.slice(0, 6).map((u) => (
              <a
                key={u}
                href={`https://x.com/${u}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] uppercase tracking-widest border border-border px-2 py-0.5 hover:border-foreground"
              >
                @{u}
              </a>
            ))}
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
            Live
          </span>
        )}
      </div>

      {showTopicTabs && (
        <div className="flex flex-wrap gap-2">
          {[{ id: "all" as XTopic, label: "All Voices" }, ...topicTabs].map((t) => (
            <button
              key={t.id}
              onClick={() => setTopic(t.id)}
              className={cn(
                "px-3 py-1.5 text-[10px] uppercase tracking-widest font-medium border transition-colors",
                topic === t.id
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
          Scanning {voices.length} accounts
          {topic !== "all" ? ` · ${X_TOPIC_VOICES.find((t) => t.id === topic)?.label}` : ""}
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
              <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-2 group-hover:text-foreground transition-colors">
                {p.text}
              </p>
              <p className="text-[10px] text-muted-foreground/80 mt-2 uppercase tracking-widest">
                via x {p.handle}
              </p>
              <ExternalLink className="w-3 h-3 mt-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.a>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground font-light">
            Embedding live timelines for top voices in this topic:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {voices.slice(0, 3).map((u) => (
              <div key={u}>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  @{u}
                </p>
                <XTimelineEmbed username={u} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
