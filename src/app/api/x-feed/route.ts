export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getHandlesForTopic, type XTopic } from "@/lib/x-voices-config";
import { fetchXPosts } from "@/lib/x-feed-fetch";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topic = (searchParams.get("topic") || "all") as XTopic;
  const userHandle = searchParams.get("user")?.replace("@", "").trim();

  const posts = await fetchXPosts(topic, userHandle, 40);
  const accounts =
    posts.length > 0
      ? [...new Set(posts.map((p) => p.author))]
      : getHandlesForTopic(topic, userHandle).slice(0, 8);

  return NextResponse.json({
    posts,
    voices: accounts,
    topic,
    source: process.env.TWITTER_BEARER_TOKEN ? "twitter-api" : "x-rss",
    timestamp: new Date().toISOString(),
  });
}
