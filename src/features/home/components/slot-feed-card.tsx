import { GravityIcon, SafeImage } from "@/components/ui";
import type { HomeFeedItemSnapshot } from "@/features/home/types/home-feed";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SlotFeedCardProps {
  readonly item: HomeFeedItemSnapshot;
  readonly onPress: (item: HomeFeedItemSnapshot) => void;
}

const OVERLAY_COLORS: readonly [string, string] = [
  "rgba(4, 8, 24, 0.02)",
  "rgba(4, 8, 24, 0.86)",
];
const OVERLAY_LOCATIONS: readonly [number, number] = [0.38, 1];

function SlotFeedCardComponent({
  item,
  onPress,
}: SlotFeedCardProps): React.JSX.Element {
  const handleOpenCard = React.useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <Pressable
      accessibilityRole="button"
      className="relative flex-1 overflow-hidden rounded-[30px] bg-surface"
      onPress={handleOpenCard}
    >
      <SafeImage
        source={item.coverImage}
        cachePolicy="memory-disk"
        contentFit="cover"
        decodeFormat="rgb"
        disableNativeFallback
        enforceEarlyResizing
        recyclingKey={`${item.kind}:${item.id}`}
        style={StyleSheet.absoluteFillObject}
        transition={0}
      />

      <LinearGradient
        colors={OVERLAY_COLORS}
        locations={OVERLAY_LOCATIONS}
        style={StyleSheet.absoluteFillObject}
      />

      <View className="absolute inset-x-0 bottom-0 z-10 px-6 pb-7 pt-24">
        <View className="items-center">
          <Text className="mb-1 text-sm font-medium text-white/85">
            {item.participantsCountLabel}
          </Text>
          <Text className="text-center text-[42px] font-black leading-[44px] text-white">
            {item.title}
          </Text>

          <View className="mt-4 flex-row flex-wrap items-center justify-center gap-x-2 gap-y-2">
            <View className="flex-row items-center gap-1.5">
              <GravityIcon name="agenda" size={14} colorToken="background" />
              <Text className="text-sm font-semibold text-white">
                {item.dateLabel}
              </Text>
            </View>
            <Text className="text-sm font-semibold text-white/80">•</Text>
            <Text className="text-sm font-semibold text-white">
              {item.timeLabel}
            </Text>
            <Text className="text-sm font-semibold text-white/80">•</Text>
            <View className="flex-row items-center gap-1.5">
              <GravityIcon name="clock" size={14} colorToken="background" />
              <Text className="text-sm font-semibold text-white">
                {item.durationLabel}
              </Text>
            </View>
          </View>

          <View className="mt-2 flex-row items-center justify-center gap-1.5">
            <GravityIcon name="location" size={14} colorToken="background" />
            <Text className="text-base text-white/90">
              {item.locationLabel}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const SlotFeedCard = React.memo(SlotFeedCardComponent);

export { SlotFeedCard };
