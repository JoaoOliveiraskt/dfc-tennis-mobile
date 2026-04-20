import React from "react";
import { Image, Text, View } from "react-native";
import { Button, EmptyState, GravityIcon, Screen, Skeleton } from "@/components/ui";
import { AccountActionCard } from "@/features/account/components/account-action-card";
import { useAccount } from "@/features/account/hooks/use-account";

function AccountLoadingState(): React.JSX.Element {
  return (
    <Screen className="flex-1 bg-background px-5 pt-4">
      <View className="items-center gap-4">
        <Skeleton className="size-28 rounded-full" />
        <Skeleton className="h-7 w-44 rounded-full" />
        <Skeleton className="h-5 w-36 rounded-full" />
      </View>
      <View className="mt-8 flex-row gap-3">
        <Skeleton className="h-24 flex-1 rounded-[24px]" />
        <Skeleton className="h-24 flex-1 rounded-[24px]" />
      </View>
      <Skeleton className="mt-4 h-14 w-full rounded-[24px]" />
    </Screen>
  );
}

function AccountScreen(): React.JSX.Element {
  const {
    data,
    errorMessage,
    isLoading,
    isSigningOut,
    signOut,
    signOutErrorMessage,
  } = useAccount();
  const isCoachAccount = data?.roleLabel === "Coach";
  const isInitialLoading = !data && isLoading;

  if (isInitialLoading) {
    return <AccountLoadingState />;
  }

  if (!data) {
    return errorMessage ? (
      <Screen className="flex-1 bg-background">
        <EmptyState title="Não foi possível carregar sua conta" description={errorMessage} />
      </Screen>
    ) : (
      <Screen className="flex-1 bg-background" />
    );
  }

  return (
    <Screen className="flex-1 bg-background px-5 pt-4">
      <View className="items-center gap-4">
        {data.image ? (
          <Image
            source={{ uri: data.image }}
            className="size-28 rounded-full"
          />
        ) : (
          <View className="size-28 items-center justify-center rounded-full bg-surface">
            <Text className="text-4xl font-semibold text-foreground">
              {data.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View className="rounded-full bg-surface px-3 py-2">
          <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {data.roleLabel}
          </Text>
        </View>

        <View className="items-center gap-1">
          <Text className="text-[34px] font-semibold leading-[40px] tracking-[-1.2px] text-foreground">
            {data.name}
          </Text>
          <Text className="text-base text-muted">{data.email}</Text>
        </View>
      </View>

      <View className="mt-8 flex-row gap-3">
        <AccountActionCard icon="wallet" label="My Wallet" />
        <AccountActionCard icon="edit" label="Edit Profile" />
      </View>

      {isCoachAccount ? (
        <>
          <Button
            className="mt-4"
            size="lg"
            variant="secondary"
            isDisabled={isSigningOut}
            onPress={signOut}
          >
            <Button.Label>{isSigningOut ? "Saindo..." : "Sair da conta"}</Button.Label>
          </Button>

          {signOutErrorMessage ? (
            <View className="mt-3 flex-row items-center gap-2">
              <GravityIcon name="bell" size={16} colorToken="danger" />
              <Text className="text-sm font-medium text-danger">
                {signOutErrorMessage}
              </Text>
            </View>
          ) : null}
        </>
      ) : null}

      {!isCoachAccount ? (
        <View className="mt-4 rounded-[28px] bg-surface px-5 py-5">
          <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Saldo disponível
          </Text>
          <Text className="mt-2 text-3xl font-semibold text-foreground">
            {data.balanceLabel}
          </Text>
        </View>
      ) : null}

      {!isCoachAccount ? (
        <>
          <Button
            className="mt-6"
            size="lg"
            variant="secondary"
            isDisabled={isSigningOut}
            onPress={signOut}
          >
            <Button.Label>{isSigningOut ? "Saindo..." : "Logout"}</Button.Label>
          </Button>

          {signOutErrorMessage ? (
            <View className="mt-3 flex-row items-center gap-2">
              <GravityIcon name="bell" size={16} colorToken="danger" />
              <Text className="text-sm font-medium text-danger">
                {signOutErrorMessage}
              </Text>
            </View>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

export { AccountScreen };
