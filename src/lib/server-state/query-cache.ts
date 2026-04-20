interface QueryCacheEntry<TData> {
  readonly data: TData;
  readonly updatedAt: number;
}

const queryCache = new Map<string, QueryCacheEntry<unknown>>();
const inFlightQueries = new Map<string, Promise<unknown>>();

function getCachedQueryData<TData>(key: string): TData | null {
  const entry = queryCache.get(key);
  if (!entry) {
    return null;
  }

  return entry.data as TData;
}

function setCachedQueryData<TData>(key: string, data: TData): void {
  queryCache.set(key, {
    data,
    updatedAt: Date.now(),
  });
}

function getCachedQueryUpdatedAt(key: string): number | null {
  const entry = queryCache.get(key);
  return entry?.updatedAt ?? null;
}

function isCachedQueryStale(key: string, staleTimeMs: number): boolean {
  if (staleTimeMs <= 0) {
    return true;
  }

  const updatedAt = getCachedQueryUpdatedAt(key);
  if (!updatedAt) {
    return true;
  }

  return Date.now() - updatedAt >= staleTimeMs;
}

async function fetchCachedQuery<TData>(
  key: string,
  fetcher: () => Promise<TData>,
): Promise<TData> {
  const currentInFlight = inFlightQueries.get(key);
  if (currentInFlight) {
    return currentInFlight as Promise<TData>;
  }

  const request = (async () => {
    const result = await fetcher();
    setCachedQueryData(key, result);
    return result;
  })();

  inFlightQueries.set(key, request);

  try {
    return await request;
  } finally {
    inFlightQueries.delete(key);
  }
}

export {
  fetchCachedQuery,
  getCachedQueryData,
  getCachedQueryUpdatedAt,
  isCachedQueryStale,
  setCachedQueryData,
};
