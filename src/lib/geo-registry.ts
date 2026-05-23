/**
 * Unified geo registry — lookup keys → city/state/country + news locale.
 * Supports: "Birmingham, Michigan", "Gujarat", "Saratoga, California", "Kyoto", etc.
 * Any "City, State" (US) or "City, Region" (India) resolves even if not in the catalog.
 */

import { US_STATES } from "./us-states";

export type GeoEntry = {
  city: string;
  state?: string;
  region?: string;
  country: string;
  countryCode: string;
  newsRegion: string;
  newsLang: string;
  keys: string[];
};

const US = {
  country: "United States",
  countryCode: "US",
  newsRegion: "US",
  newsLang: "en-US",
};

const US_STATE_ABBREV: Record<string, string> = {
  al: "Alabama", ak: "Alaska", az: "Arizona", ar: "Arkansas", ca: "California",
  co: "Colorado", ct: "Connecticut", de: "Delaware", fl: "Florida", ga: "Georgia",
  hi: "Hawaii", id: "Idaho", il: "Illinois", in: "Indiana", ia: "Iowa", ks: "Kansas",
  ky: "Kentucky", la: "Louisiana", me: "Maine", md: "Maryland", ma: "Massachusetts",
  mi: "Michigan", mn: "Minnesota", ms: "Mississippi", mo: "Missouri", mt: "Montana",
  ne: "Nebraska", nv: "Nevada", nh: "New Hampshire", nj: "New Jersey", nm: "New Mexico",
  ny: "New York",
  nc: "North Carolina", nd: "North Dakota", oh: "Ohio", ok: "Oklahoma", or: "Oregon",
  pa: "Pennsylvania", ri: "Rhode Island", sc: "South Carolina", sd: "South Dakota",
  tn: "Tennessee", tx: "Texas", ut: "Utah", vt: "Vermont", va: "Virginia",
  wa: "Washington", wv: "West Virginia", wi: "Wisconsin", wy: "Wyoming", dc: "District of Columbia",
};

const INDIA_REGIONS: Record<string, string> = {
  "andhra pradesh": "Andhra Pradesh",
  "arunachal pradesh": "Arunachal Pradesh",
  assam: "Assam",
  bihar: "Bihar",
  chhattisgarh: "Chhattisgarh",
  goa: "Goa",
  gujarat: "Gujarat",
  haryana: "Haryana",
  "himachal pradesh": "Himachal Pradesh",
  jharkhand: "Jharkhand",
  karnataka: "Karnataka",
  kerala: "Kerala",
  "madhya pradesh": "Madhya Pradesh",
  maharashtra: "Maharashtra",
  manipur: "Manipur",
  meghalaya: "Meghalaya",
  mizoram: "Mizoram",
  nagaland: "Nagaland",
  odisha: "Odisha",
  orissa: "Odisha",
  punjab: "Punjab",
  rajasthan: "Rajasthan",
  sikkim: "Sikkim",
  "tamil nadu": "Tamil Nadu",
  tamilnadu: "Tamil Nadu",
  telangana: "Telangana",
  tripura: "Tripura",
  "uttar pradesh": "Uttar Pradesh",
  uttarakhand: "Uttarakhand",
  uttaranchal: "Uttarakhand",
  "west bengal": "West Bengal",
  delhi: "Delhi",
  "jammu and kashmir": "Jammu and Kashmir",
  jammu: "Jammu and Kashmir",
  kashmir: "Jammu and Kashmir",
  ladakh: "Ladakh",
  puducherry: "Puducherry",
  pondicherry: "Puducherry",
  chandigarh: "Chandigarh",
  india: "India",
  bharat: "India",
};

