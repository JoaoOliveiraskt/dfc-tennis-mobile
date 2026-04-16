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
    mockGetManualQaAuthenticatedEntryRouteOverride.mockReturnValue(ONBOARDING_ROUTE);
  });

  it("keeps authenticated users routed to onboarding while manual QA override is active", async () => {
    const route = await resolveRealAuthenticatedEntryRoute();
    expect(route).toBe(ONBOARDING_ROUTE);
  });

  it("routes public unauthenticated users to auth", async () => {
    mockHasAuthenticatedSession.mockResolvedValue(false);

    const route = await resolvePublicEntryRoute();
    expect(route).toBe(AUTH_ROUTE);
  });

  it("routes public authenticated users through resolved authenticated route", async () => {
    mockHasAuthenticatedSession.mockResolvedValue(true);

    const route = await resolvePublicEntryRoute();
    expect(route).toBe(ONBOARDING_ROUTE);
  });

  it("falls back to home route when manual QA override is removed", async () => {
    mockGetManualQaAuthenticatedEntryRouteOverride.mockReturnValue(null);

    const route = await resolveRealAuthenticatedEntryRoute();
    expect(route).toBe(HOME_ROUTE);
  });
});

