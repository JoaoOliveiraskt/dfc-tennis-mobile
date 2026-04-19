import type { Href } from "expo-router";
import type { HeaderMode } from "@/components/ui";
import type { GravityIconName } from "@/components/ui";

type AppRole = "COACH" | "STUDENT";

type ShellRouteKey =
  | "agenda"
  | "agendar"
  | "aula"
  | "conta"
  | "home"
  | "notificacoes";

interface HeaderActionConfig {
  readonly accessibilityLabel: string;
  readonly href?: Href;
  readonly icon: GravityIconName;
}

interface HeaderRouteConfig {
  readonly action?: HeaderActionConfig;
  readonly mode: HeaderMode;
  readonly showBrand?: boolean;
  readonly title: string;
  readonly visible?: boolean;
}

interface BottomNavItemConfig {
  readonly href: Href;
  readonly icon: GravityIconName;
  readonly key: ShellRouteKey;
  readonly label: string;
}

export type {
  AppRole,
  BottomNavItemConfig,
  HeaderActionConfig,
  HeaderRouteConfig,
  ShellRouteKey,
};
