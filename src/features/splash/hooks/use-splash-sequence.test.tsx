import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useSplashSequence } from "@/features/splash/hooks/use-splash-sequence";

const mockReplace = jest.fn();
const mockGetSession = jest.fn();
const mockHideNativeSplashOnce = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("@/lib/auth", () => ({
  authClient: {
    getSession: () => mockGetSession(),
  },
}));

jest.mock("@/lib/splash-lifecycle", () => ({
  hideNativeSplashOnce: () => mockHideNativeSplashOnce(),
}));

describe("useSplashSequence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  function startSequence() {
    const hook = renderHook(() => useSplashSequence());

    act(() => {
      hook.result.current.onLayoutReady();
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    act(() => {
      hook.result.current.onWordRevealComplete();
    });

    return hook;
  }

  it("restores authenticated users directly to home after splash bootstrap", async () => {
    mockGetSession.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
        },
      },
    });

    const { result } = startSequence();

    expect(result.current.shouldPlayAnimation).toBe(true);
    expect(mockHideNativeSplashOnce).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(850);
    });

    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(app)/home");
    });
  });

  it("redirects to auth when session bootstrap fails", async () => {
    mockGetSession.mockRejectedValue(new Error("session bootstrap failed"));

    startSequence();

    act(() => {
      jest.advanceTimersByTime(850);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/sign");
    });
  });

  it("times out safely to auth when session bootstrap stalls", async () => {
    mockGetSession.mockReturnValue(new Promise(() => undefined));

    startSequence();

    act(() => {
      jest.advanceTimersByTime(850);
    });

    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalledTimes(1);
    });

    act(() => {
      jest.advanceTimersByTime(3500);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/sign");
    });
  });
});
