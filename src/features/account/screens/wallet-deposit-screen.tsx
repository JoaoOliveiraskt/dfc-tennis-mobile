import React, { useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ReacticxQrCode } from "@/components/animations/reacticx/base/qr-code";
import { Button, GravityIcon, Input, Screen } from "@/components/ui";
import { useAccount } from "@/features/account";
import { useWalletDeposit } from "@/features/wallet";

const PRESET_AMOUNTS = [15000, 30000, 60000, 150000];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(cents / 100);
}

function formatCountdown(expiresAt: Date | null): string {
  if (!expiresAt) {
    return "--:--";
  }

  const diff = Math.max(0, expiresAt.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function WalletDepositScreen(): React.JSX.Element {
  const router = useRouter();
  const { data: accountData } = useAccount();
  const {
    cancelDeposit,
    createDeposit,
    depositStatus,
    errorMessage,
    expiresAt,
    isMutating,
    pixCode,
  } = useWalletDeposit();
  const [amountCents, setAmountCents] = useState(30000);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const amountLabel = useMemo(() => formatCurrency(amountCents), [amountCents]);
  const currentBalanceLabel = accountData?.balanceLabel ?? "Saldo indisponível";
  const countdownLabel = formatCountdown(expiresAt);
  const isPaymentStep = Boolean(pixCode) && depositStatus === "PENDING";
  const isSuccessStep = depositStatus === "COMPLETED";
  const canGenerateDeposit = amountCents >= 500;

  const handleGeneratePix = async () => {
    if (!canGenerateDeposit) {
      return;
    }

    await createDeposit(amountCents);
  };

  const handleCopyPixCode = async () => {
    if (!pixCode) {
      return;
    }

    try {
      const clipboard = await import("expo-clipboard");
      await clipboard.setStringAsync(pixCode);
      setCopyFeedback("Código copiado");
      setTimeout(() => setCopyFeedback(null), 1500);
    } catch {
      setCopyFeedback("Falha ao copiar");
      setTimeout(() => setCopyFeedback(null), 1500);
    }
  };

  const handleCancelDeposit = async () => {
    Alert.alert("Cancelar depósito?", "O Pix atual será cancelado.", [
      {
        style: "cancel",
        text: "Voltar",
      },
      {
        style: "destructive",
        text: "Cancelar depósito",
        onPress: () => {
          void cancelDeposit();
        },
      },
    ]);
  };

  return (
    <Screen className="flex-1 bg-background px-5 pt-3">
      {!isPaymentStep && !isSuccessStep ? (
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-3xl font-semibold leading-10 text-foreground">
              Quanto deseja adicionar?
            </Text>
            <Text className="text-base leading-6 text-muted">
              Adicione saldo para agendar suas aulas instantaneamente. Saldo atual:{" "}
              <Text className="font-semibold text-foreground">{currentBalanceLabel}</Text>
            </Text>
          </View>

          <View className="rounded-[16px] bg-surface px-4 py-4">
            <Text className="text-center text-4xl font-semibold text-foreground">
              {amountLabel}
            </Text>
          </View>

          <Input
            keyboardType="numeric"
            placeholder="Digite o valor"
            value={String(amountCents / 100)}
            onChangeText={(value) => {
              const parsed = Number(value.replace(/\D/g, ""));
              if (Number.isFinite(parsed)) {
                setAmountCents(parsed * 100);
              }
            }}
          />

          <View className="flex-row flex-wrap gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                variant={preset === amountCents ? "primary" : "secondary"}
                className="min-w-[48%]"
                onPress={() => setAmountCents(preset)}
              >
                <Button.Label>{`${formatCurrency(preset)} (${Math.max(1, Math.round(preset / 15000))} Aula${preset > 15000 ? "s" : ""})`}</Button.Label>
              </Button>
            ))}
          </View>

          <Button
            variant="primary"
            size="lg"
            isDisabled={isMutating || !canGenerateDeposit}
            onPress={() => {
              void handleGeneratePix();
            }}
          >
            <Button.Label>{isMutating ? "Gerando..." : "Gerar Pix"}</Button.Label>
          </Button>

          {errorMessage ? <Text className="text-sm font-medium text-danger">{errorMessage}</Text> : null}
        </View>
      ) : null}

      {isPaymentStep && pixCode ? (
        <View className="gap-5">
          <View className="items-center gap-2">
            <Text className="text-3xl font-semibold text-foreground">Pagamento Pix</Text>
            <Text className="text-base text-muted">Escaneie o QR Code ou use o Copia e Cola.</Text>
            <View className="flex-row items-center gap-2">
              <GravityIcon name="clock" size={14} colorToken="muted" />
              <Text className="text-sm text-muted">Expira em {countdownLabel}</Text>
            </View>
          </View>

          <View className="items-center rounded-[22px] bg-surface px-4 py-4">
            <ReacticxQrCode data={pixCode} size={220} />
          </View>

          <View className="gap-2 rounded-[20px] bg-surface px-4 py-4">
            <Text className="text-xs font-semibold tracking-[0.12em] text-muted">CÓDIGO PIX</Text>
            <Text className="text-sm leading-6 text-foreground" numberOfLines={3}>
              {pixCode}
            </Text>
            <Button variant="secondary" onPress={() => void handleCopyPixCode()}>
              <Button.Label>{copyFeedback ?? "Copiar código"}</Button.Label>
            </Button>
          </View>

          <Text className="text-center text-base text-muted">
            {depositStatus === "PENDING" ? "Aguardando pagamento..." : "Processando..."}
          </Text>

          <Button variant="tertiary" size="lg" isDisabled={isMutating} onPress={() => void handleCancelDeposit()}>
            <Button.Label className="text-danger">{isMutating ? "Cancelando..." : "Cancelar e voltar"}</Button.Label>
          </Button>

          {errorMessage ? <Text className="text-sm font-medium text-danger">{errorMessage}</Text> : null}
        </View>
      ) : null}

      {isSuccessStep ? (
        <View className="gap-5 rounded-[24px] bg-surface px-5 py-6">
          <View className="items-center gap-2">
            <View className="size-14 items-center justify-center rounded-full bg-success/20">
              <GravityIcon name="plus-fill" size={18} colorToken="success" />
            </View>
            <Text className="text-3xl font-semibold text-foreground">Saldo adicionado</Text>
            <Text className="text-base text-muted">{amountLabel} entrou na sua carteira.</Text>
          </View>

          <Button variant="primary" size="lg" onPress={() => router.replace("/(app)/(shell)/carteira")}>
            <Button.Label>Concluir</Button.Label>
          </Button>
        </View>
      ) : null}
    </Screen>
  );
}

export { WalletDepositScreen };
