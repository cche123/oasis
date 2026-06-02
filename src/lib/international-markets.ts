import type { ResolvedLocation } from "@/lib/locations";
import { resolveLocation } from "@/lib/locations";

export type InternationalMarketOption = {
  id: string;
  label: string;
  /** Value stored in user.internationalMarkets */
  market: string;
  /** Passed to resolveLocation to personalize news */
  locationInput: string;
};

export const INTERNATIONAL_MARKET_OPTIONS: InternationalMarketOption[] = [
  { id: "usa", label: "United States", market: "USA", locationInput: "United States" },
  { id: "europe", label: "Europe", market: "Europe", locationInput: "London, United Kingdom" },
  { id: "japan", label: "Japan", market: "Japan", locationInput: "Tokyo, Japan" },
  { id: "china", label: "China", market: "China", locationInput: "Beijing, China" },
  { id: "india", label: "India", market: "India", locationInput: "Mumbai, India" },
  { id: "singapore", label: "Singapore", market: "Singapore", locationInput: "Singapore" },
  { id: "mena", label: "Middle East", market: "Middle East", locationInput: "Dubai, United Arab Emirates" },
];

export function applyInternationalMarketSelection(market: string): {
  internationalMarkets: string[];
  location: string;
  resolvedLocation?: ResolvedLocation;
} {
  const opt =
    INTERNATIONAL_MARKET_OPTIONS.find((o) => o.market === market) ??
    INTERNATIONAL_MARKET_OPTIONS[0];
  const resolved = resolveLocation(opt.locationInput);
  return {
    internationalMarkets: [opt.market],
    location: opt.locationInput,
    resolvedLocation: resolved.valid ? resolved : undefined,
  };
}
