import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toApiError } from "@/lib/api/errors";
import {
  buildNotificationFeedEntries,
  formatRelativeTimestamp,
  groupNotificationFeedByTime,
} from "@/features/notifications/services/notification-feed-adapter";
import {
  fetchNotificationPreferences,
  fetchNotificationsPage,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationPreferences,
} from "@/features/notifications/services/notifications-service";
import type {
  NotificationFeedGroup,
  NotificationItem,
  NotificationPreferences,
} from "@/features/notifications/types/notifications";
import {
  fetchCachedQuery,
  getCachedQueryData,
  isCachedQueryStale,
  setCachedQueryData,
} from "@/lib/server-state/query-cache";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";

interface UseNotificationsCenterResult {
  readonly errorMessage: string | null;
  readonly feedGroups: NotificationFeedGroup[];
  readonly hasMore: boolean;
  readonly isLoading: boolean;
  readonly isMutating: boolean;
  readonly items: NotificationItem[];
  readonly loadMore: () => Promise<void>;
  readonly markAllAsRead: () => Promise<void>;
  readonly markOneAsRead: (notificationId: string) => Promise<void>;
  readonly preferences: NotificationPreferences | null;
  readonly reload: () => void;
  readonly unreadCount: number;
  readonly updatePreferences: (
    next: NotificationPreferences,
  ) => Promise<NotificationPreferences | null>;
}

const NOTIFICATIONS_QUERY_KEY = "notifications:items";
const NOTIFICATION_PREFERENCES_QUERY_KEY = "notifications:preferences";
const NOTIFICATIONS_STALE_TIME_MS = 15 * 1000;

interface NotificationCachePayload {
  readonly hasMore: boolean;
  readonly items: NotificationItem[];
  readonly nextCursor: string | null;
}

const EMPTY_CACHE_PAYLOAD: NotificationCachePayload = {
  hasMore: false,
  items: [],
  nextCursor: null,
};

function toRelativeItems(items: NotificationItem[]): NotificationItem[] {
  const now = new Date();
  return items.map((item) => ({
    ...item,
    timestampLabel: formatRelativeTimestamp(item.createdAt, now),
  }));
}

