import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import ChevronRightIcon from "@gravity-ui/icons/svgs/chevron-right.svg";
import { EmptyState, GravityIcon, Screen, Skeleton, UserAvatar } from "@/components/ui";
import useAppThemeColor from "@/components/ui/use-app-theme-color";
import { useAccount } from "@/features/account/hooks/use-account";

type AccountPanelTab = "history" | "pending" | "upcoming";

interface AccountPanelState {
  readonly ctaLabel: string;
  readonly ctaRoute: string;
  readonly description: string;
  readonly title: string;
}

function AccountQuickActionRow({
  description,
  icon,
  label,
  mutedColor,
  onPress,
}: {
  readonly description: string;
  readonly icon: "profile" | "wallet";
  readonly label: string;
  readonly mutedColor: string;
  readonly onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable
      className="flex-row items-center justify-between rounded-[16px] bg-surface px-4 py-3"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3">
        <View className="size-9 items-center justify-center rounded-full bg-background">
          <GravityIcon name={icon} size={15} colorToken="foreground" />
        </View>
        <View className="gap-0.5">
          <Text className="text-sm font-semibold text-foreground">{label}</Text>
          <Text className="text-xs text-muted">{description}</Text>
        </View>
      </View>
      <ChevronRightIcon width={14} height={14} color={mutedColor} />
    </Pressable>
  );
}

function AccountLoadingState(): React.JSX.Element {
  return (
    <Screen className="flex-1 bg-background px-5 pt-4">
      <View className="items-center gap-4">
        <Skeleton className="size-24 rounded-full" />
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="h-4 w-32 rounded-full" />
      </View>
      <View className="mt-6 flex-row gap-3">
        <Skeleton className="h-12 flex-1 rounded-[12px]" />
        <Skeleton className="h-12 flex-1 rounded-[12px]" />
      </View>
      <Skeleton className="mt-4 h-40 w-full rounded-[18px]" />
    </Screen>
  );
}

function AccountScreen(): React.JSX.Element {
  const router = useRouter();
  const mutedColor = useAppThemeColor("muted");
  const [activeTab, setActiveTab] = useState<AccountPanelTab>("upcoming");
  const { data, errorMessage, isLoading } = useAccount();
  const isInitialLoading = !data && isLoading;

  const panelContent = useMemo<Record<AccountPanelTab, AccountPanelState>>(
    () => ({
      history: {
        ctaLabel: "Abrir histórico",
        ctaRoute: "/(app)/(shell)/agenda",
        description: "Acompanhe suas aulas concluídas e canceladas.",
        title: "Seu histórico de aulas",
      },
      pending: {
        ctaLabel: "Continuar pagamentos",
        ctaRoute: "/(app)/(shell)/agenda",
        description: "Finalize reservas com pagamento pendente sem perder vaga.",
        title: "Pagamentos pendentes",
      },
      upcoming: {
        ctaLabel: "Ver próximas aulas",
        ctaRoute: "/(app)/(shell)/agenda",
        description: "Visualize e organize suas próximas reservas.",
        title: "Próximas aulas",
      },
    }),
    [],
  );

  if (isInitialLoading) {
    return <AccountLoadingState />;
  }

  if (!data) {
    return errorMessage ? (
      <Screen className="flex-1 bg-background">
        <EmptyState title="Não foi possível carregar sua conta" description={errorMessage} />
      </Screen>
    ) : (
      <Screen className="flex-1 bg-background" />
    );
  }

  const currentPanel = panelContent[activeTab];

  return (
    <Screen className="flex-1 bg-background px-5 pt-4">
      <View className="items-center gap-2">
        <UserAvatar
          className="size-24 rounded-full"
          email={data.email}
          image={data.image}
          name={data.name}
        />
        <Text className="text-base font-semibold text-foreground">{data.name}</Text>
        <Text className="text-xs text-muted">{data.email}</Text>
      </View>

      <View className="mt-5 gap-2">
        <AccountQuickActionRow
          label="Minha carteira"
          description="Saldo, depósitos e histórico financeiro"
          icon="wallet"
          mutedColor={mutedColor}
          onPress={() => router.push("/(app)/(shell)/carteira")}
        />
        <AccountQuickActionRow
          label="Editar perfil"
          description="Dados pessoais e informações da conta"
          icon="profile"
          mutedColor={mutedColor}
          onPress={() => router.push("/(app)/(shell)/perfil")}
        />
      </View>

      <View className="mt-5 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-foreground">Aluno</Text>
          <Pressable onPress={() => router.push("/(app)/(shell)/agendar")}>
            <GravityIcon name="plus" size={14} colorToken="muted" />
          </Pressable>
        </View>

        <View className="flex-row items-center gap-2">
          {([
            { label: "Próximas", value: "upcoming" },
            { label: "Histórico", value: "history" },
            { label: "Pendentes", value: "pending" },
          ] as const).map((tab) => (
            <Pressable
              key={tab.value}
              className={activeTab === tab.value
                ? "rounded-full bg-surface px-3 py-1.5"
                : "rounded-full px-3 py-1.5"}
              onPress={() => setActiveTab(tab.value)}
            >
              <Text className={activeTab === tab.value ? "text-xs font-semibold text-foreground" : "text-xs text-muted"}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="rounded-[18px] bg-surface px-4 py-5">
          <View className="items-center gap-2">
            <View className="size-10 items-center justify-center rounded-full bg-background">
              <GravityIcon name="agenda" size={16} colorToken="muted" />
            </View>
            <Text className="text-sm font-semibold text-foreground">{currentPanel.title}</Text>
            <Text className="text-center text-xs leading-5 text-muted">{currentPanel.description}</Text>
            <Pressable
              className="mt-1 rounded-full bg-background px-4 py-2"
              onPress={() => router.push(currentPanel.ctaRoute as never)}
            >
              <Text className="text-xs font-semibold text-foreground">{currentPanel.ctaLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View className="mt-5 gap-2 border-t border-border pt-4">
        <Pressable className="flex-row items-center justify-between py-2" onPress={() => router.push("/(app)/(shell)/notificacoes")}>
          <Text className="text-sm text-foreground">Notificações</Text>
          <ChevronRightIcon width={14} height={14} color={mutedColor} />
        </Pressable>
        <Pressable className="flex-row items-center justify-between py-2" onPress={() => router.push("/(app)/(shell)/perfil-editar")}>
          <Text className="text-sm text-foreground">Configurações</Text>
          <ChevronRightIcon width={14} height={14} color={mutedColor} />
        </Pressable>
      </View>
    </Screen>
  );
}

export { AccountScreen };
