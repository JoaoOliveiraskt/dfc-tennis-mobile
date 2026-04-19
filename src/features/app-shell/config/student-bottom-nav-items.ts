import type { BottomNavItemConfig } from "@/features/app-shell/types/shell-route";

const studentBottomNavItems: BottomNavItemConfig[] = [
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
    label: "Agendar",
  },
  {
    href: "/(app)/notificacoes",
    icon: "bell",
    key: "notificacoes",
    label: "Notificações",
  },
  {
    href: "/(app)/conta",
    icon: "profile",
    key: "conta",
    label: "Perfil",
  },
];

export { studentBottomNavItems };
