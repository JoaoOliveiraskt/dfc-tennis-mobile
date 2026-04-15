import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRedirectAuthenticatedUser } from "@/features/auth/hooks/use-auth-route-guards";
import { getAuthenticatedUserSnapshot } from "@/features/auth/services/better-auth-session-service";
import { resolveRealAuthenticatedEntryRoute } from "@/features/auth/services/auth-entry-routes";
import { mapGoogleSignInErrorToMessage } from "@/features/auth/services/google-sign-in-error-messages";
import {
  type NativeGoogleSignInResult,
  signInWithGoogleNative,
  signInWithGoogleSwitchAccountNative,
} from "@/features/auth/services/native-google-auth-service";
import {
  getLastUsedAccount,
  saveLastUsedAccount,
} from "@/features/auth/services/last-used-account-storage";
import type { LastUsedAccount } from "@/features/auth/types/last-used-account";

interface UseGoogleSignInResult {
  readonly status: "idle" | "loading" | "success" | "error";
  readonly errorMessage: string | null;
  readonly latestErrorToast: {
    readonly id: number;
    readonly message: string;
  } | null;
  readonly isLoading: boolean;
  readonly isLastUsedAccountLoading: boolean;
  readonly lastUsedAccount: LastUsedAccount | null;
  readonly isSessionPending: boolean;
  readonly signInWithGoogle: () => Promise<void>;
  readonly signInWithAnotherGoogleAccount: () => Promise<void>;
}

function normalizeLastUsedAccountName(value: string): string {
  const normalized = value.trim();
  if (normalized.length > 0) {
    return normalized;
  }

  return "Usuário Google";
}

function mapUserToLastUsedAccount(user: {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}): LastUsedAccount {
  return {
    userId: user.id,
    name: normalizeLastUsedAccountName(user.name),
    email: user.email.trim(),
    avatarUrl: user.image ?? undefined,
    provider: "google",
  };
}

function useGoogleSignIn(): UseGoogleSignInResult {
  const router = useRouter();
  const sessionState = useRedirectAuthenticatedUser();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latestErrorToast, setLatestErrorToast] = useState<{
    readonly id: number;
    readonly message: string;
  } | null>(null);
  const [lastUsedAccount, setLastUsedAccount] = useState<LastUsedAccount | null>(
    null,
  );
  const [isLastUsedAccountLoading, setIsLastUsedAccountLoading] = useState(true);
  const isSubmittingRef = useRef(false);
  const errorToastEventIdRef = useRef(0);

  const emitError = useCallback((message: string): void => {
    errorToastEventIdRef.current += 1;
    setErrorMessage(message);
    setLatestErrorToast({
      id: errorToastEventIdRef.current,
      message,
    });
    setStatus("error");
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadLastUsedAccount = async (): Promise<void> => {
      try {
        const savedAccount = await getLastUsedAccount();
        if (isCancelled) {
          return;
        }

        setLastUsedAccount(savedAccount);
      } finally {
        if (!isCancelled) {
          setIsLastUsedAccountLoading(false);
        }
      }
    };

    void loadLastUsedAccount();

    return () => {
      isCancelled = true;
    };
  }, []);

  const runGoogleSignIn = useCallback(
    async (signInFn: () => Promise<NativeGoogleSignInResult>): Promise<void> => {
      if (sessionState.isPending) {
        return;
      }

      if (isSubmittingRef.current) {
        emitError("Aguarde um instante. Ainda estamos processando a tentativa anterior.");
        return;
      }

      isSubmittingRef.current = true;
      setErrorMessage(null);
      setIsLoading(true);
      setStatus("loading");

      try {
        const result = await signInFn();

        if (result.status === "success") {
          try {
            const authenticatedUser = await getAuthenticatedUserSnapshot();
            if (authenticatedUser) {
              const mappedAccount = mapUserToLastUsedAccount(authenticatedUser);
              setLastUsedAccount(mappedAccount);
              await saveLastUsedAccount(mappedAccount);
            }
          } catch {
            // Do not block a successful login when local UX persistence fails.
          }

          setStatus("success");
          const targetRoute = await resolveRealAuthenticatedEntryRoute();
          router.replace(targetRoute);
          return;
        }

        if (result.status === "cancelled") {
          setStatus("idle");
          return;
        }

        const message = mapGoogleSignInErrorToMessage(result.reason);
        if (message) {
          emitError(message);
          return;
        }

        setStatus("idle");
      } catch {
        const message = "Não foi possível entrar agora. Tente novamente.";
        emitError(message);
      } finally {
        isSubmittingRef.current = false;
        setIsLoading(false);
      }
    },
    [emitError, router, sessionState.isPending],
  );

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    await runGoogleSignIn(signInWithGoogleNative);
  }, [runGoogleSignIn]);

  const signInWithAnotherGoogleAccount = useCallback(async (): Promise<void> => {
    await runGoogleSignIn(signInWithGoogleSwitchAccountNative);
  }, [runGoogleSignIn]);

  return useMemo(
    () => ({
      status,
      errorMessage,
      latestErrorToast,
      isLoading,
      isLastUsedAccountLoading,
      lastUsedAccount,
      isSessionPending: sessionState.isPending,
      signInWithGoogle,
      signInWithAnotherGoogleAccount,
    }),
    [
      errorMessage,
      latestErrorToast,
      isLoading,
      isLastUsedAccountLoading,
      lastUsedAccount,
      sessionState.isPending,
      signInWithAnotherGoogleAccount,
      signInWithGoogle,
      status,
    ],
  );
}

export { useGoogleSignIn };
export type { UseGoogleSignInResult };
