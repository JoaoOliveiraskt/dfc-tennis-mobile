import { renderHook, waitFor } from "@testing-library/react-native";
import {
  useRedirectAuthenticatedUser,
  useRequireAuthenticatedUser,
} from "@/features/auth/hooks/use-auth-route-guards";

const mockReplace = jest.fn();
const mockUseAuthSession = jest.fn();
const mockResolveAuthenticatedEntryRoute = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("@/features/auth/hooks/use-auth-session", () => ({
  useAuthSession: () => mockUseAuthSession(),
}));

jest.mock("@/features/auth/services/auth-entry-routes", () => ({
  AUTH_ROUTE: "/(auth)/sign",
  HOME_ROUTE: "/(app)/home",
  resolveAuthenticatedEntryRoute: () => mockResolveAuthenticatedEntryRoute(),
}));

describe("auth route guards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolveAuthenticatedEntryRoute.mockResolvedValue("/(app)/home");
  });

  it("redirects real authenticated users to route resolved by onboarding status", async () => {
    mockUseAuthSession.mockReturnValue({
      data: {
        user: {
          id: "user-1",
        },
      },
      isPending: false,
      mode: "authenticated",
    });
    mockResolveAuthenticatedEntryRoute.mockResolvedValue("/(public)/onboarding");

    renderHook(() => useRedirectAuthenticatedUser());

    await waitFor(() => {
      expect(mockResolveAuthenticatedEntryRoute).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(public)/onboarding");
    });
  });

  it("redirects unauthenticated users away from protected routes", async () => {
    mockUseAuthSession.mockReturnValue({
      data: null,
      isPending: false,
      mode: "none",
    });

    renderHook(() => useRequireAuthenticatedUser());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/sign");
    });
  });

  it("does not redirect protected-route users while session is still pending", async () => {
    mockUseAuthSession.mockReturnValue({
      data: null,
      isPending: true,
      mode: "none",
    });

    renderHook(() => useRequireAuthenticatedUser());

    await waitFor(() => {
      expect(mockUseAuthSession).toHaveBeenCalled();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
