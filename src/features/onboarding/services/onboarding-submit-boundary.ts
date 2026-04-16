import { HOME_ROUTE } from "@/features/auth/services/auth-entry-routes";
import {
  getManualQaOnboardingCompletionExitRouteOverride,
} from "@/lib/config/onboarding-manual-qa-mode";
import { toStudentOnboardingPreferences } from "@/features/onboarding/services/onboarding-serialization";
import { markStudentOnboardingComplete } from "@/features/onboarding/services/onboarding-storage-service";
import type {
  OnboardingFormState,
  OnboardingNextRoute,
  StudentOnboardingPreferences,
} from "@/features/onboarding/types/onboarding-types";

interface CompleteOnboardingResult {
  readonly preferences: StudentOnboardingPreferences;
  readonly nextRoute: OnboardingNextRoute;
}

interface OnboardingSubmissionDependencies {
  readonly persistCompletion: (
    preferences: StudentOnboardingPreferences,
  ) => Promise<void>;
  readonly resolveNextRoute: () => OnboardingNextRoute;
}

const DEFAULT_ONBOARDING_SUBMISSION_DEPENDENCIES: OnboardingSubmissionDependencies = {
  persistCompletion: markStudentOnboardingComplete,
  // Temporary QA override is centralized in lib/config/onboarding-manual-qa-mode.
  resolveNextRoute: () =>
    getManualQaOnboardingCompletionExitRouteOverride() ?? HOME_ROUTE,
};

async function completeOnboardingSubmission(
  state: Pick<
    OnboardingFormState,
    "firstName" | "lastName" | "level" | "goal" | "availability" | "lessonType"
  >,
  dependencies: OnboardingSubmissionDependencies = DEFAULT_ONBOARDING_SUBMISSION_DEPENDENCIES,
): Promise<CompleteOnboardingResult> {
  const preferences = toStudentOnboardingPreferences(state);
  await dependencies.persistCompletion(preferences);

  return {
    preferences,
    nextRoute: dependencies.resolveNextRoute(),
  };
}

export {
  DEFAULT_ONBOARDING_SUBMISSION_DEPENDENCIES,
  completeOnboardingSubmission,
};
export type { CompleteOnboardingResult, OnboardingSubmissionDependencies };
