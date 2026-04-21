import React from "react";
import { View } from "react-native";
import QRCodeStyled from "react-native-qrcode-styled";

interface ReacticxQrCodeProps {
  readonly data: string;
  readonly size?: number;
}

function ReacticxQrCode({
  data,
  size = 208,
}: ReacticxQrCodeProps): React.JSX.Element {
  return (
    <View
      className="rounded-[28px] bg-white p-4"
      style={{
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 4,
      }}
    >
      <QRCodeStyled
        data={data}
        size={size}
        padding={18}
        color="#0b1020"
        pieceScale={1.03}
      />
    </View>
  );
}

export { ReacticxQrCode };
export type { ReacticxQrCodeProps };
