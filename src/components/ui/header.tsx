import useAppThemeColor from "@/components/ui/use-app-theme-color";
import ChevronLeftIcon from "@gravity-ui/icons/svgs/chevron-left.svg";
import React, { createContext, useContext } from "react";
import {
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type TextProps,
  type ViewProps,
} from "react-native";
import { twMerge } from "tailwind-merge";

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
            ? "text-2xl font-semibold leading-[40px] tracking-[-1.2px]"
            : "text-xl font-semibold leading-6 tracking-[-0.4px]",
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
  React.ComponentRef<typeof Pressable>,
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
    <Pressable
      ref={ref}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      hitSlop={12}
      onPress={onPress}
      {...props}
      className={twMerge(
        "size-8 items-center justify-center rounded-full bg-surface",
        className,
      )}
    >
      <ChevronLeftIcon color={iconColor} height={20} width={20} />
    </Pressable>
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
