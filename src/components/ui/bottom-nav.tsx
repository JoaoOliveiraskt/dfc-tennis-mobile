import React from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type ViewProps,
} from "react-native";
import { twMerge } from "tailwind-merge";
import Avatar from "@/components/ui/avatar";
import GravityIcon, { type GravityIconName } from "@/components/ui/gravity-icon";

interface BottomNavRootProps extends ViewProps {
  readonly bottomInset?: number;
  readonly className?: string;
}

interface BottomNavItemProps
  extends Omit<PressableProps, "children" | "style"> {
  readonly avatarImageUri?: string | null;
  readonly avatarName?: string;
  readonly className?: string;
  readonly icon: GravityIconName;
  readonly isActive?: boolean;
  readonly label: string;
}

const NAVIGATION_BAR_HEIGHT = 52;
const NAVIGATION_TOP_PADDING = 4;
const NAVIGATION_BASE_BOTTOM_PADDING = 4;
const MOBILE_BOTTOM_NAV_TOTAL_HEIGHT =
  NAVIGATION_BAR_HEIGHT + NAVIGATION_TOP_PADDING + NAVIGATION_BASE_BOTTOM_PADDING;

const ACTIVE_FILL_ICON_MAP: Partial<Record<GravityIconName, GravityIconName>> = {
  bell: "bell-fill",
  compass: "compass-fill",
  home: "home-fill",
  plus: "plus-fill",
  profile: "profile-fill",
};

function getAvatarFallback(name?: string): string {
  const source = name?.trim() ?? "";
  if (!source) {
    return "U";
  }

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  return parts[0].slice(0, 2).toUpperCase();
}

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
          "absolute bottom-0 left-0 right-0 bg-background px-4 pt-1",
          className,
        )}
      >
        <View className="h-[52px] flex-row items-center justify-between">
          {children}
        </View>
      </View>
    );
  },
);

const BottomNavItemComponent = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  BottomNavItemProps
>(
  function BottomNavItem(
    {
      avatarImageUri,
      avatarName,
      className,
      icon,
      isActive = false,
      label,
      ...props
    }: BottomNavItemProps,
    ref,
  ): React.JSX.Element {
    const showAvatar = avatarImageUri !== undefined || avatarName !== undefined;
    const colorToken = isActive ? "foreground" : "muted";
    const resolvedIcon = isActive
      ? (ACTIVE_FILL_ICON_MAP[icon] ?? icon)
      : icon;

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
          <Avatar
            alt={avatarName ?? label}
            animation="disable-all"
            className={twMerge(
              "size-7 rounded-full border",
              isActive ? "border-foreground" : "border-transparent",
            )}
            variant="default"
          >
            {avatarImageUri ? (
              <Avatar.Image
                source={{ uri: avatarImageUri }}
                animation={false}
              />
            ) : null}
            <Avatar.Fallback animation="disabled" delayMs={120}>
              {getAvatarFallback(avatarName ?? label)}
            </Avatar.Fallback>
          </Avatar>
        ) : (
          <GravityIcon colorToken={colorToken} name={resolvedIcon} size={26} />
        )}
      </Pressable>
    );
  },
);

const BottomNavItem = React.memo(BottomNavItemComponent);

BottomNavRoot.displayName = "BottomNav";
BottomNavItemComponent.displayName = "BottomNav.Item";

const BottomNav = Object.assign(BottomNavRoot, {
  Item: BottomNavItem,
});

export { MOBILE_BOTTOM_NAV_TOTAL_HEIGHT };
export default BottomNav;
export type { BottomNavItemProps, BottomNavRootProps };
