import { ApiError } from "@/lib/api/errors";
import { fetchHomeFeed, getCachedHomeFeedItem } from "@/features/home";
import { isStudentBookingAllowed } from "@/lib/domain/schedule-policy";
import type { ClassDetailData } from "@/features/class-detail/types/class-detail";
import type { HomeFeedItemKind } from "@/features/home/types/home-feed";

function formatCurrency(cents = 0): string {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(cents / 100);
}

function getCtaState(params: {
  readonly capacity: number;
  readonly kind: HomeFeedItemKind;
  readonly occupancy: number;
  readonly temporalState: "FUTURE" | "IN_PROGRESS" | "PAST";
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
}) {
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
    helperText: "Confirme sua reserva com poucos toques.",
    label: "Reservar vaga",
  };
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

  const cta = getCtaState({
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
    locationLabel: snapshot.locationLabel,
    occupancy: snapshot.occupancy,
    participantsCountLabel: snapshot.participantsCountLabel,
    participantsPreview: snapshot.participantsPreview,
    priceLabel: formatCurrency(snapshot.priceCents),
    sections: [
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
        title: "Como se preparar",
      },
      {
        id: "location",
        paragraphs: [
          `A aula acontece em ${snapshot.locationLabel}. Após confirmar a reserva, você acompanha todos os detalhes por aqui.`,
        ],
        title: "Local",
      },
    ],
    statusBadge: snapshot.kind === "next" ? "Reserva ativa" : "Disponível",
    timeLabel: snapshot.timeLabel,
    title: snapshot.title,
  };
}

export { getClassDetail };
