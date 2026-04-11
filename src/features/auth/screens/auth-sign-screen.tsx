import React from "react";
import { ScrollView, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, useAppThemeColor } from "@/components/ui";
import { AuthCtaBlock } from "@/features/auth/components/auth-cta-block";
import { BrandBlock } from "@/features/auth/components/brand-block";
import { CommunityAvatarGroup } from "@/features/auth/components/community-avatar-group";
import { HeroCopyBlock } from "@/features/auth/components/hero-copy-block";
import { SignInGradientBackdrop } from "@/features/auth/components/sign-in-gradient-backdrop";
import { useDevAuthBypass } from "@/features/auth/hooks/use-dev-auth-bypass";
import { useGoogleSignIn } from "@/features/auth/hooks/use-google-sign-in";

function AuthSignScreen(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const backgroundColor = useAppThemeColor("background");

  const {
    errorMessage,
    isLoading: isGoogleLoading,
    isSessionPending,
    signInWithGoogle,
  } = useGoogleSignIn();
  const {
    canUseBypass,
    errorMessage: devBypassErrorMessage,
    isLoading: isDevBypassLoading,
    signInForDevelopment,
  } = useDevAuthBypass();
  const isInteractionBlocked =
    isGoogleLoading || isDevBypassLoading || isSessionPending;

  return (
    <Screen className="flex-1 bg-background" style={{ flex: 1 }}>
      <SignInGradientBackdrop
        bottomBlendColor={backgroundColor}
        isDarkMode={isDarkMode}
      />

      <ScrollView
        bounces={false}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View
          className="flex-1"
          style={{
            flex: 1,
            paddingTop: Math.max(insets.top + 40, 36),
            paddingBottom: Math.max(insets.bottom + 16, 28),
          }}
        >
          {/* Top Content: Copy */}
          <View className="px-4 w-full items-center">
            <BrandBlock />
            <HeroCopyBlock />
          </View>

          {/* Middle Content: Avatars */}
          <View
            className="items-center justify-center px-4 w-full"
            style={{
              flex: 1,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CommunityAvatarGroup />
          </View>

          {/* Bottom Auth Area */}
          <View className="w-full px-6 pt-6">
            <AuthCtaBlock
              canUseBypass={canUseBypass}
              devBypassErrorMessage={devBypassErrorMessage}
              errorMessage={errorMessage}
              isGoogleLoading={isGoogleLoading}
              isInteractionBlocked={isInteractionBlocked}
              isSessionPending={isSessionPending}
              onPressDevBypass={signInForDevelopment}
              onPressGoogle={signInWithGoogle}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

export { AuthSignScreen };
