import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { HOME_ROUTE, useRedirectAuthenticatedUser } from "@/features/auth/hooks/use-auth-route-guards";
import { mapGoogleSignInErrorToMessage } from "@/features/auth/services/google-sign-in-error-messages";
import { signInWithGoogleNative } from "@/features/auth/services/native-google-auth-service";

interface UseGoogleSignInResult {
  readonly errorMessage: string | null;
  readonly isLoading: boolean;
  readonly isSessionPending: boolean;
  readonly signInWithGoogle: () => Promise<void>;
}

function useGoogleSignIn(): UseGoogleSignInResult {
  const router = useRouter();
  const sessionState = useRedirectAuthenticatedUser();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    if (isSubmittingRef.current || sessionState.isPending) {
      return;
    }

    isSubmittingRef.current = true;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await signInWithGoogleNative();

      if (result.status === "success") {
        router.replace(HOME_ROUTE);
        return;
      }

      if (result.status === "cancelled") {
        return;
      }

      const message = mapGoogleSignInErrorToMessage(result.reason);
      setErrorMessage(message);
    } catch {
      setErrorMessage("Não foi possível entrar agora. Tente novamente.");
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  }, [router, sessionState.isPending]);

  return useMemo(
    () => ({
      errorMessage,
      isLoading,
      isSessionPending: sessionState.isPending,
      signInWithGoogle,
    }),
    [errorMessage, isLoading, sessionState.isPending, signInWithGoogle],
  );
}

export { useGoogleSignIn };
export type { UseGoogleSignInResult };
