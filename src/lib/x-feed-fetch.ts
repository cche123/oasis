import type { XPost } from "@/lib/x-types";
import { getHandlesForTopic, type XTopic } from "@/lib/x-voices-config";
import { parsePubDate, toIsoOrNull } from "@/lib/publish-time";
import { compactXPostText, resolveXHandle, isXStatusUrl } from "@/lib/x-signal-format";
import { resolveXHandleAlias } from "@/lib/x-handle-aliases";
import { getFallbackXPosts } from "@/lib/x-fallback-posts";

const SYNDICATION_CACHE = new Map<string, { posts: XPost[]; expires: number }>();
const SYNDICATION_TTL_MS = 6 * 60_000;
const SYNDICATION_STALE_MS = 45 * 60_000;
const SYNDICATION_MIN_GAP_MS = 900;

let lastSyndicationFetchAt = 0;

async function throttleSyndication(): Promise<void> {
  const now = Date.now();
  const wait = lastSyndicationFetchAt + SYNDICATION_MIN_GAP_MS - now;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastSyndicationFetchAt = Date.now();
}

const TOPIC_NEWS_QUERY: Record<XTopic, string> = {
  all: "(markets OR stocks OR economy OR fed OR oil OR AI OR crypto)",
  ai: "(AI OR LLM OR semiconductor OR OpenAI OR Nvidia OR Anthropic)",
  founders: "(CEO OR startup OR founder OR earnings OR guidance)",
  vc: "(venture OR funding OR series OR IPO OR valuation OR raise)",
  ma: "(merger OR acquisition OR deal OR buyout OR takeover)",
  macro: "(fed OR CPI OR inflation OR rates OR treasury OR recession)",
  crypto: "(bitcoin OR ethereum OR crypto OR blockchain OR BTC)",
  markets: "(markets OR stocks OR S&P OR Nasdaq OR equities OR oil)",
};

function extractXStatusUrl(text: string): string | null {
  const m = text.match(
    /https?:\/\/(?:x\.com|twitter\.com)\/([A-Za-z0-9_]{1,15})\/status\/(\d+)/i
  );
  if (!m?.[1] || !m?.[2]) return null;
  return `https://x.com/${m[1]}/status/${m[2]}`;
}

function extractTag(block: string, tag: string): string {
  const cdata = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, "i").exec(block);
  if (cdata) return cdata[1].trim();
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(block);
  return m ? m[1].trim() : "";
}

/** Public syndication timeline — returns real /status/ links without API keys. */
async function fetchXViaSyndication(username: string): Promise<XPost[]> {
  const handle = resolveXHandleAlias(username);
  const now = Date.now();
  const cached = SYNDICATION_CACHE.get(handle);
  if (cached && cached.expires > now) return cached.posts;

  const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${encodeURIComponent(handle)}`;

  try {
    await throttleSyndication();
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!res.ok || res.status === 429) {
      if (cached && cached.expires > now - SYNDICATION_STALE_MS) return cached.posts;
      return [];
    }

    const html = await res.text();
    if (html.length < 500) {
      if (cached && cached.expires > now - SYNDICATION_STALE_MS) return cached.posts;
      return [];
    }
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/
    );
    if (!match?.[1]) return [];

    const data = JSON.parse(match[1]) as {
      props?: {
        pageProps?: {
          timeline?: {
            entries?: Array<{
              type?: string;
              entry_id?: string;
              content?: {
                tweet?: {
                  id_str?: string;
                  conversation_id_str?: string;
                  full_text?: string;
                  text?: string;
                  created_at?: string;
                  favorite_count?: number;
                  user?: { screen_name?: string };
                };
              };
            }>;
          };
        };
      };
    };

    const entries = data.props?.pageProps?.timeline?.entries ?? [];
    const posts: XPost[] = [];

    for (const entry of entries) {
      if (entry.type !== "tweet") continue;
      const tweet = entry.content?.tweet;
      if (!tweet) continue;

      const idStr =
        tweet.id_str ||
        tweet.conversation_id_str ||
        entry.entry_id?.replace(/^tweet-/, "");
      const screenName = tweet.user?.screen_name || handle;
      const text = tweet.full_text || tweet.text || "";
      if (!idStr || !text.trim()) continue;

      posts.push({
        id: idStr,
        text: compactXPostText(text, 140),
        author: screenName,
        handle: `@${screenName}`,
        createdAt:
          toIsoOrNull(parsePubDate(tweet.created_at ?? "")) ||
          new Date().toISOString(),
        url: `https://x.com/${screenName}/status/${idStr}`,
        likes: tweet.favorite_count,
      });
      if (posts.length >= 5) break;
    }

    const valid = posts.filter((p) => isXStatusUrl(p.url));
    if (valid.length > 0) {
      SYNDICATION_CACHE.set(handle, { posts: valid, expires: now + SYNDICATION_TTL_MS });
    }
    return valid;
  } catch {
    if (cached && cached.expires > now - SYNDICATION_STALE_MS) return cached.posts;
    return [];
  }
}

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

