import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, Spinner } from "@/components/ui";
import {
  AppShellChromeContext,
  type AppShellChromeState,
} from "@/features/app-shell/components/app-shell-chrome-context";
import { useRequireAuthenticatedUser } from "@/features/auth";
import { CoachAppHeader } from "@/features/app-shell/components/coach-app-header";
import { CoachBottomNav } from "@/features/app-shell/components/coach-bottom-nav";
import { StudentAppHeader } from "@/features/app-shell/components/student-app-header";
import { StudentBottomNav } from "@/features/app-shell/components/student-bottom-nav";
import type { AppRole, ShellRouteKey } from "@/features/app-shell/types/shell-route";

interface AppShellProps {
  readonly children: React.ReactNode;
}

function resolveShellRouteKey(segments: string[]): ShellRouteKey {
  const currentSegment = [...segments]
    .reverse()
    .find((segment) => !segment.startsWith("(")) ?? "home";

  switch (currentSegment) {
    case "agenda":
      return "agenda";
    case "agendar":
      return "agendar";
    case "aula":
      return "aula";
    case "conta":
      return "conta";
    case "notificacoes":
      return "notificacoes";
    case "home":
    default:
      return "home";
  }
}

function AppShell({
  children,
}: AppShellProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const sessionState = useRequireAuthenticatedUser();
  const [chrome, setChrome] = useState<AppShellChromeState>({
    onHeaderActionPress: undefined,
    walletBalanceLabel: null,
  });
  const routeKey = resolveShellRouteKey(segments);

  const chromeContextValue = useMemo(
    () => ({
      chrome,
      setChrome,
    }),
    [chrome],
  );

  if (sessionState.isPending) {
    return (
      <Screen className="flex-1 items-center justify-center bg-background">
        <Spinner />
      </Screen>
    );
  }

  if (!sessionState.data?.user) {
    return <Screen className="flex-1 bg-background" />;
  }

  const role: AppRole =
    sessionState.data.user.role === "COACH" ? "COACH" : "STUDENT";

  return (
    <AppShellChromeContext.Provider value={chromeContextValue}>
      <Screen className="flex-1 bg-background">
        {role === "COACH" ? (
          <CoachAppHeader
            routeKey={routeKey}
            topInset={insets.top}
            onHeaderActionPress={chrome.onHeaderActionPress}
          />
        ) : (
          <StudentAppHeader
            routeKey={routeKey}
            topInset={insets.top}
            walletBalanceLabel={chrome.walletBalanceLabel}
            onHeaderActionPress={chrome.onHeaderActionPress}
          />
        )}

        <View className="flex-1 bg-background">
          {children}
        </View>

        {role === "COACH" ? (
          <CoachBottomNav
            activeRouteKey={routeKey}
            bottomInset={insets.bottom}
            userImage={sessionState.data.user.image ?? null}
            userName={sessionState.data.user.name}
          />
        ) : (
          <StudentBottomNav
            activeRouteKey={routeKey}
            bottomInset={insets.bottom}
            userImage={sessionState.data.user.image ?? null}
            userName={sessionState.data.user.name}
          />
        )}
      </Screen>
    </AppShellChromeContext.Provider>
  );
}

export { AppShell };
export type { AppShellProps };
