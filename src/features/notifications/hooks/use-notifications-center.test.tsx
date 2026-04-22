import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useNotificationsCenter } from "@/features/notifications/hooks/use-notifications-center";

jest.mock("@/features/auth/hooks/use-auth-session", () => ({
  useAuthSession: () => ({
    data: {
      user: {
        id: "student-test-id",
      },
    },
    isPending: false,
    mode: "authenticated",
  }),
}));

const mockFetchNotificationsPage = jest.fn();
const mockFetchUnreadNotificationCount = jest.fn();
const mockFetchNotificationPreferences = jest.fn();
const mockMarkAllNotificationsAsRead = jest.fn();
const mockMarkNotificationAsRead = jest.fn();
const mockUpdateNotificationPreferences = jest.fn();

jest.mock("@/features/notifications/services/notifications-service", () => ({
  fetchNotificationPreferences: () => mockFetchNotificationPreferences(),
  fetchNotificationsPage: (params?: unknown) => mockFetchNotificationsPage(params),
  fetchUnreadNotificationCount: () => mockFetchUnreadNotificationCount(),
  markAllNotificationsAsRead: () => mockMarkAllNotificationsAsRead(),
  markNotificationAsRead: (notificationId: string) =>
    mockMarkNotificationAsRead(notificationId),
  updateNotificationPreferences: (prefs: unknown) =>
    mockUpdateNotificationPreferences(prefs),
}));

describe("use-notifications-center", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchNotificationsPage.mockResolvedValue({
      hasMore: true,
      items: [
        {
          actorFallback: "J",
          actorImage: null,
          actorName: "Joao",
          amount: null,
          category: "reservation",
          createdAt: new Date("2026-04-22T10:00:00.000Z"),
          description: "Pagamento confirmado",
          id: "n-1",
          isUnread: true,
          targetUrl: "/agenda",
          timestampLabel: "2h",
          title: "Pagamento confirmado",
          type: "BOOKING_CONFIRMED",
        },
      ],
      nextCursor: "cursor-2",
    });
    mockFetchUnreadNotificationCount.mockResolvedValue(1);
    mockFetchNotificationPreferences.mockResolvedValue({
      inAppEnabled: true,
      pushEnabled: true,
    });
    mockMarkAllNotificationsAsRead.mockResolvedValue(true);
    mockMarkNotificationAsRead.mockResolvedValue(true);
    mockUpdateNotificationPreferences.mockImplementation(
      async (next: unknown) => next,
    );
  });

  it("loads initial inbox state and synchronizes unread count", async () => {
    const { result } = renderHook(() => useNotificationsCenter());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.feedGroups.length).toBeGreaterThan(0);
    expect(result.current.preferences).toEqual({
      inAppEnabled: true,
      pushEnabled: true,
    });
  });

  it("marks all as read and keeps local unread count in sync", async () => {
    const { result } = renderHook(() => useNotificationsCenter());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(mockMarkAllNotificationsAsRead).toHaveBeenCalled();
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.items.every((item) => item.isUnread === false)).toBe(true);
  });

  it("updates preferences through API and keeps updated state", async () => {
    const { result } = renderHook(() => useNotificationsCenter());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updatePreferences({
        inAppEnabled: false,
        pushEnabled: true,
      });
    });

    expect(mockUpdateNotificationPreferences).toHaveBeenCalledWith({
      inAppEnabled: false,
      pushEnabled: true,
    });
    expect(result.current.preferences).toEqual({
      inAppEnabled: false,
      pushEnabled: true,
    });
  });
});
