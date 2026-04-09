import React from "react";
import { StyleSheet } from "react-native";
import { AppText, Screen } from "@/components/ui";

function AuthSignScreen(): React.JSX.Element {
  return (
    <Screen className="flex-1 items-center justify-center bg-background">
      <AppText style={styles.title} className="text-foreground">
        SIGN
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
});

export { AuthSignScreen };
