/**
 * Simple in-memory query cache for Supabase results.
 * Avoids repeated network calls for the same data within a session.
 * Cache is keyed by a string, entries expire after `TTL_MS` milliseconds.
 */

const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: any;
  expiry: number;
}

const cache: Record<string, CacheEntry> = {};

export function getCached(key: string): any | null {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    delete cache[key];
    return null;
  }
  return entry.data;
}

export function setCached(key: string, data: any): void {
  cache[key] = { data, expiry: Date.now() + TTL_MS };
}

export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    Object.keys(cache).forEach((k) => delete cache[k]);
    return;
  }
  Object.keys(cache).forEach((k) => {
    if (k.startsWith(prefix)) delete cache[k];
  });
}
