import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import ChevronLeftIcon from "@gravity-ui/icons/svgs/chevron-left.svg";
import ChevronRightIcon from "@gravity-ui/icons/svgs/chevron-right.svg";
import ReacticxButton from "@/components/animations/reacticx/base";
import {
  BottomSheet,
  Button,
  EmptyState,
  GravityIcon,
  Screen,
  Skeleton,
  useAppThemeColor,
} from "@/components/ui";
import { useAccount } from "@/features/account";
import { useAgendarSchedule } from "@/features/agendar/hooks/use-agendar-schedule";
import { resolveBookingSheetState } from "@/features/agendar/services/booking-sheet-state";
import type {
  SchedulePeriodFilter,
  ScheduleSlot,
} from "@/features/agendar/types/agendar";

const PERIOD_OPTIONS: ReadonlyArray<{
  readonly label: string;
  readonly value: SchedulePeriodFilter;
}> = [
  { label: "Todos", value: "all" },
  { label: "Manhã", value: "morning" },
  { label: "Tarde", value: "afternoon" },
  { label: "Noite", value: "night" },
];

const PERIOD_LABELS: Record<Exclude<SchedulePeriodFilter, "all">, string> = {
  afternoon: "TARDE",
  morning: "MANHÃ",
  night: "NOITE",
};

function normalizeDate(date: Date): Date {
  const next = new Date(date);
  next.setHours(12, 0, 0, 0);
  return next;
}

function parseDateISO(dateISO: string): Date {
  return normalizeDate(new Date(`${dateISO}T12:00:00`));
}

function formatDateISO(date: Date): string {
  const normalized = normalizeDate(date);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, "0");
  const day = String(normalized.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeekMonday(date: Date): Date {
  const normalized = normalizeDate(date);
  const dayIndex = (normalized.getDay() + 6) % 7;
  normalized.setDate(normalized.getDate() - dayIndex);
  return normalized;
}

function buildWeekDays(weekStartISO: string): string[] {
  const weekStart = parseDateISO(weekStartISO);
  return Array.from({ length: 7 }).map((_, index) => {
    const next = normalizeDate(weekStart);
    next.setDate(next.getDate() + index);
    return formatDateISO(next);
  });
}

function buildWeekStarts(todayISO: string, maxDateISO: string): string[] {
  const starts: string[] = [];
  const cursor = startOfWeekMonday(parseDateISO(todayISO));
  const maxDate = parseDateISO(maxDateISO);
  const maxWeekStart = startOfWeekMonday(maxDate);

  while (cursor <= maxWeekStart) {
    starts.push(formatDateISO(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }

  return starts;
}

function buildCalendarSlots(monthStart: Date): Array<Date | null> {
  const start = normalizeDate(monthStart);
  const firstWeekDay = start.getDay();
  const startOffset = (firstWeekDay + 6) % 7;
  const endDate = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  const totalDays = endDate.getDate();
  const slots: Array<Date | null> = [];

  for (let index = 0; index < startOffset; index += 1) {
    slots.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    slots.push(normalizeDate(new Date(start.getFullYear(), start.getMonth(), day)));
  }

  while (slots.length % 7 !== 0) {
    slots.push(null);
  }

  return slots;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(cents / 100);
}

function formatDateLong(dateISO: string): string {
  return parseDateISO(dateISO).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });
}

function formatSlotDate(slot: ScheduleSlot): string {
  return slot.date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
}

function formatSlotTime(slot: ScheduleSlot): string {
  return `${slot.time} às ${slot.endTime}`;
}

function resolveSlotTitle(slot: ScheduleSlot): string {
  if (slot.coach?.name) {
    return `Aula com Prof. ${slot.coach.name}`;
  }

  return "Aula DFC Tennis";
}

function resolveSlotPill(slot: ScheduleSlot): { readonly label: string; readonly tone: "default" | "success" | "warning" } {
  if (slot.currentUserBooking?.status === "PENDING_PAYMENT") {
    return { label: "Pagamento pendente", tone: "warning" };
  }

  if (slot.currentUserBooking?.status === "CONFIRMED" || slot.isCurrentUserEnrolled) {
    return { label: "Confirmada", tone: "success" };
  }

  if (slot.status === "SOLD_OUT") {
    return { label: "Sem vagas", tone: "default" };
  }

  return { label: "Disponível", tone: "default" };
}

function PendingPaymentCountdown({
  expiresAt,
  isActive,
}: {
  readonly expiresAt: Date;
  readonly isActive: boolean;
}): React.JSX.Element {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isActive) {
      return;
    }

    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isActive, expiresAt]);

  const diff = Math.max(0, expiresAt.getTime() - now);
  const minutes = Math.floor(diff / 60_000)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((diff % 60_000) / 1000)
    .toString()
    .padStart(2, "0");

  return (
    <Text className="text-xs font-semibold text-warning">
      {`Pagamento pendente · ${minutes}:${seconds}`}
    </Text>
  );
}