function titleCase(s: string): string {
  return s.replace(/\b\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function resolveUsStateToken(token: string): string | null {
  const k = token.toLowerCase().trim();
  if (US_STATES[k]) return US_STATES[k];
  if (k.length === 2 && US_STATE_ABBREV[k]) return US_STATE_ABBREV[k];
  for (const [, name] of Object.entries(US_STATES)) {
    if (name.toLowerCase() === k) return name;
  }
  return null;
}

function resolveIndiaRegionToken(token: string): string | null {
  const k = token.toLowerCase().trim();
  return INDIA_REGIONS[k] || null;
}

function syntheticUs(city: string, state: string): GeoEntry {
  return {
    city: titleCase(city),
    state,
    ...US,
    keys: [],
  };
}

function syntheticIndia(city: string, region?: string): GeoEntry {
  const regionName = region && region !== "India" ? region : undefined;
  return {
    city: titleCase(city),
    region: regionName,
    country: "India",
    countryCode: "IN",
    newsRegion: "IN",
    newsLang: "en-IN",
    keys: [],
  };
}

function tryParseUsCityState(key: string): GeoEntry | null {
  const parts = key.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const state = resolveUsStateToken(parts[parts.length - 1]);
    if (state) {
      const city = parts.slice(0, -1).join(", ");
      if (city.length >= 2) return syntheticUs(city, state);
    }
  }

  const words = key.split(" ");
  if (words.length >= 2) {
    for (let len = 3; len >= 1; len--) {
      if (words.length <= len) continue;
      const statePart = words.slice(-len).join(" ");
      const state = resolveUsStateToken(statePart);
      if (state) {
        const city = words.slice(0, -len).join(" ");
        if (city.length >= 2) return syntheticUs(city, state);
      }
    }
  }
  return null;
}

function tryParseIndiaLocation(key: string): GeoEntry | null {
  const parts = key.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1].toLowerCase();
    if (last === "india" || last === "bharat") {
      const city = parts.slice(0, -1).join(", ");
      if (city.length >= 2) return syntheticIndia(city);
    }
    const region = resolveIndiaRegionToken(parts[parts.length - 1]);
    if (region && region !== "India") {
      const city = parts.slice(0, -1).join(", ");
      if (city.length >= 2) return syntheticIndia(city, region);
    }
  }

  if (key.endsWith(" india") || key.endsWith(" bharat")) {
    const city = key.replace(/\s+(india|bharat)$/, "");
    if (city.length >= 2) return syntheticIndia(city);
  }

  const words = key.split(" ");
  if (words.length >= 2) {
    for (let len = 3; len >= 1; len--) {
      if (words.length <= len) continue;
      const regionPart = words.slice(-len).join(" ");
      const region = resolveIndiaRegionToken(regionPart);
      if (region && region !== "India") {
        const city = words.slice(0, -len).join(" ");
        if (city.length >= 2) return syntheticIndia(city, region);
      }
    }
  }
  return null;
}

function us(
  city: string,
  state: string,
  opts?: { aliases?: string[]; noBare?: boolean }
): GeoEntry {
  const keys = [
    `${city} ${state}`.toLowerCase(),
    `${city}, ${state}`.toLowerCase(),
    ...(!opts?.noBare ? [city.toLowerCase()] : []),
    ...(opts?.aliases || []).map((k) => k.toLowerCase()),
  ];
  return { city, state, ...US, keys: [...new Set(keys)] };
}

function intl(
  city: string,
  country: string,
  countryCode: string,
  newsRegion: string,
  newsLang: string,
  region?: string,
  ...extraKeys: string[]
): GeoEntry {
  const keys = [
    city.toLowerCase(),
    `${city}, ${country}`.toLowerCase(),
    ...(region
      ? [
          `${city} ${region}`.toLowerCase(),
          `${city}, ${region}`.toLowerCase(),
          `${city}, ${region}, ${country}`.toLowerCase(),
        ]
      : []),
    ...extraKeys.filter(Boolean).map((k) => k.toLowerCase()),
  ].filter(Boolean) as string[];
  return { city, region, country, countryCode, newsRegion, newsLang, keys: [...new Set(keys)] };
}

function countryOnly(
  name: string,
  countryCode: string,
  newsRegion: string,
  newsLang: string,
  ...keys: string[]
): GeoEntry {
  return {
    city: name,
    country: name,
    countryCode,
    newsRegion,
    newsLang,
    keys: [name.toLowerCase(), ...keys.map((k) => k.toLowerCase())],
  };
}

