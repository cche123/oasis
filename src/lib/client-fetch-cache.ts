type CacheEntry<T> = {
  data?: T;
  ts: number;
  promise?: Promise<T>;
};

const store = new Map<string, CacheEntry<unknown>>();

export function readCachedJson<T>(key: string, ttlMs = 90_000): T | null {
  const hit = store.get(key) as CacheEntry<T> | undefined;
  if (!hit?.data) return null;
  if (Date.now() - hit.ts > ttlMs) return null;
  return hit.data;
}

export async function cachedFetchJson<T>(
  key: string,
  url: string,
  init?: RequestInit,
  ttlMs = 90_000
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as CacheEntry<T> | undefined;

  if (hit?.data && now - hit.ts <= ttlMs) {
    return hit.data;
  }

  if (hit?.promise) {
    return hit.promise;
  }

  const promise = fetch(url, init)
    .then(async (res) => {
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      return (await res.json()) as T;
    })
    .then((data) => {
      store.set(key, { data, ts: Date.now() });
      return data;
    })
    .catch((err) => {
      const current = store.get(key) as CacheEntry<T> | undefined;
      if (current?.promise === promise) {
        store.delete(key);
      }
      throw err;
    });

  store.set(key, {
    data: hit?.data,
    ts: hit?.ts ?? 0,
    promise,
  });

  return promise;
}

export function invalidateCached(keyPrefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) store.delete(key);
  }
}
