import React from "react";
import { useRouter } from "expo-router";
import { BottomNav } from "@/components/ui";
import { coachBottomNavItems } from "@/features/app-shell/config/coach-bottom-nav-items";
import type { ShellRouteKey } from "@/features/app-shell/types/shell-route";

interface CoachBottomNavProps {
  readonly activeRouteKey: ShellRouteKey;
  readonly bottomInset: number;
  readonly userImage: string | null;
  readonly userName: string;
}

function CoachBottomNav({
  activeRouteKey,
  bottomInset,
  userImage,
  userName,
}: CoachBottomNavProps): React.JSX.Element {
  const router = useRouter();

  return (
    <BottomNav bottomInset={bottomInset}>
      {coachBottomNavItems.map((item) => (
        <BottomNav.Item
          key={item.key}
          icon={item.icon}
          label={item.label}
          isActive={activeRouteKey === item.key}
          avatarImageUri={item.key === "conta" ? userImage : undefined}
          avatarName={item.key === "conta" ? userName : undefined}
          onPress={() => router.replace(item.href)}
        />
      ))}
    </BottomNav>
  );
}

export { CoachBottomNav };
export type { CoachBottomNavProps };
