import { useMemo } from "react";
import { authClient } from "@/lib/auth";

interface EffectiveAuthUser {
  readonly email: string;
  readonly id: string;
  readonly image?: string | null;
  readonly name: string;
  readonly role?: "COACH" | "STUDENT";
}

interface EffectiveAuthSession {
  readonly data: {
    readonly user: EffectiveAuthUser;
  } | null;
  readonly isPending: boolean;
  readonly mode: "authenticated" | "none";
}

function useAuthSession(): EffectiveAuthSession {
  const sessionState = authClient.useSession();

  return useMemo(() => {
    if (sessionState.data?.user) {
      const rawRole = (sessionState.data.user as { readonly role?: string }).role;
      const role =
        rawRole === "COACH" || rawRole === "STUDENT" ? rawRole : undefined;

      return {
        data: {
          user: {
            email: sessionState.data.user.email,
            id: sessionState.data.user.id,
            image: sessionState.data.user.image,
            name: sessionState.data.user.name,
            role,
          },
        },
        isPending: sessionState.isPending,
        mode: "authenticated" as const,
      };
    }

    return {
      data: null,
      isPending: sessionState.isPending,
      mode: "none" as const,
    };
  }, [sessionState.data?.user, sessionState.isPending]);
}

export { useAuthSession };
export type { EffectiveAuthSession, EffectiveAuthUser };
