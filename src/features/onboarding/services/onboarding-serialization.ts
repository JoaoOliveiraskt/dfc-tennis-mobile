import type {
  OnboardingFormState,
  StudentOnboardingPreferences,
} from "@/features/onboarding/types/onboarding-types";

function toStudentOnboardingPreferences(
  state: Pick<
    OnboardingFormState,
    "firstName" | "lastName" | "level" | "goal" | "availability" | "lessonType"
  >,
): StudentOnboardingPreferences {
  if (!state.level || !state.goal) {
    throw new Error(
      "Cannot serialize onboarding preferences without completed single-select answers.",
    );
  }

  if (state.availability.length === 0 || state.lessonType.length === 0) {
    throw new Error(
      "Cannot serialize onboarding preferences without completed multi-select answers.",
    );
  }

  const trimmedFirstName = state.firstName.trim();
  if (trimmedFirstName.length === 0) {
    throw new Error("Cannot serialize onboarding preferences without first name.");
  }

  const trimmedLastName = state.lastName.trim();

  return {
    firstName: trimmedFirstName,
    lastName: trimmedLastName.length > 0 ? trimmedLastName : undefined,
    level: state.level,
    goal: state.goal,
    availability: [...state.availability],
    lessonType: [...state.lessonType],
  };
}

export { toStudentOnboardingPreferences };
