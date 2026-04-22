import React from "react";
import { type Href, useRouter } from "expo-router";
import {
  GravityIcon,
  HeaderIconButton,
  type GravityIconName,
} from "@/components/ui";

interface NativeHeaderIconButtonProps {
  readonly accessibilityLabel: string;
  readonly href: Href;
  readonly icon: GravityIconName;
}

function NativeHeaderIconButton({
  accessibilityLabel,
  href,
  icon,
}: NativeHeaderIconButtonProps): React.JSX.Element {
  const router = useRouter();

  return (
    <HeaderIconButton
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => router.push(href)}
    >
      <GravityIcon name={icon} size={18} />
    </HeaderIconButton>
  );
}

export { NativeHeaderIconButton };
export type { NativeHeaderIconButtonProps };
