import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="(shell)"
        options={{
          animation: "none",
        }}
      />
      <Stack.Screen
        name="aula/[id]"
        options={{
          animation: "default",
        }}
      />
    </Stack>
  );
}
