import "../styles/globals.css";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StyleSheet, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { UiProvider } from "@/components/ui";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.setOptions({
  duration: 400,
  fade: true,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const navigationTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <GestureHandlerRootView
      style={[
        styles.container,
        { backgroundColor: navigationTheme.colors.background },
      ]}
    >
      <SafeAreaProvider
        initialMetrics={initialWindowMetrics}
        style={{ backgroundColor: navigationTheme.colors.background }}
      >
        <UiProvider>
          <ThemeProvider value={navigationTheme}>
            <Stack
              initialRouteName="(public)"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="(public)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
            </Stack>
          </ThemeProvider>
        </UiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
