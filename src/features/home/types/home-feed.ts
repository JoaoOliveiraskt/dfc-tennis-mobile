import type { ImageSourcePropType } from "react-native";
import type { ClassTemporalState } from "@/lib/domain/schedule-policy";

type HomeFeedFilter = "all" | "available" | "next";
type HomeFeedItemKind = "available" | "next";

interface HomeFeedParticipant {
  readonly image: string | null;
  readonly name: string | null;
}

interface HomeFeedItemSnapshot {
  readonly activityTitle: string;
  readonly activityType?: "CLINIC" | "EVENT" | "GROUP" | "PRIVATE";
  readonly audienceType?: "ADULT" | "KIDS" | "OPEN";
  readonly capacity: number;
  readonly coach: HomeFeedParticipant | null;
  readonly coverImage: ImageSourcePropType;
  readonly date: string;
  readonly dateLabel: string;
  readonly durationLabel: string;
  readonly endTime: string;
  readonly id: string;
  readonly kind: HomeFeedItemKind;
  readonly locationLabel: string;
  readonly occupancy: number;
  readonly participantsCountLabel: string;
  readonly participantsPreview: HomeFeedParticipant[];
  readonly priceCents?: number;
  readonly primaryActionLabel: string;
  readonly startTime: string;
  readonly temporalState: ClassTemporalState;
  readonly timeLabel: string;
  readonly title: string;
}

interface HomeFeedData {
  readonly activeItems: HomeFeedItemSnapshot[];
  readonly availableItems: HomeFeedItemSnapshot[];
  readonly balanceCents: number;
  readonly filterOptions: Array<{
    readonly count: number;
    readonly key: HomeFeedFilter;
    readonly label: string;
  }>;
  readonly nextItems: HomeFeedItemSnapshot[];
  readonly selectedFilter: HomeFeedFilter;
  readonly serverNowISO: string;
  readonly unavailabilityLabel: string | null;
  readonly userName: string;
}

interface SlotsFeedItemDto {
  readonly activityTitle?: string;
  readonly activityType?: "CLINIC" | "EVENT" | "GROUP" | "PRIVATE";
  readonly audienceType?: "ADULT" | "KIDS" | "OPEN";
  readonly capacity: number;
  readonly coach?: HomeFeedParticipant | null;
  readonly date: string;
  readonly endTime: string;
  readonly id: string;
  readonly occupancy: number;
  readonly participantsPreview?: HomeFeedParticipant[];
  readonly priceCents?: number;
  readonly resourceName: string;
  readonly startTime: string;
  readonly temporalState: string;
}

interface SlotsFeedDto {
  readonly availableClasses: SlotsFeedItemDto[];
  readonly balanceCents: number;
  readonly feedVersion: "v1";
  readonly nextClasses: SlotsFeedItemDto[];
  readonly serverNowISO: string;
  readonly unavailability: {
    readonly nextAvailableDateISO: string | null;
  } | null;
  readonly userName: string;
}

export type {
  HomeFeedData,
  HomeFeedFilter,
  HomeFeedItemKind,
  HomeFeedItemSnapshot,
  HomeFeedParticipant,
  SlotsFeedDto,
  SlotsFeedItemDto,
};
