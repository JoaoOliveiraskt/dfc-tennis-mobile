import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { AUTH_ROUTE } from "@/features/auth/hooks/use-auth-route-guards";
import { signOutUser } from "@/features/auth/services/native-google-auth-service";

interface UseSignOutResult {
  readonly status: "idle" | "loading" | "success" | "error";
  readonly errorMessage: string | null;
  readonly isLoading: boolean;
  readonly isSessionPending: boolean;
  readonly signOut: () => Promise<void>;
}

function useSignOut(): UseSignOutResult {
  const router = useRouter();
  const sessionState = useAuthSession();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fallbackMessage = "Não foi possível sair da sua conta agora.";

  const signOut = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatus("loading");

    try {
      const result = await signOutUser();

      if (result.status === "error") {
        setErrorMessage(result.message);
        setStatus("error");
        return;
      }

      setStatus("success");
      router.replace(AUTH_ROUTE);
    } finally {
      setIsLoading(false);
    }
  }, [fallbackMessage, isLoading, router]);

  return useMemo(
    () => ({
      status,
      errorMessage,
      isLoading,
      isSessionPending: sessionState.isPending,
      signOut,
    }),
    [errorMessage, isLoading, sessionState.isPending, signOut, status],
  );
}

export { useSignOut };
export type { UseSignOutResult };
