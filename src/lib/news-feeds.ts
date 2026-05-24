export type FeedConfig = {
  url: string;
  source: string;
  category: string;
};

/** Diverse institutional + wire sources — not CNBC-only */
export const GLOBAL_NEWS_FEEDS: FeedConfig[] = [
  // Wall Street Journal
  { url: "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml", source: "Wall Street Journal", category: "Markets" },
  { url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml", source: "Wall Street Journal", category: "Markets" },
  { url: "https://feeds.a.dj.com/rss/RSSWorldNews.xml", source: "Wall Street Journal", category: "Geopolitics" },
  // Reuters
  { url: "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best", source: "Reuters", category: "Markets" },
  { url: "https://www.reuters.com/finance/markets/rss", source: "Reuters", category: "Markets" },
  // Financial Times
  { url: "https://www.ft.com/?format=rss", source: "Financial Times", category: "Markets" },
  { url: "https://www.ft.com/companies?format=rss", source: "Financial Times", category: "M&A" },
  // BBC
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml", source: "BBC Business", category: "Macro" },
  // NPR
  { url: "https://feeds.npr.org/1007/rss.xml", source: "NPR Business", category: "Macro" },
  // MarketWatch
  { url: "https://www.marketwatch.com/rss/topstories", source: "MarketWatch", category: "Markets" },
  { url: "https://www.marketwatch.com/rss/realtimeheadlines", source: "MarketWatch", category: "Markets" },
  // Investing.com
  { url: "https://www.investing.com/rss/news.rss", source: "Investing.com", category: "Markets" },
  // AP
  { url: "https://apnews.com/hub/business?output=rss", source: "Associated Press", category: "Macro" },
  // CNBC (limited — 2 feeds only)
  { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147", source: "CNBC", category: "Markets" },
  { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664", source: "CNBC", category: "M&A" },
  // Yahoo Finance
  { url: "https://finance.yahoo.com/news/rssindex", source: "Yahoo Finance", category: "Markets" },
  // The Economist
  { url: "https://www.economist.com/finance-and-economics/rss.xml", source: "The Economist", category: "Macro" },
  // TechCrunch (raises / startups)
  { url: "https://techcrunch.com/feed/", source: "TechCrunch", category: "Venture" },
  // Crunchbase News
  { url: "https://news.crunchbase.com/feed/", source: "Crunchbase News", category: "Venture" },
  // Google News topic bundles
  { url: "https://news.google.com/rss/search?q=mergers+acquisitions+deals&hl=en-US&gl=US&ceid=US:en", source: "Google News", category: "M&A" },
  { url: "https://news.google.com/rss/search?q=venture+capital+funding+round&hl=en-US&gl=US&ceid=US:en", source: "Google News", category: "Venture" },
  { url: "https://news.google.com/rss/search?q=artificial+intelligence+markets&hl=en-US&gl=US&ceid=US:en", source: "Google News", category: "Technology" },
  { url: "https://news.google.com/rss/search?q=stock+market+macro+economy&hl=en-US&gl=US&ceid=US:en", source: "Google News", category: "Macro" },
  { url: "https://news.google.com/rss/search?q=geopolitics+trade+policy&hl=en-US&gl=US&ceid=US:en", source: "Google News", category: "Geopolitics" },
  { url: "https://news.google.com/rss/search?q=energy+oil+commodities&hl=en-US&gl=US&ceid=US:en", source: "Google News", category: "Energy" },
];
