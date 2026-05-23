import { NextResponse } from "next/server";
import { GLOBAL_NEWS_FEEDS, type FeedConfig } from "@/lib/news-feeds";
import { getRegionalNewsFeeds } from "@/lib/regional-news";
import type { ResolvedLocation } from "@/lib/locations";
import { formatPublishedAt, parsePubDate, toIsoOrNull } from "@/lib/publish-time";

export const dynamic = "force-dynamic";

type RSSSignal = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  publishedAt?: string;
  category: string;
  summary: string;
};

const MARKET_FEEDS: Record<string, FeedConfig[]> = {
  USA: [
    googleNewsFeed("US stock market economy", "US", "en-US", "USA"),
    googleNewsFeed("Wall Street markets Federal Reserve", "US", "en-US", "USA"),
  ],
  India: [
    googleNewsFeed("India markets economy startup funding", "IN", "en-IN", "India"),
    googleNewsFeed("India sensex nifty business", "IN", "en-IN", "India"),
    { url: "https://economictimes.indiatimes.com/rssfeedsdefault.cms", source: "Economic Times", category: "India" },
    { url: "https://www.livemint.com/rss/companies", source: "Mint", category: "India" },
  ],
  China: [
    googleNewsFeed("中国 经济 财经 市场", "CN", "zh-CN", "China"),
    googleNewsFeed("China economy trade markets", "CN", "zh-CN", "China"),
  ],
  Japan: [
    googleNewsFeed("日本 経済 市場", "JP", "ja", "Japan"),
    googleNewsFeed("Japan Nikkei markets economy", "JP", "ja", "Japan"),
  ],
  Europe: [
    googleNewsFeed("European markets economy ECB", "GB", "en-GB", "Europe"),
    googleNewsFeed("EU economy finance markets", "DE", "de", "Europe"),
  ],
  Singapore: [
    googleNewsFeed("Singapore business economy markets", "SG", "en-SG", "Singapore"),
    { url: "https://www.straitstimes.com/news/business/rss.xml", source: "Straits Times", category: "Singapore" },
  ],
  "Emerging Markets": [
    googleNewsFeed("emerging markets economy finance", "US", "en-US", "Emerging Markets"),
    googleNewsFeed("EM stocks frontier markets", "US", "en-US", "Emerging Markets"),
  ],
  "Middle East": [
    googleNewsFeed("Middle East markets oil economy", "AE", "en-AE", "Middle East"),
    googleNewsFeed("Gulf business finance energy", "AE", "en-AE", "Middle East"),
  ],
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
    const marketFeeds = MARKET_FEEDS[market];
    if (marketFeeds) {
      feeds.push(...marketFeeds);
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
      next: { revalidate: 90 },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const xml = await res.text();
    const items = parseXMLItems(xml);

    return items
      .filter((item) => isValidNewsUrl(item.link))
      .slice(0, 4)
      .map((item) => {
        const published = parsePubDate(item.pubDate);
        return {
          id: crypto.randomUUID(),
          title: item.title,
          source: feed.source,
          sourceUrl: item.link,
          date: formatPublishedAt(published) || "—",
          publishedAt: toIsoOrNull(published),
          category: feed.category,
          summary:
            item.description.slice(0, 200) +
            (item.description.length > 200 ? "..." : ""),
        };
      });
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
  const countryCode = searchParams.get("countryCode") || "";
  const displayName = searchParams.get("displayName") || location;
  const state = searchParams.get("state") || "";
  const region = searchParams.get("region") || "US";
  const lang = searchParams.get("lang") || "en-US";
  const marketsParam = searchParams.get("markets");

  const interests = interestsParam
    ? interestsParam.split("|").filter(Boolean)
    : [];
  const markets = marketsParam ? marketsParam.split("|").filter(Boolean) : [];

  const resolved: ResolvedLocation | undefined = countryCode
    ? {
        valid: true,
        input: location,
        city: displayName.split(",")[0]?.trim(),
        state: state || undefined,
        country,
        countryCode,
        displayName,
        newsRegion: region,
        newsLang: lang,
      }
    : undefined;

  const regionalFeeds = getRegionalNewsFeeds(resolved);

  const personalizedFeeds = buildPersonalizedFeeds({
    interests,
    location: displayName || location,
    country,
    region,
    lang,
    markets,
  });

  const allFeeds = [...regionalFeeds, ...personalizedFeeds, ...GLOBAL_NEWS_FEEDS];
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
    const aT = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bT = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bT - aT;
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
