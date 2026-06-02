"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const REGIONS = [
  { id: "usa", label: "United States", markets: "USA", lat: 38, lon: -95 },
  { id: "europe", label: "Europe", markets: "Europe", lat: 50, lon: 10 },
  { id: "japan", label: "Japan", markets: "Japan", lat: 36, lon: 138 },
  { id: "china", label: "China", markets: "China", lat: 35, lon: 105 },
  { id: "india", label: "India", markets: "India", lat: 22, lon: 78 },
  { id: "mena", label: "Middle East", markets: "Middle East", lat: 26, lon: 45 },
  { id: "latam", label: "Emerging Markets", markets: "Emerging Markets", lat: -10, lon: -55 },
  { id: "sea", label: "Singapore / SEA", markets: "Singapore", lat: 1, lon: 104 },
] as const;

type Props = {
  selected?: string;
  onSelect?: (market: string) => void;
  className?: string;
};

/** Stylized rotatable globe — click a region to focus international markets. */
export function GlobalMarketsGlobe({ selected, onSelect, className }: Props) {
  const [rotation, setRotation] = useState(0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Global lens
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setRotation((r) => r - 24)}
            className="px-2 py-1 text-[10px] uppercase tracking-widest border border-border hover:border-foreground"
          >
            ← Spin
          </button>
          <button
            type="button"
            onClick={() => setRotation((r) => r + 24)}
            className="px-2 py-1 text-[10px] uppercase tracking-widest border border-border hover:border-foreground"
          >
            Spin →
          </button>
        </div>
      </div>

      <div
        className="relative mx-auto w-full max-w-[280px] aspect-square rounded-full border border-border bg-gradient-to-b from-muted/40 to-background overflow-hidden"
        style={{ perspective: "600px" }}
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{ transform: `rotateY(${rotation}deg)` }}
        >
          <div className="absolute inset-4 rounded-full border border-foreground/10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_55%)]" />
          {REGIONS.map((r) => {
            const x = 50 + (r.lon / 180) * 42;
            const y = 50 - (r.lat / 90) * 38;
            const active = selected === r.markets;
            return (
              <button
                key={r.id}
                type="button"
                title={r.label}
                onClick={() => onSelect?.(r.markets)}
                className={cn(
                  "absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full border transition-all",
                  active
                    ? "bg-foreground border-foreground scale-150"
                    : "bg-foreground/40 border-foreground/60 hover:scale-125"
                )}
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {REGIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect?.(r.markets)}
            className={cn(
              "px-2.5 py-1 text-[10px] uppercase tracking-widest border transition-colors",
              selected === r.markets
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
