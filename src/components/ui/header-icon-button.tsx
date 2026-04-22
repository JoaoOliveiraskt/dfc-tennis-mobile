import React from "react";
import { twMerge } from "tailwind-merge";
import Button, { type ButtonRootProps } from "@/components/ui/button";

type HeaderIconButtonTone = "default" | "overlay";

interface HeaderIconButtonProps
  extends Omit<ButtonRootProps, "size" | "variant"> {
  readonly tone?: HeaderIconButtonTone;
}

const HeaderIconButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  HeaderIconButtonProps
>(function HeaderIconButton(
  { className, tone = "default", ...props }: HeaderIconButtonProps,
  ref,
): React.JSX.Element {
  return (
    <Button
      {...props}
      ref={ref}
      variant="tertiary"
      size="icon-xs"
      className={twMerge(
        tone === "overlay" ? "border-white/20 bg-black/35" : undefined,
        className,
      )}
    />
  );
});

HeaderIconButton.displayName = "HeaderIconButton";

export default HeaderIconButton;
export type { HeaderIconButtonProps, HeaderIconButtonTone };
