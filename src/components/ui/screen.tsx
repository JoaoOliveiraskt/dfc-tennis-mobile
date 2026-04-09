import React from "react";
import {
  View,
  type ViewProps,
} from "react-native";
import { twMerge } from "tailwind-merge";

interface ScreenProps extends ViewProps {
  readonly className?: string;
}

function Screen({ className, ...props }: ScreenProps): React.JSX.Element {
  return (
    <View
      {...props}
      className={twMerge("bg-background", className)}
    />
  );
}

export default Screen;
export type { ScreenProps };
