import {
  BrandWordmark,
  Button,
  EmptyState,
  GravityIcon,
  MOBILE_BOTTOM_NAV_TOTAL_HEIGHT,
  Screen,
  Spinner,
} from "@/components/ui";
import { SlotFeedCard } from "@/features/home/components/slot-feed-card";
import { useHomeFeed } from "@/features/home/hooks/use-home-feed";
import type { HomeFeedItemSnapshot } from "@/features/home/types/home-feed";
import { router } from "expo-router";
import React from "react";
import { FlatList, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HOME_FEED_INITIAL_ITEMS_TO_RENDER = 1;
const HOME_FEED_WINDOW_SIZE = 3;
const HOME_FEED_BATCH_SIZE = 1;

function AuthenticatedHomeScreen(): React.JSX.Element {
  const FEED_BOTTOM_GAP = 8;
  const FEED_PAGE_SPACING = 8;
  const insets = useSafeAreaInsets();
  const windowHeight = useWindowDimensions().height;
  const { data, errorMessage, isLoading, reload } = useHomeFeed();
  const isInitialLoading = !data && isLoading;
  const feedTopOffset = insets.top;
  const reelViewportHeight = Math.max(
    420,
    windowHeight -
      (feedTopOffset +
        insets.bottom +
        MOBILE_BOTTOM_NAV_TOTAL_HEIGHT +
        FEED_BOTTOM_GAP),
  );

  const handleOpenClass = React.useCallback(
    (item: HomeFeedItemSnapshot) => {
      router.push({
        params: {
          id: item.id,
          kind: item.kind,
        },
        pathname: "/(app)/aula/[id]",
      });
    },
    [],
  );

  const handleOpenFilters = React.useCallback(() => {
    router.push("/(app)/(shell)/agendar");
  }, []);

  const renderFeedItem = React.useCallback(
    ({ item }: { readonly item: HomeFeedItemSnapshot }) => (
      <View style={{ height: reelViewportHeight + FEED_PAGE_SPACING }}>
        <View style={{ height: reelViewportHeight }}>
          <SlotFeedCard
            item={item}
            onPress={handleOpenClass}
          />
        </View>
      </View>
    ),
    [FEED_PAGE_SPACING, handleOpenClass, reelViewportHeight],
  );

  if (isInitialLoading) {
    return (
      <Screen className="flex-1 items-center justify-center bg-background">
        <Spinner />
      </Screen>
    );
  }

  if (!data && errorMessage) {
    return (
      <Screen className="flex-1 bg-background">
        <EmptyState
          title="Não foi possível carregar seu feed"
          description={errorMessage}
          cta={
            <Button variant="link" size="sm" onPress={reload}>
              <Button.Label className="text-accent">
                Tentar novamente
              </Button.Label>
            </Button>
          }
        />
      </Screen>
    );
  }

  if (!data) {
    return <Screen className="flex-1 bg-background" />;
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
          <BrandWordmark className="text-xs tracking-[0.2em] text-white" />

          <Button
            variant="tertiary"
            size="icon-xs"
            onPress={handleOpenFilters}
          >
            <GravityIcon name="filters" size={16} />
          </Button>
        </View>
      </View>

      <View
        className="overflow-hidden rounded-[34px] bg-surface"
        style={{ height: reelViewportHeight, marginTop: feedTopOffset }}
      >
        <FlatList
          data={data.activeItems}
          keyExtractor={(item) => `${item.kind}-${item.id}`}
          renderItem={renderFeedItem}
          bounces={false}
          decelerationRate="fast"
          disableIntervalMomentum
          initialNumToRender={HOME_FEED_INITIAL_ITEMS_TO_RENDER}
          maxToRenderPerBatch={HOME_FEED_BATCH_SIZE}
          windowSize={HOME_FEED_WINDOW_SIZE}
          updateCellsBatchingPeriod={16}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={reelViewportHeight + FEED_PAGE_SPACING}
          contentContainerStyle={{ paddingBottom: FEED_PAGE_SPACING }}
          getItemLayout={(_, index) => ({
            index,
            length: reelViewportHeight + FEED_PAGE_SPACING,
            offset: (reelViewportHeight + FEED_PAGE_SPACING) * index,
          })}
        />
      </View>
    </Screen>
  );
}

export { AuthenticatedHomeScreen };
