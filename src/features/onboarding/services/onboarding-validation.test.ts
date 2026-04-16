import { onboardingSteps } from "@/features/onboarding/types/onboarding-step-content";
import {
  clampOnboardingStepIndex,
  getOnboardingProgressForStep,
  hasCompletedOnboardingAnswers,
  isOnboardingStepValid,
  LAST_ONBOARDING_STEP_INDEX,
} from "@/features/onboarding/services/onboarding-validation";
import type { OnboardingFormState } from "@/features/onboarding/types/onboarding-types";

const VALID_STATE: OnboardingFormState = {
  currentStepIndex: LAST_ONBOARDING_STEP_INDEX,
  firstName: "João",
  lastName: "Oliveira",
  level: "intermediario",
  goal: "melhorar-tecnica",
  availability: ["noite"],
  lessonType: ["particular"],
  completionPhase: "success",
};

describe("onboarding-validation", () => {
  it("clamps step indexes within onboarding range", () => {
    expect(clampOnboardingStepIndex(Number.NaN)).toBe(0);
    expect(clampOnboardingStepIndex(-5)).toBe(0);
    expect(clampOnboardingStepIndex(LAST_ONBOARDING_STEP_INDEX + 4)).toBe(
      LAST_ONBOARDING_STEP_INDEX,
    );
  });

  it("returns progress bounded between 0 and 1", () => {
    expect(getOnboardingProgressForStep(0)).toBe(0);
    expect(getOnboardingProgressForStep(1)).toBeGreaterThan(0);
    expect(getOnboardingProgressForStep(LAST_ONBOARDING_STEP_INDEX + 8)).toBe(1);
  });

  it("validates each step contract", () => {
    onboardingSteps.forEach((step) => {
      expect(isOnboardingStepValid(VALID_STATE, step.id)).toBe(true);
    });

    const invalidNameState = { ...VALID_STATE, firstName: " " };
    expect(isOnboardingStepValid(invalidNameState, "name")).toBe(false);
  });

  it("detects whether onboarding answers are complete for submission", () => {
    expect(hasCompletedOnboardingAnswers(VALID_STATE)).toBe(true);
    expect(
      hasCompletedOnboardingAnswers({
        ...VALID_STATE,
        lessonType: [],
      }),
    ).toBe(false);
  });
});

