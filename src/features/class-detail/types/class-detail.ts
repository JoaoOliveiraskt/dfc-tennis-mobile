import type { ImageSourcePropType } from "react-native";
import type { HomeFeedItemKind, HomeFeedParticipant } from "@/features/home/types/home-feed";
import type { ClassTemporalState } from "@/lib/domain/schedule-policy";

interface ClassDetailSection {
  readonly id: "location" | "policy" | "prep" | "summary";
  readonly paragraphs: string[];
  readonly title: string;
}

interface ClassDetailCta {
  readonly disabled: boolean;
  readonly helperText?: string;
  readonly label: string;
}

type ClassDetailBookingStatus =
  | "CANCELED"
  | "CONFIRMED"
  | "EXPIRED"
  | "PENDING_PAYMENT";

interface ClassDetailBooking {
  readonly expiresAt: string | null;
  readonly id: string;
  readonly pixCode: string | null;
  readonly status: ClassDetailBookingStatus;
}

interface ClassDetailData {
  readonly activityType?: "CLINIC" | "EVENT" | "GROUP" | "PRIVATE";
  readonly audienceType?: "ADULT" | "KIDS" | "OPEN";
  readonly booking: ClassDetailBooking | null;
  readonly capacity: number;
  readonly coach: HomeFeedParticipant | null;
  readonly coverImage: ImageSourcePropType;
  readonly coverImageKey: string;
  readonly cta: ClassDetailCta;
  readonly dateLabel: string;
  readonly durationLabel: string;
  readonly id: string;
  readonly kind: HomeFeedItemKind;
  readonly locationLabel: string;
  readonly locationAddress: string | null;
  readonly occupancy: number;
  readonly participants: HomeFeedParticipant[];
  readonly participantsCountLabel: string;
  readonly participantsPreview: HomeFeedParticipant[];
  readonly priceCents: number;
  readonly priceLabel: string;
  readonly sections: ClassDetailSection[];
  readonly statusBadge: string;
  readonly temporalState: ClassTemporalState;
  readonly timeLabel: string;
  readonly title: string;
  readonly walletBalanceCents: number | null;
}

export type {
  ClassDetailBooking,
  ClassDetailBookingStatus,
  ClassDetailData,
  ClassDetailSection,
};
