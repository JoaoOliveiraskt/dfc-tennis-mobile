import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Button, EmptyState, Screen, Skeleton } from "@/components/ui";
import { ClassDetailHero } from "@/features/class-detail/components/class-detail-hero";
import { useClassDetail } from "@/features/class-detail/hooks/use-class-detail";
import type { HomeFeedItemKind } from "@/features/home/types/home-feed";

interface ClassDetailScreenProps {
  readonly classId: string;
  readonly kind?: HomeFeedItemKind;
}

function ClassDetailLoadingState(): React.JSX.Element {
  return (
    <Screen className="flex-1 bg-background px-5 pt-4">
      <View className="gap-5">
        <Skeleton className="h-[360px] w-full rounded-[32px]" />
        <Skeleton className="h-24 w-full rounded-[28px]" />
        <Skeleton className="h-40 w-full rounded-[28px]" />
      </View>
    </Screen>
  );
}

function ClassDetailScreen({
  classId,
  kind,
}: ClassDetailScreenProps): React.JSX.Element {
  const { data, errorMessage, isLoading } = useClassDetail(classId, kind);

  if (isLoading || !data) {
    return errorMessage ? (
      <Screen className="flex-1 bg-background">
        <EmptyState title="Aula indisponível" description={errorMessage} />
      </Screen>
    ) : (
      <ClassDetailLoadingState />
    );
  }

  return (
    <Screen className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 20,
          paddingBottom: 24,
          paddingHorizontal: 20,
          paddingTop: 16,
        }}
      >
        <ClassDetailHero data={data} />

        <View className="gap-4 rounded-[28px] bg-surface px-5 py-5">
          {data.sections.map((section) => (
            <View key={section.id} className="gap-2">
              <Text className="text-xl font-semibold text-foreground">
                {section.title}
              </Text>
              {section.paragraphs.map((paragraph) => (
                <Text
                  key={`${section.id}-${paragraph}`}
                  className="text-base leading-7 text-muted"
                >
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View className="gap-3 rounded-[28px] bg-surface px-5 py-5">
          <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Ação principal
          </Text>
          <Button size="lg" isDisabled={data.cta.disabled}>
            <Button.Label>{data.cta.label}</Button.Label>
          </Button>
          {data.cta.helperText ? (
            <Text className="text-sm font-medium text-muted">
              {data.cta.helperText}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

export { ClassDetailScreen };
