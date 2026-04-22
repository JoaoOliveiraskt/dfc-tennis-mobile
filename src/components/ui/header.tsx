import useAppThemeColor from "@/components/ui/use-app-theme-color";
import ArrowLeftIcon from "@gravity-ui/icons/svgs/arrow-left.svg";
import React, { createContext, useContext } from "react";
import {
  Text,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type TextProps,
  type ViewProps,
} from "react-native";
import { twMerge } from "tailwind-merge";
import HeaderIconButton from "@/components/ui/header-icon-button";

type HeaderMode = "inner" | "root";

interface HeaderRootProps extends ViewProps {
  readonly className?: string;
  readonly mode: HeaderMode;
  readonly topInset?: number;
}

interface HeaderContentProps extends ViewProps {
  readonly className?: string;
}

interface HeaderTitleProps extends TextProps {
  readonly className?: string;
}

interface HeaderActionsProps extends ViewProps {
  readonly className?: string;
}

interface HeaderBackButtonProps extends Omit<
  PressableProps,
  "children" | "onPress"
> {
  readonly className?: string;
  readonly label?: string;
  readonly onPress?: (event: GestureResponderEvent) => void;
}

const ROOT_CONTENT_HEIGHT = 72;
const INNER_CONTENT_HEIGHT = 56;

const HeaderContext = createContext<{ mode: HeaderMode }>({
  mode: "root",
});

function useHeaderContext(): { mode: HeaderMode } {
  return useContext(HeaderContext);
}

const HeaderRoot = React.forwardRef<View, HeaderRootProps>(function HeaderRoot(
  { children, className, mode, style, topInset = 0, ...props }: HeaderRootProps,
  ref,
): React.JSX.Element {
  const contentHeight =
    mode === "root" ? ROOT_CONTENT_HEIGHT : INNER_CONTENT_HEIGHT;

  return (
    <HeaderContext.Provider value={{ mode }}>
      <View
        ref={ref}
        {...props}
        style={[
          {
            minHeight: contentHeight + topInset,
            paddingTop: topInset,
          },
          style,
        ]}
        className={twMerge("bg-background px-5", className)}
      >
        {children}
      </View>
    </HeaderContext.Provider>
  );
});

const HeaderContent = React.forwardRef<View, HeaderContentProps>(
  function HeaderContent(
    { className, ...props }: HeaderContentProps,
    ref,
  ): React.JSX.Element {
    const { mode } = useHeaderContext();

    return (
      <View
        ref={ref}
        {...props}
        className={twMerge(
          "w-full flex-row justify-between",
          mode === "root" ? "min-h-14 items-end pb-2" : "min-h-14 items-center",
          className,
        )}
      />
    );
  },
);

const HeaderTitle = React.forwardRef<Text, HeaderTitleProps>(
  function HeaderTitle(
    { className, ...props }: HeaderTitleProps,
    ref,
  ): React.JSX.Element {
    const { mode } = useHeaderContext();

    return (
      <Text
        ref={ref}
        {...props}
        className={twMerge(
          "text-foreground",
          mode === "root"
            ? "text-2xl font-semibold leading-8 tracking-[-0.6px]"
            : "text-base font-semibold leading-5 tracking-[0px]",
          className,
        )}
      />
    );
  },
);

const HeaderActions = React.forwardRef<View, HeaderActionsProps>(
  function HeaderActions(
    { className, ...props }: HeaderActionsProps,
    ref,
  ): React.JSX.Element {
    return (
      <View
        ref={ref}
        {...props}
        className={twMerge(
          "ml-4 flex-row items-center justify-end gap-2.5",
          className,
        )}
      />
    );
  },
);

const HeaderBackButton = React.forwardRef<
  React.ComponentRef<typeof HeaderIconButton>,
  HeaderBackButtonProps
>(function HeaderBackButton(
  {
    accessibilityLabel,
    className,
    label = "Go back",
    onPress,
    ...props
  }: HeaderBackButtonProps,
  ref,
): React.JSX.Element {
  const iconColor = useAppThemeColor("foreground");

  return (
    <HeaderIconButton
      ref={ref}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      hitSlop={props.hitSlop ?? 12}
      onPress={onPress}
      {...props}
      className={className}
    >
      <ArrowLeftIcon color={iconColor} height={16} width={16} />
    </HeaderIconButton>
  );
});

HeaderRoot.displayName = "Header";
HeaderContent.displayName = "Header.Content";
HeaderTitle.displayName = "Header.Title";
HeaderActions.displayName = "Header.Actions";
HeaderBackButton.displayName = "Header.BackButton";

const Header = Object.assign(HeaderRoot, {
  Actions: HeaderActions,
  BackButton: HeaderBackButton,
  Content: HeaderContent,
  Title: HeaderTitle,
});

export default Header;
export type {
  HeaderActionsProps,
  HeaderBackButtonProps,
  HeaderContentProps,
  HeaderMode,
  HeaderRootProps,
  HeaderTitleProps,
};
