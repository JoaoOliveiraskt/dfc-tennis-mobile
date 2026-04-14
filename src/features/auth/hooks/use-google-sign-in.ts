import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { useRedirectAuthenticatedUser } from "@/features/auth/hooks/use-auth-route-guards";
import { resolveRealAuthenticatedEntryRoute } from "@/features/auth/services/auth-entry-routes";
import { mapGoogleSignInErrorToMessage } from "@/features/auth/services/google-sign-in-error-messages";
import { signInWithGoogleNative } from "@/features/auth/services/native-google-auth-service";

interface UseGoogleSignInResult {
  readonly status: "idle" | "loading" | "success" | "error";
  readonly errorMessage: string | null;
  readonly isLoading: boolean;
  readonly isSessionPending: boolean;
  readonly signInWithGoogle: () => Promise<void>;
}

function useGoogleSignIn(): UseGoogleSignInResult {
  const router = useRouter();
  const sessionState = useRedirectAuthenticatedUser();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    if (isSubmittingRef.current || sessionState.isPending) {
      return;
    }

    isSubmittingRef.current = true;
    setErrorMessage(null);
    setIsLoading(true);
    setStatus("loading");

    try {
      const result = await signInWithGoogleNative();

      if (result.status === "success") {
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
      setErrorMessage(message);
      setStatus("error");
    } catch {
      setErrorMessage("Não foi possível entrar agora. Tente novamente.");
      setStatus("error");
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  }, [router, sessionState.isPending]);

  return useMemo(
    () => ({
      status,
      errorMessage,
      isLoading,
      isSessionPending: sessionState.isPending,
      signInWithGoogle,
    }),
    [errorMessage, isLoading, sessionState.isPending, signInWithGoogle, status],
  );
}

export { useGoogleSignIn };
export type { UseGoogleSignInResult };