function AgendarScreen(): React.JSX.Element {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();
  const { data: accountData } = useAccount();
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const {
    availabilityDays,
    cancelBooking,
    createBookingIntent,
    dayData,
    errorMessage,
    isLoading,
    isMutating,
    reload,
    selectedDateISO,
    selectedPeriod,
    setSelectedDateISO,
    setSelectedPeriod,
  } = useAgendarSchedule();
  const weekListRef = useRef<FlatList<string> | null>(null);
  const background = useAppThemeColor("background");
  const foreground = useAppThemeColor("foreground");
  const mutedColor = useAppThemeColor("muted");

  const todayISO = useMemo(() => formatDateISO(new Date()), []);
  const maxDateISO = useMemo(() => {
    if (availabilityDays.length > 0) {
      return availabilityDays[availabilityDays.length - 1]?.date ?? todayISO;
    }

    const fallback = normalizeDate(new Date());
    fallback.setDate(fallback.getDate() + 84);
    return formatDateISO(fallback);
  }, [availabilityDays, todayISO]);

  const weekStarts = useMemo(
    () => buildWeekStarts(todayISO, maxDateISO),
    [maxDateISO, todayISO],
  );
  const selectedWeekStart = formatDateISO(startOfWeekMonday(parseDateISO(selectedDateISO)));
  const selectedWeekIndex = Math.max(weekStarts.indexOf(selectedWeekStart), 0);
  const todayDate = useMemo(() => parseDateISO(todayISO), [todayISO]);
  const todayMonthStartISO = useMemo(() => {
    return formatDateISO(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  }, [todayDate]);

  const availabilityMap = useMemo(() => {
    const map = new Map<string, boolean>();
    availabilityDays.forEach((item) => map.set(item.date, item.hasAvailableClasses));
    return map;
  }, [availabilityDays]);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const selected = parseDateISO(selectedDateISO);
    return normalizeDate(new Date(selected.getFullYear(), selected.getMonth(), 1));
  });

  const calendarSlots = useMemo(() => buildCalendarSlots(calendarMonth), [calendarMonth]);
  const calendarMonthLabel = calendarMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const balanceCents = accountData?.balanceCents ?? 0;
  const balanceLabel = accountData?.balanceLabel ?? "Saldo indisponível";

  const selectedSlotState = useMemo(() => {
    if (!selectedSlot) {
      return null;
    }
    return resolveBookingSheetState(selectedSlot, balanceCents);
  }, [balanceCents, selectedSlot]);

  useEffect(() => {
    const selected = parseDateISO(selectedDateISO);
    setCalendarMonth(normalizeDate(new Date(selected.getFullYear(), selected.getMonth(), 1)));
  }, [selectedDateISO]);

  useEffect(() => {
    if (!weekListRef.current || weekStarts.length === 0) {
      return;
    }

    weekListRef.current.scrollToIndex({
      animated: true,
      index: selectedWeekIndex,
    });
  }, [selectedWeekIndex, weekStarts.length]);

  const periodGroups = useMemo(() => {
    if (!dayData) {
      return [];
    }

    if (selectedPeriod === "all") {
      return (Object.keys(dayData.periodGroups) as Array<Exclude<SchedulePeriodFilter, "all">>)
        .map((period) => ({
          items: dayData.periodGroups[period],
          period,
        }))
        .filter((group) => group.items.length > 0);
    }

    return [
      {
        items: dayData.periodGroups[selectedPeriod],
        period: selectedPeriod,
      },
    ].filter((group) => group.items.length > 0);
  }, [dayData, selectedPeriod]);

  const slotsForCurrentPeriod = dayData?.selectedPeriodSlots ?? [];
  const hasSlotsInDay = (dayData?.slots.length ?? 0) > 0;
  const hasSlotsInCurrentPeriod = slotsForCurrentPeriod.length > 0;

  const openSlotSheet = (slot: ScheduleSlot) => {
    setActionMessage(null);
    setSelectedSlot(slot);
    setIsSheetOpen(true);
  };

  const handleSheetOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen);

    if (!isOpen) {
      setActionMessage(null);
      setSelectedSlot(null);
    }
  };

  const executePrimaryAction = async () => {
    if (!selectedSlot || !selectedSlotState?.canProceed) {
      return;
    }

    try {
      if (selectedSlotState.canCreate) {
        const result = await createBookingIntent(selectedSlot.id);

        if (result.paidWithBalance) {
          setActionMessage("Reserva confirmada com saldo.");
          reload();
          return;
        }

        router.push({
          params: {
            id: selectedSlot.id,
            openPayment: "1",
          },
          pathname: "/(app)/aula/[id]",
        });
        setIsSheetOpen(false);
        return;
      }

      if (selectedSlotState.pendingBookingId) {
        router.push({
          params: {
            id: selectedSlot.id,
            openPayment: "1",
          },
          pathname: "/(app)/aula/[id]",
        });
        setIsSheetOpen(false);
      }
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "Falha ao processar reserva.");
    }
  };

  const handlePrimaryAction = () => {
    if (!selectedSlot || !selectedSlotState?.canProceed) {
      return;
    }

    const confirmationTitle = selectedSlotState.canCreate
      ? "Confirmar pagamento?"
      : "Continuar para pagamento?";
    const confirmationDescription = selectedSlotState.canCreate
      ? "Você vai iniciar o pagamento desta reserva."
      : "Você será direcionado para finalizar o Pix desta reserva.";

    Alert.alert(confirmationTitle, confirmationDescription, [
      {
        style: "cancel",
        text: "Voltar",
      },
      {
        text: "Confirmar",
        onPress: () => {
          void executePrimaryAction();
        },
      },
    ]);
  };

  const executeCancelBooking = async () => {
    if (!selectedSlotState?.pendingBookingId) {
      return;
    }

    const success = await cancelBooking(selectedSlotState.pendingBookingId);
    setActionMessage(success ? "Reserva cancelada." : "Não foi possível cancelar.");
    if (success) {
      reload();
    }
  };

  const handleCancelBooking = () => {
    if (!selectedSlotState?.pendingBookingId) {
      return;
    }

    Alert.alert(
      "Cancelar reserva?",
      "Essa ação pode liberar sua vaga para outro aluno.",
      [
        {
          style: "cancel",
          text: "Voltar",
        },
        {
          style: "destructive",
          text: "Cancelar reserva",
          onPress: () => {
            void executeCancelBooking();
          },
        },
      ],
    );
  };

  const handleWeekMomentumEnd = (offsetX: number) => {
    const pageWidth = Math.max(width - 36, 1);
    const index = Math.round(offsetX / pageWidth);
    const weekStart = weekStarts[index];
    if (!weekStart) {
      return;
    }

    const weekDays = buildWeekDays(weekStart);
    const currentWeekdayIndex = (parseDateISO(selectedDateISO).getDay() + 6) % 7;
    const nextSelectionCandidate = weekDays[currentWeekdayIndex] ?? weekDays[0];
    const nextSelection =
      nextSelectionCandidate >= todayISO
        ? nextSelectionCandidate
        : weekDays.find((dateISO) => dateISO >= todayISO) ?? weekDays[weekDays.length - 1];
    setSelectedDateISO(nextSelection);
  };

  return (
    <Screen className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 14, paddingBottom: 130, paddingHorizontal: 18, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold capitalize text-foreground">
            {formatDateLong(selectedDateISO)}
          </Text>
          <Button
            variant="tertiary"
            size="icon-xs"
            className="bg-surface"
            onPress={() => setIsCalendarOpen(true)}
          >
            <GravityIcon name="agenda" size={16} />
          </Button>
        </View>

        <FlatList
          ref={weekListRef}
          data={weekStarts}
          horizontal
          pagingEnabled
          initialScrollIndex={selectedWeekIndex}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          getItemLayout={(_, index) => ({
            index,
            length: width - 36,
            offset: (width - 36) * index,
          })}
          onMomentumScrollEnd={(event) => handleWeekMomentumEnd(event.nativeEvent.contentOffset.x)}
          renderItem={({ item }) => {
            const weekDays = buildWeekDays(item);
            return (
              <View
                style={{ width: width - 36 }}
                className="flex-row justify-between rounded-[22px] bg-surface px-3 py-3"
              >
                {weekDays.map((dayISO) => {
                  const date = parseDateISO(dayISO);
                  const isSelected = dayISO === selectedDateISO;
                  const isPast = dayISO < todayISO;
                  const hasAvailableClasses = availabilityMap.get(dayISO) ?? false;

                  return (
                    <Pressable
                      key={dayISO}
                      className="items-center gap-1"
                      disabled={isPast}
                      onPress={() => setSelectedDateISO(dayISO)}
                    >
                      <Text className={isSelected ? "text-xs font-semibold uppercase text-foreground" : "text-xs font-medium uppercase text-muted"}>
                        {date.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3)}
                      </Text>
                      <View className={isSelected
                        ? "size-9 items-center justify-center rounded-full bg-foreground"
                        : "size-9 items-center justify-center rounded-full bg-surface"}
                      >
                        <Text className={isSelected ? "text-sm font-semibold text-background" : "text-sm font-semibold text-foreground"}>
                          {date.getDate()}
                        </Text>
                      </View>
                      <View className={hasAvailableClasses ? "size-1.5 rounded-full bg-foreground" : "size-1.5 rounded-full bg-border"} />
                    </Pressable>
                  );
                })}
              </View>
            );
          }}
        />

        <View className="rounded-full bg-surface p-1">
          <View className="flex-row">
            {PERIOD_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setSelectedPeriod(option.value)}
                className={selectedPeriod === option.value ? "flex-1 items-center rounded-full bg-background py-2" : "flex-1 items-center rounded-full py-2"}
              >
                <Text className={selectedPeriod === option.value ? "text-sm font-semibold text-foreground" : "text-sm text-muted"}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {isLoading && !dayData ? (
          <View className="gap-4 pt-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`agendar-loading-${index}`} className="h-20 w-full rounded-[18px]" />
            ))}
          </View>
        ) : null}

        {!isLoading && errorMessage && !dayData ? (
          <EmptyState
            title="Falha ao carregar horários"
            description={errorMessage}
            cta={(
              <Button variant="primary" onPress={reload}>
                <Button.Label>Tentar novamente</Button.Label>
              </Button>
            )}
          />
        ) : null}

        {!isLoading && dayData && !hasSlotsInDay ? (
          <EmptyState
            title="Sem aulas neste dia"
            description="Não há aulas agendadas para este dia."
          />
        ) : null}

        {!isLoading && dayData && hasSlotsInDay && !hasSlotsInCurrentPeriod ? (
          <EmptyState
            title="Nenhum horário nesse período"
            description="Tente outro filtro para encontrar horários disponíveis."
            cta={(
              <Button variant="secondary" onPress={() => setSelectedPeriod("all")}>
                <Button.Label>Ver todos</Button.Label>
              </Button>
            )}
          />
        ) : null}

        {!isLoading && periodGroups.map((group) => (
          <View key={group.period} className="gap-3">
            <Text className="text-xs font-semibold tracking-[0.12em] text-muted">
              {PERIOD_LABELS[group.period]}
            </Text>

            {group.items.map((slot) => {
              const pill = resolveSlotPill(slot);
              return (
                <Pressable
                  key={slot.id}
                  onPress={() => openSlotSheet(slot)}
                  className="gap-2 rounded-[20px] bg-surface px-4 py-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-foreground">{formatSlotDate(slot)}</Text>
                    <View className={pill.tone === "success"
                      ? "rounded-full bg-success/20 px-3 py-1"
                      : pill.tone === "warning"
                        ? "rounded-full bg-warning/20 px-3 py-1"
                        : "rounded-full bg-background px-3 py-1"}
                    >
                      <Text className={pill.tone === "success"
                        ? "text-xs font-semibold text-success"
                        : pill.tone === "warning"
                          ? "text-xs font-semibold text-warning"
                          : "text-xs font-semibold text-foreground"}
                      >
                        {pill.label}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-base font-semibold text-foreground">{formatSlotTime(slot)}</Text>
                  <Text className="text-sm text-muted">{resolveSlotTitle(slot)}</Text>
                  <View className="flex-row items-center gap-2">
                    <GravityIcon name="location" size={14} colorToken="muted" />
                    <Text className="text-sm text-muted">{slot.resourceName}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <BottomSheet isOpen={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content
            snapPoints={["58%"]}
            enableDynamicSizing={false}
            index={0}
          >
            <View className="gap-4 px-5 py-5">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold capitalize text-foreground">{calendarMonthLabel}</Text>
                <View className="flex-row items-center gap-2">
                  <Pressable
                    accessibilityRole="button"
                    className="size-8 items-center justify-center rounded-full bg-background"
                    disabled={formatDateISO(calendarMonth) <= todayMonthStartISO}
                    onPress={() => {
                      const next = normalizeDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
                      if (formatDateISO(next) >= todayMonthStartISO) {
                        setCalendarMonth(next);
                      }
                    }}
                  >
                    <ChevronLeftIcon width={14} height={14} color={mutedColor} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    className="size-8 items-center justify-center rounded-full bg-background"
                    onPress={() => {
                      const next = normalizeDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
                      setCalendarMonth(next);
                    }}
                  >
                    <ChevronRightIcon width={14} height={14} color={mutedColor} />
                  </Pressable>
                  <BottomSheet.Close />
                </View>
              </View>

              <View className="flex-row justify-between">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((label) => (
                  <Text key={label} className="w-9 text-center text-xs font-medium text-muted">{label}</Text>
                ))}
              </View>

              <View className="flex-row flex-wrap gap-y-2">
                {calendarSlots.map((date, index) => {
                  if (!date) {
                    return <View key={`empty-${index}`} className="w-[14.28%] items-center" />;
                  }

                  const dayISO = formatDateISO(date);
                  const isSelected = dayISO === selectedDateISO;
                  const isPast = dayISO < todayISO;

                  return (
                    <View key={dayISO} className="w-[14.28%] items-center">
                      <Pressable
                        accessibilityRole="button"
                        className={isSelected ? "size-9 items-center justify-center rounded-full bg-foreground" : "size-9 items-center justify-center rounded-full bg-background"}
                        disabled={isPast}
                        onPress={() => {
                          setSelectedDateISO(dayISO);
                          setIsCalendarOpen(false);
                        }}
                      >
                        <Text className={isSelected ? "text-sm font-semibold text-background" : isPast ? "text-sm text-muted/50" : "text-sm font-medium text-foreground"}>
                          {date.getDate()}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>

              <Button variant="secondary" size="lg" onPress={() => setIsCalendarOpen(false)}>
                <Button.Label>Fechar</Button.Label>
              </Button>
            </View>
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>

      <BottomSheet isOpen={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content
            detached
            className="mx-3"
            backgroundClassName="rounded-[28px] bg-surface"
            snapPoints={["74%"]}
            enableDynamicSizing={false}
            index={0}
          >
            {selectedSlot && selectedSlotState ? (
              <View className="flex-1 gap-4 px-5 pb-8 pt-5">
                <View className="flex-row items-center justify-end">
                  <BottomSheet.Close />
                </View>
                {selectedSlot.currentUserBooking?.status === "PENDING_PAYMENT" ? (
                  <View className="items-center">
                    <View className="rounded-full bg-warning/20 px-3 py-1">
                      {selectedSlot.currentUserBooking.expiresAt ? (
                        <PendingPaymentCountdown
                          expiresAt={selectedSlot.currentUserBooking.expiresAt}
                          isActive={isFocused && isSheetOpen}
                        />
                      ) : (
                        <Text className="text-xs font-semibold text-warning">
                          Pagamento pendente
                        </Text>
                      )}
                    </View>
                  </View>
                ) : null}

                <View className="rounded-[24px] border border-border bg-background px-4 py-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="size-6 items-center justify-center rounded-full bg-surface">
                        <GravityIcon name="profile" size={12} colorToken="muted" />
                      </View>
                      <Text className="text-xs font-medium text-foreground">Você</Text>
                    </View>
                    <View className="size-6 items-center justify-center rounded-full bg-surface">
                      <GravityIcon name="clock" size={12} colorToken="muted" />
                    </View>
                  </View>

                  <View className="mt-4 items-center gap-1">
                    <Text className="text-3xl font-semibold text-foreground">{formatSlotDate(selectedSlot)}</Text>
                    <Text className="text-xl text-muted">{formatSlotTime(selectedSlot).replace("->", "-")}</Text>
                    <Text className="text-sm text-muted">
                      {selectedSlot.participantsCount > 0 ? `${selectedSlot.participantsCount} pessoas já reservaram` : "Seja o primeiro a reservar"}
                    </Text>
                  </View>
                </View>

                <View className="rounded-[20px] bg-background px-4 py-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="size-10 items-center justify-center rounded-full bg-surface">
                        <GravityIcon name="profile" size={16} colorToken="muted" />
                      </View>
                      <View>
                        <Text className="text-base font-semibold text-foreground">
                          {selectedSlot.coach?.name ? `Prof. ${selectedSlot.coach.name}` : "Professor DFC"}
                        </Text>
                        <View className="mt-1 flex-row items-center gap-1">
                          <GravityIcon name="location" size={13} colorToken="muted" />
                          <Text className="text-sm text-muted">{selectedSlot.resourceName}</Text>
                        </View>
                      </View>
                    </View>
                    <Text className="text-2xl font-semibold text-foreground">
                      {formatCurrency(selectedSlot.priceCents)}
                    </Text>
                  </View>
                </View>

                <View className="items-center gap-1">
                  <Text className="text-sm text-muted">Saldo disponível <Text className="font-semibold text-foreground">{balanceLabel}</Text></Text>
                  <Text className="text-xs text-muted">{selectedSlotState.helperLabel}</Text>
                </View>

                {actionMessage ? (
                  <Text className="text-center text-sm font-medium text-success">{actionMessage}</Text>
                ) : null}

                <View className="items-center gap-2 pt-2">
                  <ReacticxButton
                    width={Math.max(width - 54, 300)}
                    height={56}
                    borderRadius={18}
                    backgroundColor={foreground}
                    loadingTextColor={background}
                    loadingTextBackgroundColor={foreground}
                    isLoading={isMutating}
                    disabled={!selectedSlotState.canProceed}
                    onPress={() => {
                      void handlePrimaryAction();
                    }}
                  >
                    <Text className="text-sm font-semibold text-background">
                      {selectedSlotState.ctaLabel}
                    </Text>
                  </ReacticxButton>

                  {selectedSlotState.canCancel ? (
                    <Button
                      variant="link"
                      size="sm"
                      isDisabled={isMutating}
                      onPress={() => {
                        void handleCancelBooking();
                      }}
                    >
                      <Button.Label className="text-danger">
                        {isMutating ? "Cancelando..." : "Cancelar reserva"}
                      </Button.Label>
                    </Button>
                  ) : null}
                </View>
              </View>
            ) : null}
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </Screen>
  );
}

export { AgendarScreen };
