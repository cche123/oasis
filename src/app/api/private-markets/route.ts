import { NextResponse } from "next/server";

type DealSignal = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  category: string;
  summary: string;
  company?: string;
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
    category: "Funding",
  },
  {
    url: "https://www.theinformation.com/feed",
    source: "The Information",
    category: "Private Markets",
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

function formatDate(d: string) {
  if (!d) return "Today";
  try {
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Today";
  }
}

function extractCompany(title: string): string | undefined {
  const m = title.match(/^([A-Z][A-Za-z0-9&.]+)\s+(raises|raised|lands|secures|closes)/i);
  return m?.[1];
}

export async function GET() {
  const results = await Promise.allSettled(
    VC_FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Oasis/1.0)", Accept: "application/rss+xml" },
        next: { revalidate: 300 },
      });
      if (!res.ok) return [];
      const xml = await res.text();
      return parseXMLItems(xml)
        .filter((i) => i.link.startsWith("http"))
        .slice(0, 5)
        .map((item) => ({
          id: crypto.randomUUID(),
          title: item.title,
          source: feed.source,
          sourceUrl: item.link,
          date: formatDate(item.pubDate),
          category: feed.category,
          summary: item.description.slice(0, 220),
          company: extractCompany(item.title),
        }));
    })
  );

  let deals: DealSignal[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") deals.push(...r.value);
  }

  const seen = new Set<string>();
  deals = deals
    .filter((d) => {
      const k = d.title.slice(0, 40).toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => {
      const order = ["Just now", "h ago", "Today"];
      const ai = order.findIndex((o) => a.date.includes(o));
      const bi = order.findIndex((o) => b.date.includes(o));
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .slice(0, 40);

  return NextResponse.json({ deals, timestamp: new Date().toISOString() });
}
