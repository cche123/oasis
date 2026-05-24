import { NextRequest, NextResponse } from "next/server";
import { analyzeRipple } from "@/lib/ripple-engine";
import { formatPublishedAt, parsePubDate } from "@/lib/publish-time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type RippleNewsItem = {
  id: string;
  headline: string;
  source: string;
  sourceUrl: string;
  date: string;
  summary?: string;
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
      seen.add(key);
      out.push({
        id: `news-${out.length}-${seen.size}`,
        headline,
        source,
        sourceUrl: link,
        date: formatPublishedAt(parsePubDate(pubDate)),
        summary: description?.slice(0, 200),
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

async function fetchLiveNews(limit = 40): Promise<RippleNewsItem[]> {
  const seen = new Set<string>();
  const out: RippleNewsItem[] = [];

  await Promise.all(
    LIVE_FEEDS.map((f) => parseFeed(f.url, f.source, 8, seen, out))
  );
  await fetchGoogleMacro(seen, out);

  return out.slice(0, limit);
}

export async function GET(req: NextRequest) {
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "40", 10), 50);
  const items = await fetchLiveNews(limit);
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

  const analysis = analyzeRipple(headline, {
    region: body.region,
    interests: body.interests,
  });

  return NextResponse.json({ analysis });
}
