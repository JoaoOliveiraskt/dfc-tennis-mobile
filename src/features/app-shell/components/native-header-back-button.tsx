import React from "react";
import { type Href, useRouter } from "expo-router";
import ChevronLeftIcon from "@gravity-ui/icons/svgs/chevron-left.svg";
import { HeaderIconButton } from "@/components/ui";
import useAppThemeColor from "@/components/ui/use-app-theme-color";

interface NativeHeaderBackButtonProps {
  readonly accessibilityLabel?: string;
  readonly fallbackHref?: Href;
}

function NativeHeaderBackButton({
  accessibilityLabel = "Voltar",
  fallbackHref = "/(app)/(shell)/home",
}: NativeHeaderBackButtonProps): React.JSX.Element {
  const router = useRouter();
  const iconColor = useAppThemeColor("foreground");

  return (
    <HeaderIconButton
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={10}
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }

        router.replace(fallbackHref);
      }}
    >
      <ChevronLeftIcon color={iconColor} height={16} width={16} />
    </HeaderIconButton>
  );
}

export { NativeHeaderBackButton };
export type { NativeHeaderBackButtonProps };
