import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { HOME_ROUTE } from "@/features/auth/hooks/use-auth-route-guards";
import {
  enableDevAuthSession,
  useDevAuthSession,
} from "@/lib/auth/dev-auth-store";

interface UseDevAuthBypassResult {
  readonly canUseBypass: boolean;
  readonly errorMessage: string | null;
  readonly isLoading: boolean;
  readonly signInForDevelopment: () => Promise<void>;
}

function useDevAuthBypass(): UseDevAuthBypassResult {
  const router = useRouter();
  const devSession = useDevAuthSession();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  );

  const signInForDevelopment = useCallback(async () => {
    if (!devSession.canUseBypass || isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await enableDevAuthSession();
      router.replace(HOME_ROUTE);
    } catch (error) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn("[DevAuthBypass] Failed to enable development session.", error);
      }

      if (isMountedRef.current) {
        setErrorMessage("Não foi possível ativar o acesso de desenvolvimento.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [devSession.canUseBypass, isLoading, router]);

  return useMemo(
    () => ({
      canUseBypass: devSession.canUseBypass,
      errorMessage,
      isLoading,
      signInForDevelopment,
    }),
    [devSession.canUseBypass, errorMessage, isLoading, signInForDevelopment],
  );
}

export { useDevAuthBypass };
export type { UseDevAuthBypassResult };
