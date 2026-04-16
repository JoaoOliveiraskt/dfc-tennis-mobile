import React from "react";
import { Image, Text, View } from "react-native";

interface OnboardingWelcomeStepProps {
  readonly headline: string;
}

const AVATAR_IMAGE = require("../../../../assets/images/avatar1.png");

function OnboardingWelcomeStep({
  headline,
}: OnboardingWelcomeStepProps): React.JSX.Element {
  return (
    <View className="w-full flex-1">
      <View className="flex-1 w-full z-10 justify-center">
        <View className="items-center">
          <Image
            className="h-[74%] w-[420px]"
            resizeMode="contain"
            source={AVATAR_IMAGE}
          />
          <Text className="text-4xl font-black uppercase text-foreground  tracking-tight text-center">
            {headline}
          </Text>
        </View>
      </View>
    </View>
  );
}

export { OnboardingWelcomeStep };
export type { OnboardingWelcomeStepProps };
