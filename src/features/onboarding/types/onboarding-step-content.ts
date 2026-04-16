import type {
  OnboardingMultiSelectField,
  OnboardingSingleSelectField,
  OnboardingStepId,
  StudentAvailability,
  StudentGoal,
  StudentLessonType,
  StudentLevel,
} from "./onboarding-types";

interface OnboardingOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
  readonly subtitle?: string;
}

interface OnboardingWelcomeStep {
  readonly id: "welcome";
  readonly title: "Boas-vindas";
  readonly ctaLabel: "Começar";
  readonly kind: "welcome";
  readonly headline: string;
  readonly description: string;
}

interface OnboardingNameStep {
  readonly id: "name";
  readonly title: "Junte-se ao DFC Tennis";
  readonly ctaLabel: "Continuar";
  readonly kind: "name";
  readonly firstNamePlaceholder: string;
  readonly lastNamePlaceholder: string;
}

interface OnboardingSingleSelectStep<
  TField extends OnboardingSingleSelectField,
  TValue extends string,
> {
  readonly id: Exclude<
    OnboardingStepId,
    "welcome" | "name" | "availability" | "lessonType"
  >;
  readonly title: string;
  readonly ctaLabel: "Continuar" | "Finalizar";
  readonly kind: "single-select";
  readonly field: TField;
  readonly prompt: string;
  readonly options: readonly OnboardingOption<TValue>[];
}

interface OnboardingMultiSelectStep<
  TField extends OnboardingMultiSelectField,
  TValue extends string,
> {
  readonly id: "availability" | "lessonType";
  readonly title: string;
  readonly ctaLabel: "Continuar" | "Finalizar";
  readonly kind: "multi-select";
  readonly field: TField;
  readonly prompt: string;
  readonly options: readonly OnboardingOption<TValue>[];
}

type OnboardingStep =
  | OnboardingWelcomeStep
  | OnboardingNameStep
  | OnboardingSingleSelectStep<"level", StudentLevel>
  | OnboardingSingleSelectStep<"goal", StudentGoal>
  | OnboardingMultiSelectStep<"availability", StudentAvailability>
  | OnboardingMultiSelectStep<"lessonType", StudentLessonType>;

const onboardingSteps: readonly OnboardingStep[] = [
  {
    id: "welcome",
    title: "Boas-vindas",
    ctaLabel: "Começar",
    kind: "welcome",
    headline: "Jogue melhor no seu ritmo",
    description:
      "Em menos de 1 minuto, ajustamos seu feed com as aulas ideais para você.",
  },
  {
    id: "name",
    title: "Junte-se ao DFC Tennis",
    ctaLabel: "Continuar",
    kind: "name",
    firstNamePlaceholder: "Seu primeiro nome",
    lastNamePlaceholder: "Sobrenome (opcional)",
  },
  {
    id: "level",
    title: "Nível",
    ctaLabel: "Continuar",
    kind: "single-select",
    field: "level",
    prompt: "Qual é o seu nível atual no tênis?",
    options: [
      { value: "iniciante", label: "Iniciante" },
      { value: "basico", label: "Básico" },
      { value: "intermediario", label: "Intermediário" },
      { value: "avancado", label: "Avançado" },
      { value: "competitivo", label: "Competitivo" },
    ],
  },
  {
    id: "goal",
    title: "Objetivo",
    ctaLabel: "Continuar",
    kind: "single-select",
    field: "goal",
    prompt: "Qual objetivo você quer priorizar agora?",
    options: [
      {
        value: "aprender-do-zero",
        label: "Aprender do zero",
        subtitle: "Fundamentos e confiança para começar.",
      },
      {
        value: "melhorar-tecnica",
        label: "Melhorar técnica",
        subtitle: "Refino de golpes, postura e consistência.",
      },
      {
        value: "treinar-com-frequencia",
        label: "Treinar com frequência",
        subtitle: "Criar rotina semanal de evolução.",
      },
      {
        value: "competir",
        label: "Competir",
        subtitle: "Performance para torneios e ranking.",
      },
      {
        value: "se-divertir",
        label: "Se divertir",
        subtitle: "Jogar bem e curtir cada sessão.",
      },
      {
        value: "voltar-a-jogar",
        label: "Voltar a jogar",
        subtitle: "Retomar ritmo com segurança e prazer.",
      },
    ],
  },
  {
    id: "availability",
    title: "Disponibilidade",
    ctaLabel: "Continuar",
    kind: "multi-select",
    field: "availability",
    prompt: "Em quais períodos você prefere treinar?",
    options: [
      { value: "manha", label: "Manhã" },
      { value: "tarde", label: "Tarde" },
      { value: "noite", label: "Noite" },
    ],
  },
  {
    id: "lessonType",
    title: "Tipo de aula",
    ctaLabel: "Finalizar",
    kind: "multi-select",
    field: "lessonType",
    prompt: "Quais formatos de aula te interessam?",
    options: [
      { value: "grupo", label: "Aula em grupo" },
      { value: "particular", label: "Aula particular" },
      { value: "kids", label: "Kids" },
    ],
  },
];

const QUESTION_STEPS_TOTAL = 5;

export { QUESTION_STEPS_TOTAL, onboardingSteps };
export type {
  OnboardingMultiSelectStep,
  OnboardingNameStep,
  OnboardingOption,
  OnboardingSingleSelectStep,
  OnboardingStep,
  OnboardingWelcomeStep,
};
