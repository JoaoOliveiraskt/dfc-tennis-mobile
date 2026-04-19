import type React from "react";
import { useLocalSearchParams } from "expo-router";
import { ClassDetailScreen } from "@/features/class-detail";
import type { HomeFeedItemKind } from "@/features/home/types/home-feed";

export default function ClassDetailRoute(): React.JSX.Element {
  const params = useLocalSearchParams<{
    readonly id: string;
    readonly kind?: HomeFeedItemKind;
  }>();

  return <ClassDetailScreen classId={params.id} kind={params.kind} />;
}
