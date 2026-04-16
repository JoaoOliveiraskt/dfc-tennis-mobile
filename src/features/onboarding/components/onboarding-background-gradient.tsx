import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { useAppThemeColor } from "@/components/ui";

function OnboardingBackgroundGradient(): React.JSX.Element {
  const accentColor = useAppThemeColor("accent");
  const backgroundColor = useAppThemeColor("background");

  return (
    <View className="pointer-events-none absolute -left-20 -right-20 -top-40 h-150 opacity-20">
      <LinearGradient
        colors={[accentColor, backgroundColor]}
        end={{ x: 0.5, y: 1 }}
        start={{ x: 0.5, y: 0 }}
        style={{ flex: 1 }}
      />
    </View>
  );
}

export { OnboardingBackgroundGradient };
