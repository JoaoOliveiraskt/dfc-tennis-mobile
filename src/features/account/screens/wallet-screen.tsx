import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  BottomSheet,
  Button,
  EmptyState,
  GravityIcon,
  Screen,
  Skeleton,
} from "@/components/ui";
import { useWallet } from "@/features/wallet";
import type {
  WalletTransaction,
  WalletTransactionSortBy,
  WalletTransactionStatusFilter,
} from "@/features/wallet/types/wallet";

const TYPE_OPTIONS = [
  { label: "Todos", value: "ALL" },
  { label: "Créditos", value: "CREDIT" },
  { label: "Débitos", value: "DEBIT" },
] as const;

const STATUS_OPTIONS = [
  { label: "Todos", value: "ALL" },
  { label: "Concluído", value: "COMPLETED" },
  { label: "Pendente", value: "PENDING" },
  { label: "Falhou", value: "FAILED" },
  { label: "Cancelado", value: "CANCELED" },
] as const;

const SORT_OPTIONS: Array<{ readonly label: string; readonly value: WalletTransactionSortBy }> = [
  { label: "Mais recentes", value: "date_desc" },
  { label: "Mais antigas", value: "date_asc" },
  { label: "Maior valor", value: "amount_desc" },
  { label: "Menor valor", value: "amount_asc" },
];

const PERIOD_OPTIONS = [
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
  { label: "Sem limite", value: undefined },
] as const;

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(cents / 100);
}

function formatAmount(transaction: WalletTransaction): string {
  const signal = transaction.amount >= 0 ? "+" : "-";
  return `${signal}${formatCurrency(Math.abs(transaction.amount))}`;
}

function mapTransactionStatusLabel(status: WalletTransactionStatusFilter | WalletTransaction["status"]): string {
  switch (status) {
    case "COMPLETED":
      return "Concluído";
    case "PENDING":
      return "Pendente";
    case "FAILED":
      return "Falhou";
    case "CANCELED":
      return "Cancelado";
    default:
      return "Todos";
  }
}

function mapTransactionTitle(type: string): string {
  if (type.includes("DEPOSIT")) {
    return "Depósito Pix";
  }

  if (type.includes("REFUND")) {
    return "Reembolso";
  }

  if (type.includes("PAYMENT")) {
    return "Pagamento";
  }

  return "Transação";
}

function WalletLoadingState(): React.JSX.Element {
  return (
    <View className="gap-4 px-5 py-3">
      <Skeleton className="h-44 w-full rounded-[24px]" />
      <Skeleton className="h-8 w-40 rounded-full" />
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={`wallet-loading-${index}`} className="h-16 w-full rounded-[16px]" />
      ))}
    </View>
  );
}

