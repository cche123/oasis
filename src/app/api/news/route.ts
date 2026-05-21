import { NextResponse } from "next/server";
import { GLOBAL_NEWS_FEEDS, type FeedConfig } from "@/lib/news-feeds";

type RSSSignal = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  category: string;
  summary: string;
};

const MARKET_QUERIES: Record<string, string> = {
  USA: "US stock market economy",
  Japan: "Japan markets economy Nikkei",
  Europe: "European markets economy ECB",
  "Emerging Markets": "emerging markets economy",
  "Middle East": "Middle East markets oil economy",
  China: "China markets economy trade",
};

function googleNewsFeed(
  query: string,
  region: string,
  lang: string,
  category: string
): FeedConfig {
  const q = encodeURIComponent(query);
  return {
    url: `https://news.google.com/rss/search?q=${q}&hl=${lang}&gl=${region}&ceid=${region}:en`,
    source: "Google News",
    category,
  };
}

function buildPersonalizedFeeds(opts: {
  interests: string[];
  location: string;
  country: string;
  region: string;
  lang: string;
  markets: string[];
}): FeedConfig[] {
  const feeds: FeedConfig[] = [];
  const { region, lang } = opts;

  if (opts.location || opts.country) {
    const locQuery = opts.location
      ? `${opts.location} ${opts.country} business economy news`
      : `${opts.country} business economy news`;
    feeds.push(googleNewsFeed(locQuery, region || "US", lang || "en-US", "Regional"));
  }

  for (const interest of opts.interests.slice(0, 6)) {
    feeds.push(
      googleNewsFeed(
        `${interest} finance business`,
        region || "US",
        lang || "en-US",
        interest.slice(0, 24)
      )
    );
  }

  for (const market of opts.markets) {
    const query = MARKET_QUERIES[market];
    if (query) {
      feeds.push(googleNewsFeed(query, region || "US", lang || "en-US", market));
    }
  }

  return feeds;
}

function parseXMLItems(xml: string): Array<{ title: string; link: string; pubDate: string; description: string }> {
  const items: Array<{ title: string; link: string; pubDate: string; description: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const pubDate = extractTag(itemXml, "pubDate");
    const description = extractTag(itemXml, "description");

    if (title) {
      items.push({
        title: cleanHTML(title),
        link: link || "",
        pubDate: pubDate || "",
        description: cleanHTML(description || ""),
      });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string {
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, "i");
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : "";
}

function cleanHTML(str: string): string {
  return str
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "Today";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Today";
  }
}

function isValidNewsUrl(url: string): boolean {
  if (!url || url.length < 10) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchFeed(feed: FeedConfig): Promise<RSSSignal[]> {
  try {
    const res = await fetch(feed.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OasisBot/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const xml = await res.text();
    const items = parseXMLItems(xml);

    return items
      .filter((item) => isValidNewsUrl(item.link))
      .slice(0, 4)
      .map((item) => ({
        id: crypto.randomUUID(),
        title: item.title,
        source: feed.source,
        sourceUrl: item.link,
        date: formatDate(item.pubDate),
        category: feed.category,
        summary:
          item.description.slice(0, 200) +
          (item.description.length > 200 ? "..." : ""),
      }));
  } catch {
    return [];
  }
}

/** Max articles per source so CNBC doesn't dominate */
function diversifyBySource(signals: RSSSignal[], maxPerSource = 5): RSSSignal[] {
  const sourceCount: Record<string, number> = {};
  const out: RSSSignal[] = [];

  for (const s of signals) {
    const count = sourceCount[s.source] || 0;
    if (count >= maxPerSource) continue;
    sourceCount[s.source] = count + 1;
    out.push(s);
  }

  return out;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const interestsParam = searchParams.get("interests");
  const location = searchParams.get("location") || "";
  const country = searchParams.get("country") || "";
  const region = searchParams.get("region") || "US";
  const lang = searchParams.get("lang") || "en-US";
  const marketsParam = searchParams.get("markets");

  const interests = interestsParam
    ? interestsParam.split("|").filter(Boolean)
    : [];
  const markets = marketsParam ? marketsParam.split("|").filter(Boolean) : [];

  const personalizedFeeds = buildPersonalizedFeeds({
    interests,
    location,
    country,
    region,
    lang,
    markets,
  });

  const allFeeds = [...GLOBAL_NEWS_FEEDS, ...personalizedFeeds];
  const uniqueFeeds = allFeeds.filter(
    (feed, idx, arr) => arr.findIndex((f) => f.url === feed.url) === idx
  );

  const results = await Promise.allSettled(uniqueFeeds.map((feed) => fetchFeed(feed)));

  let signals: RSSSignal[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      signals.push(...result.value);
    }
  }

  if (category && category !== "all" && category !== "All Signals") {
    signals = signals.filter(
      (s) =>
        s.category.toLowerCase() === category.toLowerCase() ||
        s.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  signals.sort((a, b) => {
    const order = ["Just now", "hour", "Yesterday"];
    const aIdx = order.findIndex((o) => a.date.includes(o));
    const bIdx = order.findIndex((o) => b.date.includes(o));
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  const seen = new Set<string>();
  signals = signals.filter((s) => {
    const key = s.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  signals = diversifyBySource(signals, 5);

  return NextResponse.json({
    signals: signals.slice(0, 50),
    count: signals.length,
    timestamp: new Date().toISOString(),
    personalized: interests.length > 0 || !!country || markets.length > 0,
  });
}
