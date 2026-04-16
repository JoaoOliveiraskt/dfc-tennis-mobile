import { onboardingSteps } from "@/features/onboarding/types/onboarding-step-content";
import type {
  OnboardingFormState,
  OnboardingStepId,
} from "@/features/onboarding/types/onboarding-types";

const LAST_ONBOARDING_STEP_INDEX = onboardingSteps.length - 1;

type StepValidatorMap = {
  [K in OnboardingStepId]: (state: OnboardingFormState) => boolean;
};

const STEP_VALIDATORS: StepValidatorMap = {
  welcome: () => true,
  name: (state) => state.firstName.trim().length > 0,
  level: (state) => state.level !== null,
  goal: (state) => state.goal !== null,
  availability: (state) => state.availability.length > 0,
  lessonType: (state) => state.lessonType.length > 0,
};

function clampOnboardingStepIndex(index: number): number {
  if (Number.isNaN(index)) {
    return 0;
  }

  return Math.min(Math.max(index, 0), LAST_ONBOARDING_STEP_INDEX);
}

function isOnboardingStepValid(
  state: OnboardingFormState,
  stepId: OnboardingStepId,
): boolean {
  return STEP_VALIDATORS[stepId](state);
}

function getOnboardingProgressForStep(stepIndex: number): number {
  if (stepIndex <= 0) {
    return 0;
  }

  const progressValue =
    Math.min(stepIndex, LAST_ONBOARDING_STEP_INDEX) / LAST_ONBOARDING_STEP_INDEX;
  return Math.max(0, Math.min(1, progressValue));
}

function hasCompletedOnboardingAnswers(state: OnboardingFormState): boolean {
  return (
    state.firstName.trim().length > 0 &&
    state.level !== null &&
    state.goal !== null &&
    state.availability.length > 0 &&
    state.lessonType.length > 0
  );
}

export {
  LAST_ONBOARDING_STEP_INDEX,
  clampOnboardingStepIndex,
  getOnboardingProgressForStep,
  hasCompletedOnboardingAnswers,
  isOnboardingStepValid,
};