async function fetchXViaGoogleNews(handle: string, topic: XTopic = "markets"): Promise<XPost[]> {
  try {
    const topicQuery = TOPIC_NEWS_QUERY[topic] ?? TOPIC_NEWS_QUERY.markets;
    const q = encodeURIComponent(`("@${handle}" OR "from:${handle}") ${topicQuery}`);
    const url = `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(url, {
      headers: { Accept: "application/rss+xml", "User-Agent": "Oasis/1.0" },
      cache: "no-store",
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const items: XPost[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 3) {
      const block = match[1];
      const rawTitle = extractTag(block, "title").replace(/<!\[CDATA\[|\]\]>/g, "");
      const link = extractTag(block, "link");
      const description = extractTag(block, "description");
      const pubDate = extractTag(block, "pubDate");
      const published = parsePubDate(pubDate);
      const resolvedHandle = resolveXHandle(link, rawTitle, handle) || handle;
      const blob = `${rawTitle} ${description} ${link}`;
      const statusUrl = extractXStatusUrl(blob);

      if (!rawTitle || !link.startsWith("http")) continue;
      if (!statusUrl) continue;
      const finalUrl = statusUrl;
      items.push({
        id: `${resolvedHandle}-${statusUrl ?? link}`,
        text: compactXPostText(rawTitle, 140),
        author: resolvedHandle,
        handle: `@${resolvedHandle}`,
        createdAt: toIsoOrNull(published) || new Date(0).toISOString(),
        url: finalUrl,
      });
    }
    return items;
  } catch {
    return [];
  }
}

function scoreXPost(text: string): number {
  const t = text.toLowerCase();
  const keywordWeights: Array<[RegExp, number]> = [
    [/\b(m&a|merger|acquisition|deal|buyout|takeover)\b/, 8],
    [/\b(raise|funding|round|seed|series|venture|valuation|ipo)\b/, 7],
    [/\b(earnings|guidance|revenue|margin|beat|miss)\b/, 6],
    [/\b(fed|cpi|jobs|rate|rates|inflation|yields)\b/, 5],
    [/\b(oil|brent|wti|opec|lng|gas|pipeline|refinery)\b/, 5],
    [/\b(ukraine|israel|iran|gaza|sanctions|hormuz|red sea|taiwan strait)\b/, 5],
    [/\b(ai|semiconductor|chips|llm|model|compute)\b/, 4],
    [/\b(stock|market|equities|etf|options)\b/, 3],
  ];

  let score = 0;
  for (const [re, w] of keywordWeights) {
    if (re.test(t)) score += w;
  }
  if (t.length >= 80) score += 1;
  return score;
}

async function fetchPostsForAccount(
  rawAccount: string,
  topic: XTopic,
  bearer?: string
): Promise<XPost[]> {
  const account = resolveXHandleAlias(rawAccount);

  const syndicationPosts = await fetchXViaSyndication(account);
  if (syndicationPosts.length > 0) return syndicationPosts.slice(0, 3);

  if (bearer) {
    const apiPosts = await fetchTwitterApiV2(account, bearer);
    if (apiPosts.length > 0) return apiPosts.slice(0, 3);
  }

  const newsPosts = await fetchXViaGoogleNews(account, topic);
  return newsPosts.slice(0, 2);
}

function matchesTopic(text: string, topic: XTopic): boolean {
  if (topic === "all") return true;
  const query = TOPIC_NEWS_QUERY[topic] ?? "";
  const terms = query
    .replace(/[()]/g, " ")
    .split(/\s+OR\s+/i)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

export async function fetchXPosts(
  topic: XTopic = "markets",
  userHandle?: string,
  maxPosts = 16
): Promise<XPost[]> {
  const bearer = process.env.TWITTER_BEARER_TOKEN;
  const accounts = getHandlesForTopic(topic, userHandle);
  const allPosts: XPost[] = [];

  for (const account of accounts.slice(0, 3)) {
    const posts = await fetchPostsForAccount(account, topic, bearer);
    allPosts.push(...posts);
    if (allPosts.length >= maxPosts * 2) break;
  }

  allPosts.sort((a, b) => {
    const aTopic = matchesTopic(a.text, topic) ? 3 : 0;
    const bTopic = matchesTopic(b.text, topic) ? 3 : 0;
    const aT = new Date(a.createdAt).getTime();
    const bT = new Date(b.createdAt).getTime();
    if (bT !== aT) return bT - aT;
    const aScore = aTopic + scoreXPost(a.text) + (a.likes || 0) * 0.02;
    const bScore = bTopic + scoreXPost(b.text) + (b.likes || 0) * 0.02;
    return bScore - aScore;
  });

  const seen = new Set<string>();
  const deduped = allPosts.filter((p) => {
    const key = `${p.url}|${p.text.slice(0, 80).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const result = deduped.filter((p) => isXStatusUrl(p.url)).slice(0, maxPosts);

  if (result.length < 4) {
    const fallbacks = getFallbackXPosts(topic, maxPosts);
    const urls = new Set(result.map((p) => p.url));
    for (const p of fallbacks) {
      if (!urls.has(p.url)) {
        result.push(p);
        urls.add(p.url);
      }
      if (result.length >= maxPosts) break;
    }
  }

  return result;
}
