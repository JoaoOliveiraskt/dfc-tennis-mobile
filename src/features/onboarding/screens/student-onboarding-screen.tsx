import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  Keyboard,
  type KeyboardEvent,
  Platform,
  ScrollView,
  View,
} from "react-native";
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/ui";
import { HOME_ROUTE } from "@/features/auth/services/auth-entry-routes";
import {
  OnboardingBackgroundGradient,
  OnboardingDoneSheet,
  OnboardingHeader,
  OnboardingMultiSelectStep,
  OnboardingNameStep,
  OnboardingSingleSelectStep,
  OnboardingStickyCta,
  OnboardingWelcomeStep,
} from "@/features/onboarding/components";
import { useStudentOnboardingQuestionnaire } from "@/features/onboarding/hooks/use-student-onboarding-questionnaire";

type TransitionDirection = "forward" | "back";

type PendingNavigation = "next" | "back" | null;

const STICKY_CTA_BUTTON_HEIGHT = 56;
const STICKY_CTA_TOP_PADDING = 16;
const STICKY_CTA_EXTRA_CONTENT_SPACING = 16;
const STICKY_CTA_KEYBOARD_GAP = 12;

function StudentOnboardingScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isSubmittingFinish, setIsSubmittingFinish] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [transitionDirection, setTransitionDirection] =
    useState<TransitionDirection>("forward");
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation>(null);
  const {
    completionPhase,
    currentStep,
    goBack,
    goNext,
    isCurrentStepValid,
    isHydrating,
    isStickyCtaVisible,
    progress,
    state,
    stickyCtaLabel,
    toggleMultiSelectValue,
    setSingleSelectValue,
    updateName,
    completeOnboarding,
  } = useStudentOnboardingQuestionnaire();

  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const handleKeyboardShow = (event: KeyboardEvent): void => {
      setKeyboardHeight(Math.max(0, event.endCoordinates.height));
    };

    const resetKeyboardOffset = (): void => {
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener(
      showEvent,
      handleKeyboardShow,
    );
    const hideSubscription = Keyboard.addListener(
      hideEvent,
      resetKeyboardOffset,
    );
    const didHideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      resetKeyboardOffset,
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      didHideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!pendingNavigation) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      if (pendingNavigation === "next") {
        goNext();
      } else {
        goBack();
      }
      setPendingNavigation(null);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [goBack, goNext, pendingNavigation]);

  useEffect(() => {
    if (currentStep.kind !== "name") {
      setKeyboardHeight(0);
    }
  }, [currentStep.kind]);

  function handleGoNext(): void {
    Keyboard.dismiss();
    setTransitionDirection("forward");
    setPendingNavigation("next");
  }

  function handleGoBack(): void {
    Keyboard.dismiss();
    setTransitionDirection("back");
    setPendingNavigation("back");
  }

  async function handleFinishOnboarding(): Promise<void> {
    if (isSubmittingFinish) {
      return;
    }

    setIsSubmittingFinish(true);

    try {
      await completeOnboarding();
      router.replace(HOME_ROUTE);
    } finally {
      setIsSubmittingFinish(false);
    }
  }

  if (isHydrating) {
    return <Screen className="flex-1 bg-background" />;
  }

  const isCompletionSheetOpen =
    currentStep.id === "lessonType" && completionPhase !== "idle";
  const stickyCtaBaseBottomInset = Math.max(insets.bottom, 32);
  const shouldLiftStickyCta = currentStep.kind === "name" && keyboardHeight > 0;
  const stickyCtaBottomInset = shouldLiftStickyCta
    ? keyboardHeight + STICKY_CTA_KEYBOARD_GAP
    : stickyCtaBaseBottomInset;
  const stickyCtaContentPaddingBottom = isStickyCtaVisible
    ? STICKY_CTA_BUTTON_HEIGHT +
      STICKY_CTA_TOP_PADDING +
      stickyCtaBaseBottomInset +
      STICKY_CTA_EXTRA_CONTENT_SPACING
    : 24;

  return (
    <Screen className="flex-1 bg-background">
      {currentStep.id === "welcome" ? <OnboardingBackgroundGradient /> : null}

      <OnboardingHeader
        canGoBack={state.currentStepIndex > 0}
        hasBackground={currentStep.id !== "welcome"}
        hideRightBadge={currentStep.id === "welcome"}
        onPressBack={handleGoBack}
        progress={progress}
        showProgress={state.currentStepIndex > 0}
        topInset={insets.top}
        title={currentStep.id === "welcome" ? currentStep.title : undefined}
      />

      <View className="relative flex-1">
        <Animated.View
          entering={
            transitionDirection === "forward"
              ? SlideInRight.duration(240)
              : SlideInLeft.duration(240)
          }
          exiting={
            transitionDirection === "forward"
              ? SlideOutLeft.duration(200)
              : SlideOutRight.duration(200)
          }
          key={currentStep.id}
          style={{ flex: 1 }}
        >
          <ScrollView
            bounces={false}
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: isCompletionSheetOpen
                ? Math.max(insets.bottom + 12, 24)
                : stickyCtaContentPaddingBottom,
              paddingHorizontal: 24,
            }}
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {currentStep.kind === "welcome" ? (
              <OnboardingWelcomeStep headline={currentStep.headline} />
            ) : null}

            {currentStep.kind === "name" ? (
              <OnboardingNameStep
                firstName={state.firstName}
                firstNamePlaceholder={currentStep.firstNamePlaceholder}
                lastName={state.lastName}
                lastNamePlaceholder={currentStep.lastNamePlaceholder}
                onFirstNameChange={(value) => {
                  updateName("firstName", value);
                }}
                onLastNameChange={(value) => {
                  updateName("lastName", value);
                }}
              />
            ) : null}

            {currentStep.kind === "single-select" ? (
              <OnboardingSingleSelectStep
                onSelectValue={(value) => {
                  setSingleSelectValue(currentStep.field, value);
                }}
                helperText={currentStep.helperText}
                options={currentStep.options}
                prompt={currentStep.prompt}
                selectedValue={state[currentStep.field]}
              />
            ) : null}

            {currentStep.kind === "multi-select" ? (
              <OnboardingMultiSelectStep
                onToggleValue={(value) => {
                  toggleMultiSelectValue(currentStep.field, value);
                }}
                helperText={currentStep.helperText}
                options={currentStep.options}
                prompt={currentStep.prompt}
                selectedValues={state[currentStep.field]}
              />
            ) : null}
          </ScrollView>
        </Animated.View>
        {isStickyCtaVisible && stickyCtaLabel ? (
          <View className="absolute bottom-0 left-0 right-0 z-30">
            <OnboardingStickyCta
              bottomInset={stickyCtaBottomInset}
              isDisabled={!isCurrentStepValid}
              label={stickyCtaLabel}
              onPress={handleGoNext}
            />
          </View>
        ) : null}
      </View>

      <OnboardingDoneSheet
        isOpen={isCompletionSheetOpen}
        isSubmitting={isSubmittingFinish}
        onPressStart={handleFinishOnboarding}
        phase={completionPhase}
      />
    </Screen>
  );
}

export { StudentOnboardingScreen };
