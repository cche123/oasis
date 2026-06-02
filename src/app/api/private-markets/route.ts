import { NextResponse } from "next/server";
import { formatPublishedAt, parsePubDate, toIsoOrNull } from "@/lib/publish-time";
import { sanitizeFeedText } from "@/lib/text-sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DealSignal = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  publishedAt?: string;
  category: string;
  summary: string;
  company?: string;
  firms?: string[];
  sourceQuality?: "primary" | "aggregated";
};

const VC_FEEDS = [
  {
    url: "https://techcrunch.com/category/venture/feed/",
    source: "TechCrunch Venture",
    category: "Venture",
  },
  {
    url: "https://news.crunchbase.com/feed/",
    source: "Crunchbase News",
    category: "Venture",
  },
  {
    url: "https://www.theinformation.com/feed",
    source: "The Information",
    category: "Private Equity",
  },
  {
    url: "https://news.google.com/rss/search?q=SpaceX+funding+valuation+round&hl=en-US&gl=US&ceid=US:en",
    source: "Google News",
    category: "Space & Defense",
  },
  {
    url: "https://news.google.com/rss/search?q=venture+capital+seed+series+A+funding&hl=en-US&gl=US&ceid=US:en",
    source: "Google News",
    category: "Seed & Series A",
  },
  {
    url: "https://news.google.com/rss/search?q=private+equity+acquisition+buyout+deal&hl=en-US&gl=US&ceid=US:en",
    source: "Google News",
    category: "Private Equity",
  },
  {
    url: "https://news.google.com/rss/search?q=startup+unicorn+valuation+funding&hl=en-US&gl=US&ceid=US:en",
    source: "Google News",
    category: "Unicorns",
  },
  {
    url: "https://news.google.com/rss/search?q=Anduril+OpenAI+Anthropic+funding&hl=en-US&gl=US&ceid=US:en",
    source: "Google News",
    category: "AI & Defense",
  },
  // Targeted Google News coverage for major VC/PE players (kept grouped to avoid
  // hitting too many RSS endpoints).
  {
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(
      "(coatue OR tiger global OR a16z OR kleiner perkins OR khosla OR \"founders fund\" OR \"d1 capital\" OR \"viking global\") (AI OR software OR defense) (funding OR round OR series)"
    )}&hl=en-US&gl=US&ceid=US:en`,
    source: "Google News",
    category: "AI & Defense",
  },
  {
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(
      "(coatue OR d1 capital OR viking global OR tiger global OR kleiner perkins OR a16z OR khosla OR strike capital OR \"redglassvc\" OR \"long lake\") (venture OR funding OR round OR series)"
    )}&hl=en-US&gl=US&ceid=US:en`,
    source: "Google News",
    category: "Venture",
  },
  {
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(
      "(benchmark OR sequoia OR accel OR greylock OR lightspeed OR nea OR ivp OR bessemer OR index ventures OR general catalyst OR insight partners OR battery ventures OR \"founders fund\" OR \"thrive capital\") (funding OR round OR series OR investment OR valuation)"
    )}&hl=en-US&gl=US&ceid=US:en`,
    source: "Google News",
    category: "Venture",
  },
  {
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(
      "(blackstone OR warburg pincus OR tpg OR kkr OR apollo OR carlyle OR \"hellman & friedman\" OR \"bain capital\" OR \"silver lake\" OR \"thoma bravo\") (private equity OR buyout OR acquisition) (deal OR investment)"
    )}&hl=en-US&gl=US&ceid=US:en`,
    source: "Google News",
    category: "Private Equity",
  },
];

const FIRM_PATTERNS: Array<{ name: string; type: "VC" | "PE" | "HF"; regex: RegExp }> = [
  { name: "Sequoia", type: "VC", regex: /\bsequoia\b/i },
  { name: "Benchmark", type: "VC", regex: /\bbenchmark\b/i },
  { name: "Andreessen Horowitz", type: "VC", regex: /\b(a16z|andreessen horowitz)\b/i },
  { name: "Kleiner Perkins", type: "VC", regex: /\bkleiner perkins\b/i },
  { name: "Accel", type: "VC", regex: /\baccel\b/i },
  { name: "Greylock", type: "VC", regex: /\bgreylock\b/i },
  { name: "Lightspeed", type: "VC", regex: /\blightspeed\b/i },
  { name: "NEA", type: "VC", regex: /\bnea\b/i },
  { name: "IVP", type: "VC", regex: /\bivp\b/i },
  { name: "Bessemer", type: "VC", regex: /\bbessemer\b/i },
  { name: "Index Ventures", type: "VC", regex: /\bindex ventures\b/i },
  { name: "General Catalyst", type: "VC", regex: /\bgeneral catalyst\b/i },
  { name: "Insight Partners", type: "VC", regex: /\binsight partners\b/i },
  { name: "Battery Ventures", type: "VC", regex: /\bbattery ventures\b/i },
  { name: "Khosla Ventures", type: "VC", regex: /\bkhosla\b/i },
  { name: "Founders Fund", type: "VC", regex: /\bfounders fund\b/i },
  { name: "Thrive Capital", type: "VC", regex: /\bthrive capital\b/i },
  { name: "Coatue", type: "HF", regex: /\bcoatue\b/i },
  { name: "Tiger Global", type: "HF", regex: /\btiger global\b/i },
  { name: "D1 Capital", type: "HF", regex: /\bd1 capital\b/i },
  { name: "Viking Global", type: "HF", regex: /\bviking global\b/i },
  { name: "KKR", type: "PE", regex: /\bkkr\b/i },
  { name: "Blackstone", type: "PE", regex: /\bblackstone\b/i },
  { name: "Warburg Pincus", type: "PE", regex: /\bwarburg pincus\b/i },
  { name: "TPG", type: "PE", regex: /\btpg\b/i },
  { name: "Apollo", type: "PE", regex: /\bapollo\b/i },
  { name: "Carlyle", type: "PE", regex: /\bcarlyle\b/i },
  { name: "Hellman & Friedman", type: "PE", regex: /\bhellman\s*&\s*friedman\b/i },
  { name: "Bain Capital", type: "PE", regex: /\bbain capital\b/i },
  { name: "Silver Lake", type: "PE", regex: /\bsilver lake\b/i },
  { name: "Thoma Bravo", type: "PE", regex: /\bthoma bravo\b/i },
];

