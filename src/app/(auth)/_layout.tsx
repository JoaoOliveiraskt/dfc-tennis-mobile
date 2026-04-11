import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        animation: "none",
        contentStyle: { backgroundColor: colors.background },
        headerShown: false,
      }}
    />
  );
}
