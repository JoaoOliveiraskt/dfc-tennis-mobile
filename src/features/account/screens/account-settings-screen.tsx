import React, { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import ChevronRightIcon from "@gravity-ui/icons/svgs/chevron-right.svg";
import { BottomSheet, Button, GravityIcon, Screen } from "@/components/ui";
import useAppThemeColor from "@/components/ui/use-app-theme-color";
import { useAccount } from "@/features/account/hooks/use-account";
import type { GravityIconName } from "@/components/ui";

type SettingsRow =
  | {
      readonly kind: "navigate";
      readonly icon: GravityIconName;
      readonly subtitle?: string;
      readonly title: string;
      readonly to: string;
    }
  | {
      readonly icon: GravityIconName;
      readonly kind: "legal";
      readonly subtitle?: string;
      readonly title: string;
      readonly doc: "licenses" | "privacy" | "terms";
    };

function legalCopy(doc: "licenses" | "privacy" | "terms"): string {
  if (doc === "terms") {
    return "Uso do app condicionado às regras operacionais de agendamento, pagamento e cancelamento do DFC Tennis.";
  }

  if (doc === "privacy") {
    return "Seus dados são usados para autenticação, agenda, carteira e notificações do app, respeitando controles de acesso por perfil.";
  }

  return "Licenças de bibliotecas de terceiros utilizadas nesta versão estão disponíveis sob demanda do suporte técnico.";
}

function SettingsSection({
  rows,
  title,
  onPressLegal,
  onPressNavigate,
}: {
  readonly rows: SettingsRow[];
  readonly title: string;
  readonly onPressLegal: (doc: "licenses" | "privacy" | "terms") => void;
  readonly onPressNavigate: (to: string) => void;
}): React.JSX.Element {
  const mutedColor = useAppThemeColor("muted");

  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{title}</Text>
      <View className="rounded-[18px] bg-surface px-3">
        {rows.map((row, index) => (
          <Pressable
            key={row.title}
            className={`flex-row items-center justify-between py-3 ${
              index < rows.length - 1 ? "border-b border-border" : ""
            }`}
            onPress={() => {
              if (row.kind === "navigate") {
                onPressNavigate(row.to);
                return;
              }
              onPressLegal(row.doc);
            }}
          >
            <View className="flex-row items-center gap-3">
              <GravityIcon name={row.icon} size={14} colorToken="muted" />
              <View className="gap-1">
                <Text className="text-sm font-medium text-foreground">{row.title}</Text>
                {row.subtitle ? <Text className="text-xs text-muted">{row.subtitle}</Text> : null}
              </View>
            </View>
            <ChevronRightIcon width={14} height={14} color={mutedColor} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function AccountSettingsScreen(): React.JSX.Element {
  const router = useRouter();
  const [activeLegalDoc, setActiveLegalDoc] = useState<"licenses" | "privacy" | "terms" | null>(null);
  const { isSigningOut, signOut, signOutErrorMessage } = useAccount();
  const handleSignOut = () => {
    Alert.alert("Sair da conta?", "Você precisará entrar novamente para continuar.", [
      {
        style: "cancel",
        text: "Cancelar",
      },
      {
        style: "destructive",
        text: "Sair",
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  const accountRows = useMemo<SettingsRow[]>(
    () => [
      { kind: "navigate", icon: "profile", subtitle: "Nome, celular e e-mail", title: "Editar perfil", to: "/(app)/(shell)/perfil" },
      { kind: "navigate", icon: "wallet", subtitle: "Saldo e transações", title: "Carteira", to: "/(app)/(shell)/carteira" },
      {
        icon: "bell",
        kind: "navigate",
        subtitle: "Alertas e preferências",
        title: "Notificações",
        to: "/(app)/(shell)/notificacoes-configuracoes",
      },
    ],
    [],
  );

  const appRows = useMemo<SettingsRow[]>(
    () => [
      { kind: "navigate", icon: "agenda", subtitle: "Próximas aulas e histórico", title: "Agenda", to: "/(app)/(shell)/agenda" },
      { kind: "navigate", icon: "plus", subtitle: "Disponibilidade por período", title: "Agendar aula", to: "/(app)/(shell)/agendar" },
    ],
    [],
  );

  const legalRows = useMemo<SettingsRow[]>(
    () => [
      { kind: "legal", icon: "edit", title: "Termos de uso", doc: "terms" },
      { kind: "legal", icon: "profile", title: "Política de privacidade", doc: "privacy" },
      { kind: "legal", icon: "gear", title: "Licenças", doc: "licenses" },
    ],
    [],
  );

  return (
    <Screen className="flex-1 bg-background">
      <View className="flex-1 gap-5 px-5 pb-10 pt-3">
        <SettingsSection
          rows={accountRows}
          title="Conta"
          onPressNavigate={(to) => router.push(to as never)}
          onPressLegal={(doc) => setActiveLegalDoc(doc)}
        />

        <SettingsSection
          rows={appRows}
          title="DFC Tennis"
          onPressNavigate={(to) => router.push(to as never)}
          onPressLegal={(doc) => setActiveLegalDoc(doc)}
        />

        <SettingsSection
          rows={legalRows}
          title="Legal"
          onPressNavigate={(to) => router.push(to as never)}
          onPressLegal={(doc) => setActiveLegalDoc(doc)}
        />

        <View className="gap-3 rounded-[18px] bg-surface px-3 py-3">
          <Button
            size="sm"
            variant="tertiary"
            className="justify-start bg-transparent px-0"
            isDisabled={isSigningOut}
            onPress={handleSignOut}
          >
            <Button.Label className="text-sm text-danger">
              {isSigningOut ? "Saindo..." : "Log out"}
            </Button.Label>
          </Button>
          {signOutErrorMessage ? (
            <Text className="text-xs text-danger">{signOutErrorMessage}</Text>
          ) : null}
        </View>

        <View className="items-center gap-1 pt-2">
          <Text className="text-sm font-semibold text-foreground">DFC Tennis</Text>
          <Text className="text-xs text-muted">
            Versão {Constants.expoConfig?.version ?? "1.0.0"}
          </Text>
        </View>
      </View>

      <BottomSheet isOpen={activeLegalDoc !== null} onOpenChange={(open) => !open && setActiveLegalDoc(null)}>
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content
            snapPoints={["38%"]}
            enableDynamicSizing={false}
            index={0}
          >
            <View className="gap-3 px-5 py-5">
              <View className="flex-row items-center justify-between">
                <BottomSheet.Title className="text-base font-semibold text-foreground">
                  {activeLegalDoc === "terms"
                    ? "Termos de uso"
                    : activeLegalDoc === "privacy"
                      ? "Política de privacidade"
                      : "Licenças"}
                </BottomSheet.Title>
                <BottomSheet.Close />
              </View>
              <Text className="text-sm leading-6 text-muted">
                {activeLegalDoc ? legalCopy(activeLegalDoc) : ""}
              </Text>
              <Button variant="primary" size="lg" onPress={() => setActiveLegalDoc(null)}>
                <Button.Label>Entendi</Button.Label>
              </Button>
            </View>
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </Screen>
  );
}

export { AccountSettingsScreen };
