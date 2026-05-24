/** Parse and compact X / Twitter posts for Live Signals */

const X_HOSTS = /(?:twitter\.com|x\.com)/i;

export function isXPostUrl(url: string): boolean {
  return X_HOSTS.test(url);
}

/** Extract handle from x.com/user/status/... or twitter.com/user/... */
export function extractXHandleFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!X_HOSTS.test(u.hostname)) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const reserved = new Set(["i", "intent", "search", "hashtag", "home", "share"]);
    if (parts.length >= 1 && !reserved.has(parts[0].toLowerCase())) {
      return parts[0].replace(/^@/, "");
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Best-effort handle from RSS / Google News title text */
export function extractXHandleFromText(text: string): string | null {
  const patterns = [
    /\(@([A-Za-z0-9_]{1,15})\)/,
    /@([A-Za-z0-9_]{1,15})\s+on\s+X\b/i,
    /\bfrom\s+@?([A-Za-z0-9_]{1,15})\b/i,
    /^@([A-Za-z0-9_]{1,15})\s*[:\u2014-]/,
    /\s-\s@?([A-Za-z0-9_]{1,15})\s+on\s+X\s*$/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

export function resolveXHandle(url: string, title: string, fallback?: string): string | null {
  return (
    extractXHandleFromUrl(url) ||
    extractXHandleFromText(title) ||
    (fallback ? fallback.replace(/^@/, "") : null)
  );
}

/** Short headline — first sentence or line, no trailing platform junk */
export function compactXPostText(text: string, maxLen = 96): string {
  let t = text
    .replace(/\s*[-–—]\s*(twitter|x)\.com\s*$/i, "")
    .replace(/\s*[-–—]\s*@?[A-Za-z0-9_]{1,15}\s+on\s+X\s*$/i, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const firstLine = t.split(/[\n\r|]/)[0]?.trim() || t;
  const sentence =
    firstLine.match(/^.{1,200}?[.!?](?:\s|$)/)?.[0]?.trim() ||
    firstLine;

  if (sentence.length <= maxLen) return sentence;
  const cut = sentence.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

export function formatXSource(handle: string): string {
  const h = handle.replace(/^@/, "");
  return `x @${h}`;
}
