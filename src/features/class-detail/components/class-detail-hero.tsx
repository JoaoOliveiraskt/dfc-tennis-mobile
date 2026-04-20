import React, { useMemo } from "react";
import { Text, View } from "react-native";
import CircleDollarIcon from "@gravity-ui/icons/svgs/circle-dollar.svg";
import MapPinIcon from "@gravity-ui/icons/svgs/map-pin.svg";
import {
  Avatar,
  GravityIcon,
  HeroSurface,
  type HeroSurfaceTokens,
} from "@/components/ui";
import type { ClassDetailData } from "@/features/class-detail/types/class-detail";
import { resolveDefaultSlotCoverImage } from "@/lib/adapters/slot-cover-image";

interface ClassDetailHeroProps {
  readonly data: ClassDetailData;
  readonly heroHeight: number;
  readonly surfaceTokens: HeroSurfaceTokens;
}

interface HeroCardProps {
  readonly children: React.ReactNode;
  readonly style?: object;
  readonly surfaceTokens: HeroSurfaceTokens;
}

function HeroCard({
  children,
  style,
  surfaceTokens,
}: HeroCardProps): React.JSX.Element {
  return (
    <View
      className="min-h-[98px] rounded-[22px] px-3.5 py-3"
      style={{
        backgroundColor: surfaceTokens.cardBackground,
        borderColor: surfaceTokens.cardBorder,
        borderWidth: 1,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 18,
        elevation: 3,
        ...style,
      }}
    >
      {children}
    </View>
  );
}

