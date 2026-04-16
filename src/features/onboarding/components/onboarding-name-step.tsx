import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { TextInput, View } from "react-native";
import { Onboarding } from "@/components/onboarding";
import { useAppThemeColor } from "@/components/ui";

interface OnboardingNameStepProps {
  readonly firstName: string;
  readonly lastName: string;
  readonly firstNamePlaceholder: string;
  readonly lastNamePlaceholder: string;
  readonly onFirstNameChange: (value: string) => void;
  readonly onLastNameChange: (value: string) => void;
}

function OnboardingNameStep({
  firstName,
  lastName,
  firstNamePlaceholder,
  lastNamePlaceholder,
  onFirstNameChange,
  onLastNameChange,
}: OnboardingNameStepProps): React.JSX.Element {
  const textColor = useAppThemeColor("foreground");
  const placeholderColor = useAppThemeColor("muted");
  const cursorColor = useAppThemeColor("foreground");
  const dividerColor = useAppThemeColor("border");

  return (
    <Onboarding.Content className="flex-1 justify-center pb-16">
      <View className="w-full">
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          cursorColor={cursorColor}
          maxLength={32}
          onChangeText={onFirstNameChange}
          placeholder={firstNamePlaceholder}
          placeholderTextColor={placeholderColor}
          returnKeyType="next"
          selectionColor={cursorColor}
          style={{ color: textColor }}
          textAlign="center"
          value={firstName}
          className="h-20 bg-transparent px-0 text-center text-xl font-semibold tracking-tight"
        />

        <LinearGradient
          colors={["transparent", dividerColor, "transparent"]}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={{ height: 1, width: "100%" }}
        />

        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          cursorColor={cursorColor}
          maxLength={48}
          onChangeText={onLastNameChange}
          placeholder={lastNamePlaceholder}
          placeholderTextColor={placeholderColor}
          selectionColor={cursorColor}
          style={{ color: textColor }}
          textAlign="center"
          value={lastName}
          className="h-20 bg-transparent px-0 text-center text-xl font-semibold tracking-tight"
        />
      </View>
    </Onboarding.Content>
  );
}

export { OnboardingNameStep };
export type { OnboardingNameStepProps };