function useNotificationsCenter(): UseNotificationsCenterResult {
  const sessionState = useAuthSession();
  const [reloadToken, setReloadToken] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>(() =>
    getCachedQueryData<NotificationCachePayload>(NOTIFICATIONS_QUERY_KEY)?.items ?? [],
  );
  const [nextCursor, setNextCursor] = useState<string | null>(() =>
    getCachedQueryData<NotificationCachePayload>(NOTIFICATIONS_QUERY_KEY)?.nextCursor ??
    null,
  );
  const [hasMore, setHasMore] = useState<boolean>(() =>
    getCachedQueryData<NotificationCachePayload>(NOTIFICATIONS_QUERY_KEY)?.hasMore ?? false,
  );
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(() =>
    getCachedQueryData<NotificationPreferences>(NOTIFICATION_PREFERENCES_QUERY_KEY),
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(items.length === 0);
  const [isMutating, setIsMutating] = useState(false);
  const itemsRef = useRef<NotificationItem[]>(items);
  const unreadCountRef = useRef(unreadCount);
  const preferencesRef = useRef<NotificationPreferences | null>(preferences);
  itemsRef.current = items;
  unreadCountRef.current = unreadCount;
  preferencesRef.current = preferences;

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      if (sessionState.isPending) {
        return;
      }

      if (!sessionState.data?.user.id) {
        setIsLoading(false);
        return;
      }

      const shouldFetch =
        reloadToken > 0 ||
        itemsRef.current.length === 0 ||
        isCachedQueryStale(NOTIFICATIONS_QUERY_KEY, NOTIFICATIONS_STALE_TIME_MS);
      if (!shouldFetch) {
        setIsLoading(false);
        return;
      }

      try {
        if (itemsRef.current.length === 0) {
          setIsLoading(true);
        }
        setErrorMessage(null);

        const [pageResult, unreadResult, preferencesResult] = await Promise.allSettled([
          fetchCachedQuery(NOTIFICATIONS_QUERY_KEY, () =>
            fetchNotificationsPage({
              limit: 20,
            }).then((payload) => ({
              hasMore: payload.hasMore,
              items: payload.items,
              nextCursor: payload.nextCursor,
            })),
          ),
          fetchUnreadNotificationCount(),
          fetchCachedQuery(
            NOTIFICATION_PREFERENCES_QUERY_KEY,
            fetchNotificationPreferences,
          ),
        ]);

        if (pageResult.status === "rejected") {
          throw pageResult.reason;
        }

        if (isCancelled) {
          return;
        }

        const relativeItems = toRelativeItems(pageResult.value.items);
        const nextUnreadCount =
          unreadResult.status === "fulfilled" ? unreadResult.value : unreadCountRef.current;
        const nextPreferences =
          preferencesResult.status === "fulfilled"
            ? preferencesResult.value
            : preferencesRef.current;

        setItems(relativeItems);
        setNextCursor(pageResult.value.nextCursor);
        setHasMore(pageResult.value.hasMore);
        setUnreadCount(nextUnreadCount);
        setPreferences(nextPreferences);
      } catch (error) {
        if (!isCancelled && itemsRef.current.length === 0) {
          setErrorMessage(toApiError(error).message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, [reloadToken, sessionState.data?.user.id, sessionState.isPending]);

  const persistNotificationsCache = useCallback(
    (cache: NotificationCachePayload) => {
      setCachedQueryData(NOTIFICATIONS_QUERY_KEY, cache);
      setItems(cache.items);
      setNextCursor(cache.nextCursor);
      setHasMore(cache.hasMore);
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    setIsMutating(true);
    setErrorMessage(null);

    try {
      await markAllNotificationsAsRead();
      const nextItems = itemsRef.current.map((item) => ({
        ...item,
        isUnread: false,
      }));
      persistNotificationsCache({
        hasMore,
        items: nextItems,
        nextCursor,
      });
      setUnreadCount(0);
    } catch (error) {
      setErrorMessage(toApiError(error).message);
    } finally {
      setIsMutating(false);
    }
  }, [hasMore, nextCursor, persistNotificationsCache]);

  const markOneAsRead = useCallback(async (notificationId: string) => {
    setIsMutating(true);
    setErrorMessage(null);

    try {
      await markNotificationAsRead(notificationId);
      const nextItems = itemsRef.current.map((item) =>
        item.id === notificationId ? { ...item, isUnread: false } : item,
      );
      persistNotificationsCache({
        hasMore,
        items: nextItems,
        nextCursor,
      });
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      setErrorMessage(toApiError(error).message);
    } finally {
      setIsMutating(false);
    }
  }, [hasMore, nextCursor, persistNotificationsCache]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || !hasMore) {
      return;
    }

    setIsMutating(true);
    setErrorMessage(null);

    try {
      const page = await fetchNotificationsPage({
        cursor: nextCursor,
        limit: 20,
      });
      const merged = toRelativeItems([...itemsRef.current, ...page.items]);
      persistNotificationsCache({
        hasMore: page.hasMore,
        items: merged,
        nextCursor: page.nextCursor,
      });
    } catch (error) {
      setErrorMessage(toApiError(error).message);
    } finally {
      setIsMutating(false);
    }
  }, [hasMore, nextCursor, persistNotificationsCache]);

  const updatePreferencesState = useCallback(
    async (next: NotificationPreferences): Promise<NotificationPreferences | null> => {
      setIsMutating(true);
      setErrorMessage(null);

      try {
        const updated = await updateNotificationPreferences(next);
        setPreferences(updated);
        setCachedQueryData(NOTIFICATION_PREFERENCES_QUERY_KEY, updated);
        return updated;
      } catch (error) {
        setErrorMessage(toApiError(error).message);
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const feedGroups = useMemo(() => {
    if (items.length === 0) {
      return [];
    }

    const entries = buildNotificationFeedEntries(items);
    return groupNotificationFeedByTime(entries);
  }, [items]);

  useEffect(() => {
    if (items.length > 0) {
      return;
    }

    setCachedQueryData(NOTIFICATIONS_QUERY_KEY, EMPTY_CACHE_PAYLOAD);
  }, [items.length]);

  return {
    errorMessage,
    feedGroups,
    hasMore,
    isLoading,
    isMutating,
    items,
    loadMore,
    markAllAsRead,
    markOneAsRead,
    preferences,
    reload,
    unreadCount,
    updatePreferences: updatePreferencesState,
  };
}

export { useNotificationsCenter };
