import type { XPost } from "@/lib/x-types";
import { getHandlesForTopic, type XTopic } from "@/lib/x-voices-config";
import { parsePubDate, toIsoOrNull } from "@/lib/publish-time";
import { compactXPostText, resolveXHandle } from "@/lib/x-signal-format";

async function fetchTwitterApiV2(
  username: string,
  bearerToken: string
): Promise<XPost[]> {
  try {
    const userRes = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}?user.fields=name,username`,
      { headers: { Authorization: `Bearer ${bearerToken}` }, cache: "no-store" }
    );
    if (!userRes.ok) return [];
    const userData = await userRes.json();
    const userId = userData.data?.id;
    if (!userId) return [];

    const tweetsRes = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at,public_metrics&exclude=retweets,replies`,
      { headers: { Authorization: `Bearer ${bearerToken}` }, cache: "no-store" }
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
        text: compactXPostText(t.text, 140),
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

async function fetchXViaGoogleNews(handle: string): Promise<XPost[]> {
  try {
    const q = encodeURIComponent(`from:${handle} (markets OR stocks OR economy)`);
    const url = `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(url, {
      headers: { Accept: "application/rss+xml" },
      cache: "no-store",
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const items: XPost[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 2) {
      const block = match[1];
      const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(block);
      const linkMatch = /<link>([\s\S]*?)<\/link>/i.exec(block);
      const pubMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(block);
      const rawTitle = titleMatch?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";
      const link = linkMatch?.[1]?.trim() || "";
      const published = parsePubDate(pubMatch?.[1]?.trim());
      const resolvedHandle = resolveXHandle(link, rawTitle, handle) || handle;
      if (rawTitle && link.startsWith("http")) {
        items.push({
          id: `${resolvedHandle}-${link}`,
          text: compactXPostText(rawTitle, 140),
          author: resolvedHandle,
          handle: `@${resolvedHandle}`,
          createdAt: toIsoOrNull(published) || new Date(0).toISOString(),
          url: link.includes("news.google.com") ? `https://x.com/${resolvedHandle}` : link,
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

export async function fetchXPosts(
  topic: XTopic = "markets",
  userHandle?: string,
  maxPosts = 16
): Promise<XPost[]> {
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
    if (allPosts.length >= maxPosts * 2) break;
  }

  allPosts.sort((a, b) => {
    const aT = new Date(a.createdAt).getTime();
    const bT = new Date(b.createdAt).getTime();
    if (bT !== aT) return bT - aT;
    return (b.likes || 0) - (a.likes || 0);
  });

  return allPosts.slice(0, maxPosts);
}
