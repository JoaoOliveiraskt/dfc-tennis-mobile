import {
  completeOnboardingSubmission,
  DEFAULT_ONBOARDING_SUBMISSION_DEPENDENCIES,
} from "@/features/onboarding/services/onboarding-submit-boundary";
import type { OnboardingFormState } from "@/features/onboarding/types/onboarding-types";

const mockToStudentOnboardingPreferences = jest.fn();
const mockMarkStudentOnboardingComplete = jest.fn();
const mockGetManualQaCompletionRouteOverride = jest.fn();

jest.mock("@/features/auth/services/auth-entry-routes", () => ({
  HOME_ROUTE: "/(app)/(shell)/home",
}));

jest.mock("@/features/onboarding/services/onboarding-serialization", () => ({
  toStudentOnboardingPreferences: (state: unknown) =>
    mockToStudentOnboardingPreferences(state),
}));

jest.mock("@/features/onboarding/services/onboarding-storage-service", () => ({
  markStudentOnboardingComplete: (preferences: unknown) =>
    mockMarkStudentOnboardingComplete(preferences),
}));

jest.mock("@/lib/config/onboarding-manual-qa-mode", () => ({
  getManualQaOnboardingCompletionExitRouteOverride: () =>
    mockGetManualQaCompletionRouteOverride(),
}));

const FORM_STATE: Pick<
  OnboardingFormState,
  "firstName" | "lastName" | "level" | "goal" | "availability" | "lessonType"
> = {
  firstName: "João",
  lastName: "Oliveira",
  level: "intermediario",
  goal: "melhorar-tecnica",
  availability: ["noite"],
  lessonType: ["particular"],
};

describe("onboarding-submit-boundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToStudentOnboardingPreferences.mockReturnValue({
      ...FORM_STATE,
    });
  });

  it("persists preferences and returns manual-qa completion route override", async () => {
mockGetManualQaCompletionRouteOverride.mockReturnValue("/(app)/(shell)/home");

    const result = await completeOnboardingSubmission(FORM_STATE);

    expect(mockToStudentOnboardingPreferences).toHaveBeenCalledWith(FORM_STATE);
    expect(mockMarkStudentOnboardingComplete).toHaveBeenCalledWith(
      mockToStudentOnboardingPreferences.mock.results[0]?.value,
    );
    expect(result.nextRoute).toBe("/(app)/(shell)/home");
  });

  it("falls back to HOME route when manual-qa override is unavailable", async () => {
    mockGetManualQaCompletionRouteOverride.mockReturnValue(null);

    const result = await completeOnboardingSubmission(FORM_STATE);

    expect(result.nextRoute).toBe("/(app)/(shell)/home");
  });

  it("supports dependency injection for future backend orchestration", async () => {
    const persistCompletion = jest.fn().mockResolvedValue(undefined);
    const resolveNextRoute = jest.fn().mockReturnValue("/(auth)/sign");

    const result = await completeOnboardingSubmission(FORM_STATE, {
      persistCompletion,
      resolveNextRoute,
    });

    expect(persistCompletion).toHaveBeenCalled();
    expect(resolveNextRoute).toHaveBeenCalled();
    expect(result.nextRoute).toBe("/(auth)/sign");
  });

  it("keeps default dependencies stable and available", () => {
    expect(typeof DEFAULT_ONBOARDING_SUBMISSION_DEPENDENCIES.persistCompletion).toBe(
      "function",
    );
    expect(typeof DEFAULT_ONBOARDING_SUBMISSION_DEPENDENCIES.resolveNextRoute).toBe(
      "function",
    );
  });
});