/** All geo entries — expanded US (with state), India, Singapore, global */
export const GEO_ENTRIES: GeoEntry[] = [
  // —— US states (all 50 + DC) ——
  ...[
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
    "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
    "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
    "District of Columbia",
  ].map((state) => us(state, state, { aliases: [state.slice(0, 2).toLowerCase()] })),

  // —— US cities (state-disambiguated where needed) ——
  us("New York", "New York", { aliases: ["nyc", "new york city", "manhattan", "brooklyn"] }),
  us("Los Angeles", "California", { aliases: ["la", "los angeles ca"] }),
  us("San Francisco", "California", { aliases: ["sf", "san francisco ca", "silicon valley"] }),
  us("San Jose", "California", { aliases: ["san jose ca"] }),
  us("Palo Alto", "California", { aliases: ["palo alto ca"] }),
  us("Menlo Park", "California", { aliases: ["menlo park ca"] }),
  us("Mountain View", "California", { aliases: ["mountain view ca"] }),
  us("Sunnyvale", "California", { aliases: ["sunnyvale ca"] }),
  us("Cupertino", "California", { aliases: ["cupertino ca"] }),
  us("Saratoga", "California", { aliases: ["saratoga ca", "saratoga california"] }),
  us("Atherton", "California", { aliases: ["atherton ca"] }),
  us("Redwood City", "California", { aliases: ["redwood city ca"] }),
  us("Santa Monica", "California", { aliases: ["santa monica ca"] }),
  us("Pasadena", "California", { aliases: ["pasadena ca"] }),
  us("Irvine", "California", { aliases: ["irvine ca"] }),
  us("San Diego", "California", { aliases: ["san diego ca"] }),
  us("Sacramento", "California", { aliases: ["sacramento ca"] }),
  us("Oakland", "California", { aliases: ["oakland ca"] }),
  us("Chicago", "Illinois", { aliases: ["chicago il"] }),
  us("Austin", "Texas", { aliases: ["austin tx"] }),
  us("Houston", "Texas", { aliases: ["houston tx"] }),
  us("Dallas", "Texas", { aliases: ["dallas tx"] }),
  us("Seattle", "Washington", { aliases: ["seattle wa"] }),
  us("Boston", "Massachusetts", { aliases: ["boston ma"] }),
  us("Miami", "Florida", { aliases: ["miami fl"] }),
  us("Atlanta", "Georgia", { aliases: ["atlanta ga"] }),
  us("Denver", "Colorado", { aliases: ["denver co"] }),
  us("Phoenix", "Arizona", { aliases: ["phoenix az"] }),
  us("Las Vegas", "Nevada", { aliases: ["vegas", "las vegas nv"] }),
  us("Portland", "Oregon", { aliases: ["portland or"] }),
  us("Detroit", "Michigan", { aliases: ["detroit mi"] }),
  us("Troy", "Michigan", { aliases: ["troy mi", "troy michigan"] }),
  us("Ann Arbor", "Michigan", { aliases: ["ann arbor mi", "ann arbor michigan"] }),
  us("Grand Rapids", "Michigan", { aliases: ["grand rapids mi"] }),
  us("Kalamazoo", "Michigan", { aliases: ["kalamazoo mi"] }),
  us("Lansing", "Michigan", { aliases: ["lansing mi"] }),
  us("Flint", "Michigan", { aliases: ["flint mi"] }),
  us("Birmingham", "Alabama", { noBare: true, aliases: ["birmingham al", "birmingham alabama"] }),
  us("Birmingham", "Michigan", { noBare: true, aliases: ["birmingham mi", "birmingham michigan"] }),
  us("Des Moines", "Iowa", { aliases: ["des moines ia", "des moines iowa"] }),
  us("Minneapolis", "Minnesota", { aliases: ["minneapolis mn"] }),
  us("St. Paul", "Minnesota", { aliases: ["st paul mn", "saint paul mn"] }),
  us("Nashville", "Tennessee", { aliases: ["nashville tn"] }),
  us("Charlotte", "North Carolina", { aliases: ["charlotte nc"] }),
  us("Raleigh", "North Carolina", { aliases: ["raleigh nc"] }),
  us("Philadelphia", "Pennsylvania", { aliases: ["philadelphia pa"] }),
  us("Pittsburgh", "Pennsylvania", { aliases: ["pittsburgh pa"] }),
  us("Washington", "District of Columbia", { aliases: ["washington dc", "dc"] }),
  us("Baltimore", "Maryland", { aliases: ["baltimore md"] }),
  us("Cleveland", "Ohio", { aliases: ["cleveland oh"] }),
  us("Cincinnati", "Ohio", { aliases: ["cincinnati oh"] }),
  us("Columbus", "Ohio", { aliases: ["columbus oh"] }),
  us("Indianapolis", "Indiana", { aliases: ["indianapolis in"] }),
  us("Milwaukee", "Wisconsin", { aliases: ["milwaukee wi"] }),
  us("Kansas City", "Missouri", { aliases: ["kansas city mo"] }),
  us("St. Louis", "Missouri", { aliases: ["st louis mo"] }),
  us("New Orleans", "Louisiana", { aliases: ["new orleans la"] }),
  us("Salt Lake City", "Utah", { aliases: ["salt lake city ut"] }),
  us("Honolulu", "Hawaii", { aliases: ["honolulu hi"] }),
  us("Anchorage", "Alaska", { aliases: ["anchorage ak"] }),
  us("Boise", "Idaho", { aliases: ["boise id"] }),
  us("Omaha", "Nebraska", { aliases: ["omaha ne"] }),
  us("Louisville", "Kentucky", { aliases: ["louisville ky"] }),
  us("Memphis", "Tennessee", { aliases: ["memphis tn"] }),
  us("Tampa", "Florida", { aliases: ["tampa fl"] }),
  us("Orlando", "Florida", { aliases: ["orlando fl"] }),
  us("Jacksonville", "Florida", { aliases: ["jacksonville fl"] }),
  us("San Antonio", "Texas", { aliases: ["san antonio tx"] }),
  us("Fort Worth", "Texas", { aliases: ["fort worth tx"] }),
  us("Richmond", "Virginia", { aliases: ["richmond va"] }),
  us("Norfolk", "Virginia", { aliases: ["norfolk va"] }),
  us("Charleston", "South Carolina", { aliases: ["charleston sc"] }),
  us("Savannah", "Georgia", { aliases: ["savannah ga"] }),
  us("Greenwich", "Connecticut", { aliases: ["greenwich ct"] }),
  us("Stamford", "Connecticut", { aliases: ["stamford ct"] }),
  us("Cambridge", "Massachusetts", { aliases: ["cambridge ma"] }),
  us("Princeton", "New Jersey", { aliases: ["princeton nj"] }),
  us("Hoboken", "New Jersey", { aliases: ["hoboken nj"] }),
  us("Jersey City", "New Jersey", { aliases: ["jersey city nj"] }),
  us("Buffalo", "New York", { aliases: ["buffalo ny"] }),
  us("Rochester", "New York", { aliases: ["rochester ny"] }),
  us("Albany", "New York", { aliases: ["albany ny"] }),
  us("Syracuse", "New York", { aliases: ["syracuse ny"] }),
  us("Tucson", "Arizona", { aliases: ["tucson az"] }),
  us("Scottsdale", "Arizona", { aliases: ["scottsdale az"] }),
  us("Tempe", "Arizona", { aliases: ["tempe az"] }),
  us("Colorado Springs", "Colorado", { aliases: ["colorado springs co"] }),
  us("Boulder", "Colorado", { aliases: ["boulder co"] }),

  // —— India (cities + states/regions) ——
  countryOnly("India", "IN", "IN", "en-IN", "bharat", "hindustan"),
  intl("Mumbai", "India", "IN", "IN", "en-IN", "Maharashtra", "bombay"),
  intl("Delhi", "India", "IN", "IN", "en-IN", "Delhi", "new delhi"),
  intl("New Delhi", "India", "IN", "IN", "en-IN", "Delhi"),
  intl("Bangalore", "India", "IN", "IN", "en-IN", "Karnataka", "bengaluru"),
  intl("Bengaluru", "India", "IN", "IN", "en-IN", "Karnataka"),
  intl("Hyderabad", "India", "IN", "IN", "en-IN", "Telangana"),
  intl("Chennai", "India", "IN", "IN", "en-IN", "Tamil Nadu", "madras"),
  intl("Kolkata", "India", "IN", "IN", "en-IN", "West Bengal", "calcutta"),
  intl("Pune", "India", "IN", "IN", "en-IN", "Maharashtra"),
  intl("Ahmedabad", "India", "IN", "IN", "en-IN", "Gujarat"),
  intl("Surat", "India", "IN", "IN", "en-IN", "Gujarat"),
  intl("Vadodara", "India", "IN", "IN", "en-IN", "Gujarat", "baroda"),
  intl("Jaipur", "India", "IN", "IN", "en-IN", "Rajasthan"),
  intl("Lucknow", "India", "IN", "IN", "en-IN", "Uttar Pradesh"),
  intl("Chandigarh", "India", "IN", "IN", "en-IN", "Punjab"),
  intl("Kochi", "India", "IN", "IN", "en-IN", "Kerala", "cochin"),
  intl("Goa", "India", "IN", "IN", "en-IN", "Goa"),
  intl("Indore", "India", "IN", "IN", "en-IN", "Madhya Pradesh"),
  intl("Bhopal", "India", "IN", "IN", "en-IN", "Madhya Pradesh"),
  intl("Nagpur", "India", "IN", "IN", "en-IN", "Maharashtra"),
  intl("Visakhapatnam", "India", "IN", "IN", "en-IN", "Andhra Pradesh", "vizag"),
  intl("Noida", "India", "IN", "IN", "en-IN", "Uttar Pradesh"),
  intl("Gurugram", "India", "IN", "IN", "en-IN", "Haryana", "gurgaon"),
  intl("Gurgaon", "India", "IN", "IN", "en-IN", "Haryana"),
  intl("Thane", "India", "IN", "IN", "en-IN", "Maharashtra"),
  intl("Coimbatore", "India", "IN", "IN", "en-IN", "Tamil Nadu"),
  intl("Madurai", "India", "IN", "IN", "en-IN", "Tamil Nadu"),
  intl("Patna", "India", "IN", "IN", "en-IN", "Bihar"),
  intl("Bhubaneswar", "India", "IN", "IN", "en-IN", "Odisha"),
  intl("Guwahati", "India", "IN", "IN", "en-IN", "Assam"),
  intl("Mysuru", "India", "IN", "IN", "en-IN", "Karnataka", "mysore"),
  intl("Mysore", "India", "IN", "IN", "en-IN", "Karnataka"),
  intl("Ludhiana", "India", "IN", "IN", "en-IN", "Punjab"),
  intl("Varanasi", "India", "IN", "IN", "en-IN", "Uttar Pradesh", "banaras"),
  intl("Agra", "India", "IN", "IN", "en-IN", "Uttar Pradesh"),
  intl("Kanpur", "India", "IN", "IN", "en-IN", "Uttar Pradesh"),
  intl("Nashik", "India", "IN", "IN", "en-IN", "Maharashtra"),
  intl("Raipur", "India", "IN", "IN", "en-IN", "Chhattisgarh"),
  intl("Ranchi", "India", "IN", "IN", "en-IN", "Jharkhand"),
  intl("Dehradun", "India", "IN", "IN", "en-IN", "Uttarakhand"),
  intl("Shimla", "India", "IN", "IN", "en-IN", "Himachal Pradesh"),
  intl("Srinagar", "India", "IN", "IN", "en-IN", "Jammu and Kashmir"),
  intl("Thiruvananthapuram", "India", "IN", "IN", "en-IN", "Kerala", "trivandrum"),
  intl("Panaji", "India", "IN", "IN", "en-IN", "Goa"),
  intl("Gandhinagar", "India", "IN", "IN", "en-IN", "Gujarat"),
  intl("Rajkot", "India", "IN", "IN", "en-IN", "Gujarat"),
  intl("Bhavnagar", "India", "IN", "IN", "en-IN", "Gujarat"),
  intl("Jamshedpur", "India", "IN", "IN", "en-IN", "Jharkhand"),
  intl("Cuttack", "India", "IN", "IN", "en-IN", "Odisha"),
  intl("Amritsar", "India", "IN", "IN", "en-IN", "Punjab"),
  intl("Udaipur", "India", "IN", "IN", "en-IN", "Rajasthan"),
  intl("Jodhpur", "India", "IN", "IN", "en-IN", "Rajasthan"),
  intl("Siliguri", "India", "IN", "IN", "en-IN", "West Bengal"),
  intl("Howrah", "India", "IN", "IN", "en-IN", "West Bengal"),
  ...Object.entries(INDIA_REGIONS)
    .filter(([k]) => k !== "india" && k !== "bharat" && k !== "orissa" && k !== "uttaranchal" && k !== "tamilnadu" && k !== "pondicherry")
    .map(([k, region]) => ({
      city: region,
      region,
      country: "India",
      countryCode: "IN",
      newsRegion: "IN",
      newsLang: "en-IN",
      keys: [k, `${k} india`, `${region.toLowerCase()}, india`],
    })),

  // —— Singapore ——
  countryOnly("Singapore", "SG", "SG", "en-SG", "sg"),
  intl("Singapore", "Singapore", "SG", "SG", "en-SG", undefined, "singapore city"),
  intl("Orchard", "Singapore", "SG", "SG", "en-SG", undefined, "orchard road"),
  intl("Marina Bay", "Singapore", "SG", "SG", "en-SG"),
  intl("Jurong", "Singapore", "SG", "SG", "en-SG", "jurong east"),
  intl("Sentosa", "Singapore", "SG", "SG", "en-SG"),
  intl("Changi", "Singapore", "SG", "SG", "en-SG"),
  intl("Tampines", "Singapore", "SG", "SG", "en-SG"),
  intl("Woodlands", "Singapore", "SG", "SG", "en-SG"),
  intl("Bishan", "Singapore", "SG", "SG", "en-SG"),
  intl("Bedok", "Singapore", "SG", "SG", "en-SG"),
  intl("Clementi", "Singapore", "SG", "SG", "en-SG"),
  intl("Toa Payoh", "Singapore", "SG", "SG", "en-SG", "toa payoh"),
  intl("Ang Mo Kio", "Singapore", "SG", "SG", "en-SG", undefined, "ang mo kio"),
  intl("Hougang", "Singapore", "SG", "SG", "en-SG"),
  intl("Punggol", "Singapore", "SG", "SG", "en-SG"),
  intl("Sengkang", "Singapore", "SG", "SG", "en-SG"),
  intl("Yishun", "Singapore", "SG", "SG", "en-SG"),
  intl("Raffles Place", "Singapore", "SG", "SG", "en-SG", "cbd singapore"),
  intl("Bugis", "Singapore", "SG", "SG", "en-SG"),
  intl("Clarke Quay", "Singapore", "SG", "SG", "en-SG"),

  // —— Japan ——
  countryOnly("Japan", "JP", "JP", "ja"),
  intl("Tokyo", "Japan", "JP", "JP", "ja"),
  intl("Osaka", "Japan", "JP", "JP", "ja"),
  intl("Kyoto", "Japan", "JP", "JP", "ja"),
  intl("Yokohama", "Japan", "JP", "JP", "ja"),
  intl("Nagoya", "Japan", "JP", "JP", "ja"),
  intl("Fukuoka", "Japan", "JP", "JP", "ja"),
  intl("Sapporo", "Japan", "JP", "JP", "ja"),

  // —— China ——
  countryOnly("China", "CN", "CN", "zh-CN"),
  intl("Beijing", "China", "CN", "CN", "zh-CN", "peking"),
  intl("Shanghai", "China", "CN", "CN", "zh-CN"),
  intl("Shenzhen", "China", "CN", "CN", "zh-CN"),
  intl("Guangzhou", "China", "CN", "CN", "zh-CN", "canton"),
  intl("Hong Kong", "Hong Kong", "HK", "HK", "en-HK"),

  // —— Europe & global (abbreviated set + key cities) ——
  countryOnly("United Kingdom", "GB", "GB", "en-GB", "uk", "britain", "england"),
  intl("London", "United Kingdom", "GB", "GB", "en-GB"),
  intl("Manchester", "United Kingdom", "GB", "GB", "en-GB"),
  intl("Edinburgh", "United Kingdom", "GB", "GB", "en-GB"),
  intl("Paris", "France", "FR", "FR", "fr"),
  intl("Berlin", "Germany", "DE", "DE", "de"),
  intl("Munich", "Germany", "DE", "DE", "de"),
  intl("Frankfurt", "Germany", "DE", "DE", "de"),
  intl("Amsterdam", "Netherlands", "NL", "NL", "nl"),
  intl("Zurich", "Switzerland", "CH", "CH", "de-CH"),
  intl("Stockholm", "Sweden", "SE", "SE", "sv"),
  intl("Oslo", "Norway", "NO", "NO", "no"),
  intl("Dublin", "Ireland", "IE", "IE", "en-IE"),
  intl("Madrid", "Spain", "ES", "ES", "es"),
  intl("Barcelona", "Spain", "ES", "ES", "es"),
  intl("Rome", "Italy", "IT", "IT", "it"),
  intl("Milan", "Italy", "IT", "IT", "it"),
  intl("Lisbon", "Portugal", "PT", "PT", "pt-PT"),
  intl("Vienna", "Austria", "AT", "AT", "de"),
  intl("Warsaw", "Poland", "PL", "PL", "pl"),
  intl("Istanbul", "Turkey", "TR", "TR", "tr"),
  intl("Moscow", "Russia", "RU", "RU", "ru"),

  countryOnly("Canada", "CA", "CA", "en-CA"),
  intl("Toronto", "Canada", "CA", "CA", "en-CA"),
  intl("Vancouver", "Canada", "CA", "CA", "en-CA"),
  intl("Montreal", "Canada", "CA", "CA", "en-CA"),
  countryOnly("Australia", "AU", "AU", "en-AU"),
  intl("Sydney", "Australia", "AU", "AU", "en-AU"),
  intl("Melbourne", "Australia", "AU", "AU", "en-AU"),
  countryOnly("South Korea", "KR", "KR", "ko", "korea"),
  intl("Seoul", "South Korea", "KR", "KR", "ko"),
  countryOnly("UAE", "AE", "AE", "en-AE", "united arab emirates"),
  intl("Dubai", "United Arab Emirates", "AE", "AE", "en-AE"),
  intl("Abu Dhabi", "United Arab Emirates", "AE", "AE", "en-AE"),
  countryOnly("Saudi Arabia", "SA", "SA", "ar"),
  intl("Riyadh", "Saudi Arabia", "SA", "SA", "ar"),
  countryOnly("Israel", "IL", "IL", "he"),
  intl("Tel Aviv", "Israel", "IL", "IL", "he", "tel aviv"),
  countryOnly("Kenya", "KE", "KE", "en-KE"),
  intl("Nairobi", "Kenya", "KE", "KE", "en-KE"),
  intl("Mombasa", "Kenya", "KE", "KE", "en-KE"),
  intl("Kampala", "Uganda", "UG", "UG", "en-UG"),
  intl("Lagos", "Nigeria", "NG", "NG", "en-NG"),
  intl("Johannesburg", "South Africa", "ZA", "ZA", "en-ZA"),
  intl("Cape Town", "South Africa", "ZA", "ZA", "en-ZA"),
  intl("Cairo", "Egypt", "EG", "EG", "ar-EG"),
  countryOnly("Brazil", "BR", "BR", "pt-BR"),
  intl("São Paulo", "Brazil", "BR", "BR", "pt-BR", "sao paulo"),
  intl("Rio de Janeiro", "Brazil", "BR", "BR", "pt-BR"),
  countryOnly("Mexico", "MX", "MX", "es-419"),
  intl("Mexico City", "Mexico", "MX", "MX", "es-419"),
  intl("Bangkok", "Thailand", "TH", "TH", "th"),
  intl("Jakarta", "Indonesia", "ID", "ID", "id"),
  intl("Manila", "Philippines", "PH", "PH", "en-PH"),
  intl("Kuala Lumpur", "Malaysia", "MY", "MY", "en-MY"),
  intl("Taipei", "Taiwan", "TW", "TW", "zh-TW"),
  intl("Ho Chi Minh City", "Vietnam", "VN", "VN", "vi", "saigon"),
];

