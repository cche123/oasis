export type ResolvedLocation = {
  valid: boolean;
  input: string;
  city?: string;
  country: string;
  countryCode: string;
  displayName: string;
  /** Google News region code (e.g. US, GB, KE) */
  newsRegion: string;
  /** hl param for Google News */
  newsLang: string;
};

type LocationEntry = {
  city?: string;
  country: string;
  countryCode: string;
  newsRegion: string;
  newsLang?: string;
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

import { US_CITIES } from "./us-cities";
import { US_STATES } from "./us-states";

const US_ENTRY: Omit<LocationEntry, "city"> = {
  country: "United States",
  countryCode: "US",
  newsRegion: "US",
  newsLang: "en-US",
};

/** Country-only entries and major cities worldwide */
const LOCATION_DB: Record<string, LocationEntry> = {
  // Countries
  usa: { country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  "united states": { country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  us: { country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  america: { country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  uk: { country: "United Kingdom", countryCode: "GB", newsRegion: "GB", newsLang: "en-GB" },
  "united kingdom": { country: "United Kingdom", countryCode: "GB", newsRegion: "GB", newsLang: "en-GB" },
  britain: { country: "United Kingdom", countryCode: "GB", newsRegion: "GB", newsLang: "en-GB" },
  england: { country: "United Kingdom", countryCode: "GB", newsRegion: "GB", newsLang: "en-GB" },
  japan: { country: "Japan", countryCode: "JP", newsRegion: "JP", newsLang: "ja" },
  china: { country: "China", countryCode: "CN", newsRegion: "CN", newsLang: "zh-CN" },
  germany: { country: "Germany", countryCode: "DE", newsRegion: "DE", newsLang: "de" },
  france: { country: "France", countryCode: "FR", newsRegion: "FR", newsLang: "fr" },
  india: { country: "India", countryCode: "IN", newsRegion: "IN", newsLang: "en-IN" },
  canada: { country: "Canada", countryCode: "CA", newsRegion: "CA", newsLang: "en-CA" },
  australia: { country: "Australia", countryCode: "AU", newsRegion: "AU", newsLang: "en-AU" },
  brazil: { country: "Brazil", countryCode: "BR", newsRegion: "BR", newsLang: "pt-BR" },
  mexico: { country: "Mexico", countryCode: "MX", newsRegion: "MX", newsLang: "es-419" },
  "south korea": { country: "South Korea", countryCode: "KR", newsRegion: "KR", newsLang: "ko" },
  korea: { country: "South Korea", countryCode: "KR", newsRegion: "KR", newsLang: "ko" },
  uae: { country: "United Arab Emirates", countryCode: "AE", newsRegion: "AE", newsLang: "en-AE" },
  "saudi arabia": { country: "Saudi Arabia", countryCode: "SA", newsRegion: "SA", newsLang: "ar" },
  israel: { country: "Israel", countryCode: "IL", newsRegion: "IL", newsLang: "he" },
  nigeria: { country: "Nigeria", countryCode: "NG", newsRegion: "NG", newsLang: "en-NG" },
  kenya: { country: "Kenya", countryCode: "KE", newsRegion: "KE", newsLang: "en-KE" },
  "south africa": { country: "South Africa", countryCode: "ZA", newsRegion: "ZA", newsLang: "en-ZA" },
  egypt: { country: "Egypt", countryCode: "EG", newsRegion: "EG", newsLang: "ar-EG" },
  turkey: { country: "Turkey", countryCode: "TR", newsRegion: "TR", newsLang: "tr" },
  italy: { country: "Italy", countryCode: "IT", newsRegion: "IT", newsLang: "it" },
  spain: { country: "Spain", countryCode: "ES", newsRegion: "ES", newsLang: "es" },
  netherlands: { country: "Netherlands", countryCode: "NL", newsRegion: "NL", newsLang: "nl" },
  switzerland: { country: "Switzerland", countryCode: "CH", newsRegion: "CH", newsLang: "de-CH" },
  sweden: { country: "Sweden", countryCode: "SE", newsRegion: "SE", newsLang: "sv" },
  norway: { country: "Norway", countryCode: "NO", newsRegion: "NO", newsLang: "no" },
  poland: { country: "Poland", countryCode: "PL", newsRegion: "PL", newsLang: "pl" },
  russia: { country: "Russia", countryCode: "RU", newsRegion: "RU", newsLang: "ru" },
  indonesia: { country: "Indonesia", countryCode: "ID", newsRegion: "ID", newsLang: "id" },
  thailand: { country: "Thailand", countryCode: "TH", newsRegion: "TH", newsLang: "th" },
  vietnam: { country: "Vietnam", countryCode: "VN", newsRegion: "VN", newsLang: "vi" },
  philippines: { country: "Philippines", countryCode: "PH", newsRegion: "PH", newsLang: "en-PH" },
  malaysia: { country: "Malaysia", countryCode: "MY", newsRegion: "MY", newsLang: "en-MY" },
  pakistan: { country: "Pakistan", countryCode: "PK", newsRegion: "PK", newsLang: "en-PK" },
  bangladesh: { country: "Bangladesh", countryCode: "BD", newsRegion: "BD", newsLang: "en-BD" },
  argentina: { country: "Argentina", countryCode: "AR", newsRegion: "AR", newsLang: "es-419" },
  chile: { country: "Chile", countryCode: "CL", newsRegion: "CL", newsLang: "es-419" },
  colombia: { country: "Colombia", countryCode: "CO", newsRegion: "CO", newsLang: "es-419" },
  qatar: { country: "Qatar", countryCode: "QA", newsRegion: "QA", newsLang: "ar" },
  kuwait: { country: "Kuwait", countryCode: "KW", newsRegion: "KW", newsLang: "ar" },
  ethiopia: { country: "Ethiopia", countryCode: "ET", newsRegion: "ET", newsLang: "en-ET" },
  ghana: { country: "Ghana", countryCode: "GH", newsRegion: "GH", newsLang: "en-GH" },
  tanzania: { country: "Tanzania", countryCode: "TZ", newsRegion: "TZ", newsLang: "en-TZ" },
  rwanda: { country: "Rwanda", countryCode: "RW", newsRegion: "RW", newsLang: "en-RW" },
  morocco: { country: "Morocco", countryCode: "MA", newsRegion: "MA", newsLang: "fr" },
  portugal: { country: "Portugal", countryCode: "PT", newsRegion: "PT", newsLang: "pt-PT" },
  ireland: { country: "Ireland", countryCode: "IE", newsRegion: "IE", newsLang: "en-IE" },
  belgium: { country: "Belgium", countryCode: "BE", newsRegion: "BE", newsLang: "fr" },
  austria: { country: "Austria", countryCode: "AT", newsRegion: "AT", newsLang: "de" },
  greece: { country: "Greece", countryCode: "GR", newsRegion: "GR", newsLang: "el" },
  taiwan: { country: "Taiwan", countryCode: "TW", newsRegion: "TW", newsLang: "zh-TW" },
  "new zealand": { country: "New Zealand", countryCode: "NZ", newsRegion: "NZ", newsLang: "en-NZ" },

  // US cities
  "new york": { city: "New York", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  nyc: { city: "New York", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  "san francisco": { city: "San Francisco", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  "los angeles": { city: "Los Angeles", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  chicago: { city: "Chicago", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  boston: { city: "Boston", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  miami: { city: "Miami", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  seattle: { city: "Seattle", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  austin: { city: "Austin", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  dallas: { city: "Dallas", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  houston: { city: "Houston", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  denver: { city: "Denver", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  atlanta: { city: "Atlanta", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  washington: { city: "Washington D.C.", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },
  "washington dc": { city: "Washington D.C.", country: "United States", countryCode: "US", newsRegion: "US", newsLang: "en-US" },

  // UK & Europe
  london: { city: "London", country: "United Kingdom", countryCode: "GB", newsRegion: "GB", newsLang: "en-GB" },
  manchester: { city: "Manchester", country: "United Kingdom", countryCode: "GB", newsRegion: "GB", newsLang: "en-GB" },
  edinburgh: { city: "Edinburgh", country: "United Kingdom", countryCode: "GB", newsRegion: "GB", newsLang: "en-GB" },
  paris: { city: "Paris", country: "France", countryCode: "FR", newsRegion: "FR", newsLang: "fr" },
  berlin: { city: "Berlin", country: "Germany", countryCode: "DE", newsRegion: "DE", newsLang: "de" },
  munich: { city: "Munich", country: "Germany", countryCode: "DE", newsRegion: "DE", newsLang: "de" },
  frankfurt: { city: "Frankfurt", country: "Germany", countryCode: "DE", newsRegion: "DE", newsLang: "de" },
  amsterdam: { city: "Amsterdam", country: "Netherlands", countryCode: "NL", newsRegion: "NL", newsLang: "nl" },
  zurich: { city: "Zurich", country: "Switzerland", countryCode: "CH", newsRegion: "CH", newsLang: "de-CH" },
  geneva: { city: "Geneva", country: "Switzerland", countryCode: "CH", newsRegion: "CH", newsLang: "de-CH" },
  madrid: { city: "Madrid", country: "Spain", countryCode: "ES", newsRegion: "ES", newsLang: "es" },
  barcelona: { city: "Barcelona", country: "Spain", countryCode: "ES", newsRegion: "ES", newsLang: "es" },
  rome: { city: "Rome", country: "Italy", countryCode: "IT", newsRegion: "IT", newsLang: "it" },
  milan: { city: "Milan", country: "Italy", countryCode: "IT", newsRegion: "IT", newsLang: "it" },
  dublin: { city: "Dublin", country: "Ireland", countryCode: "IE", newsRegion: "IE", newsLang: "en-IE" },
  stockholm: { city: "Stockholm", country: "Sweden", countryCode: "SE", newsRegion: "SE", newsLang: "sv" },
  oslo: { city: "Oslo", country: "Norway", countryCode: "NO", newsRegion: "NO", newsLang: "no" },
  warsaw: { city: "Warsaw", country: "Poland", countryCode: "PL", newsRegion: "PL", newsLang: "pl" },
  lisbon: { city: "Lisbon", country: "Portugal", countryCode: "PT", newsRegion: "PT", newsLang: "pt-PT" },
  brussels: { city: "Brussels", country: "Belgium", countryCode: "BE", newsRegion: "BE", newsLang: "fr" },
  vienna: { city: "Vienna", country: "Austria", countryCode: "AT", newsRegion: "AT", newsLang: "de" },
  athens: { city: "Athens", country: "Greece", countryCode: "GR", newsRegion: "GR", newsLang: "el" },
  moscow: { city: "Moscow", country: "Russia", countryCode: "RU", newsRegion: "RU", newsLang: "ru" },
  istanbul: { city: "Istanbul", country: "Turkey", countryCode: "TR", newsRegion: "TR", newsLang: "tr" },

  // Asia-Pacific
  tokyo: { city: "Tokyo", country: "Japan", countryCode: "JP", newsRegion: "JP", newsLang: "ja" },
  osaka: { city: "Osaka", country: "Japan", countryCode: "JP", newsRegion: "JP", newsLang: "ja" },
  beijing: { city: "Beijing", country: "China", countryCode: "CN", newsRegion: "CN", newsLang: "zh-CN" },
  shanghai: { city: "Shanghai", country: "China", countryCode: "CN", newsRegion: "CN", newsLang: "zh-CN" },
  "hong kong": { city: "Hong Kong", country: "Hong Kong", countryCode: "HK", newsRegion: "HK", newsLang: "en-HK" },
  singapore: { city: "Singapore", country: "Singapore", countryCode: "SG", newsRegion: "SG", newsLang: "en-SG" },
  mumbai: { city: "Mumbai", country: "India", countryCode: "IN", newsRegion: "IN", newsLang: "en-IN" },
  delhi: { city: "Delhi", country: "India", countryCode: "IN", newsRegion: "IN", newsLang: "en-IN" },
  "new delhi": { city: "New Delhi", country: "India", countryCode: "IN", newsRegion: "IN", newsLang: "en-IN" },
  bangalore: { city: "Bangalore", country: "India", countryCode: "IN", newsRegion: "IN", newsLang: "en-IN" },
  bengaluru: { city: "Bangalore", country: "India", countryCode: "IN", newsRegion: "IN", newsLang: "en-IN" },
  seoul: { city: "Seoul", country: "South Korea", countryCode: "KR", newsRegion: "KR", newsLang: "ko" },
  sydney: { city: "Sydney", country: "Australia", countryCode: "AU", newsRegion: "AU", newsLang: "en-AU" },
  melbourne: { city: "Melbourne", country: "Australia", countryCode: "AU", newsRegion: "AU", newsLang: "en-AU" },
  jakarta: { city: "Jakarta", country: "Indonesia", countryCode: "ID", newsRegion: "ID", newsLang: "id" },
  bangkok: { city: "Bangkok", country: "Thailand", countryCode: "TH", newsRegion: "TH", newsLang: "th" },
  "ho chi minh": { city: "Ho Chi Minh City", country: "Vietnam", countryCode: "VN", newsRegion: "VN", newsLang: "vi" },
  manila: { city: "Manila", country: "Philippines", countryCode: "PH", newsRegion: "PH", newsLang: "en-PH" },
  "kuala lumpur": { city: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", newsRegion: "MY", newsLang: "en-MY" },
  taipei: { city: "Taipei", country: "Taiwan", countryCode: "TW", newsRegion: "TW", newsLang: "zh-TW" },
  dubai: { city: "Dubai", country: "United Arab Emirates", countryCode: "AE", newsRegion: "AE", newsLang: "en-AE" },
  "abu dhabi": { city: "Abu Dhabi", country: "United Arab Emirates", countryCode: "AE", newsRegion: "AE", newsLang: "en-AE" },
  riyadh: { city: "Riyadh", country: "Saudi Arabia", countryCode: "SA", newsRegion: "SA", newsLang: "ar" },
  tel: { city: "Tel Aviv", country: "Israel", countryCode: "IL", newsRegion: "IL", newsLang: "he" },
  "tel aviv": { city: "Tel Aviv", country: "Israel", countryCode: "IL", newsRegion: "IL", newsLang: "he" },

  // Africa
  nairobi: { city: "Nairobi", country: "Kenya", countryCode: "KE", newsRegion: "KE", newsLang: "en-KE" },
  mombasa: { city: "Mombasa", country: "Kenya", countryCode: "KE", newsRegion: "KE", newsLang: "en-KE" },
  kampala: { city: "Kampala", country: "Uganda", countryCode: "UG", newsRegion: "UG", newsLang: "en-UG" },
  entebbe: { city: "Entebbe", country: "Uganda", countryCode: "UG", newsRegion: "UG", newsLang: "en-UG" },
  lagos: { city: "Lagos", country: "Nigeria", countryCode: "NG", newsRegion: "NG", newsLang: "en-NG" },
  abuja: { city: "Abuja", country: "Nigeria", countryCode: "NG", newsRegion: "NG", newsLang: "en-NG" },
  johannesburg: { city: "Johannesburg", country: "South Africa", countryCode: "ZA", newsRegion: "ZA", newsLang: "en-ZA" },
  "cape town": { city: "Cape Town", country: "South Africa", countryCode: "ZA", newsRegion: "ZA", newsLang: "en-ZA" },
  cairo: { city: "Cairo", country: "Egypt", countryCode: "EG", newsRegion: "EG", newsLang: "ar-EG" },
  casablanca: { city: "Casablanca", country: "Morocco", countryCode: "MA", newsRegion: "MA", newsLang: "fr" },
  accra: { city: "Accra", country: "Ghana", countryCode: "GH", newsRegion: "GH", newsLang: "en-GH" },
  "dar es salaam": { city: "Dar es Salaam", country: "Tanzania", countryCode: "TZ", newsRegion: "TZ", newsLang: "en-TZ" },
  kigali: { city: "Kigali", country: "Rwanda", countryCode: "RW", newsRegion: "RW", newsLang: "en-RW" },
  "addis ababa": { city: "Addis Ababa", country: "Ethiopia", countryCode: "ET", newsRegion: "ET", newsLang: "en-ET" },

  // Americas
  toronto: { city: "Toronto", country: "Canada", countryCode: "CA", newsRegion: "CA", newsLang: "en-CA" },
  vancouver: { city: "Vancouver", country: "Canada", countryCode: "CA", newsRegion: "CA", newsLang: "en-CA" },
  montreal: { city: "Montreal", country: "Canada", countryCode: "CA", newsRegion: "CA", newsLang: "en-CA" },
  "mexico city": { city: "Mexico City", country: "Mexico", countryCode: "MX", newsRegion: "MX", newsLang: "es-419" },
  "sao paulo": { city: "São Paulo", country: "Brazil", countryCode: "BR", newsRegion: "BR", newsLang: "pt-BR" },
  "rio de janeiro": { city: "Rio de Janeiro", country: "Brazil", countryCode: "BR", newsRegion: "BR", newsLang: "pt-BR" },
  "buenos aires": { city: "Buenos Aires", country: "Argentina", countryCode: "AR", newsRegion: "AR", newsLang: "es-419" },
  bogota: { city: "Bogotá", country: "Colombia", countryCode: "CO", newsRegion: "CO", newsLang: "es-419" },
  santiago: { city: "Santiago", country: "Chile", countryCode: "CL", newsRegion: "CL", newsLang: "es-419" },
};

for (const [key, cityName] of Object.entries(US_CITIES)) {
  if (!LOCATION_DB[key]) {
    LOCATION_DB[key] = { city: cityName, ...US_ENTRY };
  }
}

for (const [key, stateName] of Object.entries(US_STATES)) {
  if (!LOCATION_DB[key]) {
    LOCATION_DB[key] = { city: stateName, ...US_ENTRY };
  }
}

function normalize(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildResolved(input: string, entry: LocationEntry): ResolvedLocation {
  const displayName = entry.city
    ? `${entry.city}, ${entry.country}`
    : entry.country;
  return {
    valid: true,
    input,
    city: entry.city,
    country: entry.country,
    countryCode: entry.countryCode,
    displayName,
    newsRegion: entry.newsRegion,
    newsLang: entry.newsLang || "en-US",
  };
}

/** Resolve a free-text location to structured geo data */
export function resolveLocation(input: string): ResolvedLocation {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length < 2) {
    return { ...DEFAULT_LOCATION, input: trimmed, valid: false };
  }

  const key = normalize(trimmed);

  // Reject obvious gibberish: single char or only non-alpha
  if (key.length < 2 || !/[a-z]/.test(key)) {
    return { ...DEFAULT_LOCATION, input: trimmed, valid: false };
  }

  // Direct match
  if (LOCATION_DB[key]) {
    return buildResolved(trimmed, LOCATION_DB[key]);
  }

  // "City, Country" format — try city part first
  const parts = key.split(",").map((p) => p.trim());
  for (const part of parts) {
    if (LOCATION_DB[part]) {
      return buildResolved(trimmed, LOCATION_DB[part]);
    }
  }

  // Partial match (e.g. "san fran" won't match, but "nairobi kenya" might)
  for (const [dbKey, entry] of Object.entries(LOCATION_DB)) {
    if (key.includes(dbKey) || dbKey.includes(key)) {
      if (key.length >= 3 && dbKey.length >= 3) {
        return buildResolved(trimmed, entry);
      }
    }
  }

  return { ...DEFAULT_LOCATION, input: trimmed, valid: false };
}

export const FALLBACK_MARKETS = ["USA", "Japan", "Europe", "Emerging Markets", "Middle East", "China"];
