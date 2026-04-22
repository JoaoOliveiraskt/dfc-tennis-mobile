import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { StudentAppHeader } from "@/features/app-shell/components/student-app-header";

const mockBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    canGoBack: mockCanGoBack,
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock("@/features/auth/services/auth-entry-routes", () => ({
  HOME_ROUTE: "/(app)/(shell)/home",
}));

jest.mock("@/components/micro-interactions/flexi-button", () => ({
  FlexiButton: ({
    label,
    onPress,
  }: {
    readonly label: string;
    readonly onPress?: () => void;
  }) => {
    const { Pressable, Text } = require("react-native") as typeof import("react-native");
    return (
      <Pressable accessibilityLabel="Abrir carteira" onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    );
  },
}));

jest.mock("@/components/ui", () => ({
  BrandWordmark: () => null,
  Button: ({ children, onPress }: { readonly children?: React.ReactNode; readonly onPress?: () => void }) => {
    const { Pressable } = require("react-native") as typeof import("react-native");
    return <Pressable onPress={onPress}>{children}</Pressable>;
  },
  HeaderIconButton: ({
    accessibilityLabel,
    children,
    onPress,
  }: {
    readonly accessibilityLabel?: string;
    readonly children?: React.ReactNode;
    readonly onPress?: () => void;
  }) => {
    const { Pressable } = require("react-native") as typeof import("react-native");
    return (
      <Pressable accessibilityLabel={accessibilityLabel} onPress={onPress}>
        {children}
      </Pressable>
    );
  },
  GravityIcon: () => null,
  Header: ({ children }: { readonly children?: React.ReactNode }) => {
    const { View } = require("react-native") as typeof import("react-native");
    return <View>{children}</View>;
  },
}));

(jest.requireMock("@/components/ui").Header as Record<string, unknown>).BackButton = ({
  onPress,
}: {
  readonly onPress?: () => void;
}) => {
  const { Pressable, Text } = require("react-native") as typeof import("react-native");
  return (
    <Pressable onPress={onPress}>
      <Text>back</Text>
    </Pressable>
  );
};

(jest.requireMock("@/components/ui").Header as Record<string, unknown>).Content = ({
  children,
}: {
  readonly children?: React.ReactNode;
}) => {
  const { View } = require("react-native") as typeof import("react-native");
  return <View>{children}</View>;
};

(jest.requireMock("@/components/ui").Header as Record<string, unknown>).Actions = ({
  children,
}: {
  readonly children?: React.ReactNode;
}) => {
  const { View } = require("react-native") as typeof import("react-native");
  return <View>{children}</View>;
};

(jest.requireMock("@/components/ui").Header as Record<string, unknown>).Title = ({
  children,
}: {
  readonly children?: React.ReactNode;
}) => {
  const { Text } = require("react-native") as typeof import("react-native");
  return <Text>{children}</Text>;
};

describe("StudentAppHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanGoBack.mockReturnValue(true);
  });

  it("renders edit profile custom text actions", () => {
    const onSave = jest.fn();
    const { getByText } = render(
      <StudentAppHeader
        routeKey="perfil"
        topInset={0}
        headerActionLabel="Salvar"
        onHeaderActionPress={onSave}
      />,
    );

    fireEvent.press(getByText("Cancelar"));
    expect(mockBack).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText("Salvar"));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("renders conta wallet balance button and navigates to wallet", () => {
    const { getByLabelText, getByText } = render(
      <StudentAppHeader routeKey="conta" topInset={0} walletBalanceLabel="R$ 280,00" />,
    );

    expect(getByText("Conta")).toBeTruthy();
    expect(getByText("R$ 280,00")).toBeTruthy();

    fireEvent.press(getByLabelText("Abrir carteira"));
    expect(mockPush).toHaveBeenCalledWith("/(app)/(shell)/carteira");
  });
});
