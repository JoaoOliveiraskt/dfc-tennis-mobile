import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  BottomSheet,
  Button,
  EmptyState,
  GravityIcon,
  Screen,
  Skeleton,
} from "@/components/ui";
import { useAgendaBookings } from "@/features/agenda/hooks/use-agenda-bookings";
import type {
  AgendaBooking,
  AgendaHistoryFilterPeriod,
  AgendaHistoryFilterStatus,
  AgendaTab,
} from "@/features/agenda/types/agenda";

const HISTORY_PERIOD_OPTIONS: ReadonlyArray<{
  readonly label: string;
  readonly value: AgendaHistoryFilterPeriod;
}> = [
  { label: "Todos os períodos", value: "all" },
  { label: "Este mês", value: "this_month" },
  { label: "Últimos 3 meses", value: "last_3_months" },
];

const HISTORY_STATUS_OPTIONS: ReadonlyArray<{
  readonly label: string;
  readonly value: AgendaHistoryFilterStatus;
}> = [
  { label: "Todos os status", value: "all" },
  { label: "Concluídas", value: "completed" },
  { label: "Canceladas", value: "canceled" },
  { label: "Pendentes de pagamento", value: "pending_payment" },
];

function formatTimeRange(booking: AgendaBooking): string {
  return `${booking.classInfo.startTime} - ${booking.classInfo.endTime}`;
}

function resolveBookingTitle(booking: AgendaBooking): string {
  if (booking.classInfo.coach?.name) {
    return `Aula com Prof. ${booking.classInfo.coach.name}`;
  }

  return "Aula DFC Tennis";
}

function resolveStatusTone(
  status: AgendaBooking["status"],
): {
  readonly containerClassName: string;
  readonly label: string;
  readonly labelClassName: string;
} {
  if (status === "CONFIRMED") {
    return {
      containerClassName: "bg-success/20",
      label: "Confirmada",
      labelClassName: "text-success",
    };
  }

  if (status === "PENDING_PAYMENT" || status === "PENDING") {
    return {
      containerClassName: "bg-warning/20",
      label: "Pagamento pendente",
      labelClassName: "text-warning",
    };
  }

  if (status === "CANCELED") {
    return {
      containerClassName: "bg-danger/20",
      label: "Cancelada",
      labelClassName: "text-danger",
    };
  }

  return {
    containerClassName: "bg-surface",
    label: "Concluída",
    labelClassName: "text-foreground",
  };
}

function AgendaLoadingState(): React.JSX.Element {
  return (
    <View className="gap-4 px-4 pb-12 pt-4">
      <Skeleton className="h-14 w-full rounded-full" />
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={`agenda-loading-${index}`} className="gap-3 rounded-[22px] bg-surface px-4 py-4">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-9 w-48 rounded-xl" />
          <Skeleton className="h-4 w-40 rounded-full" />
        </View>
      ))}
    </View>
  );
}

