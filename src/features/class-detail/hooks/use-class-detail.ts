import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager } from "react-native";
import { toApiError } from "@/lib/api/errors";
import {
  createClassBookingIntent,
  getClassBookingStatus,
  getClassDetail,
} from "@/features/class-detail/services/class-detail-service";
import type {
  ClassDetailBooking,
  ClassDetailBookingStatus,
  ClassDetailData,
} from "@/features/class-detail/types/class-detail";
import type { HomeFeedItemKind } from "@/features/home/types/home-feed";
import {
  fetchCachedQuery,
  getCachedQueryData,
  isCachedQueryStale,
} from "@/lib/server-state/query-cache";

interface ClassDetailState {
  readonly data: ClassDetailData | null;
  readonly errorMessage: string | null;
  readonly isLoading: boolean;
  readonly isPaymentSheetOpen: boolean;
  readonly isSubmittingPayment: boolean;
  readonly closePaymentSheet: () => void;
  readonly openPaymentSheet: () => void;
  readonly paymentErrorMessage: string | null;
  readonly paymentNoticeMessage: string | null;
  readonly refreshPaymentStatus: () => Promise<void>;
  readonly submitPayment: () => Promise<void>;
}

function createReserveIdempotencyKey(classId: string): string {
  return [
    "booking-intent",
    classId,
    Date.now().toString(36),
    Math.random().toString(36).slice(2),
  ].join(":");
}

function resolveDefaultCta(currentData: ClassDetailData) {
  if (currentData.kind === "next") {
    return {
      disabled: currentData.temporalState === "PAST",
      helperText:
        currentData.temporalState === "PAST"
          ? "Esta aula já foi concluída."
          : "Sua reserva está confirmada.",
      label: "Gerenciar reserva",
    };
  }

  if (currentData.occupancy >= currentData.capacity) {
    return {
      disabled: true,
      helperText: "No momento, todas as vagas foram preenchidas.",
      label: "Sem vagas",
    };
  }

  if (currentData.temporalState !== "FUTURE") {
    return {
      disabled: true,
      helperText: "O horário já começou ou foi encerrado.",
      label: "Indisponível",
    };
  }

  return {
    disabled: false,
    helperText: "Revise os detalhes e confirme o pagamento no bottom sheet.",
    label: "Reservar aula",
  };
}

function resolveCta(
  currentData: ClassDetailData,
  booking: ClassDetailBooking | null,
) {
  if (booking?.status === "PENDING_PAYMENT") {
    return {
      disabled: false,
      helperText: "Continue o Pix para confirmar sua vaga.",
      label: "Continuar pagamento",
    };
  }

  if (booking?.status === "CONFIRMED") {
    return {
      disabled: currentData.temporalState === "PAST",
      helperText:
        currentData.temporalState === "PAST"
          ? "Esta aula já foi concluída."
          : "Sua reserva está confirmada.",
      label: "Gerenciar reserva",
    };
  }

  return resolveDefaultCta(currentData);
}

function resolveStatusBadge(
  currentData: ClassDetailData,
  booking: ClassDetailBooking | null,
): string {
  if (booking?.status === "PENDING_PAYMENT") {
    return "Pagamento pendente";
  }

  if (booking?.status === "CONFIRMED" || currentData.kind === "next") {
    return "Reserva ativa";
  }

  return "Disponível";
}

function applyBookingState(
  currentData: ClassDetailData,
  booking: ClassDetailBooking | null,
): ClassDetailData {
  return {
    ...currentData,
    booking,
    cta: resolveCta(currentData, booking),
    statusBadge: resolveStatusBadge(currentData, booking),
  };
}

