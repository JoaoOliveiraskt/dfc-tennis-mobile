import React from "react";
import GoogleSvg from "../../../../../assets/svgs/google.svg";

interface GoogleIconProps {
  readonly width?: number;
  readonly height?: number;
}

function GoogleIcon({
  width = 19,
  height = 19,
}: GoogleIconProps): React.JSX.Element {
  return <GoogleSvg width={width} height={height} />;
}

export { GoogleIcon };
export type { GoogleIconProps };
