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
  StudentOnboardingPreferences,
} from "./types/onboarding-types";
