import React from "react";
import { Image, ImageBackground, Text, View } from "react-native";
import { GravityIcon } from "@/components/ui";
import type { ClassDetailData } from "@/features/class-detail/types/class-detail";

interface ClassDetailHeroProps {
  readonly data: ClassDetailData;
}

function ClassDetailHero({ data }: ClassDetailHeroProps): React.JSX.Element {
  return (
    <ImageBackground
      source={data.coverImage}
      className="overflow-hidden rounded-[32px]"
      imageStyle={{ borderRadius: 32 }}
    >
      <View className="min-h-[360px] justify-end bg-background/70 px-5 pb-6 pt-16">
        <View className="self-start rounded-full bg-surface px-3 py-2">
          <Text className="text-xs font-semibold text-foreground">
            {data.statusBadge}
          </Text>
        </View>

        <Text className="mt-4 text-[38px] font-semibold leading-[40px] tracking-[-1.4px] text-foreground">
          {data.title}
        </Text>

        <View className="mt-4 flex-row flex-wrap items-center gap-x-3 gap-y-2">
          <View className="flex-row items-center gap-2">
            <GravityIcon name="agenda" size={16} colorToken="muted" />
            <Text className="text-sm font-medium text-muted">{data.dateLabel}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <GravityIcon name="clock" size={16} colorToken="muted" />
            <Text className="text-sm font-medium text-muted">
              {data.timeLabel} · {data.durationLabel}
            </Text>
          </View>
        </View>

        <View className="mt-2 flex-row items-center gap-2">
          <GravityIcon name="location" size={16} colorToken="muted" />
          <Text className="text-sm font-medium text-muted">
            {data.locationLabel}
          </Text>
        </View>

        <View className="mt-5 flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Valor
            </Text>
            <Text className="mt-1 text-xl font-semibold text-foreground">
              {data.priceLabel}
            </Text>
          </View>

          <View className="flex-row items-center">
            {data.participantsPreview.slice(0, 3).map((participant, index) => (
              participant.image ? (
                <Image
                  key={`${data.id}-participant-${index}`}
                  source={{ uri: participant.image }}
                  className="-mr-2 size-10 rounded-full border border-background"
                />
              ) : (
                <View
                  key={`${data.id}-participant-${index}`}
                  className="-mr-2 size-10 items-center justify-center rounded-full border border-background bg-surface"
                >
                  <Text className="text-xs font-semibold text-foreground">
                    {(participant.name?.[0] ?? "A").toUpperCase()}
                  </Text>
                </View>
              )
            ))}
          </View>
        </View>

        <Text className="mt-3 text-sm font-medium text-muted">
          {data.participantsCountLabel}
        </Text>
      </View>
    </ImageBackground>
  );
}

export { ClassDetailHero };
