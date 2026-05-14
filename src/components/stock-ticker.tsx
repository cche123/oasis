"use client";

const TICKERS = [
  { symbol: "SPY", price: "534.28", change: "+0.82%" },
  { symbol: "QQQ", price: "462.15", change: "+1.14%" },
  { symbol: "DIA", price: "398.73", change: "+0.34%" },
  { symbol: "AAPL", price: "192.53", change: "+0.67%" },
  { symbol: "NVDA", price: "875.42", change: "+2.31%" },
  { symbol: "MSFT", price: "423.18", change: "+0.45%" },
  { symbol: "AMZN", price: "186.92", change: "+1.08%" },
  { symbol: "TSLA", price: "248.67", change: "-1.22%" },
  { symbol: "N225", price: "38,274", change: "+0.93%" },
  { symbol: "FTSE", price: "8,412", change: "+0.18%" },
  { symbol: "DAX", price: "18,652", change: "+0.41%" },
  { symbol: "HSI", price: "17,832", change: "-0.56%" },
  { symbol: "BTC", price: "67,423", change: "+3.12%" },
  { symbol: "ETH", price: "3,842", change: "+2.67%" },
  { symbol: "10Y", price: "4.32%", change: "-0.02" },
  { symbol: "WTI", price: "78.42", change: "+0.94%" },
  { symbol: "GOLD", price: "2,348", change: "+0.33%" },
];

export function StockTicker() {
  const tickerContent = TICKERS.map((t) => (
    <span key={t.symbol} className="inline-flex items-center gap-1.5 shrink-0">
      <span className="font-medium text-foreground">{t.symbol}</span>
      <span className="text-muted-foreground">{t.price}</span>
      <span className={t.change.startsWith("-") ? "text-red-400" : "text-emerald-400"}>
        {t.change}
      </span>
    </span>
  ));

  return (
    <div className="w-full border-b border-border bg-card overflow-hidden">
      <div className="flex items-center gap-8 text-[11px] tracking-wide py-2 animate-scroll whitespace-nowrap">
        <div className="flex items-center gap-8 animate-scroll-inner">
          {tickerContent}
          {/* Duplicate for seamless loop */}
          {tickerContent}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-inner {
          display: flex;
          gap: 2rem;
          animation: scroll 60s linear infinite;
        }
      `}</style>
    </div>
  );
}
