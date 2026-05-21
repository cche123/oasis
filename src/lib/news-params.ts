import type { ResolvedLocation } from "@/lib/locations";

export function buildNewsQueryParams(opts: {
  interests?: string[];
  location?: string;
  resolvedLocation?: ResolvedLocation;
  markets?: string[];
}): string {
  const params = new URLSearchParams();
  if (opts.interests?.length) {
    params.set("interests", opts.interests.join("|"));
  }
  if (opts.location) params.set("location", opts.location);
  if (opts.resolvedLocation?.valid) {
    params.set("country", opts.resolvedLocation.country);
    params.set("region", opts.resolvedLocation.newsRegion);
    params.set("lang", opts.resolvedLocation.newsLang);
  }
  if (opts.markets?.length) {
    params.set("markets", opts.markets.join("|"));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
