import React from "react";
import { Pressable, View } from "react-native";
import { Onboarding } from "@/components/onboarding";
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
    <Onboarding.Content className="gap-8 pt-0 pb-2">
      <View className="gap-1">
        <Onboarding.Copy className="text-4xl font-semibold leading-tight tracking-tight text-foreground">
          {prompt}
        </Onboarding.Copy>
        {helperText ? (
          <Onboarding.Copy className="text-sm leading-5 text-muted">
            {helperText}
          </Onboarding.Copy>
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
                <Onboarding.Copy className="text-lg font-medium text-foreground">
                  {option.label}
                </Onboarding.Copy>
                {option.subtitle ? (
                  <Onboarding.Copy className="text-sm leading-5 text-muted">
                    {option.subtitle}
                  </Onboarding.Copy>
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
    </Onboarding.Content>
  );
}

export { OnboardingMultiSelectStep };
export type { OnboardingMultiSelectStepProps };
