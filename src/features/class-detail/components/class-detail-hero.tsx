import React, { useMemo } from "react";
import {
  Pressable,
  Text,
  View,
  type PressableProps,
  type ViewProps,
} from "react-native";
import CircleDollarIcon from "@gravity-ui/icons/svgs/circle-dollar.svg";
import MapPinIcon from "@gravity-ui/icons/svgs/map-pin.svg";
import {
  GravityIcon,
  HeroSurface,
  UserAvatar,
  type HeroSurfaceTokens,
} from "@/components/ui";
import type { ClassDetailData } from "@/features/class-detail/types/class-detail";
import { resolveDefaultSlotCoverImage } from "@/lib/adapters/slot-cover-image";

interface ClassDetailHeroProps {
  readonly data: ClassDetailData;
  readonly heroHeight: number;
  readonly onCoachPress?: () => void;
  readonly onLocationPress?: () => void;
  readonly onParticipantsPress?: () => void;
  readonly onPricePress?: () => void;
  readonly surfaceTokens: HeroSurfaceTokens;
}

interface HeroCardProps extends Omit<PressableProps, "children" | "style"> {
  readonly children: React.ReactNode;
  readonly onPress?: () => void;
  readonly style?: object;
  readonly surfaceTokens: HeroSurfaceTokens;
}

function HeroCard({
  children,
  onPress,
  style,
  surfaceTokens,
  ...props
}: HeroCardProps): React.JSX.Element {
  const sharedProps: ViewProps = {
    className: "min-h-[98px] rounded-[22px] px-3.5 py-3",
    style: {
      backgroundColor: surfaceTokens.cardBackground,
      borderColor: surfaceTokens.cardBorder,
      borderWidth: 1,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.14,
      shadowRadius: 18,
      elevation: 3,
      ...style,
    },
  };

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        hitSlop={4}
        onPress={onPress}
        {...props}
        {...sharedProps}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View {...sharedProps}>
      {children}
    </View>
  );
}

function ClassDetailHero({
  data,
  heroHeight,
  onCoachPress,
  onLocationPress,
  onParticipantsPress,
  onPricePress,
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
    () => data.participants.slice(0, 4),
    [data.participants],
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
          <UserAvatar
            alt={data.coach?.name ?? data.title}
            className="mb-3 size-14 rounded-full"
            image={data.coach?.image}
            name={data.coach?.name}
            userId={data.coach?.id}
          />

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
              <GravityIcon
                name="agenda"
                size={14}
                color="rgba(255, 255, 255, 0.9)"
              />
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
            <HeroCard
              accessibilityLabel="Ver alunos desta aula"
              onPress={onParticipantsPress}
              surfaceTokens={surfaceTokens}
              style={{ flex: 1.35 }}
            >
              <View className="min-h-[70px] items-center justify-center gap-1.5">
                <View className="flex-row items-center justify-center">
                  {heroParticipants.length > 0 ? (
                    heroParticipants.map((participant, index) => (
                      <View
                        key={`${data.id}-participant-${index}`}
                        style={{ marginLeft: index === 0 ? 0 : -8 }}
                      >
                        <UserAvatar
                          alt={participant.name ?? "Aluno"}
                          className="size-8 rounded-full"
                          email={participant.email}
                          image={participant.image}
                          name={participant.name}
                          userId={participant.id}
                        />
                      </View>
                    ))
                  ) : (
                    <UserAvatar
                      alt="Alunos"
                      className="size-7 rounded-full"
                      fallbackLabel="Alunos"
                    />
                  )}
                </View>

                <Text className="text-sm font-semibold" style={{ color: surfaceTokens.titleText }}>
                  {Math.max(data.capacity - data.occupancy, 0)} vagas
                </Text>
              </View>
            </HeroCard>

            <HeroCard
              accessibilityLabel="Ver local da aula"
              onPress={onLocationPress}
              surfaceTokens={surfaceTokens}
              style={{ flex: 0.85 }}
            >
              <View className="min-h-[70px] flex-1 items-start justify-center gap-3">
                <MapPinIcon width={15} height={15} color="rgba(255, 255, 255, 0.9)" />
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
            <HeroCard
              accessibilityLabel="Ver professor"
              onPress={onCoachPress}
              surfaceTokens={surfaceTokens}
              style={{ flex: 1.35 }}
            >
              <View className="min-h-[70px] justify-center">
                <View className="flex-row items-center gap-2.5">
                  <UserAvatar
                    alt={data.coach?.name ?? "Professor"}
                    className="size-10 rounded-full"
                    image={data.coach?.image}
                    name={data.coach?.name}
                    userId={data.coach?.id}
                  />

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

            <HeroCard
              accessibilityLabel="Reservar aula"
              onPress={onPricePress}
              surfaceTokens={surfaceTokens}
              style={{ flex: 0.85 }}
            >
              <View className="min-h-[70px] flex-1 items-start justify-center gap-3">
                <CircleDollarIcon width={16} height={16} color="rgba(255, 255, 255, 0.9)" />
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
