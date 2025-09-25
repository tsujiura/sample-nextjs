import { LRUCache } from "lru-cache";

import { ENV } from "@/config/env";

type CacheKey = string;
type CacheValue = object | string | number | boolean | symbol | bigint;

const serverCache = new LRUCache<CacheKey, CacheValue>({
  max: ENV.serverCacheMaxEntries,
  ttl: ENV.serverCacheTtlMs,
  ttlAutopurge: true,
});

export function getServerCacheValue<T extends CacheValue>(key: CacheKey): T | undefined {
  return serverCache.get(key) as T | undefined;
}

export function setServerCacheValue<T extends CacheValue>(key: CacheKey, value: T): void {
  serverCache.set(key, value);
}

export default serverCache;
