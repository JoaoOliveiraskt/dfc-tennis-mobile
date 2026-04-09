import React from "react";
import {
  Text,
  type TextProps,
} from "react-native";
import { twMerge } from "tailwind-merge";

interface AppTextProps extends TextProps {
  readonly className?: string;
}

function AppText({ className, ...props }: AppTextProps): React.JSX.Element {
  return (
    <Text
      {...props}
      className={twMerge("text-foreground", className)}
    />
  );
}

export default AppText;
export type { AppTextProps };
