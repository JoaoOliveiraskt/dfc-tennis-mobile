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

  const MockAvatar = Object.assign(
    ({ children }: { readonly children: React.ReactNode }) => (
      <NativeView>{children}</NativeView>
    ),
    {
      Image: ({ children }: { readonly children?: React.ReactNode }) => (
        <NativeView>{children}</NativeView>
      ),
      Fallback: ({ children }: { readonly children: React.ReactNode }) => (
        <NativeText>{children}</NativeText>
      ),
    },
  );

  const MockUserAvatar = ({
    name,
  }: {
    readonly name?: string | null;
  }) => <NativeText>{name?.slice(0, 2).toUpperCase() ?? "DF"}</NativeText>;

  return {
    Avatar: MockAvatar,
    Button: MockButton,
    Spinner: ({ testID }: { readonly testID?: string }) => (
      <NativeView testID={testID} />
    ),
    UserAvatar: MockUserAvatar,
  };
});

describe("AuthCtaBlock", () => {
  const baseProps = {
    isGoogleLoading: false,
    isLastUsedAccountLoading: false,
    isInteractionBlocked: false,
    lastUsedAccount: null,
    onPressGoogle: jest.fn(),
    onPressUseAnotherGoogleAccount: jest.fn(),
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

    expect(getByText("Continuar com Google")).toBeTruthy();
    expect(getByTestId("google-loading-spinner")).toBeTruthy();
    expect(getByRole("button")).toBeDisabled();
  });

  it("does not swap content to loading copy", () => {
    const { queryByText } = render(
      <AuthCtaBlock
        {...baseProps}
        isGoogleLoading
        isInteractionBlocked
      />,
    );

    expect(queryByText("Conectando com Google...")).toBeNull();
    expect(queryByText("Preparando acesso...")).toBeNull();
  });

  it("renders recognized account content inside the same primary button style", () => {
    const { getByText } = render(
      <AuthCtaBlock
        {...baseProps}
        lastUsedAccount={{
          userId: "user-1",
          name: "Elisa Beckett",
          email: "elisa.g.beckett@gmail.com",
          avatarUrl: "https://example.com/avatar.png",
          provider: "google",
        }}
      />,
    );

    expect(getByText("Continuar como Elisa")).toBeTruthy();
    expect(getByText("elisa.g.beckett@gmail.com")).toBeTruthy();
    expect(getByText("Entrar com outra conta Google")).toBeTruthy();
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

  it("fires explicit switch-account action from secondary CTA", () => {
    const onPressUseAnotherGoogleAccount = jest.fn();
    const { getByText } = render(
      <AuthCtaBlock
        {...baseProps}
        lastUsedAccount={{
          userId: "user-1",
          name: "Elisa Beckett",
          email: "elisa.g.beckett@gmail.com",
          provider: "google",
        }}
        onPressUseAnotherGoogleAccount={onPressUseAnotherGoogleAccount}
      />,
    );

    fireEvent.press(getByText("Entrar com outra conta Google"));
    expect(onPressUseAnotherGoogleAccount).toHaveBeenCalledTimes(1);
  });

  it("keeps switch-account action visible while Google auth is loading", () => {
    const { getByText, getByTestId } = render(
      <AuthCtaBlock
        {...baseProps}
        isGoogleLoading
        isInteractionBlocked
        lastUsedAccount={{
          userId: "user-1",
          name: "Elisa Beckett",
          email: "elisa.g.beckett@gmail.com",
          provider: "google",
        }}
      />,
    );

    expect(getByText("Entrar com outra conta Google")).toBeTruthy();
    expect(getByText("Continuar como Elisa")).toBeTruthy();
    expect(getByTestId("google-loading-spinner")).toBeTruthy();
  });

  it("keeps default Google CTA visible while loading last used account", () => {
    const { getByText, queryByTestId } = render(
      <AuthCtaBlock
        {...baseProps}
        isLastUsedAccountLoading
        isInteractionBlocked
      />,
    );

    expect(getByText("Continuar com Google")).toBeTruthy();
    expect(queryByTestId("last-account-skeleton-avatar")).toBeNull();
    expect(queryByTestId("last-account-skeleton-lines")).toBeNull();
    expect(queryByTestId("last-account-skeleton-provider-icon")).toBeNull();
  });

});
