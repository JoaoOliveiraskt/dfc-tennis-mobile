import type { BottomNavItemConfig } from "@/features/app-shell/types/shell-route";

const coachBottomNavItems: BottomNavItemConfig[] = [
  {
    href: "/(app)/home",
    icon: "home",
    key: "home",
    label: "Home",
  },
  {
    href: "/(app)/agenda",
    icon: "agenda",
    key: "agenda",
    label: "Agenda",
  },
  {
    href: "/(app)/agendar",
    icon: "plus",
    key: "agendar",
    label: "Criar",
  },
  {
    href: "/(app)/notificacoes",
    icon: "bell",
    key: "notificacoes",
    label: "Avisos",
  },
  {
    href: "/(app)/conta",
    icon: "profile",
    key: "conta",
    label: "Conta",
  },
];

export { coachBottomNavItems };
