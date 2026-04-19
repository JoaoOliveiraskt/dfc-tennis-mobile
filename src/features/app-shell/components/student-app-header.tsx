import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  BrandWordmark,
  GravityIcon,
  Header,
  type HeaderMode,
} from "@/components/ui";
import { HOME_ROUTE } from "@/features/auth/services/auth-entry-routes";
import { studentHeaderConfig } from "@/features/app-shell/config/student-header-config";
import type { ShellRouteKey } from "@/features/app-shell/types/shell-route";

interface StudentAppHeaderProps {
  readonly onHeaderActionPress?: (() => void) | undefined;
  readonly routeKey: ShellRouteKey;
  readonly topInset: number;
  readonly walletBalanceLabel?: string | null;
}

function StudentAppHeader({
  onHeaderActionPress,
  routeKey,
  topInset,
  walletBalanceLabel,
}: StudentAppHeaderProps): React.JSX.Element | null {
  const router = useRouter();
  const config = studentHeaderConfig[routeKey];

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
          {config.showBrand ? (
            <BrandWordmark className="pb-1" />
          ) : (
            <Header.Title numberOfLines={1}>{config.title}</Header.Title>
          )}
        </View>

        <Header.Actions>
          {routeKey === "conta" && walletBalanceLabel ? (
            <View className="rounded-full bg-surface px-3 py-2">
              <Text className="text-xs font-semibold text-foreground">
                Carteira {walletBalanceLabel}
              </Text>
            </View>
          ) : null}

          {config.action ? (
            <Pressable
              accessibilityLabel={config.action.accessibilityLabel}
              accessibilityRole="button"
              hitSlop={12}
              onPress={handleActionPress}
              className="size-11 items-center justify-center rounded-full bg-surface"
            >
              <GravityIcon name={config.action.icon} size={20} />
            </Pressable>
          ) : null}
        </Header.Actions>
      </Header.Content>
    </Header>
  );
}

export { StudentAppHeader };
export type { StudentAppHeaderProps };
