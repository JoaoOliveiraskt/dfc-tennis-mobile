import React from "react";
import { Image, Text, View } from "react-native";

interface OnboardingWelcomeStepProps {
  readonly headline: string;
  readonly description: string;
}

const AVATAR_IMAGE = require("../../../../assets/images/avatar1.png");

function OnboardingWelcomeStep({
  headline,
  description,
}: OnboardingWelcomeStepProps): React.JSX.Element {
  return (
    <View className="w-full flex-1">
      <View className="flex-1 w-full mt-4 mb-2 z-10 relative">
        <View className="z-20 flex-1 pt-14">
          <View>
            <Text className="text-5xl font-black text-muted leading-14 tracking-tight">
              Eu já
            </Text>
            <Text className="text-5xl font-black text-muted leading-14 tracking-tight">
              reservei
            </Text>
            <Text className="text-5xl font-black text-muted leading-14 tracking-tight">
              o meu jogo
            </Text>
            <Text className="text-5xl font-black text-muted leading-14 tracking-tight">
              de hoje.
            </Text>

            <Text className="mt-12 text-5xl font-black text-foreground leading-14 tracking-tighter">
              Vamos jogar?
            </Text>
          </View>
        </View>

        <View className="pointer-events-none absolute -bottom-28 -right-35 z-50 h-[120%] w-96 justify-end">
          <Image
            className="w-full h-full"
            resizeMode="contain"
            source={AVATAR_IMAGE}
          />
        </View>
      </View>

      {/* Optional fallback for original headline/description context */}
      <View className="items-center z-10">
        <Text className="text-xs font-semibold text-muted text-center max-w-60">
          {description || headline}
        </Text>
      </View>
    </View>
  );
}

export { OnboardingWelcomeStep };
export type { OnboardingWelcomeStepProps };
