import {
  getManualQaAuthenticatedEntryRouteOverride,
  getManualQaOnboardingCompletionExitRouteOverride,
  IS_ONBOARDING_MANUAL_QA_MODE_ENABLED,
} from "@/lib/config/onboarding-manual-qa-mode";

describe("onboarding-manual-qa-mode", () => {
  it("keeps manual QA mode disabled while onboarding backend integration is pending", () => {
    expect(IS_ONBOARDING_MANUAL_QA_MODE_ENABLED).toBe(false);
  });

  it("returns null for authenticated entry override when manual QA mode is disabled", () => {
    expect(getManualQaAuthenticatedEntryRouteOverride()).toBeNull();
  });

  it("returns null for completion exit override when manual QA mode is disabled", () => {
    expect(getManualQaOnboardingCompletionExitRouteOverride()).toBeNull();
  });
});
