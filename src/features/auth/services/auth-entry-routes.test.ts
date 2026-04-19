import {
  AUTH_ROUTE,
  HOME_ROUTE,
  ONBOARDING_ROUTE,
  resolvePublicEntryRoute,
  resolveRealAuthenticatedEntryRoute,
} from "@/features/auth/services/auth-entry-routes";

const mockHasAuthenticatedSession = jest.fn();
const mockGetManualQaAuthenticatedEntryRouteOverride = jest.fn();

jest.mock("@/features/auth/services/better-auth-session-service", () => ({
  hasAuthenticatedSession: () => mockHasAuthenticatedSession(),
}));

jest.mock("@/lib/config/onboarding-manual-qa-mode", () => ({
  getManualQaAuthenticatedEntryRouteOverride: () =>
    mockGetManualQaAuthenticatedEntryRouteOverride(),
}));

describe("auth-entry-routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetManualQaAuthenticatedEntryRouteOverride.mockReturnValue(null);
  });

  it("routes authenticated users to home when manual QA override is disabled", async () => {
    const route = await resolveRealAuthenticatedEntryRoute();
    expect(route).toBe(HOME_ROUTE);
  });

  it("routes public unauthenticated users to auth", async () => {
    mockHasAuthenticatedSession.mockResolvedValue(false);

    const route = await resolvePublicEntryRoute();
    expect(route).toBe(AUTH_ROUTE);
  });

  it("routes public authenticated users through resolved authenticated route", async () => {
    mockHasAuthenticatedSession.mockResolvedValue(true);

    const route = await resolvePublicEntryRoute();
    expect(route).toBe(HOME_ROUTE);
  });

  it("routes authenticated users to onboarding when manual QA override is active", async () => {
    mockGetManualQaAuthenticatedEntryRouteOverride.mockReturnValue(ONBOARDING_ROUTE);

    const route = await resolveRealAuthenticatedEntryRoute();
    expect(route).toBe(ONBOARDING_ROUTE);
  });
});