function AgendaBookingCard({
  booking,
  isMutating,
  onCancel,
  onOpenClassDetail,
}: {
  readonly booking: AgendaBooking;
  readonly isMutating: boolean;
  readonly onCancel: (bookingId: string) => void;
  readonly onOpenClassDetail: (booking: AgendaBooking) => void;
}): React.JSX.Element {
  const statusTone = resolveStatusTone(booking.status);

  return (
    <Pressable
      key={booking.id}
      className="gap-3 rounded-[22px] bg-surface px-4 py-4"
      onPress={() => onOpenClassDetail(booking)}
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-sm font-semibold text-foreground">
          {booking.classInfo.date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            weekday: "short",
          })}
        </Text>
        <View className={`rounded-full px-3 py-1 ${statusTone.containerClassName}`}>
          <Text className={`text-xs font-semibold ${statusTone.labelClassName}`}>
            {statusTone.label}
          </Text>
        </View>
      </View>

      <Text className="text-[28px] font-semibold leading-[32px] text-foreground">
        {formatTimeRange(booking)}
      </Text>
      <Text className="text-sm font-medium text-muted">
        {resolveBookingTitle(booking)}
      </Text>

      <View className="flex-row items-center gap-2">
        <GravityIcon name="location" size={14} colorToken="muted" />
        <Text className="text-sm text-muted">{booking.classInfo.resource.name}</Text>
      </View>

      {(booking.status === "PENDING_PAYMENT" || booking.status === "PENDING") ? (
        <View className="flex-row gap-2 pt-1">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onPress={() => onOpenClassDetail(booking)}
          >
            <Button.Label>Continuar Pix</Button.Label>
          </Button>
          <Button
            size="sm"
            variant="tertiary"
            className="flex-1"
            isDisabled={isMutating}
            onPress={() => onCancel(booking.id)}
          >
            <Button.Label className="text-danger">{isMutating ? "Cancelando..." : "Cancelar"}</Button.Label>
          </Button>
        </View>
      ) : null}
    </Pressable>
  );
}

