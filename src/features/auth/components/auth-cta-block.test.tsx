import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { AuthCtaBlock } from "@/features/auth/components/auth-cta-block";

jest.mock("@/features/auth/components/icons/google-icon", () => ({
  GoogleIcon: () => null,
}));

jest.mock("@/components/ui", () => {
  const {
    Pressable: NativePressable,
    Text: NativeText,
    View: NativeView,
  } = require("react-native") as typeof import("react-native");

  const MockButton = ({
    children,
    isDisabled,
    onPress,
  }: {
    readonly children: React.ReactNode;
    readonly isDisabled?: boolean;
    readonly onPress?: () => void;
  }) => (
    <NativePressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(isDisabled) }}
      disabled={isDisabled}
      onPress={onPress}
    >
      {children}
    </NativePressable>
  );

  MockButton.Label = ({ children }: { readonly children: React.ReactNode }) => (
    <NativeText>{children}</NativeText>
  );

  return {
    Button: MockButton,
    Spinner: ({ testID }: { readonly testID?: string }) => (
      <NativeView testID={testID} />
    ),
  };
});

describe("AuthCtaBlock", () => {
  const baseProps = {
    canUseBypass: false,
    devBypassErrorMessage: null,
    errorMessage: null,
    isGoogleLoading: false,
    isInteractionBlocked: false,
    isSessionPending: false,
    onPressDevBypass: jest.fn(),
    onPressGoogle: jest.fn(),
  } as const;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders only Google entrypoint and keeps Apple out of active flow", () => {
    const { getByText, queryByText } = render(<AuthCtaBlock {...baseProps} />);

    expect(getByText("Continuar com Google")).toBeTruthy();
    expect(queryByText(/apple/i)).toBeNull();
  });

  it("shows loading feedback and disables CTA while auth is in progress", () => {
    const { getByRole, getByTestId, getByText } = render(
      <AuthCtaBlock
        {...baseProps}
        isGoogleLoading
        isInteractionBlocked
      />,
    );

    expect(getByText("Conectando com Google...")).toBeTruthy();
    expect(getByTestId("google-loading-spinner")).toBeTruthy();
    expect(getByRole("button")).toBeDisabled();
  });

  it("shows mapped auth errors in UI", () => {
    const { getByText } = render(
      <AuthCtaBlock
        {...baseProps}
        errorMessage="Não foi possível entrar agora. Tente novamente."
        isSessionPending
      />,
    );

    expect(
      getByText("Não foi possível entrar agora. Tente novamente."),
    ).toBeTruthy();
  });

  it("fires Google sign-in action only when interaction is enabled", () => {
    const onPressGoogle = jest.fn();
    const { getByRole, rerender } = render(
      <AuthCtaBlock {...baseProps} onPressGoogle={onPressGoogle} />,
    );

    fireEvent.press(getByRole("button"));
    expect(onPressGoogle).toHaveBeenCalledTimes(1);

    rerender(
      <AuthCtaBlock
        {...baseProps}
        isInteractionBlocked
        onPressGoogle={onPressGoogle}
      />,
    );

    fireEvent.press(getByRole("button"));
    expect(onPressGoogle).toHaveBeenCalledTimes(1);
  });

  it("disables dev bypass link while auth interaction is blocked", () => {
    const onPressDevBypass = jest.fn();
    const { getByRole, rerender } = render(
      <AuthCtaBlock
        {...baseProps}
        canUseBypass
        onPressDevBypass={onPressDevBypass}
      />,
    );

    fireEvent.press(getByRole("link"));
    expect(onPressDevBypass).toHaveBeenCalledTimes(1);

    rerender(
      <AuthCtaBlock
        {...baseProps}
        canUseBypass
        isInteractionBlocked
        onPressDevBypass={onPressDevBypass}
      />,
    );

    fireEvent.press(getByRole("link"));
    expect(onPressDevBypass).toHaveBeenCalledTimes(1);
  });
});
