import { AnimatedScrollView } from "@/components/animations/reacticx/templates/parallax-header/components/AnimatedScrollView";
import {
  BottomSheet,
  EmptyState,
  Button,
  HeaderIconButton,
  SafeImage,
  Screen,
  Spinner,
  UserAvatar,
  useAppThemeColor,
  useHeroSurfaceTokens,
  type HeroSurfaceBucket,
} from "@/components/ui";
import { HOME_ROUTE } from "@/features/auth/services/auth-entry-routes";
import { ClassPaymentSheet } from "@/features/class-detail/components/class-payment-sheet";
import { ClassDetailHero } from "@/features/class-detail/components/class-detail-hero";
import { useClassDetail } from "@/features/class-detail/hooks/use-class-detail";
import type { HomeFeedItemKind } from "@/features/home/types/home-feed";
import {
  DEFAULT_SLOT_COVER_IMAGE,
} from "@/lib/adapters/slot-cover-image";
import { Feather } from "@expo/vector-icons";
import ArrowLeftIcon from "@gravity-ui/icons/svgs/arrow-left.svg";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Share, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ClassDetailScreenProps {
  readonly classId: string;
  readonly kind?: HomeFeedItemKind;
  readonly openPayment?: boolean;
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
    <Screen className="flex-1 items-center justify-center bg-background">
      <StatusBar style="light" />
      <Spinner />
    </Screen>
  );
}

type ClassDetailSheet = "location" | "participants";

function withAlpha(color: string, alpha: number): string {
  const normalizedAlpha = Math.max(0, Math.min(1, alpha));
  const rgbaMatch = color.match(
    /^rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9.]+)\s*\)$/i,
  );
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${normalizedAlpha})`;
  }

  const rgbMatch = color.match(
    /^rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/i,
  );
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${normalizedAlpha})`;
  }

  return color;
}

