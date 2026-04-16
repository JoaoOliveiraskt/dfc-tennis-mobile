import React from "react";
import { Pressable, Text, View } from "react-native";
import { Checkbox } from "@/components/ui";
import type { OnboardingOption } from "@/features/onboarding/types/onboarding-step-content";

interface OnboardingMultiSelectStepProps<TValue extends string> {
  readonly prompt: string;
  readonly helperText?: string;
  readonly options: readonly OnboardingOption<TValue>[];
  readonly selectedValues: readonly TValue[];
  readonly onToggleValue: (value: TValue) => void;
}

function OnboardingMultiSelectStep<TValue extends string>({
  prompt,
  helperText,
  options,
  selectedValues,
  onToggleValue,
}: OnboardingMultiSelectStepProps<TValue>): React.JSX.Element {
  return (
    <View className="gap-8 pt-0 pb-2">
      <View className="gap-1">
        <Text className="text-4xl font-semibold leading-tight tracking-tight text-foreground">
          {prompt}
        </Text>
        {helperText ? (
          <Text className="text-sm leading-5 text-muted">{helperText}</Text>
        ) : null}
      </View>

      <View className="gap-3">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);

          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              className={`flex-row items-center justify-between rounded-2xl border px-4 py-4 ${
                isSelected
                  ? "border-accent bg-default"
                  : "border-border bg-surface"
              }`}
              key={option.value}
              onPress={() => {
                onToggleValue(option.value);
              }}
            >
              <View className="flex-1 gap-1 pr-4">
                <Text className="text-lg font-medium text-foreground">
                  {option.label}
                </Text>
                {option.subtitle ? (
                  <Text className="text-sm leading-5 text-muted">
                    {option.subtitle}
                  </Text>
                ) : null}
              </View>

              <Checkbox
                variant="secondary"
                isSelected={isSelected}
                pointerEvents="none"
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export { OnboardingMultiSelectStep };
export type { OnboardingMultiSelectStepProps };
