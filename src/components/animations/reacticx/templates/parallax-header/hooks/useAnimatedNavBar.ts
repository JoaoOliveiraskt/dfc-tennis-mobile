import type { Animated } from "react-native";

export const useAnimateNavbar = (
  scroll: Animated.Value,
  imageHeight: number,
  headerHeight: number
) => {
  const HEADER_HEIGHT_DIFFERENCE = imageHeight - headerHeight;
  const transitionStart = HEADER_HEIGHT_DIFFERENCE * 0.62;
  const transitionEnd = HEADER_HEIGHT_DIFFERENCE * 0.82;
  const headerOpacity = scroll.interpolate({
    inputRange: [0, transitionStart, transitionEnd],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });
  const overflowHeaderOpacity = scroll.interpolate({
    inputRange: [0, transitionStart, transitionEnd],
    outputRange: [1, 1, 0],
    extrapolate: "clamp",
  });
  const headerTranslateY = scroll.interpolate({
    inputRange: [0, transitionStart, transitionEnd],
    outputRange: [10, 10, 0],
    extrapolate: "clamp",
  });

  return [headerOpacity, overflowHeaderOpacity, headerTranslateY];
};
