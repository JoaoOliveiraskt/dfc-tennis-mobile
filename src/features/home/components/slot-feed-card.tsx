import React from "react";
import { ImageBackground, StyleSheet, Text, View, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PressableFeedback } from "heroui-native";
import { Avatar, Button, GravityIcon } from "@/components/ui";
import {
  getSlotCoverImagePoolSize,
  resolveSlotCoverImage,
} from "@/lib/adapters/slot-cover-image";
import type { HomeFeedItemSnapshot } from "@/features/home/types/home-feed";

interface SlotFeedCardProps {
  readonly item: HomeFeedItemSnapshot;
  readonly onPress: (item: HomeFeedItemSnapshot) => void;
}

function SlotFeedCard({
  item,
  onPress,
}: SlotFeedCardProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [hasImageError, setHasImageError] = React.useState(false);
  const [coverImageSource, setCoverImageSource] = React.useState(item.coverImage);
  const attemptedSourcesRef = React.useRef<Array<HomeFeedItemSnapshot["coverImage"]>>([]);
  const bucketPoolSize = React.useMemo(
    () =>
      getSlotCoverImagePoolSize({
        activityTitle: item.activityTitle,
        activityType: item.activityType,
        audienceType: item.audienceType,
      }),
    [item.activityTitle, item.activityType, item.audienceType],
  );

  React.useEffect(() => {
    setHasImageError(false);
    setCoverImageSource(item.coverImage);
    attemptedSourcesRef.current = [];
  }, [item.coverImage, item.id]);

  const handleCoverImageError = React.useCallback(() => {
    const attemptedImages = [...attemptedSourcesRef.current, coverImageSource];
    attemptedSourcesRef.current = attemptedImages;

    if (attemptedImages.length >= bucketPoolSize) {
      setHasImageError(true);
      return;
    }

    const nextImage = resolveSlotCoverImage({
      activityTitle: item.activityTitle,
      activityType: item.activityType,
      audienceType: item.audienceType,
      excludeImages: attemptedImages,
      fallbackIndex: attemptedImages.length,
      skipCache: true,
      slotId: item.id,
      startTime: item.startTime,
    });

    if (attemptedImages.includes(nextImage)) {
      setHasImageError(true);
      return;
    }

    setCoverImageSource(nextImage);
  }, [
    bucketPoolSize,
    coverImageSource,
    item.activityTitle,
    item.activityType,
    item.audienceType,
    item.id,
    item.startTime,
  ]);

  const primaryAvatar =
    item.coach?.image ?? item.participantsPreview.find((participant) => participant.image)?.image;
  const avatarName =
    item.coach?.name ??
    item.participantsPreview.find((participant) => participant.name)?.name ??
    item.title;
  const showCoverImage = !hasImageError;
  const overlayColors: readonly [string, string] = isDarkMode
    ? ["rgba(4, 8, 24, 0.03)", "rgba(4, 8, 24, 0.9)"]
    : ["rgba(255, 255, 255, 0.0)", "rgba(255, 255, 255, 0.46)"];
  const overlayLocations: readonly [number, number] = isDarkMode
    ? [0.35, 1]
    : [0.56, 1];

  return (
    <PressableFeedback
      accessibilityRole="button"
      onPress={() => onPress(item)}
      animation={{ scale: { value: 0.985 } }}
      className="relative flex-1 overflow-hidden rounded-[34px] bg-surface"
    >
      {showCoverImage ? (
        <ImageBackground
          source={coverImageSource}
          resizeMode="cover"
          onError={handleCoverImageError}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View
          className="absolute inset-0 bg-[#101320]"
          style={StyleSheet.absoluteFillObject}
        />
      )}

      <LinearGradient
        colors={overlayColors}
        locations={overlayLocations}
        style={StyleSheet.absoluteFillObject}
      />

      <View className="absolute inset-x-0 bottom-0 z-10 px-6 pb-7 pt-24">
        <View className="items-center">
          <Avatar
            alt={avatarName}
            animation="disable-all"
            className="mb-3 size-14 rounded-full border-2 border-foreground"
            variant="default"
          >
            {primaryAvatar ? (
              <Avatar.Image source={{ uri: primaryAvatar }} animation={false} />
            ) : null}
            <Avatar.Fallback animation="disabled" delayMs={100}>
              {avatarName.slice(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar>

          <Text className="mb-1 text-sm font-medium text-foreground">
            {item.participantsCountLabel}
          </Text>
          <Text className="text-center text-[44px] font-black leading-[46px] tracking-[-1.2px] text-foreground">
            {item.title}
          </Text>

          <View className="mt-4 flex-row flex-wrap items-center justify-center gap-x-2 gap-y-2">
            <View className="flex-row items-center gap-1.5">
              <GravityIcon name="agenda" size={14} colorToken="foreground" />
              <Text className="text-sm font-semibold text-foreground">
                {item.dateLabel}
              </Text>
            </View>

            <Text className="text-sm font-semibold text-foreground">•</Text>
            <Text className="text-sm font-semibold text-foreground">
              {item.timeLabel}
            </Text>
            <Text className="text-sm font-semibold text-foreground">•</Text>

            <View className="flex-row items-center gap-1.5">
              <GravityIcon name="clock" size={14} colorToken="foreground" />
              <Text className="text-sm font-semibold text-foreground">
                {item.durationLabel}
              </Text>
            </View>
          </View>

          <View className="mt-2 flex-row items-center justify-center gap-1.5">
            <GravityIcon name="location" size={14} colorToken="foreground" />
            <Text className="text-base text-foreground">
              {item.locationLabel}
            </Text>
          </View>

          <View className="mt-5">
            <Button
              variant="tertiary"
              size="sm"
              onPress={() => onPress(item)}
            >
              <Button.Label className="text-base font-semibold">
                {item.primaryActionLabel}
              </Button.Label>
            </Button>
          </View>
        </View>
      </View>

      <PressableFeedback.Highlight />
      <PressableFeedback.Ripple />
    </PressableFeedback>
  );
}

export { SlotFeedCard };
