import PaperPlaneIcon from "@gravity-ui/icons/svgs/paper-plane.svg";
import SealCheckIcon from "@gravity-ui/icons/svgs/seal-check.svg";
import React from "react";
import { Text, View } from "react-native";
import Animated, { SlideInRight, SlideOutLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheet,
  Button,
  Spinner,
  useAppThemeColor,
} from "@/components/ui";
import type { OnboardingCompletionPhase } from "@/features/onboarding/types/onboarding-types";

interface OnboardingDoneSheetProps {
  readonly isOpen: boolean;
  readonly phase: OnboardingCompletionPhase;
  readonly isSubmitting: boolean;
  readonly onPressStart: () => void;
}

function OnboardingDoneSheet({
  isOpen,
  phase,
  isSubmitting,
  onPressStart,
}: OnboardingDoneSheetProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const iconColor = useAppThemeColor("accent");
  const foregroundColor = useAppThemeColor("foreground");

  const isProcessing = phase !== "success";

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={() => undefined}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          backgroundClassName="rounded-[32px] bg-surface"
          bottomInset={insets.bottom + 10}
          className="mx-4"
          detached
          enableDynamicSizing={false}
          enablePanDownToClose={false}
          index={0}
          snapPoints={["32%"]}
        >
          <View className="flex-1 justify-between px-6">
            <Animated.View
              entering={SlideInRight.duration(240)}
              exiting={SlideOutLeft.duration(200)}
              key={phase}
              className="items-center"
            >
              <View>
                {isProcessing ? (
                  <PaperPlaneIcon color={iconColor} height={60} width={60} />
                ) : (
                  <SealCheckIcon color={iconColor} height={60} width={60} />
                )}
              </View>

              <View className="items-center gap-2 mt-2">
                <BottomSheet.Title className="text-center text-lg font-semibold tracking-tight text-foreground">
                  {isProcessing ? "Processando..." : "Sucesso!"}
                </BottomSheet.Title>
                <BottomSheet.Description className="text-center text-base leading-6 text-muted">
                  {isProcessing
                    ? "Montando suas recomendações de aula..."
                    : "Perfil pronto. Vamos para suas aulas."}
                </BottomSheet.Description>
              </View>
            </Animated.View>

            <Animated.View
              entering={SlideInRight.duration(240)}
              exiting={SlideOutLeft.duration(200)}
              key={`${phase}-cta`}
            >
              {isProcessing ? (
                <View className="items-center pb-2 mt-4">
                  <Spinner color={foregroundColor} size="sm" />
                </View>
              ) : (
                <Button
                  className="mt-4 self-center"
                  isDisabled={isSubmitting}
                  onPress={onPressStart}
                  size="md"
                  variant="primary"
                >
                  {isSubmitting ? "Abrindo..." : "Começar"}
                </Button>
              )}
            </Animated.View>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

export { OnboardingDoneSheet };
export type { OnboardingDoneSheetProps };
