import React from "react";
import {
  Image as ReactNativeImage,
  type ImageProps as ReactNativeImageProps,
  type ImageResizeMode,
  type ImageSourcePropType,
} from "react-native";
import {
  Image as ExpoImage,
  type ImageProps as ExpoImageProps,
} from "expo-image";

type SafeImageContentFit = "cover" | "contain" | "fill" | "none" | "scale-down";

interface SafeImageProps
  extends Omit<ReactNativeImageProps, "resizeMode" | "source"> {
  readonly cachePolicy?: "none" | "disk" | "memory" | "memory-disk";
  readonly contentFit?: SafeImageContentFit;
  readonly decodeFormat?: ExpoImageProps["decodeFormat"];
  readonly disableNativeFallback?: boolean;
  readonly enforceEarlyResizing?: ExpoImageProps["enforceEarlyResizing"];
  readonly fallbackSource?: ImageSourcePropType;
  readonly onSourceError?: (params: {
    readonly error: unknown;
    readonly source: ImageSourcePropType;
  }) => void;
  readonly recyclingKey?: string;
  readonly source: ImageSourcePropType;
  readonly transition?: number;
}

function mapContentFitToResizeMode(
  contentFit: SafeImageContentFit | undefined,
): ImageResizeMode {
  if (contentFit === "contain" || contentFit === "scale-down") {
    return "contain";
  }

  if (contentFit === "fill") {
    return "stretch";
  }

  if (contentFit === "none") {
    return "center";
  }

  return "cover";
}

function SafeImage({
  contentFit,
  cachePolicy,
  decodeFormat,
  disableNativeFallback,
  enforceEarlyResizing,
  fallbackSource,
  onSourceError,
  recyclingKey,
  source,
  transition,
  ...props
}: SafeImageProps): React.JSX.Element {
  const [activeSource, setActiveSource] = React.useState(source);
  const [hasExpoImageError, setHasExpoImageError] = React.useState(false);

  React.useEffect(() => {
    setActiveSource(source);
    setHasExpoImageError(false);
  }, [source]);

  if (hasExpoImageError) {
    return (
      <ReactNativeImage
        source={activeSource}
        resizeMode={mapContentFitToResizeMode(contentFit)}
        {...props}
      />
    );
  }

  return (
    <ExpoImage
      source={activeSource}
      contentFit={contentFit}
      cachePolicy={cachePolicy}
      decodeFormat={decodeFormat}
      enforceEarlyResizing={enforceEarlyResizing}
      recyclingKey={recyclingKey}
      transition={transition}
      onError={(error) => {
        onSourceError?.({
          error: error.error,
          source: activeSource,
        });

        if (fallbackSource && activeSource !== fallbackSource) {
          setActiveSource(fallbackSource);
          return;
        }

        if (disableNativeFallback) {
          return;
        }

        setHasExpoImageError(true);
      }}
      {...(props as unknown as Record<string, unknown>)}
    />
  );
}

export default SafeImage;
export type { SafeImageProps };