function WalletScreen(): React.JSX.Element {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const {
    detail,
    errorMessage,
    filters,
    isLoading,
    isMutating,
    list,
    loadMore,
    reload,
    selectTransaction,
    setFilters,
    snapshot,
  } = useWallet();

  const balanceLabel = useMemo(
    () => formatCurrency(snapshot?.balance ?? 0),
    [snapshot?.balance],
  );

  const hasTransactions = (list?.items.length ?? 0) > 0;

  const handleOpenDetails = async (transaction: WalletTransaction) => {
    setIsDetailsOpen(true);
    await selectTransaction(transaction.id);
  };

  if (isLoading && !snapshot && !list) {
    return (
      <Screen className="flex-1 bg-background">
        <WalletLoadingState />
      </Screen>
    );
  }

  if (errorMessage && !snapshot && !list) {
    return (
      <Screen className="flex-1 bg-background">
        <EmptyState
          title="Falha ao carregar carteira"
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

  return (
    <Screen className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16, paddingBottom: 140, paddingHorizontal: 20, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3 rounded-[24px] bg-surface px-4 py-4">
          <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold tracking-[0.13em] text-muted">SALDO DISPONÍVEL</Text>
          <GravityIcon name="wallet" size={16} colorToken="muted" />
        </View>

          <Text className="text-3xl font-semibold text-foreground">{balanceLabel}</Text>

          <Button size="lg" variant="primary" onPress={() => router.push("/(app)/(shell)/depositar")}>
            <Button.Label>Adicionar saldo</Button.Label>
          </Button>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-foreground">Transações</Text>
          <Button size="sm" variant="link" onPress={() => setIsFilterOpen(true)}>
            <Button.Label className="text-foreground">Filtrar</Button.Label>
          </Button>
        </View>

        {!hasTransactions ? (
          <EmptyState
            title="Nenhuma transação"
            description="Seus pagamentos e depósitos aparecerão aqui."
          />
        ) : (
          list?.groups.map((group) => {
            const transactionsByDay = group.items.reduce<Record<string, WalletTransaction[]>>((acc, item) => {
              const dayKey = item.createdAt.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                weekday: "long",
              });
              if (!acc[dayKey]) {
                acc[dayKey] = [];
              }
              acc[dayKey].push(item);
              return acc;
            }, {});

            return (
              <View key={group.key} className="gap-4">
                <Text className="text-2xl font-semibold text-foreground">{group.label}</Text>

                {Object.entries(transactionsByDay).map(([dayLabel, dayItems]) => (
                  <View key={`${group.key}-${dayLabel}`} className="gap-2">
                    <Text className="text-xs font-semibold tracking-[0.12em] text-muted">
                      {dayLabel.toUpperCase()}
                    </Text>

                    {dayItems.map((transaction) => (
                      <Pressable
                        key={transaction.id}
                        onPress={() => {
                          void handleOpenDetails(transaction);
                        }}
                        className="flex-row items-center justify-between border-b border-border pb-3"
                      >
                        <View className="flex-row items-center gap-3">
                          <GravityIcon
                            name={transaction.amount >= 0 ? "plus" : "back"}
                            size={16}
                            colorToken={transaction.amount >= 0 ? "success" : "muted"}
                          />
                          <View>
                            <Text className="text-base font-semibold text-foreground">
                              {mapTransactionTitle(transaction.type)}
                            </Text>
                            <Text className="text-sm text-muted">
                              {transaction.createdAt.toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-lg font-semibold text-foreground">
                          {formatAmount(transaction)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ))}
              </View>
            );
          })
        )}

        {list?.hasMore ? (
          <Button
            size="lg"
            variant="secondary"
            isDisabled={isMutating}
            onPress={() => {
              void loadMore();
            }}
          >
            <Button.Label>{isMutating ? "Carregando..." : "Carregar mais"}</Button.Label>
          </Button>
        ) : null}
      </ScrollView>

      <BottomSheet isOpen={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content
            snapPoints={["74%"]}
            enableDynamicSizing={false}
            index={0}
          >
            <View className="gap-4 px-5 py-5">
              <View className="flex-row items-center justify-between">
                <BottomSheet.Title className="text-base font-semibold text-foreground">
                  Filtrar transações
                </BottomSheet.Title>
                <BottomSheet.Close />
              </View>

              <View className="gap-2">
                <Text className="text-xs font-semibold tracking-[0.12em] text-muted">PERÍODO</Text>
                {PERIOD_OPTIONS.map((option) => (
                  <Pressable
                    key={`period-${String(option.value)}`}
                    className={filters.days === option.value ? "rounded-[16px] bg-background px-4 py-3" : "rounded-[16px] bg-surface-secondary px-4 py-3"}
                    onPress={() => setFilters({ days: option.value })}
                  >
                    <Text className={filters.days === option.value ? "text-sm font-semibold text-foreground" : "text-sm text-muted"}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View className="gap-2">
                <Text className="text-xs font-semibold tracking-[0.12em] text-muted">TIPO</Text>
                {TYPE_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    className={filters.type === option.value ? "rounded-[16px] bg-background px-4 py-3" : "rounded-[16px] bg-surface-secondary px-4 py-3"}
                    onPress={() => setFilters({ type: option.value })}
                  >
                    <Text className={filters.type === option.value ? "text-sm font-semibold text-foreground" : "text-sm text-muted"}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View className="gap-2">
                <Text className="text-xs font-semibold tracking-[0.12em] text-muted">STATUS</Text>
                {STATUS_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    className={filters.status === option.value ? "rounded-[16px] bg-background px-4 py-3" : "rounded-[16px] bg-surface-secondary px-4 py-3"}
                    onPress={() => setFilters({ status: option.value })}
                  >
                    <Text className={filters.status === option.value ? "text-sm font-semibold text-foreground" : "text-sm text-muted"}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View className="gap-2">
                <Text className="text-xs font-semibold tracking-[0.12em] text-muted">ORDENAÇÃO</Text>
                {SORT_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    className={filters.sortBy === option.value ? "rounded-[16px] bg-background px-4 py-3" : "rounded-[16px] bg-surface-secondary px-4 py-3"}
                    onPress={() => setFilters({ sortBy: option.value })}
                  >
                    <Text className={filters.sortBy === option.value ? "text-sm font-semibold text-foreground" : "text-sm text-muted"}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Button variant="primary" size="lg" onPress={() => setIsFilterOpen(false)}>
                <Button.Label>Aplicar filtros</Button.Label>
              </Button>
            </View>
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>

      <BottomSheet
        isOpen={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) {
            void selectTransaction(null);
          }
        }}
      >
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content
            snapPoints={["56%"]}
            enableDynamicSizing={false}
            index={0}
          >
            <View className="gap-4 px-5 py-5">
              <View className="flex-row items-center justify-between">
                <BottomSheet.Title className="text-base font-semibold text-foreground">
                  Detalhes
                </BottomSheet.Title>
                <BottomSheet.Close />
              </View>

              {!detail ? (
                <View className="gap-2">
                  <Skeleton className="h-10 w-40 rounded-xl" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-24 w-full rounded-[16px]" />
                </View>
              ) : (
                <>
                  <View className="items-center gap-1">
                    <Text className="text-4xl font-semibold text-foreground">{formatAmount({
                      amount: detail.amount,
                      createdAt: detail.createdAt,
                      id: detail.id,
                      isCredit: detail.amount > 0,
                      status: detail.status,
                      type: detail.type,
                    })}</Text>
                    <Text className="text-base text-muted">{mapTransactionTitle(detail.type)}</Text>
                  </View>

                  <View className="gap-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base text-muted">Data</Text>
                      <Text className="text-base font-semibold text-foreground">
                        {detail.createdAt.toLocaleDateString("pt-BR")}
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base text-muted">Horário</Text>
                      <Text className="text-base font-semibold text-foreground">
                        {detail.createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base text-muted">Status</Text>
                      <Text className="text-base font-semibold text-foreground">
                        {mapTransactionStatusLabel(detail.status)}
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base text-muted">Tipo</Text>
                      <Text className="text-base font-semibold text-foreground">
                        {mapTransactionTitle(detail.type)}
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base text-muted">ID</Text>
                      <Text className="max-w-[68%] text-right text-base font-semibold text-foreground">
                        {detail.id}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </Screen>
  );
}

export { WalletScreen };
