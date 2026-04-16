import React from "react";
import { Onboarding } from "@/components/onboarding";

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
    <Onboarding.Footer
      style={{ paddingBottom: Math.max(bottomInset, 32) }}
    >
      <Onboarding.FooterCta
        isDisabled={isDisabled}
        label={label}
        onPress={onPress}
        size="lg"
      />
    </Onboarding.Footer>
  );
}

export { OnboardingStickyCta };
export type { OnboardingStickyCtaProps };
