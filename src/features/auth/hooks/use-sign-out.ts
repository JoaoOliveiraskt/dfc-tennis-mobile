import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { AUTH_ROUTE } from "@/features/auth/hooks/use-auth-route-guards";
import { signOutUser } from "@/features/auth/services/native-google-auth-service";
import { clearDevAuthSession } from "@/lib/auth/dev-auth-store";

interface UseSignOutResult {
  readonly errorMessage: string | null;
  readonly isLoading: boolean;
  readonly isSessionPending: boolean;
  readonly signOut: () => Promise<void>;
}

function useSignOut(): UseSignOutResult {
  const router = useRouter();
  const sessionState = useAuthSession();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fallbackMessage = "Não foi possível sair da sua conta agora.";

  const signOut = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (sessionState.mode === "dev") {
        try {
          await clearDevAuthSession();
          router.replace(AUTH_ROUTE);
          return;
        } catch {
          setErrorMessage(fallbackMessage);
          return;
        }
      }

      const result = await signOutUser();

      if (result.status === "error") {
        setErrorMessage(result.message);
        return;
      }

      router.replace(AUTH_ROUTE);
    } finally {
      setIsLoading(false);
    }
  }, [fallbackMessage, isLoading, router, sessionState.mode]);

  return useMemo(
    () => ({
      errorMessage,
      isLoading,
      isSessionPending: sessionState.isPending,
      signOut,
    }),
    [errorMessage, isLoading, sessionState.isPending, signOut],
  );
}

export { useSignOut };
export type { UseSignOutResult };
