import React from "react";
import { View } from "react-native";
import { Button } from "@/components/ui";

interface OnboardingStickyCtaProps {
  readonly bottomInset: number;
  readonly label: string;
  readonly isDisabled: boolean;
  readonly onPress: () => void;
}

function OnboardingStickyCta({
  bottomInset,
  label,
  isDisabled,
  onPress,
}: OnboardingStickyCtaProps): React.JSX.Element {
  return (
    <View
      className="w-full bg-background px-6 pt-4"
      style={{ paddingBottom: Math.max(bottomInset, 32) }}
    >
      <Button variant="primary" isDisabled={isDisabled} onPress={onPress} size="lg">
        {label}
      </Button>
    </View>
  );
}

export { OnboardingStickyCta };
export type { OnboardingStickyCtaProps };
