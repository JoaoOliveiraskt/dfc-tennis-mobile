import { renderHook, waitFor } from "@testing-library/react-native";
import {
  useRedirectAuthenticatedUser,
  useRequireAuthenticatedUser,
} from "@/features/auth/hooks/use-auth-route-guards";

const mockReplace = jest.fn();
const mockUseAuthSession = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("@/features/auth/hooks/use-auth-session", () => ({
  useAuthSession: () => mockUseAuthSession(),
}));

describe("auth route guards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects authenticated users away from auth screen", async () => {
    mockUseAuthSession.mockReturnValue({
      data: {
        user: {
          id: "user-1",
        },
      },
      isPending: false,
      mode: "real",
    });

    renderHook(() => useRedirectAuthenticatedUser());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(app)/home");
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
