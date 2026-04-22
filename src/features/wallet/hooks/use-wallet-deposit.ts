import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { z } from "zod";
import { toApiError } from "@/lib/api/errors";
import {
  cancelWalletDeposit,
  createWalletDepositIntent,
  fetchWalletDepositStatus,
} from "@/features/wallet/services/wallet-service";
import type { WalletDepositStatusDto } from "@/features/wallet/types/wallet";

interface UseWalletDepositResult {
  readonly cancelDeposit: () => Promise<boolean>;
  readonly createDeposit: (amount: number) => Promise<boolean>;
  readonly depositStatus: WalletDepositStatusDto["status"] | null;
  readonly errorMessage: string | null;
  readonly expiresAt: Date | null;
  readonly isMutating: boolean;
  readonly pixCode: string | null;
  readonly transactionId: string | null;
}

const WalletDepositAmountSchema = z
  .number()
  .int()
  .min(500, "O valor mínimo para depósito é R$ 5,00.");
const WalletTransactionIdSchema = z
  .string()
  .trim()
  .min(1, "ID de transação inválido.");

function createDepositIdempotencyKey(): string {
  return ["wallet-deposit", Date.now().toString(36), Math.random().toString(36).slice(2)].join(":");
}

function useWalletDeposit(): UseWalletDepositResult {
  const isFocused = useIsFocused();
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [depositStatus, setDepositStatus] = useState<WalletDepositStatusDto["status"] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const transactionIdRef = useRef<string | null>(transactionId);
  transactionIdRef.current = transactionId;

  const createDeposit = useCallback(async (amount: number): Promise<boolean> => {
    const parsedAmount = WalletDepositAmountSchema.safeParse(amount);
    if (!parsedAmount.success) {
      setErrorMessage(parsedAmount.error.issues[0]?.message ?? "Valor inválido.");
      return false;
    }

    setIsMutating(true);
    setErrorMessage(null);

    try {
      const payload = await createWalletDepositIntent(
        parsedAmount.data,
        createDepositIdempotencyKey(),
      );
      setTransactionId(payload.transactionId);
      setPixCode(payload.pixCode);
      setExpiresAt(new Date(payload.expiresAt));
      setDepositStatus("PENDING");
      return true;
    } catch (error) {
      setErrorMessage(toApiError(error).message);
      return false;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const cancelDeposit = useCallback(async (): Promise<boolean> => {
    const parsedTransactionId = WalletTransactionIdSchema.safeParse(
      transactionIdRef.current ?? "",
    );
    if (!parsedTransactionId.success) {
      return false;
    }

    setIsMutating(true);
    setErrorMessage(null);

    try {
      const payload = await cancelWalletDeposit(parsedTransactionId.data);
      setDepositStatus(payload.status);
      return payload.status === "CANCELED";
    } catch (error) {
      setErrorMessage(toApiError(error).message);
      return false;
    } finally {
      setIsMutating(false);
    }
  }, []);

  useEffect(() => {
    if (!isFocused || !transactionId || depositStatus !== "PENDING") {
      return;
    }

    const interval = setInterval(() => {
      void (async () => {
        const parsedTransactionId = WalletTransactionIdSchema.safeParse(transactionId);
        if (!parsedTransactionId.success) {
          return;
        }

        try {
          const payload = await fetchWalletDepositStatus(parsedTransactionId.data);
          setDepositStatus(payload.status);
        } catch (error) {
          setErrorMessage(toApiError(error).message);
        }
      })();
    }, 3000);

    return () => clearInterval(interval);
  }, [depositStatus, isFocused, transactionId]);

  return useMemo(
    () => ({
      cancelDeposit,
      createDeposit,
      depositStatus,
      errorMessage,
      expiresAt,
      isMutating,
      pixCode,
      transactionId,
    }),
    [
      cancelDeposit,
      createDeposit,
      depositStatus,
      errorMessage,
      expiresAt,
      isMutating,
      pixCode,
      transactionId,
    ],
  );
}

export { useWalletDeposit };
