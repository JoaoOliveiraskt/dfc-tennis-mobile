import React from "react";
import {
  Button as HeroButton,
  type ButtonLabelProps,
  type ButtonRootProps as HeroButtonRootProps,
} from "heroui-native";
import { twMerge } from "tailwind-merge";

type NativeButtonVariant = NonNullable<HeroButtonRootProps["variant"]>;
type NativeButtonSize = NonNullable<HeroButtonRootProps["size"]>;
type ButtonVariant = NativeButtonVariant | "link";
type ButtonSize = NativeButtonSize | "xs" | "icon-xs";

interface ButtonRootProps extends Omit<HeroButtonRootProps, "size" | "variant"> {
  readonly size?: ButtonSize;
  readonly variant?: ButtonVariant;
}

const PRIMARY_VARIANT: ButtonVariant = "primary";
const PRIMARY_ROOT_CLASS_NAME = "bg-foreground";
const PRIMARY_LABEL_CLASS_NAME = "text-background";
const LINK_VARIANT: ButtonVariant = "link";
const LINK_ROOT_CLASS_NAME = "bg-transparent border-0 px-0 py-0 min-h-0";
const LINK_LABEL_CLASS_NAME = "text-primary";
const XS_ROOT_CLASS_NAME = "h-8 min-h-8 rounded-full px-3 py-0";
const ICON_XS_ROOT_CLASS_NAME = "size-8 min-h-8 rounded-full px-0 py-0";

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

function withLinkLabelColor(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return <ButtonLabel className={LINK_LABEL_CLASS_NAME}>{child}</ButtonLabel>;
    }

    if (
      React.isValidElement<ButtonLabelProps>(child) &&
      child.type === ButtonLabel
    ) {
      return React.cloneElement(child, {
        className: twMerge(LINK_LABEL_CLASS_NAME, child.props.className),
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
    size,
    className,
    children,
    ...props
  }: ButtonRootProps,
  ref,
): React.JSX.Element {
  const isCustomPrimaryVariant = variant === PRIMARY_VARIANT;
  const isCustomLinkVariant = variant === LINK_VARIANT;
  const nativeVariant: NativeButtonVariant | undefined = isCustomPrimaryVariant
    ? "secondary"
    : isCustomLinkVariant
      ? "ghost"
      : variant;
  const isIconXs = size === "icon-xs";
  const isXs = size === "xs";
  const nativeSize: NativeButtonSize | undefined =
    isIconXs || isXs ? "sm" : size;
  const sizeClassName = isIconXs
    ? ICON_XS_ROOT_CLASS_NAME
    : isXs
      ? XS_ROOT_CLASS_NAME
      : undefined;
  const rootClassName = isCustomPrimaryVariant
    ? twMerge(PRIMARY_ROOT_CLASS_NAME, sizeClassName, className)
    : isCustomLinkVariant
      ? twMerge(LINK_ROOT_CLASS_NAME, sizeClassName, className)
      : twMerge(sizeClassName, className);
  const resolvedChildren = isCustomPrimaryVariant
    ? withPrimaryLabelColor(children)
    : isCustomLinkVariant
      ? withLinkLabelColor(children)
      : children;
  const nativeButtonProps = {
    ...props,
    variant: nativeVariant,
    size: nativeSize,
    hitSlop: isIconXs || isXs ? (props.hitSlop ?? 8) : props.hitSlop,
    isIconOnly: isIconXs ? true : props.isIconOnly,
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
export type { ButtonLabelProps, ButtonRootProps, ButtonSize, ButtonVariant };
