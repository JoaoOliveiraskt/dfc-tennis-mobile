import { hasAuthenticatedSession } from "@/features/auth/services/better-auth-session-service";

const AUTH_ROUTE = "/(auth)/sign";
const ONBOARDING_ROUTE = "/(public)/onboarding";
const HOME_ROUTE = "/(app)/home";

type PublicEntryRoute = typeof AUTH_ROUTE | typeof ONBOARDING_ROUTE | typeof HOME_ROUTE;
type AuthenticatedEntryRoute = typeof ONBOARDING_ROUTE | typeof HOME_ROUTE;

async function resolveRealAuthenticatedEntryRoute(): Promise<AuthenticatedEntryRoute> {
  // Temporarily force onboarding after every authenticated login
  // to streamline repeated QA cycles for onboarding work.
  return ONBOARDING_ROUTE;
}

async function resolveAuthenticatedEntryRoute(): Promise<AuthenticatedEntryRoute> {
  return resolveRealAuthenticatedEntryRoute();
}

async function resolvePublicEntryRoute(): Promise<PublicEntryRoute> {
  const hasSession = await hasAuthenticatedSession();
  if (hasSession) {
    return resolveRealAuthenticatedEntryRoute();
  }

  return AUTH_ROUTE;
}

export {
  AUTH_ROUTE,
  HOME_ROUTE,
  ONBOARDING_ROUTE,
  resolveAuthenticatedEntryRoute,
  resolvePublicEntryRoute,
  resolveRealAuthenticatedEntryRoute,
};
export type { AuthenticatedEntryRoute, PublicEntryRoute };
