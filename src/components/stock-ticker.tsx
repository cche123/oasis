"use client";

import { useState, useEffect, useCallback } from "react";

type TickerData = {
  symbol: string;
  price: number;
  change: number;
};

const TICKER_ORDER = [
  "SPY", "QQQ", "DIA", "AAPL", "NVDA", "CSCO", "MSFT", "AMZN", "TSLA",
  "GOOGL", "META", "N225", "FTSE", "DAX", "HSI", "BTC", "ETH", "10Y", "GOLD", "BRENT",
] as const;

const FALLBACK_BY_SYMBOL: Record<string, TickerData> = {
  SPY: { symbol: "SPY", price: 582.45, change: 1.24 },
  QQQ: { symbol: "QQQ", price: 524.12, change: 1.87 },
  DIA: { symbol: "DIA", price: 502.1, change: 0.65 },
  AAPL: { symbol: "AAPL", price: 245.3, change: 0.92 },
  NVDA: { symbol: "NVDA", price: 1420.5, change: 3.45 },
  CSCO: { symbol: "CSCO", price: 72.18, change: 8.12 },
  MSFT: { symbol: "MSFT", price: 512.6, change: 0.54 },
  AMZN: { symbol: "AMZN", price: 215.8, change: 1.3 },
  TSLA: { symbol: "TSLA", price: 185.4, change: -0.85 },
  GOOGL: { symbol: "GOOGL", price: 175.2, change: 0.32 },
  META: { symbol: "META", price: 585.4, change: 0.88 },
  N225: { symbol: "N225", price: 42850, change: 1.42 },
  FTSE: { symbol: "FTSE", price: 8950, change: 0.56 },
  DAX: { symbol: "DAX", price: 19820, change: 0.78 },
  HSI: { symbol: "HSI", price: 21450, change: 2.1 },
  BTC: { symbol: "BTC", price: 82450, change: 4.65 },
  ETH: { symbol: "ETH", price: 4820, change: 3.12 },
  "10Y": { symbol: "10Y", price: 5.18, change: 0.04 },
  GOLD: { symbol: "GOLD", price: 2645, change: 0.25 },
  BRENT: { symbol: "BRENT", price: 106.4, change: -2.1 },
};

const DEFAULT_TICKERS: TickerData[] = TICKER_ORDER.map(
  (s) => FALLBACK_BY_SYMBOL[s]
);

function mergeTickers(live: TickerData[]): TickerData[] {
  const liveMap = new Map(live.map((t) => [t.symbol, t]));
  return TICKER_ORDER.map(
    (sym) => liveMap.get(sym) ?? FALLBACK_BY_SYMBOL[sym]
  );
}

function formatPrice(t: TickerData): string {
  if (t.symbol === "10Y") return `${t.price.toFixed(2)}%`;
  if (["N225", "FTSE", "DAX", "HSI"].includes(t.symbol)) {
    return t.price.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  return t.price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function StockTicker() {
  const [tickers, setTickers] = useState<TickerData[]>(DEFAULT_TICKERS);
  const [isLive, setIsLive] = useState(false);

  const fetchLiveData = useCallback(async () => {
    try {
      const res = await fetch("/api/market-data", { cache: "no-store" });
      if (!res.ok) return;

      const data = await res.json();
      if (data.tickers?.length > 0) {
        setTickers(mergeTickers(data.tickers));
        setIsLive(true);
      }
    } catch (err) {
      console.warn("Market data fetch failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
    const pollInterval = setInterval(fetchLiveData, 60_000);
    return () => clearInterval(pollInterval);
  }, [fetchLiveData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) =>
        prev.map((t) => ({
          ...t,
          price: t.price * (1 + (Math.random() - 0.5) * 0.00015),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const items = tickers.map((t) => (
    <span
      key={t.symbol}
      className="inline-flex items-center gap-1.5 shrink-0 px-1"
    >
      <span className="font-semibold text-foreground">{t.symbol}</span>
      <span className="text-muted-foreground font-mono tabular-nums">
        {formatPrice(t)}
      </span>
      <span
        className={
          t.change < 0 ? "text-red-400 font-medium" : "text-emerald-400 font-medium"
        }
      >
        {t.change > 0 ? "+" : ""}
        {t.change.toFixed(2)}%
      </span>
    </span>
  ));

  return (
    <div className="sticky top-0 z-40 w-full shrink-0 border-b border-border bg-card overflow-hidden">
      <div className="relative flex h-9 min-h-9 items-center overflow-hidden">
        <div className="oasis-ticker-track flex items-center gap-10 whitespace-nowrap text-[11px] tracking-wide py-2 pl-4">
          {items}
          {items}
        </div>

        {isLive && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1.5 bg-card/90 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest text-emerald-500/80 font-medium">
              Live
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
