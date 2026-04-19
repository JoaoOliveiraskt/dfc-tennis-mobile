import { requestJson } from "@/lib/api/client";
import { resolveSlotCoverImage } from "@/lib/adapters/slot-cover-image";
import { getClassTemporalState } from "@/lib/domain/schedule-policy";
import type {
  HomeFeedData,
  HomeFeedFilter,
  HomeFeedItemKind,
  HomeFeedItemSnapshot,
  SlotsFeedDto,
  SlotsFeedItemDto,
} from "@/features/home/types/home-feed";

let latestFeedSnapshot: SlotsFeedDto | null = null;

function formatDateLabel(dateISO: string): string {
  const date = new Date(`${dateISO}T12:00:00`);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    weekday: "short",
  }).format(date);
}

function formatTimeLabel(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

function formatDurationLabel(startTime: string, endTime: string): string {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const durationMinutes =
    (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

  if (durationMinutes % 60 === 0) {
    return `${durationMinutes / 60}h`;
  }

  return `${durationMinutes} min`;
}

function formatParticipantsLabel(occupancy: number): string {
  if (occupancy === 1) {
    return "1 aluno";
  }

  return `${occupancy} alunos`;
}

function toHomeFeedItem(
  item: SlotsFeedItemDto,
  index: number,
  kind: HomeFeedItemKind,
): HomeFeedItemSnapshot {
  const title = item.activityTitle?.trim() || "Aula de Tênis";

  return {
    activityTitle: title,
    activityType: item.activityType,
    audienceType: item.audienceType,
    capacity: item.capacity,
    coach: item.coach ?? null,
    coverImage: resolveSlotCoverImage({
      activityTitle: title,
      activityType: item.activityType,
      audienceType: item.audienceType,
      fallbackIndex: index,
      slotId: item.id,
      startTime: item.startTime,
    }),
    date: item.date,
    dateLabel: formatDateLabel(item.date),
    durationLabel: formatDurationLabel(item.startTime, item.endTime),
    endTime: item.endTime,
    id: item.id,
    kind,
    locationLabel: item.resourceName,
    occupancy: item.occupancy,
    participantsCountLabel: formatParticipantsLabel(item.occupancy),
    participantsPreview: item.participantsPreview ?? [],
    priceCents: item.priceCents,
    primaryActionLabel: "Ver aula",
    startTime: item.startTime,
    temporalState: getClassTemporalState(item.date, item.startTime, item.endTime),
    timeLabel: formatTimeLabel(item.startTime, item.endTime),
    title,
  };
}

function toFilterOptions(data: {
  readonly availableItems: HomeFeedItemSnapshot[];
  readonly nextItems: HomeFeedItemSnapshot[];
}) {
  return [
    {
      count: data.nextItems.length + data.availableItems.length,
      key: "all" as const,
      label: "Tudo",
    },
    {
      count: data.nextItems.length,
      key: "next" as const,
      label: "Minhas aulas",
    },
    {
      count: data.availableItems.length,
      key: "available" as const,
      label: "Disponíveis",
    },
  ];
}

function mapHomeFeed(
  payload: SlotsFeedDto,
  selectedFilter: HomeFeedFilter,
): HomeFeedData {
  const nextItems = payload.nextClasses.map((item, index) =>
    toHomeFeedItem(item, index, "next"),
  );
  const availableItems = payload.availableClasses.map((item, index) =>
    toHomeFeedItem(item, index, "available"),
  );
  const activeItems =
    selectedFilter === "next"
      ? nextItems
      : selectedFilter === "available"
        ? availableItems
        : [...nextItems, ...availableItems];

  return {
    activeItems,
    availableItems,
    balanceCents: payload.balanceCents,
    filterOptions: toFilterOptions({
      availableItems,
      nextItems,
    }),
    nextItems,
    selectedFilter,
    serverNowISO: payload.serverNowISO,
    unavailabilityLabel: payload.unavailability?.nextAvailableDateISO
      ? `Próxima janela disponível em ${formatDateLabel(
          payload.unavailability.nextAvailableDateISO,
        )}.`
      : null,
    userName: payload.userName,
  };
}

async function fetchHomeFeed(selectedFilter: HomeFeedFilter): Promise<HomeFeedData> {
  const payload = await requestJson<SlotsFeedDto>({
    path: "/api/slots/feed",
  });

  latestFeedSnapshot = payload;
  return mapHomeFeed(payload, selectedFilter);
}

function getCachedHomeFeedItem(
  classId: string,
  kind?: HomeFeedItemKind,
): HomeFeedItemSnapshot | null {
  if (!latestFeedSnapshot) {
    return null;
  }

  const entries: Array<[HomeFeedItemKind, SlotsFeedItemDto[]]> = [
    ["next", latestFeedSnapshot.nextClasses],
    ["available", latestFeedSnapshot.availableClasses],
  ];

  for (const [entryKind, items] of entries) {
    if (kind && entryKind !== kind) {
      continue;
    }

    const index = items.findIndex((item) => item.id === classId);
    if (index >= 0) {
      return toHomeFeedItem(items[index], index, entryKind);
    }
  }

  return null;
}

export { fetchHomeFeed, getCachedHomeFeedItem };
