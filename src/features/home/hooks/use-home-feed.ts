import { useCallback, useEffect, useRef, useState } from "react";
import { InteractionManager } from "react-native";
import { toApiError } from "@/lib/api/errors";
import { fetchHomeFeed } from "@/features/home/services/home-feed-service";
import type { HomeFeedData } from "@/features/home/types/home-feed";
import {
  fetchCachedQuery,
  getCachedQueryData,
  isCachedQueryStale,
} from "@/lib/server-state/query-cache";

interface HomeFeedState {
  readonly data: HomeFeedData | null;
  readonly errorMessage: string | null;
  readonly isLoading: boolean;
  readonly reload: () => void;
}

const HOME_FEED_QUERY_KEY = "home-feed:all";
const HOME_FEED_STALE_TIME_MS = 2 * 60 * 1000;

function useHomeFeed(): HomeFeedState {
  const [reloadToken, setReloadToken] = useState(0);
  const [data, setData] = useState<HomeFeedData | null>(() =>
    getCachedQueryData<HomeFeedData>(HOME_FEED_QUERY_KEY),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!data);
  const dataRef = useRef<HomeFeedData | null>(data);
  dataRef.current = data;

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      const shouldFetch = reloadToken > 0 || isCachedQueryStale(HOME_FEED_QUERY_KEY, HOME_FEED_STALE_TIME_MS);
      if (!shouldFetch) {
        setIsLoading(false);
        return;
      }

      try {
        if (!dataRef.current) {
          setIsLoading(true);
        }
        setErrorMessage(null);
        const result = await fetchCachedQuery(HOME_FEED_QUERY_KEY, async () => fetchHomeFeed("all"));

        if (isCancelled) {
          return;
        }

        setData(result);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        if (!dataRef.current) {
          setErrorMessage(toApiError(error).message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    const shouldDeferRefresh = Boolean(dataRef.current) && reloadToken === 0;
    if (shouldDeferRefresh) {
      const interactionTask = InteractionManager.runAfterInteractions(() => {
        void load();
      });

      return () => {
        isCancelled = true;
        interactionTask.cancel();
      };
    }

    void load();

    return () => {
      isCancelled = true;
    };
  }, [reloadToken]);

  return {
    data,
    errorMessage,
    isLoading,
    reload,
  };
}

export { useHomeFeed };
