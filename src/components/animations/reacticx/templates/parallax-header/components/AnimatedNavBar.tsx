import React from "react";
import { StyleSheet, Animated } from "react-native";
import { useAnimateNavbar } from "../hooks/useAnimatedNavBar";
import type { AnimatedNavbarProps } from "../types/index";

const AnimatedNavbar = ({
  scroll,
  imageHeight,
  OverflowHeaderComponent,
  TopNavbarComponent,
  headerHeight,
  headerElevation,
}: AnimatedNavbarProps) => {
  const [headerOpacity, overflowHeaderOpacity, headerTranslateY] =
    useAnimateNavbar(scroll, imageHeight, headerHeight);

  return (
    <>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.container,
          styles.topHeader,
          {
            height: headerHeight,
            opacity: headerOpacity,
            elevation: headerElevation,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        {TopNavbarComponent}
      </Animated.View>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.container,
          styles.overflowHeader,
          {
            height: headerHeight,
            opacity: overflowHeaderOpacity,
          },
        ]}
      >
        {OverflowHeaderComponent}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    width: "100%",
    backgroundColor: "transparent",
  },
  topHeader: {
    zIndex: 40,
  },
  overflowHeader: {
    backgroundColor: "transparent",
    zIndex: 30,
  },
});

export default AnimatedNavbar;
