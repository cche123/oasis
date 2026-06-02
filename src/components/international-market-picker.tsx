"use client";

import { INTERNATIONAL_MARKET_OPTIONS, applyInternationalMarketSelection } from "@/lib/international-markets";
import { useUser } from "@/components/user-context";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/** Select a region — updates location + markets and refreshes feeds across Oasis. */
export function InternationalMarketPicker({ className }: Props) {
  const { user, updateUser } = useUser();
  const active =
    user.internationalMarkets?.[0] ??
    (user.resolvedLocation?.valid ? "USA" : "USA");

  const onSelect = (market: string) => {
    const patch = applyInternationalMarketSelection(market);
    updateUser({
      ...patch,
      feedVersion: (user.feedVersion || 0) + 1,
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        International focus
      </p>
      <p className="text-xs text-muted-foreground font-light leading-relaxed">
        Choosing a region updates your Oasis location, news prioritization, and dashboard
        briefing — immediately.
      </p>
      <div className="flex flex-wrap gap-2">
        {INTERNATIONAL_MARKET_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.market)}
            className={cn(
              "px-3 py-2 text-[10px] uppercase tracking-widest border transition-colors",
              active === opt.market
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {user.resolvedLocation?.valid && (
        <p className="text-[10px] text-muted-foreground">
          Active lens: <span className="text-foreground">{user.resolvedLocation.displayName}</span>
          {user.internationalMarkets?.length
            ? ` · Markets: ${user.internationalMarkets.join(", ")}`
            : ""}
        </p>
      )}
    </div>
  );
}
