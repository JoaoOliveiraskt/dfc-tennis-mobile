type StudentLevel =
  | "iniciante"
  | "basico"
  | "intermediario"
  | "avancado"
  | "competitivo";

type StudentGoal =
  | "aprender-do-zero"
  | "melhorar-tecnica"
  | "treinar-com-frequencia"
  | "competir"
  | "se-divertir"
  | "voltar-a-jogar";

type StudentAvailability = "manha" | "tarde" | "noite";

type StudentLessonType = "grupo" | "particular" | "kids";

type OnboardingStepId =
  | "welcome"
  | "name"
  | "level"
  | "goal"
  | "availability"
  | "lessonType";

type OnboardingQuestionStepId = Exclude<OnboardingStepId, "welcome">;

type OnboardingSingleSelectField = "level" | "goal";

type OnboardingMultiSelectField = "availability" | "lessonType";

type OnboardingCompletionPhase = "idle" | "processing" | "success";

interface StudentOnboardingPreferences {
  readonly firstName: string;
  readonly lastName?: string;
  readonly level: StudentLevel;
  readonly goal: StudentGoal;
  readonly availability: readonly StudentAvailability[];
  readonly lessonType: readonly StudentLessonType[];
}

interface OnboardingFormState {
  readonly currentStepIndex: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly level: StudentLevel | null;
  readonly goal: StudentGoal | null;
  readonly availability: readonly StudentAvailability[];
  readonly lessonType: readonly StudentLessonType[];
  readonly completionPhase: OnboardingCompletionPhase;
}

interface OnboardingDraftRecord {
  readonly profileScope: "student";
  readonly updatedAt: string;
  readonly state: OnboardingFormState;
}

interface OnboardingCompletionRecord {
  readonly profileScope: "student";
  readonly completedAt: string;
  readonly preferences: StudentOnboardingPreferences;
}

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
};
