import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { authClient } from "@/lib/auth";
import { hideNativeSplashOnce } from "@/lib/splash-lifecycle";

const AUTH_ROUTE = "/(auth)/sign";
const HOME_ROUTE = "/(app)/home";
const FINAL_WORDMARK_HOLD_MS = 850;
const SESSION_BOOTSTRAP_TIMEOUT_MS = 3500;
type SplashTargetRoute = typeof AUTH_ROUTE | typeof HOME_ROUTE;

interface UseSplashSequenceResult {
  readonly shouldPlayAnimation: boolean;
  readonly onLayoutReady: () => void;
  readonly onWordRevealComplete: () => void;
}

function useSplashSequence(): UseSplashSequenceResult {
  const router = useRouter();
  const [isLayoutReady, setIsLayoutReady] = useState<boolean>(false);
  const [isPostAnimationReady, setIsPostAnimationReady] = useState<boolean>(false);
  const [shouldPlayAnimation, setShouldPlayAnimation] =
    useState<boolean>(false);

  const hasStartedRef = useRef<boolean>(false);
  const hasHiddenSplashRef = useRef<boolean>(false);
  const hasNavigatedRef = useRef<boolean>(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const safeHideOnce = useCallback(() => {
    if (hasHiddenSplashRef.current) {
      return;
    }

    hasHiddenSplashRef.current = true;
    hideNativeSplashOnce();
  }, []);

  const safeNavigateOnce = useCallback((targetRoute: SplashTargetRoute) => {
    if (hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    router.replace(targetRoute);
  }, [router]);

  const onLayoutReady = useCallback(() => {
    setIsLayoutReady((currentReadyState) =>
      currentReadyState ? currentReadyState : true,
    );
  }, []);

  const onWordRevealComplete = useCallback(() => {
    if (holdTimerRef.current !== null) {
      return;
    }

    holdTimerRef.current = setTimeout(() => {
      setIsPostAnimationReady(true);
    }, FINAL_WORDMARK_HOLD_MS);
  }, []);

  useEffect(() => {
    if (!isLayoutReady || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    setShouldPlayAnimation(true);
  }, [isLayoutReady]);

  useEffect(() => {
    if (!shouldPlayAnimation) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      safeHideOnce();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [safeHideOnce, shouldPlayAnimation]);

  useEffect(() => {
    if (!isPostAnimationReady || hasNavigatedRef.current) {
      return;
    }

    let isCancelled = false;
    const timeoutId = setTimeout(() => {
      if (isCancelled) {
        return;
      }

      safeNavigateOnce(AUTH_ROUTE);
    }, SESSION_BOOTSTRAP_TIMEOUT_MS);

    const resolveSessionRoute = async () => {
      try {
        const sessionState = await authClient.getSession();

        if (isCancelled) {
          return;
        }

        clearTimeout(timeoutId);
        safeNavigateOnce(sessionState.data?.user?.id ? HOME_ROUTE : AUTH_ROUTE);
      } catch {
        if (isCancelled) {
          return;
        }

        clearTimeout(timeoutId);
        safeNavigateOnce(AUTH_ROUTE);
      }
    };

    void resolveSessionRoute();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isPostAnimationReady, safeNavigateOnce]);

  useEffect(
    () => () => {
      if (holdTimerRef.current !== null) {
        clearTimeout(holdTimerRef.current);
      }
    },
    [],
  );

  return {
    shouldPlayAnimation,
    onLayoutReady,
    onWordRevealComplete,
  };
}

export { useSplashSequence };
export type { UseSplashSequenceResult };
