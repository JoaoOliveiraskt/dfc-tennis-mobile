import { ApiError } from "@/lib/api/errors";
import { fetchHomeFeed, getCachedHomeFeedItem } from "@/features/home";
import { isStudentBookingAllowed } from "@/lib/domain/schedule-policy";
import type {
  ClassDetailBooking,
  ClassDetailBookingStatus,
  ClassDetailData,
} from "@/features/class-detail/types/class-detail";
import type { HomeFeedItemKind } from "@/features/home/types/home-feed";
import { requestJson } from "@/lib/api/client";

interface BookingIntentResult {
  readonly bookingId: string;
  readonly expiresAt: string | null;
  readonly paidWithBalance: boolean;
  readonly pixCode: string | null;
}

interface BookingStatusResult {
  readonly bookingId: string;
  readonly expiresAt: string | null;
  readonly pixCode: string | null;
  readonly status: ClassDetailBookingStatus;
}

interface WalletSnapshotResult {
  readonly balance: number;
  readonly transactions: unknown[];
}

interface UserBookingSummary {
  readonly class: {
    readonly id: string;
  };
  readonly expiresAt: string | null;
  readonly id: string;
  readonly status: "CANCELED" | "CONFIRMED" | "PENDING_PAYMENT";
}

interface UserBookingsResult {
  readonly history: UserBookingSummary[];
  readonly upcoming: UserBookingSummary[];
}

function formatCurrency(cents = 0): string {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(cents / 100);
}

