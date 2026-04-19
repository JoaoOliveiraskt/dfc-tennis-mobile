import React from "react";
import { FlatList, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BrandWordmark,
  Button,
  EmptyState,
  GravityIcon,
  MOBILE_BOTTOM_NAV_TOTAL_HEIGHT,
  Screen,
} from "@/components/ui";
import { HomeFeedSkeleton } from "@/features/home/components/home-feed-skeleton";
import { SlotFeedCard } from "@/features/home/components/slot-feed-card";
import { useHomeFeed } from "@/features/home/hooks/use-home-feed";
import type { HomeFeedItemSnapshot } from "@/features/home/types/home-feed";

function AuthenticatedHomeScreen(): React.JSX.Element {
  const FEED_BOTTOM_GAP = 8;
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { data, errorMessage, isLoading, reload } = useHomeFeed();
  const feedTopOffset = insets.top;
  const reelViewportHeight = Math.max(
    420,
    windowHeight -
      (feedTopOffset + insets.bottom + MOBILE_BOTTOM_NAV_TOTAL_HEIGHT + FEED_BOTTOM_GAP),
  );

  const handleOpenClass = (item: HomeFeedItemSnapshot) => {
    router.push({
      params: {
        id: item.id,
        kind: item.kind,
      },
      pathname: "/(app)/aula/[id]",
    });
  };
  const handleOpenFilters = () => {
    router.push("/(app)/agendar");
  };

  if (isLoading || !data) {
    return <HomeFeedSkeleton />;
  }

  if (errorMessage) {
    return (
      <Screen className="flex-1 bg-background">
        <EmptyState
          title="Não foi possível carregar seu feed"
          description={errorMessage}
          cta={
            <Button variant="link" size="sm" onPress={reload}>
              <Button.Label className="text-accent">Tentar novamente</Button.Label>
            </Button>
          }
        />
      </Screen>
    );
  }

  if (data.activeItems.length === 0) {
    return (
      <Screen className="flex-1 bg-background">
        <EmptyState
          title="Ainda não há aulas por aqui"
          description="Assim que novos horários forem publicados, eles vão aparecer no seu feed com prioridade para a experiência mobile."
        />
      </Screen>
    );
  }

  return (
    <Screen className="flex-1 bg-background">
      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 z-20 px-5"
        style={{ height: insets.top + 72, paddingTop: insets.top, top: 0 }}
      >
        <View className="min-h-[72px] flex-row items-center justify-between">
          <BrandWordmark className="text-xs tracking-[0.2em] text-foreground" />

          <Button
            variant="tertiary"
            size="sm"
            className="size-10 rounded-full px-0"
            onPress={handleOpenFilters}
          >
            <GravityIcon name="filters" size={16} />
          </Button>
        </View>
      </View>

      <View
        className="mx-2 overflow-hidden rounded-[34px] bg-surface"
        style={{ height: reelViewportHeight, marginTop: feedTopOffset }}
      >
        <FlatList
          data={data.activeItems}
          keyExtractor={(item) => `${item.kind}-${item.id}`}
          renderItem={({ item }) => (
            <View style={{ height: reelViewportHeight }}>
              <SlotFeedCard item={item} onPress={handleOpenClass} />
            </View>
          )}
          pagingEnabled
          bounces={false}
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={reelViewportHeight}
          getItemLayout={(_, index) => ({
            index,
            length: reelViewportHeight,
            offset: reelViewportHeight * index,
          })}
        />
      </View>
    </Screen>
  );
}

export { AuthenticatedHomeScreen };
