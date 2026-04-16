import { useEffect, useMemo, useState } from "react";
import { onboardingSteps } from "@/features/onboarding/types/onboarding-step-content";
import type {
  OnboardingCompletionPhase,
  OnboardingFormState,
  OnboardingMultiSelectField,
  OnboardingSingleSelectField,
  OnboardingStepId,
  StudentAvailability,
  StudentGoal,
  StudentLessonType,
  StudentLevel,
  StudentOnboardingPreferences,
} from "@/features/onboarding/types/onboarding-types";
import { toStudentOnboardingPreferences } from "../services/onboarding-serialization";
import {
  getOnboardingDraft,
  markStudentOnboardingComplete,
  saveOnboardingDraft,
} from "../services/onboarding-storage-service";

const LAST_STEP_INDEX = onboardingSteps.length - 1;

const INITIAL_FORM_STATE: OnboardingFormState = {
  currentStepIndex: 0,
  firstName: "",
  lastName: "",
  level: null,
  goal: null,
  availability: [],
  lessonType: [],
  completionPhase: "idle",
};

interface UseStudentOnboardingQuestionnaireResult {
  readonly isHydrating: boolean;
  readonly steps: typeof onboardingSteps;
  readonly currentStep: (typeof onboardingSteps)[number];
  readonly state: OnboardingFormState;
  readonly progress: number;
  readonly isCurrentStepValid: boolean;
  readonly isStickyCtaVisible: boolean;
  readonly stickyCtaLabel: string | null;
  readonly completionPhase: OnboardingCompletionPhase;
  readonly updateName: (field: "firstName" | "lastName", value: string) => void;
  readonly setSingleSelectValue: (
    field: OnboardingSingleSelectField,
    value: StudentLevel | StudentGoal,
  ) => void;
  readonly toggleMultiSelectValue: (
    field: OnboardingMultiSelectField,
    value: StudentAvailability | StudentLessonType,
  ) => void;
  readonly goBack: () => void;
  readonly goNext: () => void;
  readonly completeOnboarding: () => Promise<StudentOnboardingPreferences>;
}

function clampStepIndex(index: number): number {
  if (Number.isNaN(index)) {
    return 0;
  }

  return Math.min(Math.max(index, 0), LAST_STEP_INDEX);
}

function isStepValid(state: OnboardingFormState, stepId: OnboardingStepId): boolean {
  switch (stepId) {
    case "welcome":
      return true;
    case "name":
      return state.firstName.trim().length > 0;
    case "level":
      return state.level !== null;
    case "goal":
      return state.goal !== null;
    case "availability":
      return state.availability.length > 0;
    case "lessonType":
      return state.lessonType.length > 0;
    default:
      return false;
  }
}

function getProgressForStep(stepIndex: number): number {
  if (stepIndex <= 0) {
    return 0;
  }

  const progressValue = Math.min(stepIndex, LAST_STEP_INDEX) / LAST_STEP_INDEX;
  return Math.max(0, Math.min(1, progressValue));
}

function useStudentOnboardingQuestionnaire(): UseStudentOnboardingQuestionnaireResult {
  const [isHydrating, setIsHydrating] = useState(true);
  const [state, setState] = useState<OnboardingFormState>(INITIAL_FORM_STATE);

  const currentStep = onboardingSteps[state.currentStepIndex] ?? onboardingSteps[0];
  const isCurrentStepValid = isStepValid(state, currentStep.id);

  useEffect(() => {
    let isCancelled = false;

    const loadDraft = async () => {
      const draft = await getOnboardingDraft();
      if (isCancelled) {
        return;
      }

      if (!draft) {
        setIsHydrating(false);
        return;
      }

      setState({
        ...draft,
        currentStepIndex: clampStepIndex(draft.currentStepIndex),
        completionPhase: "idle",
      });
      setIsHydrating(false);
    };

    void loadDraft();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    void saveOnboardingDraft(state);
  }, [isHydrating, state]);

  useEffect(() => {
    if (
      state.currentStepIndex !== LAST_STEP_INDEX ||
      state.completionPhase !== "processing"
    ) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setState((currentState) => {
        if (
          currentState.currentStepIndex !== LAST_STEP_INDEX ||
          currentState.completionPhase !== "processing"
        ) {
          return currentState;
        }

        return {
          ...currentState,
          completionPhase: "success",
        };
      });
    }, 1700);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [state.completionPhase, state.currentStepIndex]);

  function updateName(field: "firstName" | "lastName", value: string): void {
    setState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  }

  function setSingleSelectValue(
    field: OnboardingSingleSelectField,
    value: StudentLevel | StudentGoal,
  ): void {
    setState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  }

  function toggleMultiSelectValue(
    field: OnboardingMultiSelectField,
    value: StudentAvailability | StudentLessonType,
  ): void {
    setState((currentState) => {
      const hasValue = currentState[field].includes(value as never);

      const nextValues = hasValue
        ? currentState[field].filter((item) => item !== value)
        : [...currentState[field], value];

      return {
        ...currentState,
        [field]: nextValues,
      };
    });
  }

  function goBack(): void {
    setState((currentState) => ({
      ...currentState,
      currentStepIndex: clampStepIndex(currentState.currentStepIndex - 1),
      completionPhase:
        currentState.currentStepIndex === LAST_STEP_INDEX
          ? "idle"
          : currentState.completionPhase,
    }));
  }

  function goNext(): void {
    setState((currentState) => {
      const step = onboardingSteps[currentState.currentStepIndex];
      if (!step) {
        return currentState;
      }

      if (!isStepValid(currentState, step.id)) {
        return currentState;
      }

      if (currentState.currentStepIndex >= LAST_STEP_INDEX) {
        if (
          currentState.currentStepIndex === LAST_STEP_INDEX &&
          currentState.completionPhase === "idle"
        ) {
          return {
            ...currentState,
            completionPhase: "processing",
          };
        }

        return currentState;
      }

      const nextStepIndex = clampStepIndex(currentState.currentStepIndex + 1);

      return {
        ...currentState,
        currentStepIndex: nextStepIndex,
      };
    });
  }

  async function completeOnboarding(): Promise<StudentOnboardingPreferences> {
    const preferences = toStudentOnboardingPreferences(state);
    await markStudentOnboardingComplete(preferences);
    return preferences;
  }

  const stickyCtaLabel = useMemo(() => {
    if ("ctaLabel" in currentStep) {
      return currentStep.ctaLabel;
    }

    return "Continuar";
  }, [currentStep]);

  return {
    isHydrating,
    steps: onboardingSteps,
    currentStep,
    state,
    progress: getProgressForStep(state.currentStepIndex),
    isCurrentStepValid,
    isStickyCtaVisible: state.completionPhase === "idle",
    stickyCtaLabel,
    completionPhase: state.completionPhase,
    updateName,
    setSingleSelectValue,
    toggleMultiSelectValue,
    goBack,
    goNext,
    completeOnboarding,
  };
}

export { INITIAL_FORM_STATE, useStudentOnboardingQuestionnaire };
export type { UseStudentOnboardingQuestionnaireResult };
