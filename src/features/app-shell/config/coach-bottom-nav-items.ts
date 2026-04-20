import type { BottomNavItemConfig } from "@/features/app-shell/types/shell-route";

const coachBottomNavItems: BottomNavItemConfig[] = [
  {
    href: "/(app)/(shell)/home",
    icon: "home",
    key: "home",
    label: "Home",
  },
  {
    href: "/(app)/(shell)/agenda",
    icon: "compass",
    key: "agenda",
    label: "Agenda",
  },
  {
    href: "/(app)/(shell)/agendar",
    icon: "plus",
    key: "agendar",
    label: "Criar",
  },
  {
    href: "/(app)/(shell)/notificacoes",
    icon: "bell",
    key: "notificacoes",
    label: "Avisos",
  },
  {
    href: "/(app)/(shell)/conta",
    icon: "profile",
    key: "conta",
    label: "Conta",
  },
];

export { coachBottomNavItems };