/** Build lookup map from all alias keys */
export function buildLookupMap(): Map<string, GeoEntry> {
  const map = new Map<string, GeoEntry>();
  for (const entry of GEO_ENTRIES) {
    for (const key of entry.keys) {
      const norm = key.trim().toLowerCase().replace(/\s+/g, " ");
      if (norm.length >= 2 && !map.has(norm)) {
        map.set(norm, entry);
      }
    }
  }
  return map;
}

const LOOKUP = buildLookupMap();

const US_STATE_NAMES = new Set(
  GEO_ENTRIES.filter((e) => e.countryCode === "US" && e.city === e.state)
    .map((e) => e.state?.toLowerCase())
    .filter(Boolean)
);

export function formatDisplayName(entry: GeoEntry): string {
  if (entry.countryCode === "US" && entry.state && entry.city === entry.state) {
    return entry.state;
  }
  if (entry.countryCode === "US" && entry.state && entry.city !== entry.state) {
    return `${entry.city}, ${entry.state}`;
  }
  if (entry.region && entry.city !== entry.region) {
    return `${entry.city}, ${entry.region}`;
  }
  if (entry.region && entry.city === entry.region) {
    return `${entry.region}, ${entry.country}`;
  }
  if (entry.city && entry.country && entry.city !== entry.country) {
    return `${entry.city}, ${entry.country}`;
  }
  return entry.country;
}

