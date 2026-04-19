import { useEffect, useState } from "react";
import { toApiError } from "@/lib/api/errors";
import { getClassDetail } from "@/features/class-detail/services/class-detail-service";
import type { ClassDetailData } from "@/features/class-detail/types/class-detail";
import type { HomeFeedItemKind } from "@/features/home/types/home-feed";

interface ClassDetailState {
  readonly data: ClassDetailData | null;
  readonly errorMessage: string | null;
  readonly isLoading: boolean;
}

function useClassDetail(
  classId: string,
  kind?: HomeFeedItemKind,
): ClassDetailState {
  const [data, setData] = useState<ClassDetailData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const result = await getClassDetail(classId, kind);

        if (!isCancelled) {
          setData(result);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(toApiError(error).message);
        }
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
  }, [classId, kind]);

  return {
    data,
    errorMessage,
    isLoading,
  };
}

export { useClassDetail };