function getCtaState(params: {
  readonly booking: ClassDetailBooking | null;
  readonly capacity: number;
  readonly kind: HomeFeedItemKind;
  readonly occupancy: number;
  readonly temporalState: "FUTURE" | "IN_PROGRESS" | "PAST";
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
}) {
  if (params.booking?.status === "PENDING_PAYMENT") {
    return {
      disabled: false,
      helperText: "Continue o Pix para confirmar sua vaga.",
      label: "Continuar pagamento",
    };
  }

  if (params.booking?.status === "CONFIRMED") {
    return {
      disabled: params.temporalState === "PAST",
      helperText:
        params.temporalState === "PAST"
          ? "Esta aula já foi concluída."
          : "Sua reserva está confirmada.",
      label: "Gerenciar reserva",
    };
  }

  if (params.kind === "next") {
    return {
      disabled: params.temporalState === "PAST",
      helperText:
        params.temporalState === "PAST"
          ? "Esta aula já foi concluída."
          : "Você já está inscrito(a) nesta aula.",
      label: "Gerenciar reserva",
    };
  }

  if (params.occupancy >= params.capacity) {
    return {
      disabled: true,
      helperText: "No momento, todas as vagas foram preenchidas.",
      label: "Sem vagas",
    };
  }

  if (
    !isStudentBookingAllowed(
      params.date,
      params.startTime,
      params.endTime,
    )
  ) {
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

function resolveStatusBadge(
  booking: ClassDetailBooking | null,
  kind: HomeFeedItemKind,
): string {
  if (booking?.status === "PENDING_PAYMENT") {
    return "Pagamento pendente";
  }

  if (booking?.status === "CONFIRMED" || kind === "next") {
    return "Reserva ativa";
  }

  return "Disponível";
}

async function getWalletSnapshot(): Promise<WalletSnapshotResult | null> {
  try {
    return await requestJson<WalletSnapshotResult>({
      path: "/api/wallet/me",
    });
  } catch {
    return null;
  }
}

async function getUserBookingForClass(
  classId: string,
): Promise<ClassDetailBooking | null> {
  try {
    const result = await requestJson<UserBookingsResult>({
      path: "/api/bookings/me",
    });
    const candidate =
      result.upcoming.find((booking) => booking.class.id === classId) ??
      result.history.find((booking) => booking.class.id === classId);

    if (!candidate) {
      return null;
    }

    if (candidate.status === "PENDING_PAYMENT") {
      const status = await requestJson<BookingStatusResult>({
        path: `/api/bookings/${candidate.id}/status`,
      });

      return {
        expiresAt: status.expiresAt ?? candidate.expiresAt ?? null,
        id: candidate.id,
        pixCode: status.pixCode ?? null,
        status: status.status,
      };
    }

    return {
      expiresAt: candidate.expiresAt,
      id: candidate.id,
      pixCode: null,
      status: candidate.status,
    };
  } catch {
    return null;
  }
}

async function getClassDetail(
  classId: string,
  kind?: HomeFeedItemKind,
): Promise<ClassDetailData> {
  let snapshot = getCachedHomeFeedItem(classId, kind);

  if (!snapshot) {
    await fetchHomeFeed("all");
    snapshot = getCachedHomeFeedItem(classId, kind);
  }

  if (!snapshot) {
    throw new ApiError({
      message: "Não encontramos esta aula no feed atual.",
      status: 404,
    });
  }

  const [walletSnapshot, booking] = await Promise.all([
    getWalletSnapshot(),
    getUserBookingForClass(classId),
  ]);

  const cta = getCtaState({
    booking,
    capacity: snapshot.capacity,
    date: snapshot.date,
    endTime: snapshot.endTime,
    kind: snapshot.kind,
    occupancy: snapshot.occupancy,
    startTime: snapshot.startTime,
    temporalState: snapshot.temporalState,
  });

  return {
    activityType: snapshot.activityType,
    audienceType: snapshot.audienceType,
    capacity: snapshot.capacity,
    coach: snapshot.coach,
    coverImage: snapshot.coverImage,
    coverImageKey: snapshot.coverImageKey,
    cta,
    dateLabel: snapshot.dateLabel,
    durationLabel: snapshot.durationLabel,
    id: snapshot.id,
    kind: snapshot.kind,
    booking,
    locationAddress: null,
    locationLabel: snapshot.locationLabel,
    occupancy: snapshot.occupancy,
    participants: snapshot.participantsPreview,
    participantsCountLabel: snapshot.participantsCountLabel,
    participantsPreview: snapshot.participantsPreview,
    priceCents: snapshot.priceCents ?? 0,
    priceLabel: formatCurrency(snapshot.priceCents),
    sections: [
      {
        id: "summary",
        paragraphs: [
          `Você vai jogar em ${snapshot.locationLabel}, com duração de ${snapshot.durationLabel}.`,
          booking?.status === "PENDING_PAYMENT"
            ? "Seu pagamento está pendente. Continue pelo Pix para confirmar a vaga."
            : booking?.status === "CONFIRMED"
              ? "Vaga confirmada. Agora é só acompanhar os detalhes da aula por aqui."
              : "Confira os detalhes e finalize a reserva no pagamento para garantir sua vaga.",
        ],
        title: "Resumo",
      },
      {
        id: "policy",
        paragraphs: [
          "Cancelamentos com 2h ou mais de antecedência recebem reembolso integral.",
          "Após essa janela, o reembolso parcial segue a política da turma e o no-show não gera crédito.",
        ],
        title: "Política de cancelamento",
      },
      {
        id: "prep",
        paragraphs: [
          "Chegue alguns minutos antes para aquecer e entrar em quadra no ritmo certo.",
          "Use roupas leves, leve água e prefira calçados adequados para tênis.",
        ],
        title: "Antes de ir para a quadra",
      },
      {
        id: "location",
        paragraphs: [
          `A aula acontece em ${snapshot.locationLabel}. Após confirmar a reserva, você acompanha todos os detalhes por aqui.`,
        ],
        title: "Local",
      },
      ],
      statusBadge: resolveStatusBadge(booking, snapshot.kind),
      temporalState: snapshot.temporalState,
      timeLabel: snapshot.timeLabel,
      title: snapshot.title,
      walletBalanceCents: walletSnapshot?.balance ?? null,
  };
}

async function createClassBookingIntent(params: {
  readonly classId: string;
  readonly idempotencyKey: string;
}): Promise<BookingIntentResult> {
  return requestJson<BookingIntentResult>({
    body: {
      slotId: params.classId,
    },
    headers: {
      "Idempotency-Key": params.idempotencyKey,
    },
    method: "POST",
    path: "/api/bookings/intent",
  });
}

async function getClassBookingStatus(
  bookingId: string,
): Promise<BookingStatusResult> {
  return requestJson<BookingStatusResult>({
    path: `/api/bookings/${bookingId}/status`,
  });
}

export { createClassBookingIntent, getClassBookingStatus, getClassDetail };
export type { BookingIntentResult, BookingStatusResult };
