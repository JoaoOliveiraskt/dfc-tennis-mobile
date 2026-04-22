import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { FlexiButton } from "@/components/micro-interactions/flexi-button";
import {
  BrandWordmark,
  GravityIcon,
  Header,
  HeaderIconButton,
} from "@/components/ui";
import { HOME_ROUTE } from "@/features/auth/services/auth-entry-routes";
import { studentHeaderConfig } from "@/features/app-shell/config/student-header-config";
import type { StudentHeaderRouteKey } from "@/features/app-shell/types/shell-route";

interface StudentAppHeaderProps {
  readonly headerActionDisabled?: boolean | undefined;
  readonly headerActionLabel?: string | null | undefined;
  readonly onHeaderActionPress?: (() => void) | undefined;
  readonly routeKey: StudentHeaderRouteKey;
  readonly topInset: number;
  readonly walletBalanceLabel?: string | null;
}

function StudentAppHeader({
  headerActionDisabled = false,
  headerActionLabel,
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

  if (config.mode === "root") {
    return (
      <Header mode="root" topInset={topInset}>
        <Header.Content>
          <View className="min-w-0 flex-1 flex-row items-center gap-3">
            {config.showBrand ? (
              <BrandWordmark className="pb-1" />
            ) : (
              <Header.Title numberOfLines={1}>{config.title}</Header.Title>
            )}
          </View>

          <Header.Actions>
            {routeKey === "conta" && walletBalanceLabel ? (
              <FlexiButton
                isOpenByDefault
                label={walletBalanceLabel}
                onPress={() => router.push("/(app)/(shell)/carteira")}
              />
            ) : null}

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
    );
  }

  if (routeKey === "perfil") {
    return (
      <Header mode="inner" topInset={topInset}>
        <View className="relative min-h-14 justify-center">
          <View className="absolute inset-y-0 left-0 z-10 flex-row items-center">
            <Pressable
              accessibilityRole="button"
              className="h-8 justify-center"
              hitSlop={8}
              onPress={handleBack}
            >
              <Text className="text-sm font-medium text-foreground">Cancelar</Text>
            </Pressable>
          </View>

          <View className="items-center px-16">
            <Header.Title className="text-base font-semibold leading-5" numberOfLines={1}>
              Editar perfil
            </Header.Title>
          </View>

          <View className="absolute inset-y-0 right-0 z-10 flex-row items-center">
            <Pressable
              accessibilityRole="button"
              className="h-8 justify-center"
              disabled={!onHeaderActionPress || headerActionDisabled}
              hitSlop={8}
              onPress={handleActionPress}
            >
              <Text
                className={!onHeaderActionPress || headerActionDisabled
                  ? "text-sm font-medium text-muted"
                  : "text-sm font-medium text-foreground"}
              >
                {headerActionLabel ?? "Salvar"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Header>
    );
  }

  return (
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
  );
}

export { StudentAppHeader };
export type { StudentAppHeaderProps };
