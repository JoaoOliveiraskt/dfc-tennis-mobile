import React from "react";
import { Text, View } from "react-native";

function HeroCopyBlock(): React.JSX.Element {
  return (
    <View className="w-full items-center">
      <Text className="text-center text-2xl font-black leading-tight tracking-tight text-foreground">
        Comece agora com DFC Tennis
      </Text>
    </View>
  );
}

export { HeroCopyBlock };
