import React from "react";
import { Text, View } from "react-native";

function HeroCopyBlock(): React.JSX.Element {
  return (
    <View className="items-center w-full px-2">
      <Text
        className="text-center font-bold text-white"
        style={{ fontSize: 42, lineHeight: 46, letterSpacing: -1.2 }}
      >
        <Text
          className="text-white"
          style={{ fontSize: 40, fontStyle: "italic", fontWeight: "300" }}
        >
          Agende{"\u00A0"}
        </Text>
        <Text
          className="text-white"
          style={{ fontSize: 40, fontWeight: "700" }}
        >
          e{"\u00A0"}
        </Text>
        <Text
          className="text-white"
          style={{ fontSize: 40, fontStyle: "italic", fontWeight: "300" }}
        >
          jogue
        </Text>
        {"\n"}no seu{" "}
        <Text
          className="text-white"
          style={{
            fontSize: 40,
            fontStyle: "italic",
            fontWeight: "300",
          }}
        >
          ritmo
        </Text>
        .
      </Text>

      <Text
        className="mt-2 text-center text-xs font-medium leading-5.5 text-white opacity-40"
        style={{ maxWidth: 270 }}
      >
        Organize aulas e jogos em segundos e mantenha sua rotina de evolução
        sempre em dia.
      </Text>
    </View>
  );
}

export { HeroCopyBlock };
