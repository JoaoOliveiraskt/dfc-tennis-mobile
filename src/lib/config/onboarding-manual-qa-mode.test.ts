import {
  getManualQaAuthenticatedEntryRouteOverride,
  getManualQaOnboardingCompletionExitRouteOverride,
  IS_ONBOARDING_MANUAL_QA_MODE_ENABLED,
  MANUAL_QA_AUTHENTICATED_ENTRY_ROUTE,
  MANUAL_QA_COMPLETION_EXIT_ROUTE,
} from "@/lib/config/onboarding-manual-qa-mode";

describe("onboarding-manual-qa-mode", () => {
  it("keeps manual QA mode enabled in current refactor window", () => {
    expect(IS_ONBOARDING_MANUAL_QA_MODE_ENABLED).toBe(true);
  });

  it("returns isolated authenticated entry override route", () => {
    expect(getManualQaAuthenticatedEntryRouteOverride()).toBe(
      MANUAL_QA_AUTHENTICATED_ENTRY_ROUTE,
    );
  });

  it("returns isolated completion exit override route", () => {
    expect(getManualQaOnboardingCompletionExitRouteOverride()).toBe(
      MANUAL_QA_COMPLETION_EXIT_ROUTE,
    );
  });
});

