import React from "react";
import { Text, View } from "react-native";
import { Radio, RadioGroup } from "@/components/ui";
import type { OnboardingOption } from "@/features/onboarding/types/onboarding-step-content";

interface OnboardingSingleSelectStepProps<TValue extends string> {
  readonly prompt: string;
  readonly helperText?: string;
  readonly options: readonly OnboardingOption<TValue>[];
  readonly selectedValue: TValue | null;
  readonly onSelectValue: (value: TValue) => void;
}

function OnboardingSingleSelectStep<TValue extends string>({
  prompt,
  helperText,
  options,
  selectedValue,
  onSelectValue,
}: OnboardingSingleSelectStepProps<TValue>): React.JSX.Element {
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

      <RadioGroup
        className="gap-3"
        onValueChange={(value) => {
          onSelectValue(value as TValue);
        }}
        value={selectedValue ?? undefined}
      >
        {options.map((option) => (
          <RadioGroup.Item
            variant="secondary"
            className={`rounded-2xl border px-4 py-4 ${
              selectedValue === option.value
                ? "border-accent bg-default"
                : "border-border bg-surface"
            }`}
            key={option.value}
            value={option.value}
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
            <Radio />
          </RadioGroup.Item>
        ))}
      </RadioGroup>
    </View>
  );
}

export { OnboardingSingleSelectStep };
export type { OnboardingSingleSelectStepProps };
