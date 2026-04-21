import { Button, Spinner, UserAvatar } from "@/components/ui";
import React from "react";
import { Text, View, useColorScheme } from "react-native";
import { GoogleIcon } from "@/features/auth/components/icons/google-icon";
import type { LastUsedAccount } from "@/features/auth/types/last-used-account";

interface AuthCtaBlockProps {
  readonly isGoogleLoading: boolean;
  readonly isLastUsedAccountLoading: boolean;
  readonly isInteractionBlocked: boolean;
  readonly lastUsedAccount: LastUsedAccount | null;
  readonly onPressGoogle: () => void;
  readonly onPressUseAnotherGoogleAccount: () => void;
}

function getFirstName(name: string): string {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return "Google";
  }

  const [firstName] = trimmedName.split(/\s+/);
  return firstName || "Google";
}

function AuthCtaBlock({
  isGoogleLoading,
  isLastUsedAccountLoading,
  isInteractionBlocked,
  lastUsedAccount,
  onPressGoogle,
  onPressUseAnotherGoogleAccount,
}: AuthCtaBlockProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const hasRecognizedAccount =
    !isLastUsedAccountLoading && lastUsedAccount !== null;
  const isPrimaryDisabled = isInteractionBlocked || isLastUsedAccountLoading;
  const googleCtaVariant = colorScheme === "dark" ? "primary" : "tertiary";
  const googlePrimaryTextClassName =
    googleCtaVariant === "primary" ? "text-background" : "text-foreground";
  const secondaryLabelClassName = "text-muted";
  return (
    <View className="w-full gap-2">
      <Button
        variant={googleCtaVariant}
        size="lg"
        isDisabled={isPrimaryDisabled}
        onPress={onPressGoogle}
      >
        {/* Skeleton temporariamente desativado para testes visuais ao vivo. */}

        {hasRecognizedAccount && lastUsedAccount ? (
          <View className="w-full flex-row items-center justify-center gap-3">
            <UserAvatar
              alt={`Conta Google de ${lastUsedAccount.name}`}
              className="h-8.5 w-8.5 rounded-full"
              email={lastUsedAccount.email}
              image={lastUsedAccount.avatarUrl}
              name={lastUsedAccount.name}
              userId={lastUsedAccount.userId}
            />

            <View className="min-w-0 flex-1">
              <Text className={`text-sm font-medium ${googlePrimaryTextClassName}`}>
                {`Continuar como ${getFirstName(lastUsedAccount.name)}`}
              </Text>
              <Text
                className={`text-sm ${secondaryLabelClassName}`}
                numberOfLines={1}
              >
                {lastUsedAccount.email}
              </Text>
            </View>

            <GoogleIcon width={22} height={22} />
            {isGoogleLoading ? (
              <Spinner
                color="default"
                size="sm"
                testID="google-loading-spinner"
              />
            ) : null}
          </View>
        ) : null}

        {!hasRecognizedAccount ? (
          <View className="w-full flex-row items-center justify-center gap-3">
            <GoogleIcon />
            <Text className={googlePrimaryTextClassName}>Continuar com Google</Text>
            {isGoogleLoading ? (
              <Spinner
                color="default"
                size="sm"
                testID="google-loading-spinner"
              />
            ) : null}
          </View>
        ) : null}
      </Button>

      {hasRecognizedAccount ? (
        <Button
          className="mt-2 w-full"
          variant="ghost"
          size="lg"
          isDisabled={isInteractionBlocked}
          onPress={onPressUseAnotherGoogleAccount}
        >
          <Button.Label className="text-sm">
            Entrar com outra conta Google
          </Button.Label>
        </Button>
      ) : null}
    </View>
  );
}

export { AuthCtaBlock };
export type { AuthCtaBlockProps };
