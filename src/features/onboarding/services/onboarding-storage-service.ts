import * as SecureStore from "expo-secure-store";
import type {
  OnboardingCompletionRecord,
  OnboardingDraftRecord,
  OnboardingFormState,
  StudentOnboardingPreferences,
} from "@/features/onboarding/types/onboarding-types";

const ONBOARDING_DRAFT_STORAGE_KEY = "dfc-tennis-mobile.onboarding.student.v1.draft";
const ONBOARDING_COMPLETION_STORAGE_KEY =
  "dfc-tennis-mobile.onboarding.student.v1.completion";
const DISABLE_ONBOARDING_PERSISTENCE = false;

async function clearOnboardingStorage(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ONBOARDING_DRAFT_STORAGE_KEY),
    SecureStore.deleteItemAsync(ONBOARDING_COMPLETION_STORAGE_KEY),
  ]);
}

async function saveOnboardingDraft(state: OnboardingFormState): Promise<void> {
  if (DISABLE_ONBOARDING_PERSISTENCE) {
    return;
  }

  const payload: OnboardingDraftRecord = {
    profileScope: "student",
    updatedAt: new Date().toISOString(),
    state,
  };

  await SecureStore.setItemAsync(
    ONBOARDING_DRAFT_STORAGE_KEY,
    JSON.stringify(payload),
  );
}

async function getOnboardingDraft(): Promise<OnboardingFormState | null> {
  if (DISABLE_ONBOARDING_PERSISTENCE) {
    await clearOnboardingStorage();
    return null;
  }

  try {
    const rawValue = await SecureStore.getItemAsync(ONBOARDING_DRAFT_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as OnboardingDraftRecord;
    return parsedValue.state ?? null;
  } catch {
    return null;
  }
}

async function clearOnboardingDraft(): Promise<void> {
  await SecureStore.deleteItemAsync(ONBOARDING_DRAFT_STORAGE_KEY);
}

async function markStudentOnboardingComplete(
  preferences: StudentOnboardingPreferences,
): Promise<void> {
  if (DISABLE_ONBOARDING_PERSISTENCE) {
    await clearOnboardingStorage();
    return;
  }

  const payload: OnboardingCompletionRecord = {
    profileScope: "student",
    completedAt: new Date().toISOString(),
    preferences,
  };

  await SecureStore.setItemAsync(
    ONBOARDING_COMPLETION_STORAGE_KEY,
    JSON.stringify(payload),
  );
  await clearOnboardingDraft();
}

async function getStudentOnboardingCompletion(): Promise<OnboardingCompletionRecord | null> {
  if (DISABLE_ONBOARDING_PERSISTENCE) {
    await clearOnboardingStorage();
    return null;
  }

  try {
    const rawValue = await SecureStore.getItemAsync(
      ONBOARDING_COMPLETION_STORAGE_KEY,
    );
    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as OnboardingCompletionRecord;
  } catch {
    return null;
  }
}

async function hasCompletedStudentOnboarding(): Promise<boolean> {
  if (DISABLE_ONBOARDING_PERSISTENCE) {
    await clearOnboardingStorage();
    return false;
  }

  const completionRecord = await getStudentOnboardingCompletion();
  return completionRecord !== null;
}

export {
  clearOnboardingDraft,
  getOnboardingDraft,
  getStudentOnboardingCompletion,
  hasCompletedStudentOnboarding,
  markStudentOnboardingComplete,
  saveOnboardingDraft,
};
