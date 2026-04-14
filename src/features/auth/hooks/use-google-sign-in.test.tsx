import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { NativeGoogleSignInResult } from "@/features/auth/services/native-google-auth-service";
import { useGoogleSignIn } from "@/features/auth/hooks/use-google-sign-in";

const mockReplace = jest.fn();
const mockUseRedirectAuthenticatedUser = jest.fn();
const mockSignInWithGoogleNative = jest.fn();
const mockMapGoogleSignInErrorToMessage = jest.fn();
const mockResolveRealAuthenticatedEntryRoute = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("@/features/auth/hooks/use-auth-route-guards", () => ({
  useRedirectAuthenticatedUser: () => mockUseRedirectAuthenticatedUser(),
}));

jest.mock("@/features/auth/services/auth-entry-routes", () => ({
  resolveRealAuthenticatedEntryRoute: () =>
    mockResolveRealAuthenticatedEntryRoute(),
}));

jest.mock("@/features/auth/services/native-google-auth-service", () => ({
  signInWithGoogleNative: () => mockSignInWithGoogleNative(),
}));

jest.mock("@/features/auth/services/google-sign-in-error-messages", () => ({
  mapGoogleSignInErrorToMessage: (reason: string) =>
    mockMapGoogleSignInErrorToMessage(reason),
}));

function deferredPromise<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
}

describe("useGoogleSignIn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRedirectAuthenticatedUser.mockReturnValue({
      data: null,
      isPending: false,
      mode: "none",
    });
    mockMapGoogleSignInErrorToMessage.mockReturnValue(
      "Não foi possível entrar agora. Tente novamente.",
    );
    mockResolveRealAuthenticatedEntryRoute.mockResolvedValue("/(public)/onboarding");
  });

  it("navigates to onboarding/home route resolved for real authenticated users", async () => {
    mockSignInWithGoogleNative.mockResolvedValue({ status: "success" });

    const { result } = renderHook(() => useGoogleSignIn());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockSignInWithGoogleNative).toHaveBeenCalledTimes(1);
    expect(mockResolveRealAuthenticatedEntryRoute).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/(public)/onboarding");
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("does not show error or redirect when user cancels Google login", async () => {
    mockSignInWithGoogleNative.mockResolvedValue({ status: "cancelled" });

    const { result } = renderHook(() => useGoogleSignIn());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockMapGoogleSignInErrorToMessage).not.toHaveBeenCalled();
    expect(mockResolveRealAuthenticatedEntryRoute).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBeNull();
  });

  it("maps offline error to user-friendly message", async () => {
    const networkResult: NativeGoogleSignInResult = {
      status: "error",
      reason: "network",
    };
    mockSignInWithGoogleNative.mockResolvedValue(networkResult);
    mockMapGoogleSignInErrorToMessage.mockReturnValue(
      "Sem conexão no momento. Verifique sua internet e tente novamente.",
    );

    const { result } = renderHook(() => useGoogleSignIn());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockMapGoogleSignInErrorToMessage).toHaveBeenCalledWith("network");
    expect(result.current.errorMessage).toBe(
      "Sem conexão no momento. Verifique sua internet e tente novamente.",
    );
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockResolveRealAuthenticatedEntryRoute).not.toHaveBeenCalled();
  });

  it("maps backend/provider failure without exposing technical details", async () => {
    const providerFailure: NativeGoogleSignInResult = {
      status: "error",
      reason: "provider_rejected",
    };
    mockSignInWithGoogleNative.mockResolvedValue(providerFailure);

    const { result } = renderHook(() => useGoogleSignIn());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockMapGoogleSignInErrorToMessage).toHaveBeenCalledWith(
      "provider_rejected",
    );
    expect(result.current.errorMessage).toBe(
      "Não foi possível entrar agora. Tente novamente.",
    );
  });

  it("prevents duplicate calls on rapid multi-tap while request is in flight", async () => {
    const pending = deferredPromise<NativeGoogleSignInResult>();
    mockSignInWithGoogleNative.mockReturnValue(pending.promise);

    const { result } = renderHook(() => useGoogleSignIn());

    await act(async () => {
      const firstAttempt = result.current.signInWithGoogle();
      const secondAttempt = result.current.signInWithGoogle();
      pending.resolve({ status: "cancelled" });
      await Promise.all([firstAttempt, secondAttempt]);
    });

    expect(mockSignInWithGoogleNative).toHaveBeenCalledTimes(1);
    expect(mockResolveRealAuthenticatedEntryRoute).not.toHaveBeenCalled();
  });

  it("resets visible error before a retry and recovers on next success", async () => {
    const retryAttempt = deferredPromise<NativeGoogleSignInResult>();

    mockSignInWithGoogleNative
      .mockResolvedValueOnce({ status: "error", reason: "network" })
      .mockReturnValueOnce(retryAttempt.promise);
    mockMapGoogleSignInErrorToMessage.mockReturnValueOnce(
      "Sem conexão no momento. Verifique sua internet e tente novamente.",
    );

    const { result } = renderHook(() => useGoogleSignIn());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.errorMessage).toBe(
      "Sem conexão no momento. Verifique sua internet e tente novamente.",
    );

    let retryPromise: Promise<void> = Promise.resolve();
    act(() => {
      retryPromise = result.current.signInWithGoogle();
    });

    await waitFor(() => {
      expect(result.current.errorMessage).toBeNull();
    });

    await act(async () => {
      retryAttempt.resolve({ status: "success" });
      await retryPromise;
    });

    expect(mockResolveRealAuthenticatedEntryRoute).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/(public)/onboarding");
    expect(result.current.errorMessage).toBeNull();
  });

  it("blocks sign-in attempts during session bootstrap pending state", async () => {
    mockUseRedirectAuthenticatedUser.mockReturnValue({
      data: null,
      isPending: true,
      mode: "none",
    });

    const { result } = renderHook(() => useGoogleSignIn());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockSignInWithGoogleNative).not.toHaveBeenCalled();
    expect(result.current.isSessionPending).toBe(true);
  });
});