function AgendaScreen(): React.JSX.Element {
  const router = useRouter();
  const [isHistoryFilterOpen, setIsHistoryFilterOpen] = useState(false);
  const {
    activeTab,
    cancelBooking,
    data,
    errorMessage,
    historyFilters,
    historyGroups,
    isLoading,
    isMutating,
    reload,
    setActiveTab,
    setHistoryFilters,
    upcomingGroups,
  } = useAgendaBookings();

  const hasAnyBookings = (data?.upcoming.length ?? 0) + (data?.history.length ?? 0) > 0;

  const historyCount = useMemo(() => {
    if (historyFilters.period === "all" && historyFilters.status === "all") {
      return data?.history.length ?? 0;
    }

    return historyGroups.reduce((total, group) => total + group.items.length, 0);
  }, [data?.history.length, historyFilters.period, historyFilters.status, historyGroups]);

  const handleOpenClassDetail = (booking: AgendaBooking) => {
    router.push({
      params: {
        id: booking.classInfo.id,
        openPayment: booking.status === "PENDING_PAYMENT" ? "1" : undefined,
      },
      pathname: "/(app)/aula/[id]",
    });
  };

  const handleCancelBooking = (bookingId: string) => {
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
            void cancelBooking(bookingId);
          },
        },
      ],
    );
  };

  if (isLoading && !data) {
    return (
      <Screen className="flex-1 bg-background">
        <AgendaLoadingState />
      </Screen>
    );
  }

  if (errorMessage && !data) {
    return (
      <Screen className="flex-1 bg-background">
        <EmptyState
          title="Falha ao carregar agenda"
          description={errorMessage}
          cta={(
            <Button variant="primary" onPress={reload}>
              <Button.Label>Tentar novamente</Button.Label>
            </Button>
          )}
        />
      </Screen>
    );
  }

  if (!hasAnyBookings) {
    return (
      <Screen className="flex-1 bg-background">
        <EmptyState
          title="Nenhuma aula ainda"
          description="Quando você confirmar aulas, a agenda aparece aqui."
        />
      </Screen>
    );
  }

  return (
    <Screen className="flex-1 bg-background">
      <View className="px-4 pb-2">
        <View className="rounded-full bg-surface p-1">
          <View className="flex-row">
            <Pressable
              className={activeTab === "upcoming" ? "flex-1 items-center rounded-full bg-background py-2" : "flex-1 items-center py-2"}
              onPress={() => setActiveTab("upcoming")}
            >
              <Text className={activeTab === "upcoming" ? "text-sm font-semibold text-foreground" : "text-sm text-muted"}>
                Próximos
              </Text>
            </Pressable>
            <Pressable
              className={activeTab === "history" ? "flex-1 items-center rounded-full bg-background py-2" : "flex-1 items-center py-2"}
              onPress={() => setActiveTab("history")}
            >
              <View className="flex-row items-center gap-2">
                <Text className={activeTab === "history" ? "text-sm font-semibold text-foreground" : "text-sm text-muted"}>
                  Histórico
                </Text>
                <Text className="text-xs font-semibold text-muted">{historyCount}</Text>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => {
                    setActiveTab("history");
                    setIsHistoryFilterOpen(true);
                  }}
                >
                  <GravityIcon name="filters" size={14} colorToken="muted" />
                </Pressable>
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 18, paddingBottom: 130, paddingHorizontal: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "upcoming" ? (
          upcomingGroups.length === 0 ? (
            <EmptyState
              title="Nenhuma aula próxima"
              description="As próximas reservas confirmadas vão aparecer aqui."
            />
          ) : (
            upcomingGroups.map((group) => (
              <View key={group.dateISO} className="gap-3">
                <Text className="text-base font-semibold text-foreground">{group.label}</Text>
                {group.items.map((booking) => (
                  <AgendaBookingCard
                    key={booking.id}
                    booking={booking}
                    isMutating={isMutating}
                    onCancel={handleCancelBooking}
                    onOpenClassDetail={handleOpenClassDetail}
                  />
                ))}
              </View>
            ))
          )
        ) : historyGroups.length === 0 ? (
          <EmptyState
            title={historyFilters.period === "all" && historyFilters.status === "all" ? "Sem histórico ainda" : "Nenhuma aula nesse filtro"}
            description={historyFilters.period === "all" && historyFilters.status === "all"
              ? "Quando você concluir aulas, elas aparecerão aqui."
              : "Ajuste os filtros para encontrar aulas no histórico."}
          />
        ) : (
          historyGroups.map((group) => (
            <View key={group.key} className="gap-3">
              <Text className="text-base font-semibold text-foreground">{group.label}</Text>
              {group.items.map((booking) => (
                <AgendaBookingCard
                  key={booking.id}
                  booking={booking}
                  isMutating={isMutating}
                  onCancel={handleCancelBooking}
                  onOpenClassDetail={handleOpenClassDetail}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <BottomSheet isOpen={isHistoryFilterOpen} onOpenChange={setIsHistoryFilterOpen}>
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content
            snapPoints={["64%"]}
            enableDynamicSizing={false}
            index={0}
          >
            <View className="gap-4 px-5 py-5">
              <View className="flex-row items-center justify-between">
                <BottomSheet.Title className="text-2xl font-semibold text-foreground">
                  Filtrar histórico
                </BottomSheet.Title>
                <BottomSheet.Close />
              </View>

              <View className="gap-2">
                <Text className="text-xs font-semibold tracking-[0.12em] text-muted">PERÍODO</Text>
                {HISTORY_PERIOD_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    className={historyFilters.period === option.value ? "rounded-[16px] bg-background px-4 py-3" : "rounded-[16px] bg-surface-secondary px-4 py-3"}
                    onPress={() => setHistoryFilters({ period: option.value })}
                  >
                    <Text className={historyFilters.period === option.value ? "text-sm font-semibold text-foreground" : "text-sm text-muted"}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View className="gap-2">
                <Text className="text-xs font-semibold tracking-[0.12em] text-muted">STATUS</Text>
                {HISTORY_STATUS_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    className={historyFilters.status === option.value ? "rounded-[16px] bg-background px-4 py-3" : "rounded-[16px] bg-surface-secondary px-4 py-3"}
                    onPress={() => setHistoryFilters({ status: option.value })}
                  >
                    <Text className={historyFilters.status === option.value ? "text-sm font-semibold text-foreground" : "text-sm text-muted"}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Button variant="primary" size="lg" onPress={() => setIsHistoryFilterOpen(false)}>
                <Button.Label>Aplicar filtros</Button.Label>
              </Button>
            </View>
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </Screen>
  );
}

export { AgendaScreen };
