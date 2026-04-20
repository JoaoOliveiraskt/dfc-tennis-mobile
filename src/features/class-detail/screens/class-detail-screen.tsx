import { AnimatedScrollView } from "@/components/animations/reacticx/templates/parallax-header/components/AnimatedScrollView";
import {
  Button,
  EmptyState,
  GravityIcon,
  SafeImage,
  Screen,
  Skeleton,
  useAppThemeColor,
  useHeroSurfaceTokens,
  type HeroSurfaceBucket,
} from "@/components/ui";
import { HOME_ROUTE } from "@/features/auth/services/auth-entry-routes";
import { ClassDetailHero } from "@/features/class-detail/components/class-detail-hero";
import { useClassDetail } from "@/features/class-detail/hooks/use-class-detail";
import type { HomeFeedItemKind } from "@/features/home/types/home-feed";
import {
  DEFAULT_SLOT_COVER_IMAGE,
  resolveDefaultSlotCoverImage,
} from "@/lib/adapters/slot-cover-image";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Share, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ClassDetailScreenProps {
  readonly classId: string;
  readonly kind?: HomeFeedItemKind;
}

function inferHeroSurfaceBucket(
  title?: string | null,
  activityType?: "CLINIC" | "EVENT" | "GROUP" | "PRIVATE",
  audienceType?: "ADULT" | "KIDS" | "OPEN",
  kind?: HomeFeedItemKind,
): HeroSurfaceBucket {
  if (activityType === "PRIVATE") {
    return "private";
  }

  if (audienceType === "KIDS") {
    return "kids";
  }

  const normalizedTitle = (title ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (
    normalizedTitle.includes("kids") ||
    normalizedTitle.includes("infantil") ||
    normalizedTitle.includes("crianca") ||
    normalizedTitle.includes("criança")
  ) {
    return "kids";
  }

  if (
    normalizedTitle.includes("private") ||
    normalizedTitle.includes("particular") ||
    normalizedTitle.includes("individual")
  ) {
    return "private";
  }

  if (
    normalizedTitle.includes("grupo") ||
    normalizedTitle.includes("group") ||
    normalizedTitle.includes("turma")
  ) {
    return "group";
  }

  return kind === "next" ? "group" : "default";
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { data, errorMessage, isLoading } = useClassDetail(classId, kind);
  const appBackgroundColor = useAppThemeColor("background");
  const appForegroundColor = useAppThemeColor("foreground");
  const appMutedColor = useAppThemeColor("muted");
  const appSurfaceColor = useAppThemeColor("surface");
  const isInitialLoading = !data && isLoading;
  const heroBucket = useMemo(
    () =>
      inferHeroSurfaceBucket(
        data?.title,
        data?.activityType,
        data?.audienceType,
        data?.kind,
      ),
    [data?.activityType, data?.audienceType, data?.kind, data?.title],
  );
  const heroSurfaceTokens = useHeroSurfaceTokens({
    bucket: heroBucket,
    imageSource: data?.coverImage ?? DEFAULT_SLOT_COVER_IMAGE,
    paletteKey: `class-detail:${classId}`,
  });
  const classImageFallback = useMemo(
    () =>
      resolveDefaultSlotCoverImage({
        activityTitle: data?.title,
        activityType: data?.activityType,
        audienceType: data?.audienceType,
      }),
    [data?.activityType, data?.audienceType, data?.title],
  );

  const heroHeight = useMemo(
    () => Math.max(640, windowHeight * 0.8),
    [windowHeight],
  );
  const bottomBarBaseHeight = 84;
  const bottomBarHeight = bottomBarBaseHeight + Math.max(insets.bottom, 12);
  const topBarHeight = insets.top + 56;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(HOME_ROUTE);
  }, [router]);

  const handleShare = useCallback(async () => {
    if (!data) return;

    await Share.share({
      message: `${data.title} • ${data.dateLabel} • ${data.timeLabel}`,
      title: data.title,
    });
  }, [data]);

  if (isInitialLoading) {
    return <ClassDetailLoadingState />;
  }

  if (!data) {
    return errorMessage ? (
      <Screen className="flex-1 bg-background">
        <EmptyState title="Aula indisponível" description={errorMessage} />
      </Screen>
    ) : (
      <Screen className="flex-1 bg-background" />
    );
  }

  return (
    <Screen className="flex-1 bg-background">
      <AnimatedScrollView
        headerMaxHeight={heroHeight}
        topBarHeight={topBarHeight}
        topBarElevation={3}
        HeaderComponent={
          <ClassDetailHero
            data={data}
            heroHeight={heroHeight}
            surfaceTokens={heroSurfaceTokens}
          />
        }
        HeaderNavbarComponent={
          <View
            className="px-4"
            style={{
              height: topBarHeight,
              paddingTop: insets.top,
            }}
          >
            <View className="h-12 flex-row items-center justify-between">
              <Button
                variant="tertiary"
                size="icon-xs"
                onPress={handleBack}
                accessibilityLabel="Voltar"
              >
                <GravityIcon name="back" size={16} />
              </Button>

              <Button
                variant="tertiary"
                size="icon-xs"
                onPress={handleShare}
                accessibilityLabel="Compartilhar aula"
              >
                <Feather name="share-2" size={16} color={appForegroundColor} />
              </Button>
            </View>
          </View>
        }
        TopNavBarComponent={
          <View
            className="border-b px-3.5"
            style={{
              backgroundColor: appBackgroundColor,
              borderColor: appSurfaceColor,
              height: topBarHeight,
              paddingTop: insets.top,
            }}
          >
            <View className="h-12 flex-row items-center gap-2">
              <Button
                variant="tertiary"
                size="icon-xs"
                onPress={handleBack}
                accessibilityLabel="Voltar"
              >
                <GravityIcon name="back" size={16} />
              </Button>

              <View
                className="size-8 overflow-hidden rounded-md"
                style={{ backgroundColor: appSurfaceColor }}
              >
                <SafeImage
                  source={data.coverImage}
                  fallbackSource={classImageFallback}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  className="size-8"
                  recyclingKey={data.coverImageKey}
                  transition={0}
                />
              </View>

              <View className="min-w-0 flex-1 justify-center">
                <Text
                  className="text-sm font-semibold leading-4"
                  style={{ color: appForegroundColor }}
                  numberOfLines={1}
                >
                  {data.title}
                </Text>
                <Text
                  className="text-xs font-semibold leading-4"
                  style={{ color: appMutedColor }}
                  numberOfLines={1}
                >
                  {data.priceLabel}
                </Text>
              </View>

              <Button
                variant="tertiary"
                size="icon-xs"
                onPress={handleShare}
                accessibilityLabel="Compartilhar aula"
              >
                <Feather name="share-2" size={16} color={appForegroundColor} />
              </Button>
            </View>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          backgroundColor: appBackgroundColor,
          paddingBottom: bottomBarHeight + 24,
        }}
      >
        <View
          className="px-5 pb-6 pt-14"
          style={{ backgroundColor: appBackgroundColor }}
        >
          <View
            className="mb-10 h-px w-full"
            style={{ backgroundColor: appSurfaceColor }}
          />
          {data.sections.map((section) => (
            <View key={section.id} className="gap-2.5">
              <Text
                className="text-lg font-semibold"
                style={{ color: appForegroundColor }}
              >
                {section.title}
              </Text>
              {section.paragraphs.map((paragraph) => (
                <Text
                  key={`${section.id}-${paragraph}`}
                  className="text-[15px] leading-7"
                  style={{ color: appMutedColor }}
                >
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </AnimatedScrollView>

      <View
        className="absolute inset-x-0 bottom-0 border-t px-4 pt-3"
        style={{
          backgroundColor: appBackgroundColor,
          borderColor: appSurfaceColor,
          paddingBottom: Math.max(insets.bottom, 12),
        }}
      >
        <View className="flex-row items-center gap-3">
          <View className="min-w-[116px]">
            <Text
              className="text-[11px] font-medium uppercase tracking-[0.06em]"
              style={{ color: appMutedColor }}
            >
              Valor
            </Text>
            <Text
              className="text-base font-semibold"
              style={{ color: appForegroundColor }}
            >
              {data.priceLabel}
            </Text>
          </View>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            isDisabled={data.cta.disabled}
          >
            <Button.Label className="text-sm font-semibold">
              {data.cta.label}
            </Button.Label>
          </Button>
        </View>
      </View>
    </Screen>
  );
}

export { ClassDetailScreen };
