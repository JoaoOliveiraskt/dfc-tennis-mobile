import { useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager } from "react-native";
import { toApiError } from "@/lib/api/errors";
import { getClassDetail } from "@/features/class-detail/services/class-detail-service";
import type { ClassDetailData } from "@/features/class-detail/types/class-detail";
import type { HomeFeedItemKind } from "@/features/home/types/home-feed";
import {
  fetchCachedQuery,
  getCachedQueryData,
  isCachedQueryStale,
} from "@/lib/server-state/query-cache";

interface ClassDetailState {
  readonly data: ClassDetailData | null;
  readonly errorMessage: string | null;
  readonly isLoading: boolean;
}

function useClassDetail(
  classId: string,
  kind?: HomeFeedItemKind,
): ClassDetailState {
  const queryKey = useMemo(() => `class-detail:${classId}:${kind ?? "all"}`, [classId, kind]);
  const [data, setData] = useState<ClassDetailData | null>(() =>
    getCachedQueryData<ClassDetailData>(queryKey),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!data);
  const dataRef = useRef<ClassDetailData | null>(data);
  dataRef.current = data;

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      const shouldFetch = isCachedQueryStale(queryKey, 60 * 1000);
      if (!shouldFetch) {
        setIsLoading(false);
        return;
      }

      try {
        if (!dataRef.current) {
          setIsLoading(true);
        }
        setErrorMessage(null);
        const result = await fetchCachedQuery(queryKey, async () => getClassDetail(classId, kind));

        if (!isCancelled) {
          setData(result);
        }
      } catch (error) {
        if (!isCancelled && !dataRef.current) {
          setErrorMessage(toApiError(error).message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    if (dataRef.current) {
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
  }, [classId, kind, queryKey]);

  return {
    data,
    errorMessage,
    isLoading,
  };
}

export { useClassDetail };
