import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Button,
  EmptyState,
  GravityIcon,
  Screen,
  Skeleton,
  UserAvatar,
} from "@/components/ui";
import { useNotificationsCenter } from "@/features/notifications/hooks/use-notifications-center";
import type {
  NotificationFeedEntry,
  NotificationItem,
} from "@/features/notifications/types/notifications";

function resolveNotificationHref(item: NotificationItem): {
  readonly params?: Record<string, string>;
  readonly pathname: string;
} {
  const target = item.targetUrl.trim();

  if (target.includes("/agenda")) {
    return { pathname: "/(app)/(shell)/agenda" };
  }

  if (target.includes("/agendar")) {
    return { pathname: "/(app)/(shell)/agendar" };
  }

  if (target.includes("/notificacoes/configuracoes")) {
    return { pathname: "/(app)/(shell)/notificacoes-configuracoes" };
  }

  if (target.includes("/notificacoes")) {
    return { pathname: "/(app)/(shell)/notificacoes" };
  }

  if (target.includes("/conta/carteira/deposito")) {
    return { pathname: "/(app)/(shell)/depositar" };
  }

  if (target.includes("/conta/carteira")) {
    return { pathname: "/(app)/(shell)/carteira" };
  }

  if (target.includes("/conta/perfil/editar")) {
    return { pathname: "/(app)/(shell)/perfil" };
  }

  if (target.includes("/conta/perfil")) {
    return { pathname: "/(app)/(shell)/perfil" };
  }

  const classMatch = target.match(/\/aula\/([^/?#]+)/);
  if (classMatch?.[1]) {
    return {
      params: { id: classMatch[1] },
      pathname: "/(app)/aula/[id]",
    };
  }

  const paymentMatch = target.match(/\/pagamento\/([^/?#]+)/);
  if (paymentMatch?.[1]) {
    return { pathname: "/(app)/(shell)/agenda" };
  }

  return { pathname: "/(app)/(shell)/notificacoes" };
}

function NotificationsLoadingState(): React.JSX.Element {
  return (
    <View className="gap-6 px-5 py-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={`notification-loading-${index}`} className="flex-row gap-3">
          <Skeleton className="mt-1 size-11 rounded-full" />
          <View className="flex-1 gap-2 border-b border-border pb-4">
            <Skeleton className="h-5 w-40 rounded-full" />
            <Skeleton className="h-4 w-56 rounded-full" />
            <Skeleton className="h-4 w-48 rounded-full" />
          </View>
        </View>
      ))}
    </View>
  );
}

function NotificationEntry({
  entry,
  isMutating,
  onOpen,
}: {
  readonly entry: NotificationFeedEntry;
  readonly isMutating: boolean;
  readonly onOpen: (item: NotificationItem) => void;
}): React.JSX.Element {
  if (entry.kind === "booking_group") {
    return (
      <Pressable
        className={`flex-row gap-3 rounded-[16px] px-2 py-2 ${entry.isUnread ? "bg-surface/70" : ""}`}
        onPress={() => onOpen(entry.latestNotification)}
      >
        <View className="mt-1">
          <UserAvatar
            className="size-11 rounded-full"
            image={entry.latestNotification.actorImage}
            name={entry.latestNotification.actorName ?? entry.latestNotification.actorFallback}
          />
        </View>
        <View className="flex-1 gap-1 border-b border-border pb-4">
          <View className="flex-row items-start justify-between gap-3">
            <Text className="flex-1 text-base font-semibold leading-6 text-foreground">
              {entry.latestNotification.title}
            </Text>
            <Text className="text-sm text-muted">{entry.latestNotification.timestampLabel}</Text>
          </View>
        <Text className="text-sm leading-6 text-muted">{entry.summary}</Text>
          <Text className="text-xs uppercase tracking-[0.12em] text-muted">
            {entry.notifications.length} notificações agrupadas
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      className={`flex-row gap-3 rounded-[16px] px-2 py-2 ${entry.notification.isUnread ? "bg-surface/70" : ""}`}
      onPress={() => onOpen(entry.notification)}
      disabled={isMutating}
    >
      <View className="mt-1 size-11 items-center justify-center rounded-full bg-surface">
        <GravityIcon name="bell" size={16} colorToken="muted" />
      </View>
      <View className="flex-1 gap-1 border-b border-border pb-4">
        <View className="flex-row items-start justify-between gap-3">
          <Text className="flex-1 text-base font-semibold leading-6 text-foreground">
            {entry.notification.title}
          </Text>
          <Text className="text-sm text-muted">{entry.notification.timestampLabel}</Text>
        </View>
        <Text className="text-sm leading-6 text-muted">{entry.notification.description}</Text>
      </View>
    </Pressable>
  );
}

function NotificationsScreen(): React.JSX.Element {
  const router = useRouter();
  const {
    errorMessage,
    feedGroups,
    hasMore,
    isLoading,
    isMutating,
    items,
    loadMore,
    markAllAsRead,
    markOneAsRead,
    reload,
    unreadCount,
  } = useNotificationsCenter();

  const handleOpenNotification = (item: NotificationItem) => {
    if (item.isUnread) {
      void markOneAsRead(item.id);
    }

    const route = resolveNotificationHref(item);
    router.push(route as never);
  };

  if (isLoading && items.length === 0) {
    return (
      <Screen className="flex-1 bg-background">
        <NotificationsLoadingState />
      </Screen>
    );
  }

  if (errorMessage && items.length === 0) {
    return (
      <Screen className="flex-1 bg-background">
        <EmptyState
          title="Falha ao carregar notificações"
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

  if (feedGroups.length === 0) {
    return (
      <Screen className="flex-1 bg-background">
        <EmptyState
          title="Sem notificações"
          description="Quando houver atualizações de reservas e pagamentos, elas aparecerão aqui."
        />
      </Screen>
    );
  }

  return (
    <Screen className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 20, paddingBottom: 120, paddingHorizontal: 20, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {unreadCount > 0 ? (
          <Button
            variant="secondary"
            size="sm"
            isDisabled={isMutating}
            onPress={() => {
              void markAllAsRead();
            }}
          >
            <Button.Label>{isMutating ? "Atualizando..." : `Marcar tudo como lido (${unreadCount})`}</Button.Label>
          </Button>
        ) : null}

        {feedGroups.map((group) => (
          <View key={group.key} className="gap-4">
            <Text className="text-xs font-semibold tracking-[0.14em] text-muted">
              {group.label.toUpperCase()}
            </Text>

            {group.items.map((entry) => (
              <NotificationEntry
                key={entry.key}
                entry={entry}
                isMutating={isMutating}
                onOpen={handleOpenNotification}
              />
            ))}
          </View>
        ))}

        {hasMore ? (
          <Button
            variant="secondary"
            size="lg"
            isDisabled={isMutating}
            onPress={() => {
              void loadMore();
            }}
          >
            <Button.Label>{isMutating ? "Carregando..." : "Carregar mais"}</Button.Label>
          </Button>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

export { NotificationsScreen };
