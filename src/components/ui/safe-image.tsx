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

function resolveImageSourceKey(source: ImageSourcePropType): string {
  if (typeof source === "number") {
    return `asset:${source}`;
  }

  if (Array.isArray(source)) {
    return source.map(resolveImageSourceKey).join("|");
  }

  if (source && typeof source === "object" && "uri" in source) {
    return `uri:${source.uri ?? ""}`;
  }

  return "unknown";
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
  const sourceKey = React.useMemo(
    () => recyclingKey ?? resolveImageSourceKey(source),
    [recyclingKey, source],
  );
  const fallbackSourceKey = React.useMemo(
    () => (fallbackSource ? resolveImageSourceKey(fallbackSource) : null),
    [fallbackSource],
  );
  const [activeSourceState, setActiveSourceState] = React.useState({
    key: sourceKey,
    source,
  });
  const [hasExpoImageError, setHasExpoImageError] = React.useState(false);
  const lastSourceKeyRef = React.useRef(sourceKey);

  React.useEffect(() => {
    if (lastSourceKeyRef.current === sourceKey) {
      return;
    }

    lastSourceKeyRef.current = sourceKey;
    setActiveSourceState({
      key: sourceKey,
      source,
    });
    setHasExpoImageError(false);
  }, [source, sourceKey]);

  if (hasExpoImageError) {
    return (
      <ReactNativeImage
        source={activeSourceState.source}
        resizeMode={mapContentFitToResizeMode(contentFit)}
        {...props}
      />
    );
  }

  return (
    <ExpoImage
      contentFit={contentFit}
      cachePolicy={cachePolicy}
      decodeFormat={decodeFormat}
      enforceEarlyResizing={enforceEarlyResizing}
      recyclingKey={recyclingKey}
      source={activeSourceState.source}
      transition={transition}
      onError={(error) => {
        onSourceError?.({
          error: error.error,
          source: activeSourceState.source,
        });

        if (
          fallbackSource &&
          fallbackSourceKey &&
          activeSourceState.key !== fallbackSourceKey
        ) {
          setActiveSourceState({
            key: fallbackSourceKey,
            source: fallbackSource,
          });
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