export function resolveGeoEntry(input: string): {
  valid: boolean;
  entry?: GeoEntry;
  displayName: string;
} {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length < 2 || !/[a-z]/i.test(trimmed)) {
    return { valid: false, displayName: "" };
  }

  const key = trimmed.toLowerCase().replace(/\s+/g, " ");

  if (LOOKUP.has(key)) {
    const entry = LOOKUP.get(key)!;
    return { valid: true, entry, displayName: formatDisplayName(entry) };
  }

  const parts = key.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const full = parts.join(", ");
    if (LOOKUP.has(full)) {
      const entry = LOOKUP.get(full)!;
      return { valid: true, entry, displayName: formatDisplayName(entry) };
    }
    const city = parts[0];
    const second = parts[1];
    const cityState = `${city} ${second}`;
    if (LOOKUP.has(cityState)) {
      const entry = LOOKUP.get(cityState)!;
      return { valid: true, entry, displayName: formatDisplayName(entry) };
    }
    if (US_STATE_NAMES.has(second)) {
      const stateName = resolveUsStateToken(second) || titleCase(second);
      const synthetic = syntheticUs(city, stateName);
      return { valid: true, entry: synthetic, displayName: formatDisplayName(synthetic) };
    }
    const india = tryParseIndiaLocation(key);
    if (india) {
      return { valid: true, entry: india, displayName: formatDisplayName(india) };
    }
    for (const part of parts) {
      if (LOOKUP.has(part)) {
        const entry = LOOKUP.get(part)!;
        return { valid: true, entry, displayName: formatDisplayName(entry) };
      }
    }
  }

  const usSynthetic = tryParseUsCityState(key);
  if (usSynthetic) {
    return { valid: true, entry: usSynthetic, displayName: formatDisplayName(usSynthetic) };
  }

  const indiaSynthetic = tryParseIndiaLocation(key);
  if (indiaSynthetic) {
    return { valid: true, entry: indiaSynthetic, displayName: formatDisplayName(indiaSynthetic) };
  }

  for (const [dbKey, entry] of LOOKUP) {
    if (key.length >= 4 && (key === dbKey || key.includes(dbKey) || dbKey.includes(key))) {
      return { valid: true, entry, displayName: formatDisplayName(entry) };
    }
  }

  return { valid: false, displayName: "" };
}
