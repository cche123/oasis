import { NextRequest, NextResponse } from "next/server";
import { analyzeRipple } from "@/lib/ripple-engine";
import { formatPublishedAt, parsePubDate, toIsoOrNull } from "@/lib/publish-time";
import { WAVE_MIN_SCORE, scoreWaveHeadline } from "@/lib/wave-headline-filter";
import { sanitizeFeedText } from "@/lib/text-sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RIPPLE_CACHE = { items: [] as RippleNewsItem[], expires: 0 };
const RIPPLE_CACHE_TTL_MS = 120_000;

export type RippleNewsItem = {
  id: string;
  headline: string;
  source: string;
  sourceUrl: string;
  date: string;
  publishedAt?: string;
  summary?: string;
  macroScore?: number;
  macroTags?: string[];
  macroReason?: string;
};

const LIVE_FEEDS: { url: string; source: string }[] = [
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", source: "NYT" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NYT World" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/US.xml", source: "NYT US" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", source: "NYT Business" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
  { url: "https://www.theguardian.com/world/rss", source: "The Guardian" },
  { url: "https://www.theguardian.com/us-business/rss", source: "Guardian Business" },
  { url: "https://feeds.a.dj.com/rss/RSSWorldNews.xml", source: "WSJ" },
];

const MACRO_QUERIES = [
  "earthquake OR tsunami OR hurricane OR tornado",
  "war OR conflict OR sanctions OR military",
  "oil OR OPEC OR pipeline OR energy prices",
  "Federal Reserve OR inflation OR recession",
  "wildfire OR flood OR extreme weather",
];

function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = re.exec(block);
  if (!m) return "";
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim();
}

async function parseFeed(
  url: string,
  source: string,
  limit: number,
  seen: Set<string>,
  out: RippleNewsItem[]
) {
  try {
    const res = await fetch(url, {
      next: { revalidate: 180 },
      headers: { "User-Agent": "OasisRipple/1.0" },
    });
    if (!res.ok) return;
    const xml = await res.text();
    const items = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
    for (const block of items.slice(0, limit)) {
      const headline = extractTag(block, "title");
      const link = extractTag(block, "link");
      const pubDate = extractTag(block, "pubDate");
      const description = extractTag(block, "description");
      const key = headline.toLowerCase().slice(0, 80);
      if (!headline || !link || seen.has(key)) continue;
      const published = parsePubDate(pubDate);
      const publishedAt = toIsoOrNull(published);
      const waveScore = scoreWaveHeadline(headline, {
        publishedAt: publishedAt ?? undefined,
      });
      // Hard reject only truly irrelevant/non-macro headlines.
      if (!waveScore.tags.length) continue;
      seen.add(key);
      out.push({
        id: `news-${out.length}-${seen.size}`,
        headline,
        source,
        sourceUrl: link,
        date: formatPublishedAt(published),
        publishedAt: publishedAt ?? undefined,
        summary: sanitizeFeedText(description ?? "", 200),
        macroScore: waveScore.score,
        macroTags: waveScore.tags,
        macroReason: waveScore.reason,
      });
    }
  } catch {
    /* skip */
  }
}

async function fetchGoogleMacro(seen: Set<string>, out: RippleNewsItem[]) {
  for (const query of MACRO_QUERIES) {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    await parseFeed(url, "Google News", 5, seen, out);
  }
}

async function fetchLiveNews(limit = 12): Promise<RippleNewsItem[]> {
  const seen = new Set<string>();
  const out: RippleNewsItem[] = [];

  await Promise.all(
    LIVE_FEEDS.map((f) => parseFeed(f.url, f.source, 8, seen, out))
  );
  await fetchGoogleMacro(seen, out);

  const sorted = out.sort((a, b) => {
      const aT = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bT = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      if (bT !== aT) return bT - aT;
      return (b.macroScore ?? 0) - (a.macroScore ?? 0);
    });

  // Dynamic thresholding: stay strict when we have enough, relax slightly otherwise.
  const target = Math.min(limit, 8);
  const strict = sorted.filter((x) => (x.macroScore ?? 0) >= WAVE_MIN_SCORE);
  if (strict.length >= target) return strict.slice(0, limit);

  const medium = sorted.filter((x) => (x.macroScore ?? 0) >= Math.max(10, WAVE_MIN_SCORE - 2));
  if (medium.length >= Math.min(limit, 6)) return medium.slice(0, limit);

  const fallback = sorted.filter((x) => (x.macroScore ?? 0) >= 9);
  return (fallback.length ? fallback : sorted).slice(0, limit);
}

export async function GET(req: NextRequest) {
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "12", 10), 15);
  const now = Date.now();
  if (RIPPLE_CACHE.expires > now && RIPPLE_CACHE.items.length > 0) {
    return NextResponse.json({
      items: RIPPLE_CACHE.items.slice(0, limit),
      fetchedAt: new Date().toISOString(),
    });
  }
  const items = await fetchLiveNews(limit);
  RIPPLE_CACHE.items = items;
  RIPPLE_CACHE.expires = now + RIPPLE_CACHE_TTL_MS;
  return NextResponse.json({ items, fetchedAt: new Date().toISOString() });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    headline?: string;
    region?: string;
    interests?: string[];
  };

  const headline = body.headline?.trim();
  if (!headline) {
    return NextResponse.json({ error: "headline required" }, { status: 400 });
  }

  const waveScore = scoreWaveHeadline(headline, { minScore: 10 });
  if (!waveScore.passes) {
    return NextResponse.json(
      { error: "Headline does not meet macro-impact threshold for Wave", waveScore },
      { status: 422 }
    );
  }

  const analysis = analyzeRipple(headline, {
    region: body.region,
    interests: body.interests,
    macroTags: waveScore.tags,
  });

  return NextResponse.json({ analysis });
}
