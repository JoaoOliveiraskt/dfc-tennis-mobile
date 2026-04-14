import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import {
  AUTH_ROUTE,
  HOME_ROUTE,
  resolveAuthenticatedEntryRoute,
} from "@/features/auth/services/auth-entry-routes";

function useRedirectAuthenticatedUser() {
  const router = useRouter();
  const hasNavigatedRef = useRef(false);
  const sessionState = useAuthSession();

  useEffect(() => {
    if (
      !sessionState.data?.user ||
      hasNavigatedRef.current ||
      sessionState.isPending ||
      sessionState.mode !== "authenticated"
    ) {
      return;
    }

    let isCancelled = false;

    const navigateAuthenticatedUser = async () => {
      const targetRoute = await resolveAuthenticatedEntryRoute();
      if (isCancelled || hasNavigatedRef.current) {
        return;
      }

      hasNavigatedRef.current = true;
      router.replace(targetRoute);
    };

    void navigateAuthenticatedUser();

    return () => {
      isCancelled = true;
    };
  }, [router, sessionState.data?.user, sessionState.isPending, sessionState.mode]);

  useEffect(() => {
    if (!sessionState.data?.user) {
      hasNavigatedRef.current = false;
    }
  }, [sessionState.data?.user]);

  return sessionState;
}

function useRequireAuthenticatedUser() {
  const router = useRouter();
  const hasNavigatedRef = useRef(false);
  const sessionState = useAuthSession();

  useEffect(() => {
    if (sessionState.isPending || sessionState.data?.user || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    router.replace(AUTH_ROUTE);
  }, [router, sessionState.data?.user, sessionState.isPending]);

  useEffect(() => {
    if (sessionState.data?.user) {
      hasNavigatedRef.current = false;
    }
  }, [sessionState.data?.user]);

  return sessionState;
}

export { AUTH_ROUTE, HOME_ROUTE, useRedirectAuthenticatedUser, useRequireAuthenticatedUser };
