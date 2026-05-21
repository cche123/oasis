import { NextResponse } from "next/server";
import type { XPost } from "@/lib/x-types";
import { getHandlesForTopic, type XTopic } from "@/lib/x-voices-config";

async function fetchTwitterApiV2(
  username: string,
  bearerToken: string
): Promise<XPost[]> {
  try {
    const userRes = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}?user.fields=name,username`,
      { headers: { Authorization: `Bearer ${bearerToken}` }, next: { revalidate: 600 } }
    );
    if (!userRes.ok) return [];
    const userData = await userRes.json();
    const userId = userData.data?.id;
    if (!userId) return [];

    const tweetsRes = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at,public_metrics&exclude=retweets,replies`,
      { headers: { Authorization: `Bearer ${bearerToken}` }, next: { revalidate: 300 } }
    );
    if (!tweetsRes.ok) return [];

    const tweetsData = await tweetsRes.json();
    return (tweetsData.data || []).map(
      (t: {
        id: string;
        text: string;
        created_at: string;
        public_metrics?: { like_count?: number };
      }) => ({
        id: t.id,
        text: t.text,
        author: username,
        handle: `@${username}`,
        createdAt: t.created_at,
        url: `https://x.com/${username}/status/${t.id}`,
        likes: t.public_metrics?.like_count,
      })
    );
  } catch {
    return [];
  }
}

/** Google News surfaces X posts when API unavailable */
async function fetchXViaGoogleNews(handle: string): Promise<XPost[]> {
  try {
    const q = encodeURIComponent(`site:twitter.com ${handle} OR from:${handle}`);
    const url = `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(url, {
      headers: { Accept: "application/rss+xml" },
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const items: XPost[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 3) {
      const block = match[1];
      const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(block);
      const linkMatch = /<link>([\s\S]*?)<\/link>/i.exec(block);
      const title = titleMatch?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";
      const link = linkMatch?.[1]?.trim() || "";
      if (title && link.startsWith("http")) {
        items.push({
          id: link,
          text: title,
          author: handle,
          handle: `@${handle}`,
          createdAt: new Date().toISOString(),
          url: link,
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topic = (searchParams.get("topic") || "all") as XTopic;
  const userHandle = searchParams.get("user")?.replace("@", "").trim();
  const bearer = process.env.TWITTER_BEARER_TOKEN;

  const accounts = getHandlesForTopic(topic, userHandle);
  const allPosts: XPost[] = [];

  for (const account of accounts) {
    let posts: XPost[] = [];
    if (bearer) {
      posts = await fetchTwitterApiV2(account, bearer);
    }
    if (posts.length === 0) {
      posts = await fetchXViaGoogleNews(account);
    }
    allPosts.push(...posts.slice(0, 2));
    if (allPosts.length >= 36) break;
  }

  allPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));

  return NextResponse.json({
    posts: allPosts.slice(0, 40),
    voices: accounts,
    topic,
    source: bearer ? "twitter-api" : "google-news-x",
    timestamp: new Date().toISOString(),
  });
}
