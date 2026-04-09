import "../styles/globals.css";

import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  hideNativeSplashOnce,
  preventNativeSplashAutoHideOnce,
} from "@/lib/splash-lifecycle";

preventNativeSplashAutoHideOnce();

export default function RootLayout() {
  useEffect(() => {
    const emergencyHideId = setTimeout(() => {
      hideNativeSplashOnce();
    }, 4500);

    return () => {
      clearTimeout(emergencyHideId);
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <HeroUINativeProvider>
          <Stack
            initialRouteName="(public)"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="(public)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
