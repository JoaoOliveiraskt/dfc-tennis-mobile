import type { BottomNavItemConfig } from "@/features/app-shell/types/shell-route";

const studentBottomNavItems: BottomNavItemConfig[] = [
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
    label: "Agendar",
  },
  {
    href: "/(app)/(shell)/notificacoes",
    icon: "bell",
    key: "notificacoes",
    label: "Notificações",
  },
  {
    href: "/(app)/(shell)/conta",
    icon: "profile",
    key: "conta",
    label: "Perfil",
  },
];

export { studentBottomNavItems };
