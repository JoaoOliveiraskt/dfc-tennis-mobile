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
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  FlatList,
  View,
  useWindowDimensions,
  type ListRenderItemInfo,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FEED_BOTTOM_GAP = 0;
const FEED_PAGE_SPACING = 16;
const HOME_DARK_BACKGROUND = "#000";
const HOME_HEADER_ICON_COLOR = "rgba(255, 255, 255, 0.92)";
const HOME_FEED_INITIAL_ITEMS_TO_RENDER = 2;
const HOME_FEED_WINDOW_SIZE = 5;
const HOME_FEED_BATCH_SIZE = 2;

interface HomeFeedListItemProps {
  readonly item: HomeFeedItemSnapshot;
  readonly itemStyle: StyleProp<ViewStyle>;
  readonly onPress: (item: HomeFeedItemSnapshot) => void;
  readonly viewportStyle: StyleProp<ViewStyle>;
}

const HomeFeedListItem = React.memo(function HomeFeedListItem({
  item,
  itemStyle,
  onPress,
  viewportStyle,
}: HomeFeedListItemProps): React.JSX.Element {
  return (
    <View style={itemStyle}>
      <View style={viewportStyle}>
        <SlotFeedCard item={item} onPress={onPress} />
      </View>
    </View>
  );
});

function AuthenticatedHomeScreen(): React.JSX.Element {
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

  const handleOpenClass = React.useCallback((item: HomeFeedItemSnapshot) => {
    router.push({
      params: {
        id: item.id,
        kind: item.kind,
      },
      pathname: "/(app)/aula/[id]",
    });
  }, []);

  const handleOpenFilters = React.useCallback(() => {
    router.push("/(app)/(shell)/agendar");
  }, []);
  const feedItemHeight = reelViewportHeight + FEED_PAGE_SPACING;
  const feedItemStyle = React.useMemo(
    () => ({ height: feedItemHeight }),
    [feedItemHeight],
  );
  const feedViewportStyle = React.useMemo(
    () => ({ height: reelViewportHeight }),
    [reelViewportHeight],
  );
  const feedContentContainerStyle = React.useMemo(
    () => ({ paddingBottom: FEED_PAGE_SPACING }),
    [],
  );
  const getFeedItemLayout = React.useCallback(
    (_: ArrayLike<HomeFeedItemSnapshot> | null | undefined, index: number) => ({
      index,
      length: feedItemHeight,
      offset: feedItemHeight * index,
    }),
    [feedItemHeight],
  );

  const renderFeedItem = React.useCallback(
    ({ item }: ListRenderItemInfo<HomeFeedItemSnapshot>) => (
      <HomeFeedListItem
        item={item}
        itemStyle={feedItemStyle}
        onPress={handleOpenClass}
        viewportStyle={feedViewportStyle}
      />
    ),
    [feedItemStyle, feedViewportStyle, handleOpenClass],
  );

  if (isInitialLoading) {
    return (
      <Screen
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: HOME_DARK_BACKGROUND }}
      >
        <StatusBar style="light" />
        <Spinner />
      </Screen>
    );
  }

  if (!data && errorMessage) {
    return (
      <Screen
        className="flex-1"
        style={{ backgroundColor: HOME_DARK_BACKGROUND }}
      >
        <StatusBar style="light" />
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
    return (
      <Screen
        className="flex-1"
        style={{ backgroundColor: HOME_DARK_BACKGROUND }}
      >
        <StatusBar style="light" />
      </Screen>
    );
  }

  if (data.activeItems.length === 0) {
    return (
      <Screen
        className="flex-1"
        style={{ backgroundColor: HOME_DARK_BACKGROUND }}
      >
        <StatusBar style="light" />
        <EmptyState
          title="Ainda não há aulas por aqui"
          description="Assim que novos horários forem publicados, eles vão aparecer no seu feed com prioridade para a experiência mobile."
        />
      </Screen>
    );
  }

  return (
    <Screen
      className="flex-1"
      style={{ backgroundColor: HOME_DARK_BACKGROUND }}
    >
      <StatusBar style="light" />
      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 z-20 px-5"
        style={{ height: insets.top + 72, paddingTop: insets.top, top: 0 }}
      >
        <View className="min-h-18 flex-row items-center justify-between">
          <BrandWordmark className="text-xs tracking-[0.2em] text-white" />

          <Button
            variant="tertiary"
            size="icon-xs"
            className="bg-default/80"
            onPress={handleOpenFilters}
          >
            <GravityIcon
              name="filters"
              size={16}
              color={HOME_HEADER_ICON_COLOR}
            />
          </Button>
        </View>
      </View>

      <View
        className="overflow-hidden rounded-3xl bg-surface"
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
          removeClippedSubviews={false}
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={reelViewportHeight + FEED_PAGE_SPACING}
          contentContainerStyle={feedContentContainerStyle}
          getItemLayout={getFeedItemLayout}
        />
      </View>
    </Screen>
  );
}

export { AuthenticatedHomeScreen };
