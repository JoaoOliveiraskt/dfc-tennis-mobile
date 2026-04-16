import React from "react";
import {
  Button as HeroButton,
  type ButtonLabelProps,
  type ButtonRootProps as HeroButtonRootProps,
} from "heroui-native";
import { twMerge } from "tailwind-merge";

type NativeButtonVariant = NonNullable<HeroButtonRootProps["variant"]>;
type ButtonVariant = NativeButtonVariant;

interface ButtonRootProps extends Omit<HeroButtonRootProps, "variant"> {
  readonly variant?: ButtonVariant;
}

const PRIMARY_VARIANT: ButtonVariant = "primary";
const PRIMARY_ROOT_CLASS_NAME = "bg-foreground";
const PRIMARY_LABEL_CLASS_NAME = "text-background";

const ButtonLabel = React.forwardRef<
  React.ComponentRef<typeof HeroButton.Label>,
  ButtonLabelProps
>(function ButtonLabel(
  { className, ...props }: ButtonLabelProps,
  ref,
): React.JSX.Element {
  return <HeroButton.Label ref={ref} className={className} {...props} />;
});

ButtonLabel.displayName = "ButtonLabel";

function withPrimaryLabelColor(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return (
        <ButtonLabel className={PRIMARY_LABEL_CLASS_NAME}>{child}</ButtonLabel>
      );
    }

    if (
      React.isValidElement<ButtonLabelProps>(child) &&
      child.type === ButtonLabel
    ) {
      return React.cloneElement(child, {
        className: twMerge(PRIMARY_LABEL_CLASS_NAME, child.props.className),
      });
    }

    return child;
  });
}

const ButtonRoot = React.forwardRef<
  React.ComponentRef<typeof HeroButton>,
  ButtonRootProps
>(function ButtonRoot(
  {
    variant,
    className,
    children,
    ...props
  }: ButtonRootProps,
  ref,
): React.JSX.Element {
  const isCustomPrimaryVariant = variant === PRIMARY_VARIANT;
  const nativeVariant: NativeButtonVariant | undefined = isCustomPrimaryVariant
    ? "secondary"
    : variant;
  const rootClassName = isCustomPrimaryVariant
    ? twMerge(PRIMARY_ROOT_CLASS_NAME, className)
    : className;
  const resolvedChildren = isCustomPrimaryVariant
    ? withPrimaryLabelColor(children)
    : children;
  const nativeButtonProps = {
    ...props,
    variant: nativeVariant,
    className: rootClassName,
    children: resolvedChildren,
  } as HeroButtonRootProps;

  return <HeroButton ref={ref} {...nativeButtonProps} />;
});

ButtonRoot.displayName = "Button";

const CompoundButton = Object.assign(ButtonRoot, {
  Label: ButtonLabel,
});

export default CompoundButton;
export type { ButtonLabelProps, ButtonRootProps, ButtonVariant };
