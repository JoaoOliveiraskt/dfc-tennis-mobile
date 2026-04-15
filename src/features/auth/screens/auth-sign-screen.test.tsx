import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { AuthSignScreen } from "@/features/auth/screens/auth-sign-screen";

const mockToastShow = jest.fn();
const mockUseGoogleSignIn = jest.fn();
const mockAuthCtaBlock = jest.fn<React.JSX.Element, [unknown]>((_) => {
  const { View } = require("react-native") as typeof import("react-native");
  return <View testID="auth-cta-block" />;
});

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { readonly children?: React.ReactNode }) => {
    const { View } = require("react-native") as typeof import("react-native");
    return <View>{children}</View>;
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({
    top: 24,
    right: 0,
    bottom: 10,
    left: 0,
  }),
}));

jest.mock("@/components/ui", () => ({
  Screen: ({ children }: { readonly children?: React.ReactNode }) => {
    const { View } = require("react-native") as typeof import("react-native");
    return <View>{children}</View>;
  },
  useAppThemeColor: () => "#f7f7f7",
  useToast: () => ({
    toast: {
      show: mockToastShow,
    },
  }),
}));

jest.mock("@/features/auth/components/sign-in-gradient-backdrop", () => ({
  SignInGradientBackdrop: () => null,
}));

jest.mock("@/features/auth/components/auth-cta-block", () => ({
  AuthCtaBlock: (props: unknown) => mockAuthCtaBlock(props),
}));

jest.mock("@/features/auth/hooks/use-google-sign-in", () => ({
  useGoogleSignIn: () => mockUseGoogleSignIn(),
}));

describe("AuthSignScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGoogleSignIn.mockReturnValue({
      errorMessage: null,
      latestErrorToast: null,
      isLoading: false,
      isLastUsedAccountLoading: false,
      lastUsedAccount: null,
      isSessionPending: false,
      signInWithAnotherGoogleAccount: jest.fn(),
      signInWithGoogle: jest.fn(),
    });
  });

  it("shows HeroUI danger toast at top when sign-in returns an error", async () => {
    mockUseGoogleSignIn.mockReturnValue({
      errorMessage: "Não foi possível entrar agora. Tente novamente.",
      latestErrorToast: {
        id: 1,
        message: "Não foi possível entrar agora. Tente novamente.",
      },
      isLoading: false,
      isLastUsedAccountLoading: false,
      lastUsedAccount: null,
      isSessionPending: false,
      signInWithAnotherGoogleAccount: jest.fn(),
      signInWithGoogle: jest.fn(),
    });

    render(<AuthSignScreen />);

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith({
        variant: "danger",
        placement: "top",
        label: "Não foi possível entrar agora. Tente novamente.",
      });
    });
  });

  it("does not pass inline errorMessage to AuthCtaBlock and skips toast when no error", () => {
    render(<AuthSignScreen />);

    expect(mockToastShow).not.toHaveBeenCalled();
    expect(mockAuthCtaBlock).toHaveBeenCalledTimes(1);
    expect(mockAuthCtaBlock.mock.calls[0]?.[0]).not.toHaveProperty(
      "errorMessage",
    );
  });

  it("does not show duplicate toast when rerendering with the same error event id", async () => {
    mockUseGoogleSignIn.mockImplementation(() => ({
      errorMessage: "Não foi possível entrar agora. Tente novamente.",
      latestErrorToast: {
        id: 1,
        message: "Não foi possível entrar agora. Tente novamente.",
      },
      isLoading: false,
      isLastUsedAccountLoading: false,
      lastUsedAccount: null,
      isSessionPending: false,
      signInWithAnotherGoogleAccount: jest.fn(),
      signInWithGoogle: jest.fn(),
    }));

    const { rerender } = render(<AuthSignScreen />);

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledTimes(1);
    });

    rerender(<AuthSignScreen />);
    expect(mockToastShow).toHaveBeenCalledTimes(1);
  });
});
