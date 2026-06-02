/** Score whether a headline is macro-market relevant (Wave channel only). */

const STRONG_MACRO: Array<[RegExp, number, string]> = [
  [/\b(federal reserve|fomc|powell|rate hike|rate cut|interest rates)\b/i, 12, "Monetary policy"],
  [/\b(inflation|cpi|pce|jobs report|nonfarm|payrolls|gdp|recession)\b/i, 11, "Macro data"],
  [/\b(sanctions|invasion|war|military strike|missile|ceasefire|nato)\b/i, 11, "Geopolitical"],
  [/\b(opec|crude oil|brent|wti|natural gas|pipeline|refinery|energy crisis)\b/i, 10, "Energy"],
  [/\b(earthquake|tsunami|hurricane|wildfire|flood|tornado|cyclone)\b/i, 10, "Natural disaster"],
  [/\b(tariff|trade war|debt ceiling|treasury yield)\b/i, 9, "Fiscal / trade"],
  [/\b(cyberattack|ransomware|grid outage|pipeline hack)\b/i, 9, "Cyber / infra"],
  [/\b(bank failure|credit crunch|liquidity crisis|sovereign default)\b/i, 9, "Financial stress"],
];

const NOISE: RegExp[] = [
  /\b(celebrity|kardashian|reality tv|grammy|oscar|nba|nfl|mlb|premier league)\b/i,
  /\b(recipe|fashion week|beauty tips|wedding|dating)\b/i,
  /\b(disrupt 2026|early bird ticket|conference ticket|techcrunch disrupt)\b/i,
  /\b(bonus after deal|workers set for|union ends wrangling)\b/i,
  /\b(firstft|newsletter|podcast|what to watch this week)\b/i,
  /\b(samsung workers|employee bonus)\b/i,
];

/** Minimum score to appear in Wave (see UI legend). */
export const WAVE_MIN_SCORE = 14;
export const WAVE_MAX_AGE_HOURS = 48;

export type WaveHeadlineScore = {
  score: number;
  passes: boolean;
  tags: string[];
  reason: string;
};

export function scoreWaveHeadline(
  headline: string,
  opts?: {
    publishedAt?: string;
    maxAgeHours?: number;
    requirePublishedAt?: boolean;
    minScore?: number;
  }
): WaveHeadlineScore {
  const text = headline.trim();
  const lower = text.toLowerCase();
  const tags: string[] = [];
  let score = 0;

  if (NOISE.some((re) => re.test(lower))) {
    return { score: 0, passes: false, tags: [], reason: "Filtered: not macro-market relevant" };
  }

  for (const [re, pts, label] of STRONG_MACRO) {
    if (re.test(lower)) {
      score += pts;
      tags.push(label);
    }
  }

  if (tags.length === 0) {
    return {
      score,
      passes: false,
      tags,
      reason: "No direct macro transmission channel detected",
    };
  }

  if (opts?.requirePublishedAt && !opts.publishedAt) {
    return {
      score,
      passes: false,
      tags,
      reason: "Missing publish time; cannot validate recency",
    };
  }

  const maxAge = opts?.maxAgeHours ?? WAVE_MAX_AGE_HOURS;
  if (opts?.publishedAt) {
    const ageH = (Date.now() - new Date(opts.publishedAt).getTime()) / 3600000;
    if (ageH > maxAge) {
      return {
        score,
        passes: false,
        tags,
        reason: `Older than ${maxAge}h`,
      };
    }
    if (ageH < 12) score += 2;
  }

  const minScore = opts?.minScore ?? WAVE_MIN_SCORE;
  const passes = score >= minScore && tags.length > 0;
  return {
    score,
    passes,
    tags,
    reason: passes
      ? `Macro channel: ${tags.join(", ")}`
      : `Score below Wave threshold (${minScore})`,
  };
}
