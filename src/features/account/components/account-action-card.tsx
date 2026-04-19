import React from "react";
import { Pressable, Text, View } from "react-native";
import { GravityIcon } from "@/components/ui";

interface AccountActionCardProps {
  readonly icon: "edit" | "wallet";
  readonly label: string;
  readonly onPress?: () => void;
}

function AccountActionCard({
  icon,
  label,
  onPress,
}: AccountActionCardProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-1 rounded-[24px] bg-surface px-4 py-4"
    >
      <View className="flex-row items-center gap-3">
        <View className="size-11 items-center justify-center rounded-full bg-background">
          <GravityIcon name={icon} size={20} />
        </View>
        <Text className="text-base font-semibold text-foreground">{label}</Text>
      </View>
    </Pressable>
  );
}

export { AccountActionCard };
