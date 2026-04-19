import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/ui";

interface FeedSkeletonBlockProps {
  readonly className?: string;
}

function FeedSkeletonBlock({ className }: FeedSkeletonBlockProps): React.JSX.Element {
  const progress = React.useRef(new Animated.Value(0)).current;
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1300,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-height, height],
  });

  return (
    <View
      onLayout={(event) => {
        setHeight(event.nativeEvent.layout.height);
      }}
      className={`overflow-hidden rounded-[18px] bg-surface ${className ?? ""}`}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.14)", "rgba(255,255,255,0)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
}

function HomeFeedSkeleton(): React.JSX.Element {
  return (
    <Screen className="flex-1 bg-background px-3 pb-3 pt-3">
      <View className="flex-1 rounded-[34px] bg-[#111425] p-4">
        <View className="flex-row items-center justify-between">
          <FeedSkeletonBlock className="h-5 w-28 rounded-full" />
          <FeedSkeletonBlock className="size-10 rounded-full" />
        </View>

        <View className="mt-6 flex-1 justify-end pb-4">
          <View className="items-center">
            <FeedSkeletonBlock className="mb-3 size-14 rounded-full" />
            <FeedSkeletonBlock className="mb-2 h-5 w-24 rounded-full" />
            <FeedSkeletonBlock className="h-12 w-64 rounded-[20px]" />
            <FeedSkeletonBlock className="mt-4 h-4 w-60 rounded-full" />
            <FeedSkeletonBlock className="mt-2 h-4 w-44 rounded-full" />
            <FeedSkeletonBlock className="mt-6 h-12 w-32 rounded-full" />
          </View>
        </View>
      </View>
    </Screen>
  );
}

export { HomeFeedSkeleton };
