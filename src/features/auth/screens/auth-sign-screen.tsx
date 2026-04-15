import React, { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Image, ScrollView, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, useAppThemeColor, useToast } from "@/components/ui";
import { AuthCtaBlock } from "@/features/auth/components/auth-cta-block";
import { HeroCopyBlock } from "@/features/auth/components/hero-copy-block";
import { useGoogleSignIn } from "@/features/auth/hooks/use-google-sign-in";

const SIGN_IN_TOP_ICON = require("../../../../assets/icons/ios-tinted.png");

function AuthSignScreen(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const dividerColor = useAppThemeColor("border");
  const { toast } = useToast();

  const {
    latestErrorToast,
    isLoading: isGoogleLoading,
    isLastUsedAccountLoading,
    lastUsedAccount,
    isSessionPending,
    signInWithAnotherGoogleAccount,
    signInWithGoogle,
  } = useGoogleSignIn();

  const isInteractionBlocked = isSessionPending;
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    if (!latestErrorToast) {
      return;
    }

    toastRef.current.show({
      variant: "danger",
      placement: "top",
      label: latestErrorToast.message,
    });
  }, [latestErrorToast?.id]);

  return (
    <Screen className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        bounces={false}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex-grow justify-center bg-background px-6"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: Math.max(insets.bottom + 26, 28),
        }}
      >
        <View className="w-full gap-6">
          <View className="w-full items-center">
            <Image
              className="h-[82px] w-[82px] rounded-[22px]"
              source={SIGN_IN_TOP_ICON}
              resizeMode="contain"
            />
          </View>

          <HeroCopyBlock />

          <View className="my-6">
            <View className="h-px w-full overflow-hidden">
              <LinearGradient
                colors={["transparent", dividerColor, "transparent"]}
                end={{ x: 1, y: 0 }}
                start={{ x: 0, y: 0 }}
                style={{ flex: 1 }}
              />
            </View>
          </View>

          <AuthCtaBlock
            isDarkMode={isDarkMode}
            isGoogleLoading={isGoogleLoading}
            isLastUsedAccountLoading={isLastUsedAccountLoading}
            isInteractionBlocked={isInteractionBlocked}
            lastUsedAccount={lastUsedAccount}
            onPressUseAnotherGoogleAccount={signInWithAnotherGoogleAccount}
            onPressGoogle={signInWithGoogle}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

export { AuthSignScreen };
