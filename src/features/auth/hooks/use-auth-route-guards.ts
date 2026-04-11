import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";

const AUTH_ROUTE = "/(auth)/sign";
const HOME_ROUTE = "/(app)/home";

function useRedirectAuthenticatedUser() {
  const router = useRouter();
  const hasNavigatedRef = useRef(false);
  const sessionState = useAuthSession();

  useEffect(() => {
    if (!sessionState.data?.user || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    router.replace(HOME_ROUTE);
  }, [router, sessionState.data?.user]);

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
