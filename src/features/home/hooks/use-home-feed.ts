import { useCallback, useEffect, useState } from "react";
import { toApiError } from "@/lib/api/errors";
import { fetchHomeFeed } from "@/features/home/services/home-feed-service";
import type { HomeFeedData } from "@/features/home/types/home-feed";

interface HomeFeedState {
  readonly data: HomeFeedData | null;
  readonly errorMessage: string | null;
  readonly isLoading: boolean;
  readonly reload: () => void;
}

function useHomeFeed(): HomeFeedState {
  const [reloadToken, setReloadToken] = useState(0);
  const [data, setData] = useState<HomeFeedData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const result = await fetchHomeFeed("all");

        if (isCancelled) {
          return;
        }

        setData(result);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setErrorMessage(toApiError(error).message);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

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