function useClassDetail(
  classId: string,
  kind?: HomeFeedItemKind,
): ClassDetailState {
  const queryKey = useMemo(() => `class-detail:${classId}:${kind ?? "all"}`, [classId, kind]);
  const [data, setData] = useState<ClassDetailData | null>(() =>
    getCachedQueryData<ClassDetailData>(queryKey),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!data);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);
  const [paymentNoticeMessage, setPaymentNoticeMessage] = useState<string | null>(null);
  const dataRef = useRef<ClassDetailData | null>(data);
  const isSubmittingPaymentRef = useRef(false);
  dataRef.current = data;

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      const shouldFetch = isCachedQueryStale(queryKey, 60 * 1000);
      if (!shouldFetch) {
        setIsLoading(false);
        return;
      }

      try {
        if (!dataRef.current) {
          setIsLoading(true);
        }
        setErrorMessage(null);
        const result = await fetchCachedQuery(queryKey, async () => getClassDetail(classId, kind));

        if (!isCancelled) {
          setData(result);
        }
      } catch (error) {
        if (!isCancelled && !dataRef.current) {
          setErrorMessage(toApiError(error).message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    if (dataRef.current) {
      const interactionTask = InteractionManager.runAfterInteractions(() => {
        void load();
      });

      return () => {
        isCancelled = true;
        interactionTask.cancel();
      };
    }

    void load();

    return () => {
      isCancelled = true;
    };
  }, [classId, kind, queryKey]);

  const openPaymentSheet = useCallback(() => {
    const currentData = dataRef.current;
    if (
      !currentData ||
      (currentData.cta.disabled && currentData.booking?.status !== "PENDING_PAYMENT")
    ) {
      return;
    }

    setPaymentErrorMessage(null);
    setPaymentNoticeMessage(null);
    setIsPaymentSheetOpen(true);
  }, []);

  const closePaymentSheet = useCallback(() => {
    if (isSubmittingPaymentRef.current) {
      return;
    }

    setIsPaymentSheetOpen(false);
  }, []);

  const submitPayment = useCallback(async () => {
    const currentData = dataRef.current;
    if (
      !currentData ||
      currentData.cta.disabled ||
      currentData.booking?.status === "CONFIRMED" ||
      currentData.booking?.status === "PENDING_PAYMENT" ||
      isSubmittingPaymentRef.current
    ) {
      return;
    }

    isSubmittingPaymentRef.current = true;
    setIsSubmittingPayment(true);
    setPaymentErrorMessage(null);
    setPaymentNoticeMessage(null);

    try {
      const result = await createClassBookingIntent({
        classId,
        idempotencyKey: createReserveIdempotencyKey(classId),
      });

      if (!result.paidWithBalance && (!result.bookingId || !result.pixCode)) {
        throw new Error("Nao foi possivel gerar o Pix agora.");
      }

      setData((currentState) => {
        if (!currentState) {
          return currentState;
        }

        if (result.paidWithBalance) {
          return applyBookingState(currentState, {
            expiresAt: null,
            id: result.bookingId,
            pixCode: null,
            status: "CONFIRMED",
          });
        }

        if (!result.bookingId || !result.pixCode) {
          return currentState;
        }

        return applyBookingState(currentState, {
          expiresAt: result.expiresAt,
          id: result.bookingId,
          pixCode: result.pixCode,
          status: "PENDING_PAYMENT",
        });
      });

      setPaymentNoticeMessage(
        result.paidWithBalance
          ? "Reserva confirmada com saldo."
          : "Pix gerado. Finalize o pagamento para confirmar a vaga.",
      );
      setIsPaymentSheetOpen(true);
    } catch (error) {
      setPaymentErrorMessage(toApiError(error).message);
    } finally {
      isSubmittingPaymentRef.current = false;
      setIsSubmittingPayment(false);
    }
  }, [classId]);

  const refreshPaymentStatus = useCallback(async () => {
    const currentData = dataRef.current;
    const currentBooking = currentData?.booking;
    if (
      !currentData ||
      !currentBooking ||
      currentBooking.status !== "PENDING_PAYMENT" ||
      isSubmittingPaymentRef.current
    ) {
      return;
    }

    try {
      const result = await getClassBookingStatus(currentBooking.id);
      const nextBooking: ClassDetailBooking | null =
        result.status === "PENDING_PAYMENT" ||
        result.status === "CONFIRMED"
          ? {
              expiresAt: result.expiresAt,
              id: currentBooking.id,
              pixCode: result.pixCode ?? currentBooking.pixCode,
              status: result.status,
            }
          : null;

      setData((currentState) => {
        if (!currentState) {
          return currentState;
        }

        return applyBookingState(currentState, nextBooking);
      });

      if (result.status === "CONFIRMED") {
        setPaymentNoticeMessage("Pagamento confirmado. Sua reserva está ativa.");
      }

      if (result.status === "EXPIRED") {
        setPaymentErrorMessage("O Pix expirou. Gere um novo pagamento para continuar.");
      }
    } catch (error) {
      setPaymentErrorMessage(toApiError(error).message);
    }
  }, []);

  useEffect(() => {
    if (!isPaymentSheetOpen || data?.booking?.status !== "PENDING_PAYMENT") {
      return;
    }

    const interval = setInterval(() => {
      void refreshPaymentStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [data?.booking?.id, data?.booking?.status, isPaymentSheetOpen, refreshPaymentStatus]);

  return {
    data,
    errorMessage,
    isLoading,
    isPaymentSheetOpen,
    isSubmittingPayment,
    closePaymentSheet,
    openPaymentSheet,
    paymentErrorMessage,
    paymentNoticeMessage,
    refreshPaymentStatus,
    submitPayment,
  };
}

export { createReserveIdempotencyKey, useClassDetail };
