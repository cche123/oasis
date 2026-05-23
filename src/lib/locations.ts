import { resolveGeoEntry, formatDisplayName, type GeoEntry } from "./geo-registry";

export type ResolvedLocation = {
  valid: boolean;
  input: string;
  city?: string;
  state?: string;
  region?: string;
  country: string;
  countryCode: string;
  displayName: string;
  newsRegion: string;
  newsLang: string;
};

const DEFAULT_LOCATION: ResolvedLocation = {
  valid: false,
  input: "",
  country: "United States",
  countryCode: "US",
  displayName: "United States",
  newsRegion: "US",
  newsLang: "en-US",
};

function toResolved(input: string, entry: GeoEntry): ResolvedLocation {
  return {
    valid: true,
    input,
    city: entry.city,
    state: entry.state,
    region: entry.region,
    country: entry.country,
    countryCode: entry.countryCode,
    displayName: formatDisplayName(entry),
    newsRegion: entry.newsRegion,
    newsLang: entry.newsLang,
  };
}

/** Resolve a free-text location to structured geo data */
export function resolveLocation(input: string): ResolvedLocation {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length < 2) {
    return { ...DEFAULT_LOCATION, input: trimmed, valid: false };
  }

  const result = resolveGeoEntry(trimmed);
  if (result.valid && result.entry) {
    return toResolved(trimmed, result.entry);
  }

  return { ...DEFAULT_LOCATION, input: trimmed, valid: false };
}

export const FALLBACK_MARKETS = [
  "USA",
  "India",
  "China",
  "Japan",
  "Europe",
  "Singapore",
  "Emerging Markets",
  "Middle East",
];
