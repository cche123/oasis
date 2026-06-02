"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cachedFetchJson, readCachedJson } from "@/lib/client-fetch-cache";

export function useCachedFetch<T>(
  cacheKey: string,
  url: string | null,
  deps: unknown[],
  options?: { ttlMs?: number; enabled?: boolean }
) {
  const ttlMs = options?.ttlMs ?? 90_000;
  const enabled = options?.enabled ?? true;
  const [data, setData] = useState<T | null>(() => readCachedJson<T>(cacheKey, ttlMs));
  const [loading, setLoading] = useState(() => !readCachedJson<T>(cacheKey, ttlMs));
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!url || !enabled) return;
    const hasCache = readCachedJson<T>(cacheKey, ttlMs) !== null;
    if (!hasCache) setLoading(true);
    try {
      const next = await cachedFetchJson<T>(cacheKey, url, undefined, ttlMs);
      if (!mounted.current) return;
      setData(next);
      setError(null);
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof Error ? err : new Error("fetch failed"));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [cacheKey, url, enabled, ttlMs]);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls invalidation via cacheKey/deps
  }, [cacheKey, url, enabled, ...deps]);

  return { data, loading, error, refresh, setData };
}