function parseXMLItems(xml: string) {
  const items: Array<{ title: string; link: string; pubDate: string; description: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");
    const description = extractTag(block, "description");
    if (title) items.push({ title: clean(title), link, pubDate, description: clean(description) });
  }
  return items;
}

function extractTag(xml: string, tag: string): string {
  const cdata = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, "i").exec(xml);
  if (cdata) return cdata[1].trim();
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(xml);
  return m ? m[1].trim() : "";
}

function clean(s: string) {
  return s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
}

function extractCompany(title: string): string | undefined {
  const m = title.match(/^([A-Z][A-Za-z0-9&.]+)\s+(raises|raised|lands|secures|closes)/i);
  return m?.[1];
}

function extractFirms(title: string, summary: string): string[] {
  const text = `${title} ${summary}`;
  const out: string[] = [];
  for (const firm of FIRM_PATTERNS) {
    if (firm.regex.test(text)) out.push(firm.name);
  }
  return out.slice(0, 4);
}

function scoreDealSignal(deal: DealSignal): number {
  const text = `${deal.title} ${deal.summary}`.toLowerCase();
  let score = 0;
  if (deal.sourceQuality === "primary") score += 2;
  if (deal.firms?.length) score += Math.min(6, deal.firms.length * 2);
  if (/\b(series [a-f]|seed|raised|funding|valuation|ipo)\b/.test(text)) score += 4;
  if (/\b(acquisition|buyout|merger|takeover|deal)\b/.test(text)) score += 5;
  if (/\b(ai|llm|chip|defense|autonomous)\b/.test(text)) score += 3;
  if (/\b\d+(\.\d+)?\s?(b|bn|billion|m|million)\b/.test(text)) score += 2;
  return score;
}

function getSourceQuality(source: string, link: string): "primary" | "aggregated" {
  if (source.toLowerCase().includes("google news")) return "aggregated";
  try {
    const host = new URL(link).hostname.toLowerCase();
    if (host.includes("news.google.com")) return "aggregated";
  } catch {
    return "aggregated";
  }
  return "primary";
}

function dedupeKey(title: string, link: string): string {
  const normalizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
  let host = "unknown";
  try {
    host = new URL(link).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    host = "unknown";
  }
  return `${normalizedTitle}|${host}`;
}

export async function GET() {
  const results = await Promise.allSettled(
    VC_FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Oasis/1.0)", Accept: "application/rss+xml" },
        next: { revalidate: 90 },
        cache: "no-store",
      });
      if (!res.ok) return [];
      const xml = await res.text();
      return parseXMLItems(xml)
        .filter((i) => i.link.startsWith("http"))
        .slice(0, 5)
        .map((item) => {
          const published = parsePubDate(item.pubDate);
          const summary = sanitizeFeedText(item.description, 220);
          return {
            id: crypto.randomUUID(),
            title: item.title,
            source: feed.source,
            sourceUrl: item.link,
            date: formatPublishedAt(published) || "—",
            publishedAt: toIsoOrNull(published),
            category: feed.category,
            summary,
            company: extractCompany(item.title),
            firms: extractFirms(item.title, summary),
            sourceQuality: getSourceQuality(feed.source, item.link),
          };
        });
    })
  );

  let deals: DealSignal[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") deals.push(...r.value);
  }

  const seen = new Set<string>();
  deals = deals
    .filter((d) => {
      const k = dedupeKey(d.title, d.sourceUrl);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => {
      const aT = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bT = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      if (bT !== aT) return bT - aT;
      return scoreDealSignal(b) - scoreDealSignal(a);
    })
    .slice(0, 40);

  return NextResponse.json({ deals, timestamp: new Date().toISOString() });
}
