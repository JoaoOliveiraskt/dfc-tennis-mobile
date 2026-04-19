import type {
  HeaderRouteConfig,
  ShellRouteKey,
} from "@/features/app-shell/types/shell-route";

const coachHeaderConfig: Record<ShellRouteKey, HeaderRouteConfig> = {
  agenda: {
    mode: "root",
    title: "Coach Agenda",
    visible: true,
  },
  agendar: {
    mode: "root",
    title: "Novo horário",
    visible: true,
  },
  aula: {
    mode: "inner",
    title: "Sessão",
    visible: true,
  },
  conta: {
    action: {
      accessibilityLabel: "Coach settings",
      icon: "gear",
    },
    mode: "root",
    title: "Coach",
    visible: true,
  },
  home: {
    action: {
      accessibilityLabel: "Coach feed filters",
      icon: "filters",
    },
    mode: "root",
    title: "Visão geral",
    visible: false,
  },
  notificacoes: {
    mode: "root",
    title: "Alertas",
    visible: true,
  },
};

export { coachHeaderConfig };
