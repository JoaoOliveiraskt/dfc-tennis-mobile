import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";

type DirectionalTransitionDirection = "forward" | "back";

interface DirectionalTransitionProps {
  readonly children: React.ReactNode;
  readonly direction: DirectionalTransitionDirection;
  readonly transitionKey: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly className?: string;
  readonly enterDurationMs?: number;
  readonly exitDurationMs?: number;
}

const DEFAULT_ENTER_DURATION_MS = 240;
const DEFAULT_EXIT_DURATION_MS = 200;

function DirectionalTransition({
  children,
  direction,
  transitionKey,
  style,
  className,
  enterDurationMs = DEFAULT_ENTER_DURATION_MS,
  exitDurationMs = DEFAULT_EXIT_DURATION_MS,
}: DirectionalTransitionProps): React.JSX.Element {
  const entering =
    direction === "forward"
      ? SlideInRight.duration(enterDurationMs)
      : SlideInLeft.duration(enterDurationMs);
  const exiting =
    direction === "forward"
      ? SlideOutLeft.duration(exitDurationMs)
      : SlideOutRight.duration(exitDurationMs);

  return (
    <Animated.View
      className={className}
      entering={entering}
      exiting={exiting}
      key={transitionKey}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

export { DEFAULT_ENTER_DURATION_MS, DEFAULT_EXIT_DURATION_MS, DirectionalTransition };
export type { DirectionalTransitionDirection, DirectionalTransitionProps };

