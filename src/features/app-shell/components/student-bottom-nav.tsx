import { BottomNav } from "@/components/ui";
import { studentBottomNavItems } from "@/features/app-shell/config/student-bottom-nav-items";
import type { ShellRouteKey } from "@/features/app-shell/types/shell-route";
import { type Href, useRouter } from "expo-router";
import React from "react";

interface StudentBottomNavProps {
  readonly activeRouteKey: ShellRouteKey;
  readonly bottomInset: number;
  readonly userImage: string | null;
  readonly userName: string;
}

function StudentBottomNav({
  activeRouteKey,
  bottomInset,
  userImage,
  userName,
}: StudentBottomNavProps): React.JSX.Element {
  const router = useRouter();
  const handleTabPress = React.useCallback(
    (targetRouteKey: ShellRouteKey, href: Href) => {
      if (activeRouteKey === targetRouteKey) {
        return;
      }

      router.navigate(href);
    },
    [activeRouteKey, router],
  );

  return (
    <BottomNav
      bottomInset={bottomInset}
      className={activeRouteKey === "home" ? "bg-black" : undefined}
    >
      {studentBottomNavItems.map((item) => (
        <BottomNav.Item
          key={item.key}
          icon={item.icon}
          label={item.label}
          isActive={activeRouteKey === item.key}
          tone={activeRouteKey === "home" ? "inverse" : "default"}
          avatarImageUri={item.key === "conta" ? userImage : undefined}
          avatarName={item.key === "conta" ? userName : undefined}
          onPress={() => handleTabPress(item.key, item.href)}
        />
      ))}
    </BottomNav>
  );
}

export { StudentBottomNav };
export type { StudentBottomNavProps };
