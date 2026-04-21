import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheet, Button, useAppThemeColor } from "@/components/ui";
import ReacticxButton from "@/components/animations/reacticx/base";
import { ReacticxQrCode } from "@/components/animations/reacticx/base/qr-code";
import type { ClassDetailData } from "@/features/class-detail/types/class-detail";

interface ClassPaymentSheetProps {
  readonly data: ClassDetailData;
  readonly errorMessage: string | null;
  readonly isOpen: boolean;
  readonly isSubmitting: boolean;
  readonly noticeMessage: string | null;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly onRefreshStatus: () => Promise<void>;
  readonly onSubmit: () => Promise<void>;
}

interface PaymentSummaryRowProps {
  readonly label: string;
  readonly value: string;
}

function PaymentSummaryRow({ label, value }: PaymentSummaryRowProps): React.JSX.Element {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        {label}
      </Text>
      <Text className="max-w-[64%] text-right text-sm font-semibold text-foreground">
        {value}
      </Text>
    </View>
  );
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(cents / 100);
}

function formatCountdown(expiresAt: string | null): string | null {
  if (!expiresAt) {
    return null;
  }

  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) {
    return "Expirado";
  }

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

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

function ClassPaymentSheet({
  data,
  errorMessage,
  isOpen,
  isSubmitting,
  noticeMessage,
  onOpenChange,
  onRefreshStatus,
  onSubmit,
}: ClassPaymentSheetProps): React.JSX.Element {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const backgroundColor = useAppThemeColor("background");
  const foregroundColor = useAppThemeColor("foreground");
  const mutedColor = useAppThemeColor("muted");
  const dangerColor = useAppThemeColor("danger");
  const successColor = useAppThemeColor("success");
  const surfaceColor = useAppThemeColor("surface");
  const [isCopying, setIsCopying] = useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(() =>
    formatCountdown(data.booking?.expiresAt ?? null),
  );
  const previousBookingStatusRef = useRef(data.booking?.status ?? null);
  const booking = data.booking;
  const hasEnoughBalance =
    data.walletBalanceCents !== null && data.walletBalanceCents >= data.priceCents;
  const isPendingPayment = booking?.status === "PENDING_PAYMENT";
  const isConfirmed = booking?.status === "CONFIRMED";
  const canRunPrimaryAction = isPendingPayment || !data.cta.disabled;
  const qrCodeSize = useMemo(() => Math.min(windowWidth - 124, 220), [windowWidth]);
  const primaryButtonWidth = useMemo(() => Math.min(windowWidth - 64, 420), [windowWidth]);
  const cardBackgroundColor = useMemo(() => withAlpha(surfaceColor, 0.84), [surfaceColor]);
  const cardBorderColor = useMemo(() => withAlpha(foregroundColor, 0.08), [foregroundColor]);
  const dividerColor = useMemo(() => withAlpha(foregroundColor, 0.12), [foregroundColor]);
  const statusPillBackgroundColor = useMemo(
    () =>
      withAlpha(
        isConfirmed ? successColor : isPendingPayment ? foregroundColor : surfaceColor,
        isConfirmed ? 0.18 : 0.12,
      ),
    [foregroundColor, isConfirmed, isPendingPayment, successColor, surfaceColor],
  );
  const statusPillIconColor = isConfirmed ? successColor : foregroundColor;
  const balanceLabel = useMemo(
    () =>
      data.walletBalanceCents !== null
        ? formatCurrency(data.walletBalanceCents)
        : "Saldo indisponível",
    [data.walletBalanceCents],
  );
  const headerMeta = useMemo(
    () => `${data.dateLabel} • ${data.timeLabel} • ${data.locationLabel}`,
    [data.dateLabel, data.locationLabel, data.timeLabel],
  );
  const methodLabel = useMemo(() => {
    if (isConfirmed) {
      return "Pagamento concluído";
    }

    if (isPendingPayment) {
      return "Pix em andamento";
    }

    return hasEnoughBalance ? "Pagamento com saldo" : "Pagamento com Pix";
  }, [hasEnoughBalance, isConfirmed, isPendingPayment]);
  const statusTone = errorMessage ? dangerColor : noticeMessage ? successColor : mutedColor;
  const snapPoints = useMemo(() => {
    if (isPendingPayment) {
      return ["80%", "92%"];
    }

    return ["62%", "78%"];
  }, [isPendingPayment]);

  const paymentTitle = useMemo(() => {
    if (isConfirmed) {
      return "Reserva confirmada";
    }

    if (isPendingPayment) {
      return "Finalize o pagamento";
    }

    return hasEnoughBalance ? "Confirmar reserva" : "Gerar Pix";
  }, [hasEnoughBalance, isConfirmed, isPendingPayment]);

  const paymentDescription = useMemo(() => {
    if (isConfirmed) {
      return "Sua vaga está garantida. Agora é só acompanhar os detalhes da aula.";
    }

    if (isPendingPayment) {
      return "Use o app do banco para concluir. A confirmação aparece aqui automaticamente.";
    }

    return hasEnoughBalance
      ? "Seu saldo já cobre essa aula. A confirmação acontece sem sair desta tela."
      : "Seu saldo não cobre essa aula. Gere o Pix para continuar.";
  }, [hasEnoughBalance, isConfirmed, isPendingPayment]);

  const primaryActionLabel = useMemo(() => {
    if (isPendingPayment) {
      return "Verificar pagamento";
    }

    return hasEnoughBalance ? "Confirmar com saldo" : "Gerar Pix";
  }, [hasEnoughBalance, isPendingPayment]);

  const primaryLoadingLabel = useMemo(() => {
    if (isPendingPayment) {
      return "Verificando...";
    }

    return hasEnoughBalance ? "Confirmando..." : "Gerando Pix...";
  }, [hasEnoughBalance, isPendingPayment]);

  useEffect(() => {
    if (booking?.status !== "PENDING_PAYMENT") {
      setTimeLeft(null);
      return;
    }

    const updateCountdown = () => {
      setTimeLeft(formatCountdown(booking.expiresAt));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [booking?.expiresAt, booking?.status]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, [isOpen]);

  useEffect(() => {
    if (
      previousBookingStatusRef.current === "PENDING_PAYMENT" &&
      booking?.status === "CONFIRMED"
    ) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined,
      );
    }

    previousBookingStatusRef.current = booking?.status ?? null;
  }, [booking?.status]);

  const handleCopyPixCode = useCallback(async () => {
    if (!booking?.pixCode || isCopying) {
      return;
    }

    setIsCopying(true);

    try {
      const clipboard = await import("expo-clipboard");
      await clipboard.setStringAsync(booking.pixCode);
      setCopyFeedback("Código Pix copiado");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined,
      );
    } catch {
      setCopyFeedback("Não foi possível copiar agora");
    } finally {
      setTimeout(() => setIsCopying(false), 1200);
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  }, [booking?.pixCode, isCopying]);

  const handlePrimaryAction = useCallback(async () => {
    if (!canRunPrimaryAction) {
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);

    if (isPendingPayment) {
      setIsRefreshingStatus(true);
      try {
        await onRefreshStatus();
      } finally {
        setIsRefreshingStatus(false);
      }
      return;
    }

    await onSubmit();
  }, [canRunPrimaryAction, isPendingPayment, onRefreshStatus, onSubmit]);

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          detached
          bottomInset={Math.max(insets.bottom + 8, 16)}
          className="mx-3"
          backgroundClassName="rounded-[28px] bg-surface"
          enableDynamicSizing={false}
          index={0}
          snapPoints={snapPoints}
        >
          <View className="flex-1">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                gap: 16,
                paddingHorizontal: 18,
                paddingTop: 18,
                paddingBottom: 14,
              }}
            >
              <View className="gap-1.5">
                <BottomSheet.Title className="text-[22px] font-semibold leading-[28px] text-foreground">
                  {paymentTitle}
                </BottomSheet.Title>
                <BottomSheet.Description className="text-sm leading-5 text-muted">
                  {paymentDescription}
                </BottomSheet.Description>
                <Text className="text-sm leading-6 text-muted" numberOfLines={2}>
                  {headerMeta}
                </Text>
              </View>

              <View
                className="flex-row items-center justify-between rounded-full px-3 py-2"
                style={{ backgroundColor: statusPillBackgroundColor }}
              >
                <View className="flex-row items-center gap-2">
                  <Feather
                    name={isConfirmed ? "check-circle" : isPendingPayment ? "clock" : "credit-card"}
                    size={14}
                    color={statusPillIconColor}
                  />
                  <Text className="text-sm font-semibold" style={{ color: statusPillIconColor }}>
                    {methodLabel}
                  </Text>
                </View>
                {timeLeft && isPendingPayment ? (
                  <View className="items-end">
                    <Text className="text-[11px] uppercase text-muted">expira em</Text>
                    <Text className="text-sm font-semibold" style={{ color: statusPillIconColor }}>
                      {timeLeft}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View
                className="gap-4 rounded-[22px] px-4 py-4"
                style={{
                  backgroundColor: cardBackgroundColor,
                  borderColor: cardBorderColor,
                  borderWidth: 1,
                }}
              >
                <View className="gap-1">
                  <Text className="text-xs uppercase text-muted">Valor total</Text>
                  <Text className="text-[30px] font-semibold leading-[34px] text-foreground">
                    {data.priceLabel}
                  </Text>
                  <Text className="text-sm text-muted" numberOfLines={2}>
                    {data.title}
                  </Text>
                </View>

                <View className="h-px" style={{ backgroundColor: dividerColor }} />

                <View className="gap-3">
                  <PaymentSummaryRow label="Quando" value={`${data.dateLabel} • ${data.timeLabel}`} />
                  <PaymentSummaryRow label="Local" value={data.locationLabel} />
                  <PaymentSummaryRow label="Saldo disponível" value={balanceLabel} />
                </View>
              </View>

              {isPendingPayment && booking?.pixCode ? (
                <View
                  className="gap-4 rounded-[22px] px-4 py-4"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderColor: cardBorderColor,
                    borderWidth: 1,
                  }}
                >
                  <View className="items-center gap-3 rounded-[18px] bg-background px-3 py-3">
                    <ReacticxQrCode data={booking.pixCode} size={qrCodeSize} />
                    <Text className="text-center text-sm font-semibold text-foreground">
                      Escaneie no app do banco
                    </Text>
                    <Text className="text-center text-xs leading-5 text-muted">
                      Também dá para pagar com o código abaixo.
                    </Text>
                  </View>

                  <View className="gap-2 rounded-[16px] bg-background px-3 py-3">
                    <Text className="text-xs uppercase text-muted">Copia e cola Pix</Text>
                    <Text className="text-sm leading-6 text-foreground" numberOfLines={4}>
                      {booking.pixCode}
                    </Text>
                    <Button
                      variant="tertiary"
                      size="lg"
                      onPress={handleCopyPixCode}
                      isDisabled={isCopying}
                    >
                      <Button.Label className="text-sm font-semibold">
                        {copyFeedback ?? (isCopying ? "Copiando..." : "Copiar código")}
                      </Button.Label>
                    </Button>
                  </View>
                </View>
              ) : null}

              {isConfirmed ? (
                <View
                  className="items-center gap-3 rounded-[22px] px-4 py-5"
                  style={{
                    backgroundColor: withAlpha(successColor, 0.12),
                    borderColor: withAlpha(successColor, 0.22),
                    borderWidth: 1,
                  }}
                >
                  <View
                    className="size-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: withAlpha(successColor, 0.2) }}
                  >
                    <Feather name="check" size={22} color={successColor} />
                  </View>
                  <Text className="text-center text-sm leading-6 text-foreground">
                    Pagamento confirmado. Sua vaga está garantida.
                  </Text>
                </View>
              ) : null}

              {!booking ? (
                <View
                  className="gap-2 rounded-[22px] px-4 py-4"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderColor: cardBorderColor,
                    borderWidth: 1,
                  }}
                >
                  <Text className="text-sm font-medium text-foreground">
                    {hasEnoughBalance
                      ? "Seu saldo cobre o valor total da aula."
                      : "A confirmação desta aula acontece por Pix."}
                  </Text>
                  <Text className="text-sm leading-6 text-muted">
                    {hasEnoughBalance
                      ? "Ao confirmar, a reserva entra na hora."
                      : "Gere o Pix e acompanhe o status sem sair do app."}
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            <View
              className="gap-2 px-5 pt-2"
              style={{ paddingBottom: Math.max(insets.bottom + 4, 14) }}
            >
              {errorMessage || noticeMessage ? (
                <Text
                  className="text-center text-sm font-medium leading-6"
                  style={{ color: statusTone }}
                >
                  {errorMessage ?? noticeMessage}
                </Text>
              ) : null}

              {!isConfirmed ? (
                <View className="items-center gap-1">
                  <ReacticxButton
                    width={primaryButtonWidth}
                    height={54}
                    borderRadius={18}
                    backgroundColor={foregroundColor}
                    loadingTextBackgroundColor={withAlpha(foregroundColor, 0.86)}
                    loadingTextColor={backgroundColor}
                    loadingText={primaryLoadingLabel}
                    showLoadingIndicator
                    isLoading={isSubmitting || isRefreshingStatus}
                    disabled={!canRunPrimaryAction}
                    onPress={() => {
                      void handlePrimaryAction();
                    }}
                    style={{ width: primaryButtonWidth }}
                  >
                    <View className="flex-row items-center justify-center gap-2">
                      <Feather
                        name={isPendingPayment ? "refresh-cw" : hasEnoughBalance ? "check" : "credit-card"}
                        size={16}
                        color={backgroundColor}
                      />
                      <Text className="text-sm font-semibold" style={{ color: backgroundColor }}>
                        {primaryActionLabel}
                      </Text>
                    </View>
                  </ReacticxButton>
                  {isPendingPayment ? (
                    <Text className="text-xs text-muted">Já pagou? toque para atualizar.</Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

export { ClassPaymentSheet };
export type { ClassPaymentSheetProps };
