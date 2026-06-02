export const runtime = "nodejs";

import { NextResponse } from "next/server";

/** Display symbol → Yahoo Finance symbol */
const YAHOO_SYMBOLS: Record<string, string> = {
  SPY: "SPY",
  QQQ: "QQQ",
  DIA: "DIA",
  AAPL: "AAPL",
  NVDA: "NVDA",
  CSCO: "CSCO",
  MSFT: "MSFT",
  AMZN: "AMZN",
  TSLA: "TSLA",
  GOOGL: "GOOGL",
  META: "META",
  // Wave impact mapping (subset of names produced by ripple-engine)
  LMT: "LMT",
  RTX: "RTX",
  XLE: "XLE",
  JETS: "JETS",
  GLD: "GLD",
  XOM: "XOM",
  USO: "USO",
  UAL: "UAL",
  URI: "URI",
  HD: "HD",
  ALL: "ALL",
  TRV: "TRV",
  ADM: "ADM",
  UNG: "UNG",
  TLT: "TLT",
  XLF: "XLF",
  CRWD: "CRWD",
  PANW: "PANW",
  CYBR: "CYBR",
  EWJ: "EWJ",
  TM: "TM",
  BTC: "BTC-USD",
  ETH: "ETH-USD",
  GOLD: "GC=F",
  BRENT: "BZ=F",
  "10Y": "^TNX",
  N225: "^N225",
  FTSE: "^FTSE",
  DAX: "^GDAXI",
  HSI: "^HSI",
};

// Keep the default top ticker bar payload small.
const DEFAULT_TICKER_ORDER = [
  "SPY",
  "QQQ",
  "DIA",
  "AAPL",
  "NVDA",
  "CSCO",
  "MSFT",
  "AMZN",
  "TSLA",
  "GOOGL",
  "META",
  "BTC",
  "ETH",
  "GOLD",
  "BRENT",
  "10Y",
  "N225",
  "FTSE",
  "DAX",
  "HSI",
] as const;

const TICKER_ORDER = DEFAULT_TICKER_ORDER;

type TickerResult = {
  symbol: string;
  price: number;
  change: number;
};

async function fetchYahooQuote(displaySymbol: string): Promise<TickerResult | null> {
  const yahooSymbol = YAHOO_SYMBOLS[displaySymbol] ?? displaySymbol;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      next: { revalidate: 45 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const currentPrice = meta.regularMarketPrice ?? 0;
    const previousClose =
      meta.chartPreviousClose ?? meta.previousClose ?? currentPrice;
    const changePercent =
      previousClose > 0
        ? ((currentPrice - previousClose) / previousClose) * 100
        : 0;

    if (currentPrice <= 0) return null;

    return {
      symbol: displaySymbol,
      price: currentPrice,
      change: parseFloat(changePercent.toFixed(2)),
    };
  } catch {
    return null;
  }
}

async function fetchPolygonQuote(
  displaySymbol: string,
  polygonTicker: string,
  apiKey: string
): Promise<TickerResult | null> {
  try {
    const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${polygonTicker}?apiKey=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 45 } });
    if (!res.ok) return null;

    const data = await res.json();
    const t = data.ticker;
    if (!t) return null;

    const price = t.lastTrade?.p ?? t.day?.c ?? t.prevDay?.c ?? 0;
    const prev = t.prevDay?.c ?? t.day?.o ?? price;
    const change = prev > 0 ? ((price - prev) / prev) * 100 : 0;

    if (price <= 0) return null;

    return {
      symbol: displaySymbol,
      price,
      change: parseFloat(change.toFixed(2)),
    };
  } catch {
    return null;
  }
}

async function fetchAlphaVantageQuote(
  displaySymbol: string,
  apiKey: string
): Promise<TickerResult | null> {
  try {
    if (displaySymbol === "BTC" || displaySymbol === "ETH") {
      const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${displaySymbol}&to_currency=USD&apikey=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) return null;
      const data = await res.json();
      const rate = data["Realtime Currency Exchange Rate"];
      if (!rate) return null;
      return {
        symbol: displaySymbol,
        price: parseFloat(rate["5. Exchange Rate"] || "0"),
        change: 0,
      };
    }

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${displaySymbol}&apikey=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    const quote = data["Global Quote"];
    if (!quote?.["05. price"]) return null;

    return {
      symbol: displaySymbol,
      price: parseFloat(quote["05. price"]),
      change: parseFloat((quote["10. change percent"] || "0").replace("%", "")),
    };
  } catch {
    return null;
  }
}

const POLYGON_EQUITIES = new Set([
  "SPY", "QQQ", "DIA", "AAPL", "NVDA", "CSCO", "MSFT", "AMZN", "TSLA", "GOOGL", "META",
]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbolsParam = url.searchParams.get("symbols");
  const requested =
    symbolsParam && symbolsParam.trim().length > 0
      ? symbolsParam
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter((s) => Boolean(s))
      : null;

  const symbolsToFetch = requested?.length ? requested : [...TICKER_ORDER];

  const polygonKey = process.env.POLYGON_API_KEY;
  const alphaKey = process.env.ALPHA_VANTAGE_API_KEY;

  const yahooResults = await Promise.allSettled(
    symbolsToFetch.map((sym) => fetchYahooQuote(sym))
  );

  const bySymbol: Record<string, TickerResult> = {};

  for (let i = 0; i < symbolsToFetch.length; i++) {
    const sym = symbolsToFetch[i];
    const result = yahooResults[i];
    if (result.status === "fulfilled" && result.value) {
      bySymbol[sym] = result.value;
    }
  }

  if (polygonKey) {
    await Promise.all(
      symbolsToFetch.filter((s) => POLYGON_EQUITIES.has(s)).map(async (sym) => {
        const poly = await fetchPolygonQuote(sym, sym, polygonKey);
        if (poly) bySymbol[sym] = poly;
      })
    );
  }

  for (const sym of symbolsToFetch) {
    if (bySymbol[sym]) continue;
    if (alphaKey) {
      const av = await fetchAlphaVantageQuote(sym, alphaKey);
      if (av) bySymbol[sym] = av;
    }
  }

  const tickers = symbolsToFetch.filter((s) => bySymbol[s]).map((s) => bySymbol[s]);

  let source = "yahoo";
  if (polygonKey && tickers.length > 8) source = "polygon+yahoo";
  else if (alphaKey && tickers.length > 0) source = "alphavantage+yahoo";

  return NextResponse.json({
    tickers,
    expected: symbolsToFetch.length,
    source,
    timestamp: new Date().toISOString(),
  });
}
