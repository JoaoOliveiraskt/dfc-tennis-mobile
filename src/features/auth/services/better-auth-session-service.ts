import { isLikelyNetworkError } from "@/features/auth/domain/auth-error-classification";
import { authClient } from "@/lib/auth";

type BetterAuthGoogleExchangeResult =
  | "success"
  | "provider_rejected"
  | "session_not_established";

type BetterAuthSignOutResult = "success" | "network" | "unknown";

async function exchangeGoogleIdTokenForSession(
  idToken: string,
): Promise<BetterAuthGoogleExchangeResult> {
  const authResponse = await authClient.signIn.social({
    provider: "google",
    disableRedirect: true,
    idToken: {
      token: idToken,
    },
  });

  if (authResponse.error) {
    return "provider_rejected";
  }

  const sessionState = await authClient.getSession();
  if (!sessionState.data?.user?.id) {
    return "session_not_established";
  }

  return "success";
}

async function hasAuthenticatedSession(): Promise<boolean> {
  const sessionState = await authClient.getSession();
  return Boolean(sessionState.data?.user?.id);
}

async function signOutAuthenticatedSession(): Promise<BetterAuthSignOutResult> {
  try {
    const response = await authClient.signOut();
    if (response.error) {
      return "unknown";
    }

    return "success";
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      return "network";
    }

    return "unknown";
  }
}

export {
  exchangeGoogleIdTokenForSession,
  hasAuthenticatedSession,
  signOutAuthenticatedSession,
};
export type { BetterAuthGoogleExchangeResult, BetterAuthSignOutResult };
