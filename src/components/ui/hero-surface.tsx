import React from "react";
import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { requireOptionalNativeModule } from "expo-modules-core";
import { twMerge } from "tailwind-merge";
import SafeImage from "./safe-image";

type HeroSurfaceBucket = "default" | "group" | "kids" | "private";

interface HeroSurfaceTokens {
  readonly bottomMassBackground: string;
  readonly bottomBarBackground: string;
  readonly bottomMassGradientColors: readonly [string, string, string, string];
  readonly bottomMassGradientLocations: readonly [number, number, number, number];
  readonly bridgeGradientColors: readonly [string, string];
  readonly bridgeGradientLocations: readonly [number, number];
  readonly cardBackground: string;
  readonly cardBorder: string;
  readonly cardGlass: string;
  readonly ctaBackground: string;
  readonly ctaForeground: string;
  readonly heroGradientColors: readonly [string, string, string];
  readonly heroGradientLocations: readonly [number, number, number];
  readonly metaText: string;
  readonly sectionBackground: string;
  readonly subtleText: string;
  readonly titleText: string;
}

interface HeroSurfaceProps extends Omit<ViewProps, "children"> {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly imageCacheKey?: string;
  readonly imageFallbackSource?: ImageSourcePropType;
  readonly imageSource: ImageSourcePropType;
  readonly imageTransitionMs?: number;
  readonly tokens: HeroSurfaceTokens;
}

interface UseHeroSurfaceTokensParams {
  readonly bucket?: HeroSurfaceBucket;
  readonly imageSource: ImageSourcePropType;
  readonly paletteKey: string;
}

type RGBColor = readonly [number, number, number];
type ImageColorsResult = import("react-native-image-colors").ImageColorsResult;
type ImageColorsModule = typeof import("react-native-image-colors");

const HERO_BUCKET_BASE_HEX = {
  default: ["#23361f", "#294224", "#314a29"],
  group: ["#24381f", "#2a4324", "#305029"],
  kids: ["#1f3730", "#274339", "#2f4d42"],
  private: ["#4b3124", "#5a3a2a", "#66452f"],
} as const satisfies Record<HeroSurfaceBucket, readonly string[]>;

const HERO_BUCKET_ACCENT_HEX = {
  default: ["#42653a", "#4b7042", "#567c49"],
  group: ["#4a6b3f", "#56794a", "#628654"],
  kids: ["#416a61", "#4b776d", "#58857a"],
  private: ["#8b6445", "#9a7150", "#a77d5c"],
} as const satisfies Record<HeroSurfaceBucket, readonly string[]>;

const LATE_TOKEN_UPDATE_LIMIT_MS = 120;
const HERO_SURFACE_CACHE = new Map<string, HeroSurfaceTokens>();
const HERO_SURFACE_IN_FLIGHT = new Map<string, Promise<HeroSurfaceTokens>>();
let imageColorsModulePromise: Promise<ImageColorsModule | null> | null = null;

