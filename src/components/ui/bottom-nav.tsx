import { UserAvatar } from "@/components/ui/avatar";
import GravityIcon, {
  type GravityIconName,
} from "@/components/ui/gravity-icon";
import React from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type ViewProps,
} from "react-native";
import { twMerge } from "tailwind-merge";

interface BottomNavRootProps extends ViewProps {
  readonly bottomInset?: number;
  readonly className?: string;
}

interface BottomNavItemProps extends Omit<
  PressableProps,
  "children" | "style"
> {
  readonly avatarImageUri?: string | null;
  readonly avatarName?: string;
  readonly className?: string;
  readonly icon: GravityIconName;
  readonly isActive?: boolean;
  readonly label: string;
  readonly tone?: "default" | "inverse";
}

const NAVIGATION_BAR_HEIGHT = 52;
const NAVIGATION_TOP_PADDING = 4;
const NAVIGATION_BASE_BOTTOM_PADDING = 4;
const MOBILE_BOTTOM_NAV_TOTAL_HEIGHT =
  NAVIGATION_BAR_HEIGHT +
  NAVIGATION_TOP_PADDING +
  NAVIGATION_BASE_BOTTOM_PADDING;

const ACTIVE_FILL_ICON_MAP: Partial<Record<GravityIconName, GravityIconName>> =
  {
    bell: "bell-fill",
    compass: "compass-fill",
    home: "home-fill",
    plus: "plus-fill",
    profile: "profile-fill",
  };

const BottomNavRoot = React.forwardRef<View, BottomNavRootProps>(
  function BottomNavRoot(
    {
      bottomInset = 0,
      children,
      className,
      style,
      ...props
    }: BottomNavRootProps,
    ref,
  ): React.JSX.Element {
    return (
      <View
        ref={ref}
        {...props}
        style={[
          {
            paddingBottom: bottomInset + NAVIGATION_BASE_BOTTOM_PADDING,
          },
          style,
        ]}
        className={twMerge(
          "absolute bottom-0 left-0 right-0 bg-background px-4",
          className,
        )}
      >
        <View className="h-12 flex-row items-center justify-between">
          {children}
        </View>
      </View>
    );
  },
);

const BottomNavItemComponent = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  BottomNavItemProps
>(function BottomNavItem(
  {
    avatarImageUri,
    avatarName,
    className,
    icon,
    isActive = false,
    label,
    tone = "default",
    ...props
  }: BottomNavItemProps,
  ref,
): React.JSX.Element {
  const showAvatar = avatarImageUri !== undefined || avatarName !== undefined;
  const resolvedIcon = isActive ? (ACTIVE_FILL_ICON_MAP[icon] ?? icon) : icon;
  const iconColor =
    tone === "inverse"
      ? isActive
        ? "rgba(255, 255, 255, 0.94)"
        : "rgba(255, 255, 255, 0.68)"
      : undefined;

  return (
    <Pressable
      ref={ref}
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      hitSlop={10}
      {...props}
      className={twMerge(
        "h-full flex-1 items-center justify-center",
        className,
      )}
    >
      {showAvatar ? (
        <UserAvatar
          alt={avatarName ?? label}
          className={twMerge(
            "size-7 rounded-full border",
            isActive ? "border-foreground" : "border-none",
          )}
          fallbackLabel={label}
          image={avatarImageUri}
          name={avatarName}
        />
      ) : (
        <GravityIcon
          color={iconColor}
          colorToken={isActive ? "foreground" : "muted"}
          name={resolvedIcon}
          size={26}
        />
      )}
    </Pressable>
  );
});

const BottomNavItem = React.memo(BottomNavItemComponent);

BottomNavRoot.displayName = "BottomNav";
BottomNavItemComponent.displayName = "BottomNav.Item";

const BottomNav = Object.assign(BottomNavRoot, {
  Item: BottomNavItem,
});

export { MOBILE_BOTTOM_NAV_TOTAL_HEIGHT };
export default BottomNav;
export type { BottomNavItemProps, BottomNavRootProps };
