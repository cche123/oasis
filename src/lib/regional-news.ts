import type { FeedConfig } from "./news-feeds";
import type { ResolvedLocation } from "./locations";

function gNews(
  query: string,
  region: string,
  lang: string,
  source: string,
  category: string
): FeedConfig {
  const q = encodeURIComponent(query);
  return {
    url: `https://news.google.com/rss/search?q=${q}&hl=${lang}&gl=${region}&ceid=${region}:en`,
    source,
    category,
  };
}

/** Country-native news feeds — layered on top of global wire */
export function getRegionalNewsFeeds(loc?: ResolvedLocation): FeedConfig[] {
  if (!loc?.valid) return [];

  const cc = loc.countryCode;
  const region = loc.newsRegion;
  const lang = loc.newsLang;
  const place = loc.displayName || loc.city || loc.country;
  const feeds: FeedConfig[] = [];

  const regionalQuery = `${place} business economy markets news`;

  feeds.push(
    gNews(regionalQuery, region, lang, `${loc.country} News`, "Regional"),
    gNews(`${loc.country} stock market finance`, region, lang, "Google News", "Markets")
  );

  switch (cc) {
    case "IN":
      feeds.push(
        { url: "https://economictimes.indiatimes.com/rssfeedsdefault.cms", source: "Economic Times", category: "Regional" },
        { url: "https://www.livemint.com/rss/companies", source: "Mint", category: "Regional" },
        gNews("India startup funding venture capital", "IN", "en-IN", "Google News", "Venture"),
        gNews("India markets sensex nifty", "IN", "en-IN", "Google News", "Markets")
      );
      if (loc.region) {
        feeds.push(gNews(`${loc.region} India news business`, "IN", "en-IN", "Google News", "Regional"));
      }
      break;
    case "CN":
      feeds.push(
        gNews("中国 经济 财经 市场", "CN", "zh-CN", "Google News", "Regional"),
        gNews("China markets economy trade", "CN", "zh-CN", "Google News", "Geopolitics")
      );
      break;
    case "SG":
      feeds.push(
        gNews("Singapore business economy", "SG", "en-SG", "Google News", "Regional"),
        { url: "https://www.straitstimes.com/news/business/rss.xml", source: "Straits Times", category: "Regional" }
      );
      break;
    case "JP":
      feeds.push(
        gNews("日本 経済 市場", "JP", "ja", "Google News", "Regional"),
        gNews("Japan markets Nikkei economy", "JP", "ja", "Google News", "Markets")
      );
      break;
    case "GB":
      feeds.push(
        { url: "https://feeds.bbci.co.uk/news/business/rss.xml", source: "BBC Business", category: "Regional" },
        gNews("UK markets FTSE economy", "GB", "en-GB", "Google News", "Markets")
      );
      break;
    case "DE":
      feeds.push(gNews("Germany economy markets", "DE", "de", "Google News", "Regional"));
      break;
    case "FR":
      feeds.push(gNews("France economy markets", "FR", "fr", "Google News", "Regional"));
      break;
    case "KR":
      feeds.push(gNews("South Korea markets economy", "KR", "ko", "Google News", "Regional"));
      break;
    case "AU":
      feeds.push(gNews("Australia business ASX", "AU", "en-AU", "Google News", "Regional"));
      break;
    case "CA":
      feeds.push(gNews("Canada business economy", "CA", "en-CA", "Google News", "Regional"));
      break;
    case "KE":
    case "NG":
    case "ZA":
    case "UG":
    case "EG":
      feeds.push(
        gNews(`${loc.country} business economy markets`, region, lang, "Google News", "Regional")
      );
      break;
    case "US":
      if (loc.state) {
        feeds.push(
          gNews(`${loc.city || loc.state} ${loc.state} business news`, "US", "en-US", "Google News", "Regional")
        );
      }
      break;
    default:
      break;
  }

  return feeds;
}
