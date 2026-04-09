import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { hideNativeSplashOnce } from "@/lib/splash-lifecycle";

const FINAL_WORDMARK_HOLD_MS = 850;

interface UseSplashSequenceResult {
  readonly shouldPlayAnimation: boolean;
  readonly onLayoutReady: () => void;
  readonly onWordRevealComplete: () => void;
}

function useSplashSequence(): UseSplashSequenceResult {
  const router = useRouter();
  const [isLayoutReady, setIsLayoutReady] = useState<boolean>(false);
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

  const safeNavigateOnce = useCallback(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    router.replace("/(auth)/sign");
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
      safeNavigateOnce();
    }, FINAL_WORDMARK_HOLD_MS);
  }, [safeNavigateOnce]);

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
