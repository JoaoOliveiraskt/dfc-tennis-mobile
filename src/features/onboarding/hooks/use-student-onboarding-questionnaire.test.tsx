import { act, renderHook, waitFor } from "@testing-library/react-native";
import {
  INITIAL_FORM_STATE,
  useStudentOnboardingQuestionnaire,
} from "@/features/onboarding/hooks/use-student-onboarding-questionnaire";

const mockGetOnboardingDraft = jest.fn();
const mockSaveOnboardingDraft = jest.fn();
const mockCompleteOnboardingSubmission = jest.fn();

jest.mock("@/features/onboarding/services/onboarding-storage-service", () => ({
  getOnboardingDraft: () => mockGetOnboardingDraft(),
  saveOnboardingDraft: (state: unknown) => mockSaveOnboardingDraft(state),
}));

jest.mock("@/features/onboarding/services/onboarding-submit-boundary", () => ({
  completeOnboardingSubmission: (state: unknown) =>
    mockCompleteOnboardingSubmission(state),
}));

describe("useStudentOnboardingQuestionnaire", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockGetOnboardingDraft.mockResolvedValue(null);
    mockCompleteOnboardingSubmission.mockResolvedValue({
      preferences: {
        firstName: "João",
        lastName: "Oliveira",
        level: "intermediario",
        goal: "melhorar-tecnica",
        availability: ["noite"],
        lessonType: ["particular"],
      },
      nextRoute: "/(app)/home",
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("progresses through all steps and keeps completion in last step", async () => {
    const hook = renderHook(() => useStudentOnboardingQuestionnaire());

    await waitFor(() => {
      expect(hook.result.current.isHydrating).toBe(false);
    });

    expect(hook.result.current.currentStep.id).toBe("welcome");
    expect(hook.result.current.isCurrentStepValid).toBe(true);

    act(() => {
      hook.result.current.goNext();
    });
    expect(hook.result.current.currentStep.id).toBe("name");
    expect(hook.result.current.isCurrentStepValid).toBe(false);

    act(() => {
      hook.result.current.updateName("firstName", "João");
      hook.result.current.updateName("lastName", "Oliveira");
      hook.result.current.goNext();
    });
    expect(hook.result.current.currentStep.id).toBe("level");

    act(() => {
      hook.result.current.setSingleSelectValue("level", "intermediario");
      hook.result.current.goNext();
      hook.result.current.setSingleSelectValue("goal", "melhorar-tecnica");
      hook.result.current.goNext();
      hook.result.current.toggleMultiSelectValue("availability", "noite");
      hook.result.current.goNext();
      hook.result.current.toggleMultiSelectValue("lessonType", "particular");
      hook.result.current.goNext();
    });

    expect(hook.result.current.currentStep.id).toBe("lessonType");
    expect(hook.result.current.completionPhase).toBe("processing");
    expect(hook.result.current.stickyCtaLabel).toBe("Finalizar");
    expect(hook.result.current.isStickyCtaVisible).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1700);
    });

    await waitFor(() => {
      expect(hook.result.current.completionPhase).toBe("success");
    });

    let completionResult:
      | Awaited<ReturnType<typeof hook.result.current.completeOnboarding>>
      | undefined;
    await act(async () => {
      completionResult = await hook.result.current.completeOnboarding();
    });

    expect(mockCompleteOnboardingSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "João",
        lastName: "Oliveira",
        level: "intermediario",
        goal: "melhorar-tecnica",
        availability: ["noite"],
        lessonType: ["particular"],
      }),
    );
    expect(completionResult?.nextRoute).toBe("/(app)/home");
  });

  it("restores persisted draft state and keeps current step", async () => {
    mockGetOnboardingDraft.mockResolvedValue({
      ...INITIAL_FORM_STATE,
      currentStepIndex: 4,
      firstName: "João",
      level: "basico",
      goal: "se-divertir",
      availability: ["manha"],
      lessonType: [],
      completionPhase: "processing",
    });

    const hook = renderHook(() => useStudentOnboardingQuestionnaire());

    await waitFor(() => {
      expect(hook.result.current.isHydrating).toBe(false);
    });

    expect(hook.result.current.currentStep.id).toBe("availability");
    expect(hook.result.current.state.firstName).toBe("João");
    expect(hook.result.current.state.level).toBe("basico");
    expect(hook.result.current.state.goal).toBe("se-divertir");
    expect(hook.result.current.state.availability).toEqual(["manha"]);
    expect(hook.result.current.completionPhase).toBe("idle");
    expect(hook.result.current.currentStep.id).toBe("availability");
  });
});
