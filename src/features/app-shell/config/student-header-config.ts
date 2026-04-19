import type {
  HeaderRouteConfig,
  ShellRouteKey,
} from "@/features/app-shell/types/shell-route";

const studentHeaderConfig: Record<ShellRouteKey, HeaderRouteConfig> = {
  agenda: {
    mode: "root",
    title: "Agenda",
    visible: true,
  },
  agendar: {
    mode: "root",
    title: "Agendar",
    visible: true,
  },
  aula: {
    mode: "inner",
    title: "Aula",
    visible: true,
  },
  conta: {
    action: {
      accessibilityLabel: "Settings",
      icon: "gear",
    },
    mode: "root",
    title: "Account",
    visible: true,
  },
  home: {
    action: {
      accessibilityLabel: "Open feed filters",
      icon: "filters",
    },
    mode: "root",
    showBrand: true,
    title: "Início",
    visible: false,
  },
  notificacoes: {
    mode: "root",
    title: "Notificações",
    visible: true,
  },
};

export { studentHeaderConfig };
