import { requestJson } from "@/lib/api/client";
import {
  mapNotificationPage,
} from "@/features/notifications/services/notification-feed-adapter";
import type {
  NotificationPage,
  NotificationPageDto,
  NotificationPreferences,
  NotificationPreferencesDto,
  NotificationsReadResultDto,
  NotificationUnreadCountDto,
} from "@/features/notifications/types/notifications";

async function fetchNotificationsPage(params?: {
  readonly cursor?: string | null;
  readonly limit?: number;
}): Promise<NotificationPage> {
  const payload = await requestJson<NotificationPageDto>({
    path: "/api/notifications",
    query: {
      cursor: params?.cursor ?? undefined,
      limit: params?.limit ?? undefined,
    },
  });

  return mapNotificationPage(payload);
}

async function markAllNotificationsAsRead(): Promise<boolean> {
  const payload = await requestJson<NotificationsReadResultDto>({
    method: "POST",
    path: "/api/notifications/read",
  });

  return payload.success;
}

async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const payload = await requestJson<NotificationsReadResultDto>({
    method: "POST",
    path: `/api/notifications/${notificationId}/read`,
  });

  return payload.success;
}

async function fetchUnreadNotificationCount(): Promise<number> {
  const payload = await requestJson<NotificationUnreadCountDto>({
    path: "/api/notifications/unread-count",
  });

  return payload.unreadCount ?? payload.count ?? 0;
}

async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  return requestJson<NotificationPreferencesDto>({
    path: "/api/notifications/preferences",
  });
}

async function updateNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<NotificationPreferences> {
  return requestJson<NotificationPreferencesDto>({
    body: {
      inAppEnabled: preferences.inAppEnabled,
      pushEnabled: preferences.pushEnabled,
    },
    method: "PATCH",
    path: "/api/notifications/preferences",
  });
}

export {
  fetchNotificationPreferences,
  fetchNotificationsPage,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationPreferences,
};
