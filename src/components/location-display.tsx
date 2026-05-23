"use client";

import { cn } from "@/lib/utils";
import type { ResolvedLocation } from "@/lib/locations";

type Variant = "dark" | "light";

/** Pretty "Detroit, Michigan" / "New Delhi, India" badge */
export function LocationBadge({
  name,
  variant = "dark",
  className,
}: {
  name: string;
  variant?: Variant;
  className?: string;
}) {
  const comma = name.indexOf(", ");
  const city = comma >= 0 ? name.slice(0, comma) : name;
  const rest = comma >= 0 ? name.slice(comma + 2) : "";

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-0.5 font-serif tracking-wide",
        variant === "dark" ? "text-white" : "text-foreground",
        className
      )}
    >
      <span className="font-medium">{city}</span>
      {rest && (
        <>
          <span className={variant === "dark" ? "text-white/35" : "text-muted-foreground/50"}>
            ,
          </span>
          <span
            className={cn(
              "font-light ml-1",
              variant === "dark" ? "text-white/65" : "text-muted-foreground"
            )}
          >
            {rest}
          </span>
        </>
      )}
    </span>
  );
}

export function LocationResolved({
  location,
  variant = "dark",
}: {
  location: ResolvedLocation;
  variant?: Variant;
}) {
  if (!location.valid) return null;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border px-4 py-2",
        variant === "dark"
          ? "border-emerald-500/25 bg-emerald-500/5"
          : "border-emerald-600/20 bg-emerald-50/50 dark:bg-emerald-950/20"
      )}
    >
      <span className="text-emerald-400 text-sm leading-none">✓</span>
      <LocationBadge name={location.displayName} variant={variant} />
      <span
        className={cn(
          "text-[10px] uppercase tracking-widest font-medium",
          variant === "dark" ? "text-emerald-400/70" : "text-emerald-600/80"
        )}
      >
        Regional news
      </span>
    </div>
  );
}

/** Pipe-separated row — Detroit, Michigan | New Delhi, India | Tel Aviv, Israel */
export function LocationExamples({
  examples,
  onSelect,
  variant = "dark",
}: {
  examples: { input: string; label: string }[];
  onSelect?: (input: string) => void;
  variant?: Variant;
}) {
  return (
    <div className="space-y-3">
      <p
        className={cn(
          "text-[10px] uppercase tracking-[0.2em] text-center",
          variant === "dark" ? "text-white/30" : "text-muted-foreground"
        )}
      >
        Examples
      </p>
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm",
          variant === "dark" ? "text-white/50" : "text-muted-foreground"
        )}
      >
        {examples.map((ex, i) => (
          <span key={ex.input} className="inline-flex items-center gap-2">
            {i > 0 && (
              <span className={variant === "dark" ? "text-white/20" : "text-border"}>|</span>
            )}
            <button
              type="button"
              onClick={() => onSelect?.(ex.input)}
              className={cn(
                "transition-colors opacity-80 hover:opacity-100",
                onSelect && "cursor-pointer",
                variant === "dark" ? "hover:text-white" : "hover:text-foreground"
              )}
            >
              <LocationBadge name={ex.label} variant={variant} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
