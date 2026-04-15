import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View } from "react-native";

interface SignInGradientBackdropProps {
  readonly bottomBlendColor: string;
  readonly isDarkMode: boolean;
}

function SignInGradientBackdrop({
  bottomBlendColor,
  isDarkMode,
}: SignInGradientBackdropProps): React.JSX.Element {
  type FiveColorStops = readonly [string, string, string, string, string];
  type FiveLocationStops = readonly [number, number, number, number, number];
  type ThreeColorStops = readonly [string, string, string];
  type ThreeLocationStops = readonly [number, number, number];

  const sunsetColors: FiveColorStops = isDarkMode
    ? ["#4A90D0", "#D68A3D", "#8B2E1B", "#4E180D", bottomBlendColor]
    : ["#5B9EDB", "#BF7A1E", "#8B2F1B", "#8E4437", bottomBlendColor];

  const sunsetLocations: FiveLocationStops = isDarkMode
    ? [0, 0.14, 0.36, 0.74, 0.95]
    : [0, 0.2, 0.32, 0.82, 1];

  const bottomOverlayColors: ThreeColorStops = isDarkMode
    ? ["rgba(17,17,20,0)", bottomBlendColor, bottomBlendColor]
    : ["rgba(17,17,20,0)", "rgba(17,17,20,0)", bottomBlendColor];

  const bottomOverlayLocations: ThreeLocationStops = isDarkMode
    ? [0, 0.85, 1]
    : [0, 0.92, 1];

  return (
    <View className="absolute inset-0" pointerEvents="none">
      {/* 
        This is the primary background gradient, darkened for a true 
        night/sunset feel. The last stop must match the application container. 
      */}
      <View className="absolute inset-0">
        <LinearGradient
          colors={sunsetColors}
          locations={sunsetLocations}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      {!isDarkMode ? (
        <View className="absolute inset-0">
          <LinearGradient
            colors={["rgba(191,122,30,0)", "rgba(191,122,30,0.16)", "rgba(139,47,27,0)"]}
            locations={[0, 0.5, 1]}
            start={{ x: 0.5, y: 0.17 }}
            end={{ x: 0.5, y: 0.4 }}
            style={{ flex: 1 }}
          />
        </View>
      ) : null}

      {!isDarkMode ? (
        <View className="absolute inset-0">
          <LinearGradient
            colors={["rgba(201,135,31,0)", "rgba(201,135,31,0.12)", "rgba(139,47,27,0)"]}
            locations={[0, 0.55, 1]}
            start={{ x: 0.5, y: 0.22 }}
            end={{ x: 0.5, y: 0.46 }}
            style={{ flex: 1 }}
          />
        </View>
      ) : null}

      {/* 
        The final transparent to solid background gradient smooths everything out perfectly 
        across the entire screen to eliminate any perceived sharp lines.
      */}
      <View className="absolute inset-0">
        <LinearGradient
          colors={bottomOverlayColors}
          locations={bottomOverlayLocations}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      {!isDarkMode ? (
        <View className="absolute inset-0">
          <LinearGradient
            colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.68)", bottomBlendColor]}
            locations={[0, 0.82, 1]}
            start={{ x: 0.5, y: 0.76 }}
            end={{ x: 0.5, y: 1 }}
            style={{ flex: 1 }}
          />
        </View>
      ) : null}
    </View>
  );
}

export { SignInGradientBackdrop };
export type { SignInGradientBackdropProps };
