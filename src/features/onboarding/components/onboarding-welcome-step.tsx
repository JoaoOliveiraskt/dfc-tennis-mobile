import React from "react";
import { Image, View } from "react-native";
import { Onboarding } from "@/components/onboarding";

interface OnboardingWelcomeStepProps {
  readonly headline: string;
}

const AVATAR_IMAGE = require("../../../../assets/images/avatar1.png");

function OnboardingWelcomeStep({
  headline,
}: OnboardingWelcomeStepProps): React.JSX.Element {
  return (
    <Onboarding.Content className="w-full flex-1">
      <Onboarding.Hero className="flex-1 w-full z-10 justify-center">
        <View className="items-center">
          <Image
            className="h-[74%] w-[420px]"
            resizeMode="contain"
            source={AVATAR_IMAGE}
          />
          <Onboarding.Copy
            className="text-4xl font-black text-foreground  tracking-tight text-center"
            uppercase
          >
            {headline}
          </Onboarding.Copy>
        </View>
      </Onboarding.Hero>
    </Onboarding.Content>
  );
}

export { OnboardingWelcomeStep };
export type { OnboardingWelcomeStepProps };
