import { useEffect, useMemo, useState } from "react";
import { onboardingSteps } from "@/features/onboarding/types/onboarding-step-content";
import { completeOnboardingSubmission } from "@/features/onboarding/services/onboarding-submit-boundary";
import {
  LAST_ONBOARDING_STEP_INDEX,
  clampOnboardingStepIndex,
  getOnboardingProgressForStep,
  isOnboardingStepValid,
} from "@/features/onboarding/services/onboarding-validation";
import type {
  OnboardingCompletionPhase,
  OnboardingFormState,
  OnboardingMultiSelectField,
  OnboardingSingleSelectField,
  StudentAvailability,
  StudentGoal,
  StudentLessonType,
  StudentLevel,
  StudentOnboardingCompletionResult,
} from "@/features/onboarding/types/onboarding-types";
import {
  getOnboardingDraft,
  saveOnboardingDraft,
} from "../services/onboarding-storage-service";

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
  readonly completeOnboarding: () => Promise<StudentOnboardingCompletionResult>;
}

function toggleSelection<TValue extends string>(
  values: readonly TValue[],
  targetValue: TValue,
): readonly TValue[] {
  const hasValue = values.includes(targetValue);
  if (hasValue) {
    return values.filter((value) => value !== targetValue);
  }

  return [...values, targetValue];
}

function useStudentOnboardingQuestionnaire(): UseStudentOnboardingQuestionnaireResult {
  const [isHydrating, setIsHydrating] = useState(true);
  const [state, setState] = useState<OnboardingFormState>(INITIAL_FORM_STATE);

  const currentStep = onboardingSteps[state.currentStepIndex] ?? onboardingSteps[0];
  const isCurrentStepValid = isOnboardingStepValid(state, currentStep.id);

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
        currentStepIndex: clampOnboardingStepIndex(draft.currentStepIndex),
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
      state.currentStepIndex !== LAST_ONBOARDING_STEP_INDEX ||
      state.completionPhase !== "processing"
    ) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setState((currentState) => {
        if (
          currentState.currentStepIndex !== LAST_ONBOARDING_STEP_INDEX ||
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
      const nextValues = toggleSelection(
        currentState[field],
        value,
      );

      return {
        ...currentState,
        [field]: nextValues,
      };
    });
  }

  function goBack(): void {
    setState((currentState) => ({
      ...currentState,
      currentStepIndex: clampOnboardingStepIndex(currentState.currentStepIndex - 1),
      completionPhase:
        currentState.currentStepIndex === LAST_ONBOARDING_STEP_INDEX
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

      if (!isOnboardingStepValid(currentState, step.id)) {
        return currentState;
      }

      if (currentState.currentStepIndex >= LAST_ONBOARDING_STEP_INDEX) {
        if (
          currentState.currentStepIndex === LAST_ONBOARDING_STEP_INDEX &&
          currentState.completionPhase === "idle"
        ) {
          return {
            ...currentState,
            completionPhase: "processing",
          };
        }

        return currentState;
      }

      const nextStepIndex = clampOnboardingStepIndex(currentState.currentStepIndex + 1);

      return {
        ...currentState,
        currentStepIndex: nextStepIndex,
      };
    });
  }

  async function completeOnboarding(): Promise<StudentOnboardingCompletionResult> {
    return completeOnboardingSubmission(state);
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
    progress: getOnboardingProgressForStep(state.currentStepIndex),
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
