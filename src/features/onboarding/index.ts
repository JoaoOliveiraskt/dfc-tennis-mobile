export { StudentOnboardingScreen } from "./screens/student-onboarding-screen";
export { useStudentOnboardingQuestionnaire } from "./hooks/use-student-onboarding-questionnaire";
export {
  getOnboardingDraft,
  getStudentOnboardingCompletion,
  hasCompletedStudentOnboarding,
  markStudentOnboardingComplete,
  saveOnboardingDraft,
} from "./services/onboarding-storage-service";
export { toStudentOnboardingPreferences } from "./services/onboarding-serialization";
export { completeOnboardingSubmission } from "./services/onboarding-submit-boundary";
export {
  clampOnboardingStepIndex,
  getOnboardingProgressForStep,
  hasCompletedOnboardingAnswers,
  isOnboardingStepValid,
} from "./services/onboarding-validation";
export { onboardingSteps } from "./types/onboarding-step-content";
export type {
  OnboardingCompletionPhase,
  OnboardingCompletionRecord,
  OnboardingDraftRecord,
  OnboardingFormState,
  OnboardingMultiSelectField,
  OnboardingQuestionStepId,
  OnboardingSingleSelectField,
  OnboardingStepId,
  StudentAvailability,
  StudentGoal,
  StudentLessonType,
  StudentLevel,
  StudentOnboardingCompletionResult,
  StudentOnboardingPreferences,
} from "./types/onboarding-types";
export type {
  CompleteOnboardingResult,
  OnboardingSubmissionDependencies,
} from "./services/onboarding-submit-boundary";