function ClassDetailScreen({
  classId,
  kind,
  openPayment = false,
}: ClassDetailScreenProps): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const {
    data,
    errorMessage,
    isLoading,
    isPaymentSheetOpen,
    isSubmittingPayment,
    closePaymentSheet,
    openPaymentSheet,
    paymentErrorMessage,
    paymentNoticeMessage,
    refreshPaymentStatus,
    submitPayment,
  } = useClassDetail(classId, kind);
  const [activeSheet, setActiveSheet] = useState<ClassDetailSheet | null>(null);
  const appBackgroundColor = useAppThemeColor("background");
  const appForegroundColor = useAppThemeColor("foreground");
  const appMutedColor = useAppThemeColor("muted");
  const appDangerColor = useAppThemeColor("danger");
  const appSuccessColor = useAppThemeColor("success");
  const appSurfaceColor = useAppThemeColor("surface");
  const isInitialLoading = !data && isLoading;
  const hasOpenedPaymentFromParamRef = useRef(false);
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
  const topHeaderBackgroundColor = useMemo(
    () => heroSurfaceTokens.bottomBarBackground,
    [heroSurfaceTokens.bottomBarBackground],
  );
  const topHeaderBorderColor = useMemo(
    () => withAlpha(heroSurfaceTokens.cardBorder, 0.4),
    [heroSurfaceTokens.cardBorder],
  );
  const scrolledHeaderButtonBorderColor = useMemo(
    () => withAlpha(heroSurfaceTokens.cardBorder, 0.78),
    [heroSurfaceTokens.cardBorder],
  );
  const miniThumbBackgroundColor = useMemo(
    () => withAlpha(heroSurfaceTokens.bottomBarBackground, 0.26),
    [heroSurfaceTokens.bottomBarBackground],
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
  const handleOpenPaymentSheet = useCallback(() => {
    openPaymentSheet();
  }, [openPaymentSheet]);
  const handleOpenTeacherProfile = useCallback(() => {
    if (!data) {
      return;
    }

    router.push({
      params: {
        classId: data.id,
        kind: data.kind,
      },
      pathname: "/(app)/professor",
    });
  }, [data, router]);
  const handleOpenParticipants = useCallback(() => {
    setActiveSheet("participants");
  }, []);
  const handleOpenLocation = useCallback(() => {
    setActiveSheet("location");
  }, []);
  const handleSheetOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setActiveSheet(null);
    }
  }, []);
  const summarySection = useMemo(
    () => data?.sections.find((section) => section.id === "summary") ?? null,
    [data?.sections],
  );
  const contentSections = useMemo(
    () => data?.sections.filter((section) => section.id !== "summary") ?? [],
    [data?.sections],
  );

  useEffect(() => {
    if (!openPayment || !data || isPaymentSheetOpen || hasOpenedPaymentFromParamRef.current) {
      return;
    }

    hasOpenedPaymentFromParamRef.current = true;
    openPaymentSheet();
  }, [data, isPaymentSheetOpen, openPayment, openPaymentSheet]);

  if (isInitialLoading) {
    return <ClassDetailLoadingState />;
  }

  if (!data) {
    return errorMessage ? (
      <Screen className="flex-1 bg-background">
        <StatusBar style="light" />
        <EmptyState title="Aula indisponível" description={errorMessage} />
      </Screen>
    ) : (
      <Screen className="flex-1 bg-background">
        <StatusBar style="light" />
      </Screen>
    );
  }

  return (
    <Screen className="flex-1 bg-background">
      <StatusBar style="light" />
      <AnimatedScrollView
        headerMaxHeight={heroHeight}
        topBarHeight={topBarHeight}
        topBarElevation={3}
        HeaderComponent={
          <ClassDetailHero
            data={data}
            heroHeight={heroHeight}
            onCoachPress={handleOpenTeacherProfile}
            onLocationPress={handleOpenLocation}
            onParticipantsPress={handleOpenParticipants}
            onPricePress={handleOpenPaymentSheet}
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
              <HeaderIconButton
                tone="overlay"
                onPress={handleBack}
                accessibilityLabel="Voltar"
              >
                <ArrowLeftIcon
                  width={18}
                  height={18}
                  color="rgba(255, 255, 255, 0.98)"
                />
              </HeaderIconButton>

              <HeaderIconButton
                tone="overlay"
                onPress={handleShare}
                accessibilityLabel="Compartilhar aula"
              >
                <Feather
                  name="share-2"
                  size={16}
                  color="rgba(255, 255, 255, 0.98)"
                />
              </HeaderIconButton>
            </View>
          </View>
        }
        TopNavBarComponent={
          <View
            className="border-b px-3.5"
            style={{
              backgroundColor: topHeaderBackgroundColor,
              borderColor: topHeaderBorderColor,
              height: topBarHeight,
              paddingTop: insets.top,
            }}
          >
            <View className="h-12 flex-row items-center gap-2">
              <HeaderIconButton
                tone="overlay"
                className="border-white/25 bg-black/30"
                onPress={handleBack}
                accessibilityLabel="Voltar"
              >
                <ArrowLeftIcon
                  width={18}
                  height={18}
                  color="rgba(255, 255, 255, 0.96)"
                />
              </HeaderIconButton>

              <View
                className="size-8 overflow-hidden rounded-md"
                style={{
                  backgroundColor: miniThumbBackgroundColor,
                  borderColor: scrolledHeaderButtonBorderColor,
                  borderWidth: 1,
                }}
              >
                <SafeImage
                  source={data.coverImage}
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
                  style={{ color: "rgba(255, 255, 255, 0.96)" }}
                  numberOfLines={1}
                >
                  {data.title}
                </Text>
                <Text
                  className="text-xs font-semibold leading-4"
                  style={{ color: "rgba(255, 255, 255, 0.72)" }}
                  numberOfLines={1}
                >
                  {data.priceLabel}
                </Text>
              </View>

              <HeaderIconButton
                tone="overlay"
                className="border-white/25 bg-black/30"
                onPress={handleShare}
                accessibilityLabel="Compartilhar aula"
              >
                <Feather name="share-2" size={16} color="rgba(255, 255, 255, 0.96)" />
              </HeaderIconButton>
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
          className="px-5 pb-6 pt-12"
          style={{ backgroundColor: appBackgroundColor }}
        >
          <View className="gap-6">
            <View className="gap-2">
              <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
                <Text className="text-[15px] font-semibold text-foreground">
                  {data.dateLabel}
                </Text>
                <Text className="text-[15px] font-semibold text-muted">•</Text>
                <Text className="text-[15px] font-semibold text-foreground">
                  {data.timeLabel}
                </Text>
                <Text className="text-[15px] font-semibold text-muted">•</Text>
                <Text className="text-[15px] font-semibold text-foreground">
                  {data.durationLabel}
                </Text>
              </View>
              <Text className="text-sm text-muted">{data.statusBadge}</Text>
            </View>

            {summarySection ? (
              <View className="gap-2">
                {summarySection.paragraphs.map((paragraph) => (
                  <Text
                    key={`summary-${paragraph}`}
                    className="text-[15px] leading-7 text-muted"
                  >
                    {paragraph}
                  </Text>
                ))}
              </View>
            ) : null}

            {contentSections.map((section) => (
              <View key={section.id} className="gap-3">
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
                <View className="h-px" style={{ backgroundColor: withAlpha(appSurfaceColor, 0.75) }} />
              </View>
            ))}
          </View>
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
            onPress={handleOpenPaymentSheet}
          >
            <Button.Label className="text-sm font-semibold">
              {data.cta.label}
            </Button.Label>
          </Button>
        </View>
        {paymentErrorMessage || paymentNoticeMessage ? (
          <Text
            className="mt-2 text-center text-xs font-medium"
            style={{
              color: paymentErrorMessage
                ? appDangerColor
                : paymentNoticeMessage
                  ? appSuccessColor
                  : appMutedColor,
            }}
          >
            {paymentErrorMessage ?? paymentNoticeMessage}
          </Text>
        ) : null}
      </View>

      <BottomSheet
        isOpen={activeSheet !== null}
        onOpenChange={handleSheetOpenChange}
      >
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content
            detached
            bottomInset={Math.max(insets.bottom, 12)}
            className="mx-4"
            backgroundClassName="rounded-[30px]"
            snapPoints={["42%", "72%"]}
          >
            {activeSheet === "participants" ? (
              <View className="gap-5">
                <View className="gap-1">
                  <BottomSheet.Title>Alunos</BottomSheet.Title>
                  <BottomSheet.Description>
                    {data.participantsCountLabel}
                  </BottomSheet.Description>
                </View>
                {data.participants.length > 0 ? (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
                  >
                    {data.participants.map((participant, index) => (
                      <View
                        key={participant.id ?? `${participant.name ?? "aluno"}-${index}`}
                        className="flex-row items-center gap-3 rounded-[20px] bg-surface px-4 py-3"
                      >
                        <UserAvatar
                          className="size-10 rounded-full"
                          email={participant.email}
                          image={participant.image}
                          name={participant.name}
                          userId={participant.id}
                        />
                        <Text className="flex-1 text-base font-semibold text-foreground">
                          {participant.name ?? "Aluno DFC"}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Text className="text-sm leading-6 text-muted">
                    A lista completa fica disponível conforme as reservas forem confirmadas.
                  </Text>
                )}
              </View>
            ) : null}

            {activeSheet === "location" ? (
              <View className="gap-4">
                <View className="gap-1">
                  <BottomSheet.Title>Local</BottomSheet.Title>
                  <BottomSheet.Description>
                    {data.locationLabel}
                  </BottomSheet.Description>
                </View>
                <View className="rounded-[22px] bg-surface px-4 py-4">
                  <Text className="text-base font-semibold text-foreground">
                    {data.locationLabel}
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-muted">
                    {data.locationAddress ??
                      "O endereço detalhado aparece aqui quando estiver disponível na API da aula."}
                  </Text>
                </View>
              </View>
            ) : null}
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>

      <ClassPaymentSheet
        data={data}
        isOpen={isPaymentSheetOpen}
        isSubmitting={isSubmittingPayment}
        errorMessage={paymentErrorMessage}
        noticeMessage={paymentNoticeMessage}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closePaymentSheet();
          }
        }}
        onRefreshStatus={refreshPaymentStatus}
        onSubmit={submitPayment}
      />
    </Screen>
  );
}

export { ClassDetailScreen };
