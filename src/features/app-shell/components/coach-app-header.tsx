import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { GravityIcon, Header, HeaderIconButton } from "@/components/ui";
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
    config.mode === "root" ? (
      <Header mode="root" topInset={topInset}>
        <Header.Content>
          <View className="min-w-0 flex-1 flex-row items-center gap-3">
            <Header.Title numberOfLines={1}>{config.title}</Header.Title>
          </View>

          <Header.Actions>
            {config.action ? (
              <HeaderIconButton
                accessibilityLabel={config.action.accessibilityLabel}
                onPress={handleActionPress}
              >
                <GravityIcon name={config.action.icon} size={16} />
              </HeaderIconButton>
            ) : null}
          </Header.Actions>
        </Header.Content>
      </Header>
    ) : (
      <Header mode="inner" topInset={topInset}>
        <View className="relative min-h-14 justify-center">
          <View className="absolute inset-y-0 left-0 z-10 flex-row items-center">
            <Header.BackButton onPress={handleBack} />
          </View>

          <View className="items-center px-16">
            <Header.Title className="text-base font-semibold leading-5" numberOfLines={1}>
              {config.title}
            </Header.Title>
          </View>

          <View className="absolute inset-y-0 right-0 z-10 flex-row items-center">
            {config.action ? (
              <HeaderIconButton
                accessibilityLabel={config.action.accessibilityLabel}
                onPress={handleActionPress}
              >
                <GravityIcon name={config.action.icon} size={16} />
              </HeaderIconButton>
            ) : (
              <View className="w-8" />
            )}
          </View>
        </View>
      </Header>
    )
  );
}

export { CoachAppHeader };
export type { CoachAppHeaderProps };
