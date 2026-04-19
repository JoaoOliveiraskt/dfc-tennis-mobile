import React from "react";
import { Text, type TextProps } from "react-native";
import { twMerge } from "tailwind-merge";

interface BrandWordmarkProps extends TextProps {
  readonly className?: string;
}

function BrandWordmark({
  className,
  ...props
}: BrandWordmarkProps): React.JSX.Element {
  return (
    <Text
      {...props}
      className={twMerge(
        "text-sm font-black uppercase tracking-[0.22em] text-foreground",
        className,
      )}
    >
      DFCTENNIS
    </Text>
  );
}

export default BrandWordmark;
export type { BrandWordmarkProps };
