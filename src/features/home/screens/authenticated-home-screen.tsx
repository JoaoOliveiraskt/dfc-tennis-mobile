import React from "react";
import { Button, Screen } from "@/components/ui";
import { Text } from "react-native";
import { useRequireAuthenticatedUser, useSignOut } from "@/features/auth";

function AuthenticatedHomeScreen(): React.JSX.Element {
  const sessionState = useRequireAuthenticatedUser();
  const { errorMessage, isLoading, isSessionPending, signOut } = useSignOut();

  if (sessionState.isPending || !sessionState.data?.user) {
    return <Screen className="flex-1 bg-background" />;
  }

  return (
    <Screen className="flex-1 items-center justify-center gap-6 bg-background px-8">
      <Text className="text-center text-3xl font-semibold tracking-tight text-foreground">
        Authenticated Home
      </Text>

      <Button
        className="w-full"
        variant="outline"
        size="lg"
        isDisabled={isLoading || isSessionPending}
        onPress={signOut}
      >
        {isLoading ? "Saindo..." : "Sair"}
      </Button>

      {errorMessage ? (
        <Text className="text-center text-sm text-foreground">
          {errorMessage}
        </Text>
      ) : null}
    </Screen>
  );
}

export { AuthenticatedHomeScreen };
