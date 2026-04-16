import ArrowLeftIcon from "@gravity-ui/icons/svgs/arrow-left.svg";
import PersonFillIcon from "@gravity-ui/icons/svgs/person-fill.svg";
import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Button, useAppThemeColor } from "@/components/ui";

interface OnboardingHeaderProps {
  readonly title: string;
  readonly progress: number;
  readonly showProgress: boolean;
  readonly hideRightBadge?: boolean;
  readonly hasBackground?: boolean;
  readonly topInset: number;
  readonly canGoBack: boolean;
  readonly onPressBack: () => void;
}

const ICON_CONTAINER_SIZE = 32;
const RING_STROKE_WIDTH = 3;
const RING_SIZE = ICON_CONTAINER_SIZE + RING_STROKE_WIDTH * 2;
const RING_RADIUS = (RING_SIZE - RING_STROKE_WIDTH) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function OnboardingHeader({
  title,
  progress,
  showProgress,
  hideRightBadge = false,
  hasBackground = true,
  topInset,
  canGoBack,
  onPressBack,
}: OnboardingHeaderProps): React.JSX.Element {
  const iconColor = useAppThemeColor("foreground");
  const ringProgressColor = useAppThemeColor("accent");
  const avatarIconColor = useAppThemeColor("foreground");
  const secondaryColor = useAppThemeColor("surface-secondary");

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const progressOffset = RING_CIRCUMFERENCE * (1 - clampedProgress);

  return (
    <View
      className={`w-full flex-row items-center justify-between px-6 ${
        hasBackground ? "bg-background" : ""
      }`}
      style={{ paddingTop: topInset + 8 }}
    >
      {canGoBack ? (
        <Button
          accessibilityLabel="Voltar"
          isIconOnly
          onPress={onPressBack}
          size="sm"
          variant="secondary"
        >
          <ArrowLeftIcon color={iconColor} height={16} width={16} />
        </Button>
      ) : (
        <View className="size-8" />
      )}

      <Text
        className="flex-1 px-4 text-center text-base font-semibold text-foreground"
        numberOfLines={1}
      >
        {title}
      </Text>

      {hideRightBadge ? (
        <View style={{ height: RING_SIZE, width: RING_SIZE }} />
      ) : (
        <View
          className="relative items-center justify-center overflow-visible"
          style={{ height: RING_SIZE, width: RING_SIZE }}
        >
          {showProgress ? (
            <View className="absolute inset-0 items-center justify-center">
              <Svg
                height={RING_SIZE}
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                width={RING_SIZE}
              >
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  fill="none"
                  r={RING_RADIUS}
                  stroke={ringProgressColor}
                  strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                  strokeDashoffset={progressOffset}
                  strokeLinecap="round"
                  strokeWidth={RING_STROKE_WIDTH}
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                />
              </Svg>
            </View>
          ) : null}
          <View
            accessibilityLabel="Progresso do onboarding"
            accessibilityRole="image"
            className="absolute items-center justify-center rounded-full"
            pointerEvents="none"
            style={{
              backgroundColor: secondaryColor,
              height: ICON_CONTAINER_SIZE,
              width: ICON_CONTAINER_SIZE,
            }}
          >
            <PersonFillIcon color={avatarIconColor} height={14} width={14} />
          </View>
        </View>
      )}
    </View>
  );
}

export { OnboardingHeader };
export type { OnboardingHeaderProps };
