import { Button, Spinner } from "@/components/ui";
import React from "react";
import { Text, View } from "react-native";
import { GoogleIcon } from "@/features/auth/components/icons/google-icon";

interface AuthCtaBlockProps {
  readonly errorMessage: string | null;
  readonly isGoogleLoading: boolean;
  readonly isInteractionBlocked: boolean;
  readonly onPressGoogle: () => void;
}

function AuthCtaBlock({
  errorMessage,
  isGoogleLoading,
  isInteractionBlocked,
  onPressGoogle,
}: AuthCtaBlockProps): React.JSX.Element {
  return (
    <View className="gap-6">
      <View>
        <Button
          className="bg-white"
          variant="tertiary"
          size="lg"
          isDisabled={isInteractionBlocked}
          onPress={onPressGoogle}
        >
          <View className="flex-row items-center justify-center gap-3">
            <GoogleIcon />
            <Button.Label className="text-black">
              {isGoogleLoading
                ? "Conectando com Google..."
                : "Continuar com Google"}
            </Button.Label>
            {isGoogleLoading ? (
              <Spinner
                color="default"
                size="sm"
                testID="google-loading-spinner"
              />
            ) : null}
          </View>
        </Button>
      </View>

      <View className="items-center justify-center mt-2">
        {errorMessage ? (
          <Text className="mb-2 text-center text-sm text-foreground">
            {errorMessage}
          </Text>
        ) : null}

        <View className="flex-row items-center justify-center gap-1.5">
          <Text className="text-center text-xs leading-5 text-muted">
            Entre e comece a jogar agora.
          </Text>
        </View>
      </View>
    </View>
  );
}

export { AuthCtaBlock };
export type { AuthCtaBlockProps };
