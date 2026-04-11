import { useMemo } from "react";
import { useDevAuthSession } from "@/lib/auth/dev-auth-store";
import { authClient } from "@/lib/auth";

interface EffectiveAuthUser {
  readonly email: string;
  readonly id: string;
  readonly image?: string | null;
  readonly name: string;
}

interface EffectiveAuthSession {
  readonly data: {
    readonly user: EffectiveAuthUser;
  } | null;
  readonly isPending: boolean;
  readonly mode: "real" | "dev" | "none";
}

function useAuthSession(): EffectiveAuthSession {
  const sessionState = authClient.useSession();
  const devSession = useDevAuthSession();

  return useMemo(() => {
    if (sessionState.data?.user) {
      return {
        data: {
          user: {
            email: sessionState.data.user.email,
            id: sessionState.data.user.id,
            image: sessionState.data.user.image,
            name: sessionState.data.user.name,
          },
        },
        isPending: sessionState.isPending,
        mode: "real" as const,
      };
    }

    if (devSession.canUseBypass && devSession.isAuthenticated) {
      return {
        data: {
          user: {
            email: "dev@dfctennis.local",
            id: "dev-auth-session",
            image: null,
            name: "Dev Session",
          },
        },
        isPending: devSession.isHydrating,
        mode: "dev" as const,
      };
    }

    return {
      data: null,
      isPending: sessionState.isPending || devSession.isHydrating,
      mode: "none" as const,
    };
  }, [devSession.canUseBypass, devSession.isAuthenticated, devSession.isHydrating, sessionState.data?.user, sessionState.isPending]);
}

export { useAuthSession };
export type { EffectiveAuthSession, EffectiveAuthUser };
