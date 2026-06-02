"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { SP500_UNIVERSE, searchSp500 } from "@/lib/sp500-symbols";
import { useUser } from "@/components/user-context";
import { cn } from "@/lib/utils";

type Quote = { symbol: string; price: number; change: number };

export default function PublicMarketsPage() {
  const { user, updateUser } = useUser();
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sectors = useMemo(
    () => ["All", ...Array.from(new Set(SP500_UNIVERSE.map((e) => e.sector))).sort()],
    []
  );

  const filtered = useMemo(() => {
    let list =
      query.trim().length === 0
        ? [...SP500_UNIVERSE]
        : searchSp500(query, SP500_UNIVERSE.length);
    if (sector !== "All") list = list.filter((e) => e.sector === sector);
    return list.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [query, sector]);

  const fetchQuotes = useCallback(async (symbols: string[]) => {
    if (!symbols.length) {
      setQuotes([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/market-data?symbols=${encodeURIComponent(symbols.join(","))}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setQuotes(data.tickers ?? []);
    } catch {
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const syms = filtered.slice(0, 20).map((e) => e.symbol);
    const timer = setTimeout(() => {
      void fetchQuotes(syms);
    }, 200);
    return () => clearTimeout(timer);
  }, [filtered, fetchQuotes]);

  useEffect(() => {
    if (selected) void fetchQuotes([selected]);
  }, [selected, fetchQuotes]);

  const quoteMap = useMemo(() => {
    const m: Record<string, Quote> = {};
    for (const q of quotes) m[q.symbol] = q;
    return m;
  }, [quotes]);

  const selectedQuote = selected ? quoteMap[selected] : undefined;
  const watchlist = user.trackedTickers ?? [];

  const toggleWatch = (sym: string) => {
    const set = new Set(watchlist);
    if (set.has(sym)) set.delete(sym);
    else set.add(sym);
    updateUser({ trackedTickers: Array.from(set).slice(0, 15) });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full font-sans pb-24">
      <header className="mb-10 border-b border-border pb-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
          Public Markets · S&P 500 universe
        </p>
        <h1 className="text-4xl font-serif font-light tracking-tight">Equity Explorer</h1>
        <p className="text-muted-foreground max-w-2xl font-light mt-3 text-sm leading-relaxed">
          Search large-cap US equities, preview live quotes (Yahoo Finance), and build your
          watchlist — synced with Oasis AI and your dashboard.
        </p>
      </header>

      <div className="flex flex-col gap-4 mb-8">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by symbol or company (e.g. NVDA, Boeing)…"
            className="w-full pl-8 pr-3 py-2.5 border-b border-border bg-transparent text-sm focus:outline-none focus:border-foreground"
            autoComplete="off"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {sectors.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSector(s)}
              className={cn(
                "px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-colors",
                sector === s
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} symbols
          {query.trim() ? ` matching “${query.trim()}”` : ""}.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 border border-border divide-y divide-border max-h-[70vh] overflow-y-auto">
          {filtered.map((entry) => {
            const q = quoteMap[entry.symbol];
            return (
              <button
                key={entry.symbol}
                type="button"
                onClick={() => setSelected(entry.symbol)}
                className={cn(
                  "w-full text-left p-4 hover:bg-muted/20 transition-colors flex items-center justify-between gap-4",
                  selected === entry.symbol && "bg-muted/40"
                )}
              >
                <div>
                  <span className="font-mono font-semibold text-foreground">{entry.symbol}</span>
                  <span className="text-sm text-muted-foreground ml-2">{entry.name}</span>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    {entry.sector}
                  </p>
                </div>
                <div className="text-right shrink-0 min-w-[72px]">
                  {loading && !q ? (
                    <span className="text-xs text-muted-foreground">…</span>
                  ) : q ? (
                    <>
                      <p className="font-mono text-sm">{q.price.toFixed(2)}</p>
                      <p
                        className={cn(
                          "text-xs flex items-center justify-end gap-0.5",
                          q.change < 0 ? "text-red-400" : "text-emerald-400"
                        )}
                      >
                        {q.change < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        {q.change > 0 ? "+" : ""}
                        {q.change.toFixed(2)}%
                      </p>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <aside className="lg:col-span-4 border border-border bg-card p-6 rounded-3xl space-y-4 sticky top-8">
          {!selected ? (
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Select a stock to preview live price action and add it to your Oasis watchlist.
            </p>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-serif">{selected}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {SP500_UNIVERSE.find((e) => e.symbol === selected)?.name}
                </p>
              </div>
              {selectedQuote && (
                <p className="font-mono text-lg">
                  {selectedQuote.price.toFixed(2)}{" "}
                  <span
                    className={
                      selectedQuote.change < 0 ? "text-red-400 text-sm" : "text-emerald-400 text-sm"
                    }
                  >
                    {selectedQuote.change > 0 ? "+" : ""}
                    {selectedQuote.change.toFixed(2)}%
                  </span>
                </p>
              )}
              <button
                type="button"
                onClick={() => toggleWatch(selected)}
                className="w-full py-3 border border-border text-xs uppercase tracking-widest font-bold hover:border-foreground transition-colors"
              >
                {watchlist.includes(selected) ? "Remove from watchlist" : "Add to watchlist"}
              </button>
              <a
                href={`https://finance.yahoo.com/quote/${selected}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Open on Yahoo Finance →
              </a>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
