import React from "react";
import { StyleSheet } from "react-native";
import StaggeredText from "@/components/animations/reacticx/organisms/animated-text";
import { Screen, useAppThemeColor } from "@/components/ui";
import { useSplashSequence } from "../hooks/use-splash-sequence";

const WORDMARK = "DFCTENNIS";

function SplashScreen(): React.JSX.Element {
  const foregroundColor = useAppThemeColor("foreground");
  const { shouldPlayAnimation, onLayoutReady, onWordRevealComplete } =
    useSplashSequence();

  return (
    <Screen
      onLayout={onLayoutReady}
      className="flex-1 items-center justify-center bg-background"
    >
      {shouldPlayAnimation ? (
        <StaggeredText
          text={WORDMARK}
          direction="rtl"
          style={[styles.wordmark, { color: foregroundColor }]}
          onRevealComplete={onWordRevealComplete}
          animationConfig={{
            characterDelay: 78,
            characterEnterDuration: 360,
            characterExitDuration: 220,
            layoutTransitionDuration: 240,
            spring: {
              damping: 20,
              stiffness: 220,
              mass: 0.7,
            },
            maxBlurIntensity: 0,
          }}
          enterFrom={{
            opacity: 0,
            translateY: 8,
            scale: 0.96,
            rotate: 0,
          }}
          enterTo={{
            opacity: 1,
            translateY: 0,
            scale: 1,
            rotate: 0,
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontSize: 38,
    fontWeight: "700",
    letterSpacing: -1.4,
    textAlign: "center",
  },
});

export { SplashScreen };
