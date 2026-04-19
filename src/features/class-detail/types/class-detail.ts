import type { ImageSourcePropType } from "react-native";
import type { HomeFeedItemKind, HomeFeedParticipant } from "@/features/home/types/home-feed";

interface ClassDetailSection {
  readonly id: "location" | "policy" | "prep";
  readonly paragraphs: string[];
  readonly title: string;
}

interface ClassDetailCta {
  readonly disabled: boolean;
  readonly helperText?: string;
  readonly label: string;
}

interface ClassDetailData {
  readonly coach: HomeFeedParticipant | null;
  readonly coverImage: ImageSourcePropType;
  readonly cta: ClassDetailCta;
  readonly dateLabel: string;
  readonly durationLabel: string;
  readonly id: string;
  readonly kind: HomeFeedItemKind;
  readonly locationLabel: string;
  readonly participantsCountLabel: string;
  readonly participantsPreview: HomeFeedParticipant[];
  readonly priceLabel: string;
  readonly sections: ClassDetailSection[];
  readonly statusBadge: string;
  readonly timeLabel: string;
  readonly title: string;
}

export type { ClassDetailData, ClassDetailSection };
