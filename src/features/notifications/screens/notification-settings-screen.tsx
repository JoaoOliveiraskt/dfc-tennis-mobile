import React, { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";
import { Button, EmptyState, Screen, Skeleton } from "@/components/ui";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from "@/features/notifications/services/notifications-service";

interface SettingsState {
  readonly inAppEnabled: boolean;
  readonly pushEnabled: boolean;
}

const NotificationPreferencesSchema = z.object({
  inAppEnabled: z.boolean(),
  pushEnabled: z.boolean(),
});

function NotificationSettingsScreen(): React.JSX.Element {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        setErrorMessage(null);
        const preferences = await fetchNotificationPreferences();
        if (!isCancelled) {
          setSettings(preferences);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Não foi possível carregar preferências.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, []);

  const persist = async (next: SettingsState) => {
    const parsedSettings = NotificationPreferencesSchema.safeParse(next);
    if (!parsedSettings.success) {
      setErrorMessage(parsedSettings.error.issues[0]?.message ?? "Preferências inválidas.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const updated = await updateNotificationPreferences(parsedSettings.data);
      setSettings(updated);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível salvar preferências.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !settings) {
    return (
      <Screen className="flex-1 bg-background px-5 pt-3">
        <View className="gap-4 rounded-[20px] bg-surface px-4 py-4">
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-16 w-full rounded-[16px]" />
          <Skeleton className="h-16 w-full rounded-[16px]" />
        </View>
      </Screen>
    );
  }

  if (!settings) {
    return (
      <Screen className="flex-1 bg-background">
        <EmptyState
          title="Falha ao carregar preferências"
          description={errorMessage ?? "Não foi possível carregar suas preferências de notificação."}
          cta={(
            <Button variant="primary" onPress={() => router.back()}>
              <Button.Label>Voltar</Button.Label>
            </Button>
          )}
        />
      </Screen>
    );
  }

  return (
    <Screen className="flex-1 bg-background px-5 pt-3">
      <View className="gap-4 rounded-[20px] bg-surface px-4 py-4">
        <Text className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Alertas</Text>
        <Text className="text-sm leading-6 text-muted">
          Controle como você recebe avisos de pagamento, confirmações e atualizações.
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base font-semibold text-foreground">Notificações no app</Text>
            <Text className="text-sm text-muted">Inbox com leitura e histórico.</Text>
          </View>
          <Switch
            value={settings.inAppEnabled}
            onValueChange={(value) => {
              const next = { ...settings, inAppEnabled: value };
              setSettings(next);
              void persist(next);
            }}
          />
        </View>

        <View className="h-px bg-border" />

        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base font-semibold text-foreground">Push no celular</Text>
            <Text className="text-sm text-muted">Lembretes e confirmações em tempo real.</Text>
          </View>
          <Switch
            value={settings.pushEnabled}
            onValueChange={(value) => {
              const next = { ...settings, pushEnabled: value };
              setSettings(next);
              void persist(next);
            }}
          />
        </View>
      </View>

      {errorMessage ? (
        <Text className="mt-4 text-sm font-medium text-danger">{errorMessage}</Text>
      ) : null}

      <Button className="mt-6" variant="primary" size="lg" isDisabled={isSaving} onPress={() => router.back()}>
        <Button.Label>{isSaving ? "Salvando..." : "Concluir"}</Button.Label>
      </Button>
    </Screen>
  );
}

export { NotificationSettingsScreen };
