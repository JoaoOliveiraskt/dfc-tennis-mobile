type NotificationCategory = "reservation" | "schedule" | "system";
type NotificationAudience = "coach" | "student";

interface NotificationPreferences {
  readonly inAppEnabled: boolean;
  readonly pushEnabled: boolean;
}

interface NotificationPreferencesDto {
  readonly inAppEnabled: boolean;
  readonly pushEnabled: boolean;
}

interface NotificationPageDto {
  readonly hasMore: boolean;
  readonly items: NotificationItemDto[];
  readonly nextCursor: string | null;
}

interface NotificationItemDto {
  readonly actorFallback: string;
  readonly actorImage: string | null;
  readonly actorName: string | null;
  readonly amount: number | null;
  readonly audience?: NotificationAudience;
  readonly bookingSlotDate?: string | null;
  readonly bookingSlotId?: string | null;
  readonly bookingStartTime?: string | null;
  readonly category: NotificationCategory;
  readonly createdAt: string;
  readonly description: string;
  readonly id: string;
  readonly isUnread: boolean;
  readonly targetUrl: string;
  readonly timestampLabel: string;
  readonly title: string;
  readonly type: string | null;
}

interface NotificationItem {
  readonly actorFallback: string;
  readonly actorImage: string | null;
  readonly actorName: string | null;
  readonly amount: number | null;
  readonly audience?: NotificationAudience;
  readonly bookingSlotDate?: Date | null;
  readonly bookingSlotId?: string | null;
  readonly bookingStartTime?: string | null;
  readonly category: NotificationCategory;
  readonly createdAt: Date;
  readonly description: string;
  readonly id: string;
  readonly isUnread: boolean;
  readonly targetUrl: string;
  readonly timestampLabel: string;
  readonly title: string;
  readonly type: string | null;
}

interface NotificationPage {
  readonly hasMore: boolean;
  readonly items: NotificationItem[];
  readonly nextCursor: string | null;
}

type NotificationGroupKey =
  | "today"
  | "yesterday"
  | "this-week"
  | "this-month"
  | "older";

interface NotificationSingleFeedEntry {
  readonly key: string;
  readonly kind: "single";
  readonly notification: NotificationItem;
}

interface NotificationBookingGroupFeedEntry {
  readonly audience: NotificationAudience;
  readonly isUnread: boolean;
  readonly key: string;
  readonly kind: "booking_group";
  readonly latestNotification: NotificationItem;
  readonly notifications: NotificationItem[];
  readonly slotId: string;
  readonly summary: string;
}

type NotificationFeedEntry =
  | NotificationSingleFeedEntry
  | NotificationBookingGroupFeedEntry;

interface NotificationFeedGroup {
  readonly items: NotificationFeedEntry[];
  readonly key: NotificationGroupKey;
  readonly label: string;
}

interface NotificationsReadResultDto {
  readonly success: boolean;
}

interface NotificationUnreadCountDto {
  readonly count?: number;
  readonly unreadCount?: number;
}

export type {
  NotificationAudience,
  NotificationBookingGroupFeedEntry,
  NotificationCategory,
  NotificationFeedEntry,
  NotificationFeedGroup,
  NotificationGroupKey,
  NotificationItem,
  NotificationItemDto,
  NotificationPage,
  NotificationPageDto,
  NotificationPreferences,
  NotificationPreferencesDto,
  NotificationsReadResultDto,
  NotificationUnreadCountDto,
};