function ClassDetailHero({
  data,
  heroHeight,
  surfaceTokens,
}: ClassDetailHeroProps): React.JSX.Element {
  const fallbackHeroImage = useMemo(
    () =>
      resolveDefaultSlotCoverImage({
        activityTitle: data.title,
        activityType: data.activityType,
        audienceType: data.audienceType,
      }),
    [data.activityType, data.audienceType, data.title],
  );
  const heroParticipants = useMemo(
    () => data.participantsPreview.slice(0, 4),
    [data.participantsPreview],
  );

  return (
    <HeroSurface
      imageFallbackSource={fallbackHeroImage}
      imageSource={data.coverImage}
      imageCacheKey={data.coverImageKey}
      tokens={surfaceTokens}
      style={{ height: heroHeight }}
    >
      <View className="relative z-10 flex-1 justify-end px-4 pb-6">
        <View className="items-center">
          <Avatar
            alt={data.coach?.name ?? data.title}
            animation="disable-all"
            className="mb-3 size-14 rounded-full"
            variant="default"
          >
            {data.coach?.image ? (
              <Avatar.Image source={{ uri: data.coach.image }} animation={false} />
            ) : null}
            <Avatar.Fallback animation="disabled" delayMs={100}>
              {(data.coach?.name?.slice(0, 2) ?? "DF").toUpperCase()}
            </Avatar.Fallback>
          </Avatar>

          <Text className="text-sm font-medium" style={{ color: surfaceTokens.metaText }}>
            {data.participantsCountLabel}
          </Text>

          <Text
            className="mt-1 text-center text-[40px] font-extrabold leading-[42px] tracking-[-0.8px]"
            style={{ color: surfaceTokens.titleText }}
          >
            {data.title}
          </Text>

          <View className="mt-3 flex-row flex-wrap items-center justify-center gap-x-2 gap-y-2">
            <View className="flex-row items-center gap-1.5">
              <GravityIcon name="agenda" size={14} colorToken="foreground" />
              <Text className="text-[15px] font-semibold" style={{ color: surfaceTokens.metaText }}>
                {data.dateLabel}
              </Text>
            </View>
            <Text className="text-[15px] font-semibold" style={{ color: surfaceTokens.metaText }}>
              •
            </Text>
            <Text className="text-[15px] font-semibold" style={{ color: surfaceTokens.metaText }}>
              {data.timeLabel}
            </Text>
          </View>
        </View>

        <View className="mt-5 gap-2.5">
          <View className="flex-row gap-2.5">
            <HeroCard surfaceTokens={surfaceTokens} style={{ flex: 1.35 }}>
              <View className="min-h-[70px] items-center justify-center gap-1.5">
                <View className="flex-row items-center justify-center">
                  {heroParticipants.length > 0 ? (
                    heroParticipants.map((participant, index) => (
                      <View
                        key={`${data.id}-participant-${index}`}
                        style={{ marginLeft: index === 0 ? 0 : -8 }}
                      >
                        <Avatar
                          alt={participant.name ?? "Aluno"}
                          animation="disable-all"
                          className="size-8 rounded-full"
                          variant="default"
                        >
                          {participant.image ? (
                            <Avatar.Image source={{ uri: participant.image }} animation={false} />
                          ) : null}
                          <Avatar.Fallback animation="disabled" delayMs={80}>
                            {(participant.name?.[0] ?? "A").toUpperCase()}
                          </Avatar.Fallback>
                        </Avatar>
                      </View>
                    ))
                  ) : (
                    <Avatar
                      alt="Alunos"
                      animation="disable-all"
                      className="size-7 rounded-full"
                      variant="default"
                    >
                      <Avatar.Fallback animation="disabled" delayMs={80}>
                        {(data.coach?.name?.[0] ?? "A").toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar>
                  )}
                </View>

                <Text className="text-sm font-semibold" style={{ color: surfaceTokens.titleText }}>
                  {Math.max(data.capacity - data.occupancy, 0)} vagas
                </Text>
              </View>
            </HeroCard>

            <HeroCard surfaceTokens={surfaceTokens} style={{ flex: 0.85 }}>
              <View className="min-h-[70px] flex-1 items-start justify-center gap-3">
                <MapPinIcon width={15} height={15} color={surfaceTokens.metaText} />
                <Text
                  className="text-sm font-semibold leading-[18px]"
                  style={{ color: surfaceTokens.titleText }}
                  numberOfLines={3}
                >
                  {data.locationLabel}
                </Text>
              </View>
            </HeroCard>
          </View>

          <View className="flex-row gap-2.5">
            <HeroCard surfaceTokens={surfaceTokens} style={{ flex: 1.35 }}>
              <View className="min-h-[70px] justify-center">
                <View className="flex-row items-center gap-2.5">
                  <Avatar
                    alt={data.coach?.name ?? "Professor"}
                    animation="disable-all"
                    className="size-10 rounded-full"
                    variant="default"
                  >
                    {data.coach?.image ? (
                      <Avatar.Image source={{ uri: data.coach.image }} animation={false} />
                    ) : null}
                    <Avatar.Fallback animation="disabled" delayMs={80}>
                      {(data.coach?.name?.[0] ?? "P").toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>

                  <View className="min-w-0 flex-1">
                    <Text
                      className="text-sm font-semibold leading-[18px]"
                      style={{ color: surfaceTokens.titleText }}
                      numberOfLines={2}
                    >
                      {data.coach?.name ?? "Equipe DFC Tennis"}
                    </Text>
                    <Text className="mt-0.5 text-xs" style={{ color: surfaceTokens.subtleText }}>
                      professor
                    </Text>
                  </View>
                </View>
              </View>
            </HeroCard>

            <HeroCard surfaceTokens={surfaceTokens} style={{ flex: 0.85 }}>
              <View className="min-h-[70px] flex-1 items-start justify-center gap-3">
                <CircleDollarIcon width={16} height={16} color={surfaceTokens.metaText} />
                <Text
                  className="text-sm font-semibold leading-[18px]"
                  style={{ color: surfaceTokens.titleText }}
                >
                  {data.priceLabel}
                </Text>
              </View>
            </HeroCard>
          </View>
        </View>
      </View>
    </HeroSurface>
  );
}

export { ClassDetailHero };
