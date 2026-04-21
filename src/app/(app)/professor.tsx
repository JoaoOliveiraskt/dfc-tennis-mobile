import type React from "react";
import { useLocalSearchParams } from "expo-router";
import { ClassTeacherProfileScreen } from "@/features/class-detail";
import type { HomeFeedItemKind } from "@/features/home/types/home-feed";

export default function ClassTeacherProfileRoute(): React.JSX.Element {
  const params = useLocalSearchParams<{
    readonly classId: string;
    readonly kind?: HomeFeedItemKind;
  }>();

  return (
    <ClassTeacherProfileScreen
      classId={params.classId}
      kind={params.kind}
    />
  );
}
