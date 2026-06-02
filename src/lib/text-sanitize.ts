/** Strip HTML tags and decode common entities for RSS descriptions. */
export function sanitizeFeedText(raw: string, maxLen = 220): string {
  if (!raw) return "";
  let t = raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    // Decode then strip encoded tags like: <font color="#6f6f6f">...</font>
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Drop dangling partial tags / google news wrapper junk
  if (/^<a\s/i.test(t) || t.includes('href="https://news.google')) {
    t = t.replace(/<a[^>]*>/gi, "").replace(/<\/a>/gi, "");
    t = t.replace(/https?:\/\/\S+/g, "").trim();
  }

  if (t.length > maxLen) return t.slice(0, maxLen - 1).trim() + "…";
  return t;
}
