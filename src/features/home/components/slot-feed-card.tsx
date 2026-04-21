import { GravityIcon, SafeImage } from "@/components/ui";
import type { HomeFeedItemSnapshot } from "@/features/home/types/home-feed";
import MapPinIcon from "@gravity-ui/icons/svgs/map-pin.svg";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SlotFeedCardProps {
  readonly item: HomeFeedItemSnapshot;
  readonly onPress: (item: HomeFeedItemSnapshot) => void;
}

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
      className="relative flex-1 overflow-hidden rounded-3xl bg-black"
      onPress={handleOpenCard}
    >
      <SafeImage
        source={item.coverImage}
        cachePolicy="memory-disk"
        contentFit="cover"
        decodeFormat="rgb"
        disableNativeFallback
        enforceEarlyResizing
        style={StyleSheet.absoluteFillObject}
        transition={0}
      />

      <View className="absolute inset-x-0 bottom-0 z-10 px-6 pb-7 pt-24">
        <View className="items-center">
          <Text className="mb-1 text-sm font-medium text-white">
            {item.participantsCountLabel}
          </Text>
          <Text className="text-center text-[42px] font-black leading-11 text-white">
            {item.title}
          </Text>

          <View className="mt-4 flex-row flex-wrap items-center justify-center gap-x-2 gap-y-2">
            <View className="flex-row items-center gap-1.5">
              <GravityIcon name="agenda" size={14} colorToken="white" />
              <Text className="text-sm font-semibold text-white">
                {item.dateLabel}
              </Text>
            </View>
            <Text className="text-sm font-semibold text-white">•</Text>
            <Text className="text-sm font-semibold text-white">
              {item.timeLabel}
            </Text>
            <Text className="text-sm font-semibold text-white">•</Text>
            <View className="flex-row items-center gap-1.5">
              <GravityIcon name="clock" size={14} colorToken="white" />
              <Text className="text-sm font-semibold text-white">
                {item.durationLabel}
              </Text>
            </View>
          </View>

          <View className="mt-2 flex-row items-center justify-center gap-1.5">
            <MapPinIcon
              width={14}
              height={14}
              color="rgba(255, 255, 255, 0.9)"
            />
            <Text className="text-base text-white">{item.locationLabel}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const SlotFeedCard = React.memo(
  SlotFeedCardComponent,
  (previousProps, nextProps) =>
    previousProps.onPress === nextProps.onPress &&
    previousProps.item.id === nextProps.item.id &&
    previousProps.item.kind === nextProps.item.kind &&
    previousProps.item.coverImageKey === nextProps.item.coverImageKey &&
    previousProps.item.title === nextProps.item.title &&
    previousProps.item.dateLabel === nextProps.item.dateLabel &&
    previousProps.item.timeLabel === nextProps.item.timeLabel &&
    previousProps.item.durationLabel === nextProps.item.durationLabel &&
    previousProps.item.locationLabel === nextProps.item.locationLabel &&
    previousProps.item.participantsCountLabel ===
      nextProps.item.participantsCountLabel,
);

export { SlotFeedCard };