function resolveImageColorsModule(): Promise<ImageColorsModule | null> {
  if (!imageColorsModulePromise) {
    const imageColorsNativeModule = requireOptionalNativeModule("ImageColors");

    imageColorsModulePromise = imageColorsNativeModule
      ? import("react-native-image-colors")
          .then((module) => module)
          .catch(() => null)
      : Promise.resolve(null);
  }

  return imageColorsModulePromise;
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function parseColorToRgb(color: string): RGBColor | null {
  const normalizedHex = color.trim().replace(/^#/, "");

  if (normalizedHex.length === 3) {
    const [r, g, b] = normalizedHex.split("");
    return [
      parseInt(r + r, 16),
      parseInt(g + g, 16),
      parseInt(b + b, 16),
    ];
  }

  if (normalizedHex.length === 6) {
    return [
      parseInt(normalizedHex.slice(0, 2), 16),
      parseInt(normalizedHex.slice(2, 4), 16),
      parseInt(normalizedHex.slice(4, 6), 16),
    ];
  }

  if (normalizedHex.length === 8) {
    return [
      parseInt(normalizedHex.slice(2, 4), 16),
      parseInt(normalizedHex.slice(4, 6), 16),
      parseInt(normalizedHex.slice(6, 8), 16),
    ];
  }

  return null;
}

function rgbToHex(color: RGBColor): string {
  return `#${color
    .map((channel) => clampChannel(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function normalizeColorToHex(color: string | null | undefined): string | null {
  if (typeof color !== "string") {
    return null;
  }

  const parsed = parseColorToRgb(color);
  return parsed ? rgbToHex(parsed) : null;
}

function mixRgb(base: RGBColor, other: RGBColor, ratio: number): RGBColor {
  const clampedRatio = Math.max(0, Math.min(1, ratio));

  return [
    clampChannel(base[0] * (1 - clampedRatio) + other[0] * clampedRatio),
    clampChannel(base[1] * (1 - clampedRatio) + other[1] * clampedRatio),
    clampChannel(base[2] * (1 - clampedRatio) + other[2] * clampedRatio),
  ];
}

function toRgba(color: RGBColor, alpha: number): string {
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${clampedAlpha})`;
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function resolveImageSourceUri(source: ImageSourcePropType): string | null {
  if (typeof source === "number") {
    return Image.resolveAssetSource(source)?.uri ?? null;
  }

  if (Array.isArray(source)) {
    const firstUri = source[0] && "uri" in source[0] ? source[0].uri : null;
    return typeof firstUri === "string" ? firstUri : null;
  }

  if (source && typeof source === "object" && "uri" in source) {
    return typeof source.uri === "string" ? source.uri : null;
  }

  return null;
}

function resolveTokenSeed(params: UseHeroSurfaceTokensParams): number {
  const sourceUri = resolveImageSourceUri(params.imageSource);
  return hashString(sourceUri ?? params.paletteKey);
}

function resolveSurfaceCacheKey(params: UseHeroSurfaceTokensParams): string {
  const bucket = params.bucket ?? "default";
  const sourceUri = resolveImageSourceUri(params.imageSource);
  return `${bucket}:image:${hashString(sourceUri ?? params.paletteKey)}`;
}

function resolveImageColorsCacheKey(params: UseHeroSurfaceTokensParams): string {
  const sourceUri = resolveImageSourceUri(params.imageSource);
  return `hero-image:${hashString(sourceUri ?? params.paletteKey)}`;
}

function buildTokens(params: {
  readonly accentHex: string;
  readonly baseHex: string;
  readonly seed: number;
}): HeroSurfaceTokens {
  const baseColor = parseColorToRgb(params.baseHex) ?? [37, 54, 77];
  const accentColor = parseColorToRgb(params.accentHex) ?? [90, 142, 209];
  const inkColor: RGBColor = [8, 11, 18];
  const whiteColor: RGBColor = [255, 255, 255];
  const seedRatio = (params.seed % 100) / 100;

  const familyColor = mixRgb(baseColor, accentColor, 0.14 + seedRatio * 0.04);
  const deepMix = 0.74 + seedRatio * 0.04;
  const sectionMix = 0.86 + seedRatio * 0.03;
  const cardMix = 0.34 + seedRatio * 0.03;
  const bottomMassMix = 0.22 + seedRatio * 0.02;

  const deepColor = mixRgb(familyColor, inkColor, deepMix);
  const sectionColor = mixRgb(familyColor, inkColor, sectionMix);
  const cardColor = mixRgb(familyColor, inkColor, cardMix);
  const denseColor = mixRgb(cardColor, inkColor, 0.18 + seedRatio * 0.02);
  const bottomMassColor = mixRgb(cardColor, inkColor, bottomMassMix);
  const bottomBarColor = mixRgb(bottomMassColor, inkColor, 0.08);
  const cardBorderColor = mixRgb(accentColor, whiteColor, 0.18 + seedRatio * 0.08);
  const ctaBackgroundColor = mixRgb(accentColor, whiteColor, 0.18 + seedRatio * 0.05);

  return {
    bottomMassBackground: toRgba(bottomMassColor, 1),
    bottomBarBackground: toRgba(bottomBarColor, 0.985),
    bottomMassGradientColors: [
      toRgba(bottomMassColor, 0),
      toRgba(cardColor, 0.06),
      toRgba(bottomMassColor, 0.86),
      toRgba(bottomMassColor, 1),
    ],
    bottomMassGradientLocations: [0.46, 0.62, 0.76, 0.84],
    bridgeGradientColors: [toRgba(cardColor, 0), toRgba(bottomMassColor, 0.88)],
    bridgeGradientLocations: [0.48, 0.78],
    cardBackground: toRgba(mixRgb(cardColor, whiteColor, 0.07), 0.98),
    cardBorder: toRgba(cardBorderColor, 0.34),
    cardGlass: toRgba(mixRgb(baseColor, whiteColor, 0.18), 0.24),
    ctaBackground: toRgba(ctaBackgroundColor, 0.96),
    ctaForeground: "rgba(255, 255, 255, 0.96)",
    heroGradientColors: [
      "rgba(0, 0, 0, 0)",
      toRgba(deepColor, 0.05),
      toRgba(denseColor, 0.7),
    ],
    heroGradientLocations: [0.48, 0.72, 0.84],
    metaText: "rgba(255, 255, 255, 0.88)",
    sectionBackground: toRgba(sectionColor, 0.985),
    subtleText: "rgba(255, 255, 255, 0.68)",
    titleText: "rgba(255, 255, 255, 0.98)",
  };
}

function resolveFallbackTokens(params: UseHeroSurfaceTokensParams): HeroSurfaceTokens {
  const seed = resolveTokenSeed(params);
  const bucket = params.bucket ?? "default";
  const basePalette = HERO_BUCKET_BASE_HEX[bucket];
  const accentPalette = HERO_BUCKET_ACCENT_HEX[bucket];
  const baseHex = basePalette[seed % basePalette.length] ?? basePalette[0];
  const accentHex = accentPalette[(seed + 1) % accentPalette.length] ?? accentPalette[0];

  return buildTokens({ accentHex, baseHex, seed });
}

function resolveFallbackHex(params: UseHeroSurfaceTokensParams): string {
  const seed = resolveTokenSeed(params);
  const bucket = params.bucket ?? "default";
  const palette = HERO_BUCKET_ACCENT_HEX[bucket];
  return palette[seed % palette.length] ?? palette[0];
}

function pickPlatformColor(colors: ImageColorsResult): string | null {
  if (colors.platform === "android") {
    return normalizeColorToHex(colors.dominant);
  }

  if (colors.platform === "ios") {
    return normalizeColorToHex(colors.detail);
  }

  return normalizeColorToHex(colors.dominant);
}

async function extractHeroSurfaceTokens(
  params: UseHeroSurfaceTokensParams,
): Promise<HeroSurfaceTokens> {
  const fallbackTokens = resolveFallbackTokens(params);
  const sourceUri = resolveImageSourceUri(params.imageSource);
  if (!sourceUri) {
    return fallbackTokens;
  }

  const imageColorsModule = await resolveImageColorsModule();
  if (!imageColorsModule?.getColors) {
    return fallbackTokens;
  }

  try {
    const colors = await imageColorsModule.getColors(sourceUri, {
      fallback: resolveFallbackHex(params),
      cache: true,
      key: resolveImageColorsCacheKey(params),
    });
    const imageHex = pickPlatformColor(colors);
    if (!imageHex) {
      return fallbackTokens;
    }

    return buildTokens({
      accentHex: imageHex,
      baseHex: imageHex,
      seed: resolveTokenSeed(params),
    });
  } catch {
    return fallbackTokens;
  }
}

function preloadHeroSurfaceTokens(
  params: UseHeroSurfaceTokensParams,
): Promise<HeroSurfaceTokens> {
  const cacheKey = resolveSurfaceCacheKey(params);
  const cached = HERO_SURFACE_CACHE.get(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }

  const inFlight = HERO_SURFACE_IN_FLIGHT.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const request = extractHeroSurfaceTokens(params)
    .then((tokens) => {
      HERO_SURFACE_CACHE.set(cacheKey, tokens);
      return tokens;
    })
    .finally(() => {
      HERO_SURFACE_IN_FLIGHT.delete(cacheKey);
    });

  HERO_SURFACE_IN_FLIGHT.set(cacheKey, request);
  return request;
}

function useHeroSurfaceTokens({
  bucket = "default",
  imageSource,
  paletteKey,
}: UseHeroSurfaceTokensParams): HeroSurfaceTokens {
  const params = React.useMemo(
    () => ({ bucket, imageSource, paletteKey }),
    [bucket, imageSource, paletteKey],
  );
  const cacheKey = React.useMemo(() => resolveSurfaceCacheKey(params), [params]);
  const fallbackTokens = React.useMemo(
    () => resolveFallbackTokens(params),
    [params],
  );
  const [tokens, setTokens] = React.useState<HeroSurfaceTokens>(() => {
    return HERO_SURFACE_CACHE.get(cacheKey) ?? fallbackTokens;
  });

  React.useEffect(() => {
    let isDisposed = false;
    const cached = HERO_SURFACE_CACHE.get(cacheKey);
    if (cached) {
      setTokens(cached);
      return () => {
        isDisposed = true;
      };
    }

    setTokens(fallbackTokens);
    const startedAt = Date.now();
    void preloadHeroSurfaceTokens(params).then((resolvedTokens) => {
      if (isDisposed) {
        return;
      }

      if (Date.now() - startedAt <= LATE_TOKEN_UPDATE_LIMIT_MS) {
        setTokens(resolvedTokens);
      }
    });

    return () => {
      isDisposed = true;
    };
  }, [cacheKey, fallbackTokens, params]);

  return tokens;
}

function HeroSurface({
  children,
  className,
  imageCacheKey,
  imageFallbackSource,
  imageSource,
  imageTransitionMs = 0,
  tokens,
  ...props
}: HeroSurfaceProps): React.JSX.Element {
  return (
    <View {...props} className={twMerge("relative overflow-hidden", className)}>
      <SafeImage
        source={imageSource}
        fallbackSource={imageFallbackSource}
        cachePolicy="memory-disk"
        contentFit="cover"
        recyclingKey={imageCacheKey}
        style={StyleSheet.absoluteFillObject}
        transition={imageTransitionMs}
      />

      <LinearGradient
        colors={tokens.heroGradientColors}
        locations={tokens.heroGradientLocations}
        style={StyleSheet.absoluteFillObject}
      />

      <LinearGradient
        colors={tokens.bottomMassGradientColors}
        locations={tokens.bottomMassGradientLocations}
        style={StyleSheet.absoluteFillObject}
      />

      {children}
    </View>
  );
}

export default HeroSurface;
export { preloadHeroSurfaceTokens, useHeroSurfaceTokens };
export type { HeroSurfaceBucket, HeroSurfaceTokens };
