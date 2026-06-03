export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getHandlesForTopic, type XTopic } from "@/lib/x-voices-config";
import { fetchXPosts } from "@/lib/x-feed-fetch";

const X_FEED_CACHE = new Map<string, { body: object; expires: number }>();
const X_FEED_TTL_MS = 90_000;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topic = (searchParams.get("topic") || "all") as XTopic;
  const userHandle = searchParams.get("user")?.replace("@", "").trim();
  const cacheKey = `${topic}:${userHandle || ""}`;

  const hit = X_FEED_CACHE.get(cacheKey);
  if (hit && hit.expires > Date.now()) {
    return NextResponse.json(hit.body, {
      headers: { "Cache-Control": "public, s-maxage=90, stale-while-revalidate=180" },
    });
  }

  const posts = await fetchXPosts(topic, userHandle, 40);
  const accounts =
    posts.length > 0
      ? [...new Set(posts.map((p) => p.author))]
      : getHandlesForTopic(topic, userHandle).slice(0, 8);

  const body = {
    posts,
    voices: accounts,
    topic,
    themeId: searchParams.get("themeId") || null,
    source: process.env.TWITTER_BEARER_TOKEN ? "syndication+twitter-api" : "syndication",
    timestamp: new Date().toISOString(),
  };

  X_FEED_CACHE.set(cacheKey, { body, expires: Date.now() + X_FEED_TTL_MS });

  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, s-maxage=90, stale-while-revalidate=180" },
  });
}
