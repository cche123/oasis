const previewCache = new Map<string, string>();

/** 30s Apple Music preview — works without hosting MP3s */
export async function fetchPreviewUrl(itunesTerm: string): Promise<string | null> {
  const key = itunesTerm.toLowerCase();
  const cached = previewCache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(itunesTerm)}&media=music&limit=1`,
      { cache: "force-cache" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: { previewUrl?: string }[] };
    const url = data.results?.[0]?.previewUrl ?? null;
    if (url) previewCache.set(key, url);
    return url;
  } catch {
    return null;
  }
}
