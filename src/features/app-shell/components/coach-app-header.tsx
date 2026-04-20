import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button, GravityIcon, Header, type HeaderMode } from "@/components/ui";
import { HOME_ROUTE } from "@/features/auth/services/auth-entry-routes";
import { coachHeaderConfig } from "@/features/app-shell/config/coach-header-config";
import type { ShellRouteKey } from "@/features/app-shell/types/shell-route";

interface CoachAppHeaderProps {
  readonly onHeaderActionPress?: (() => void) | undefined;
  readonly routeKey: ShellRouteKey;
  readonly topInset: number;
}

function CoachAppHeader({
  onHeaderActionPress,
  routeKey,
  topInset,
}: CoachAppHeaderProps): React.JSX.Element | null {
  const router = useRouter();
  const config = coachHeaderConfig[routeKey];

  if (config.visible === false) {
    return null;
  }

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(HOME_ROUTE);
  };

  const handleActionPress = () => {
    if (onHeaderActionPress) {
      onHeaderActionPress();
      return;
    }

    if (config.action?.href) {
      router.push(config.action.href);
    }
  };

  return (
    <Header mode={config.mode as HeaderMode} topInset={topInset}>
      <Header.Content>
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          {config.mode === "inner" ? (
            <Header.BackButton onPress={handleBack} />
          ) : null}
          <Header.Title numberOfLines={1}>{config.title}</Header.Title>
        </View>

        <Header.Actions>
          {config.action ? (
            <Button
              accessibilityLabel={config.action.accessibilityLabel}
              variant="tertiary"
              size="icon-xs"
              onPress={handleActionPress}
              className="bg-surface"
            >
              <GravityIcon name={config.action.icon} size={16} />
            </Button>
          ) : null}
        </Header.Actions>
      </Header.Content>
    </Header>
  );
}

export { CoachAppHeader };
export type { CoachAppHeaderProps };
