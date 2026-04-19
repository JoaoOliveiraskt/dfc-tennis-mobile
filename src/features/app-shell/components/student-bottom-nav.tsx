import React from "react";
import { useRouter } from "expo-router";
import { BottomNav } from "@/components/ui";
import { studentBottomNavItems } from "@/features/app-shell/config/student-bottom-nav-items";
import type { ShellRouteKey } from "@/features/app-shell/types/shell-route";

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

  return (
    <BottomNav bottomInset={bottomInset}>
      {studentBottomNavItems.map((item) => (
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

export { StudentBottomNav };
export type { StudentBottomNavProps };
