import type { ExpoConfig } from "expo/config";

const APP_SCHEME = "dfctennismobile";
const IOS_BUNDLE_IDENTIFIER = "com.dfctennis.mobile";
const ANDROID_PACKAGE = "com.dfctennis.mobile";
const GOOGLE_IOS_URL_SCHEME_PLACEHOLDER = "com.googleusercontent.apps.replace-me";

const googleIosClientId =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || "";
const googleIosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME?.trim() || "";

function isInvalidGoogleIosUrlScheme(value: string): boolean {
  const normalizedValue = value.toLowerCase();
  return (
    normalizedValue === GOOGLE_IOS_URL_SCHEME_PLACEHOLDER ||
    normalizedValue.includes("replace-me") ||
    !/^com\.googleusercontent\.apps\.[a-z0-9._-]+$/i.test(value)
  );
}

if (!googleIosUrlScheme && googleIosClientId) {
  throw new Error(
    "Missing GOOGLE_IOS_URL_SCHEME: set the real reversed iOS client ID when EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is configured.",
  );
}

if (googleIosUrlScheme && isInvalidGoogleIosUrlScheme(googleIosUrlScheme)) {
  throw new Error(
    "Invalid GOOGLE_IOS_URL_SCHEME: use the real reversed iOS client ID (for example: com.googleusercontent.apps.<id>) and never a placeholder value.",
  );
}

const config: ExpoConfig = {
  name: "dfc-tennis-mobile",
  slug: "dfc-tennis-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: APP_SCHEME,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    backgroundColor: "#ffffff",
    dark: {
      backgroundColor: "#000000",
    },
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: IOS_BUNDLE_IDENTIFIER,
  },
  android: {
    package: ANDROID_PACKAGE,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "@react-native-google-signin/google-signin",
      {
        ...(googleIosUrlScheme ? { iosUrlScheme: googleIosUrlScheme } : {}),
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    authBaseUrl:
      process.env.EXPO_PUBLIC_AUTH_BASE_URL?.trim() ||
      "https://dfc-tennis.vercel.app",
    eas: {
      projectId: "3a7e547d-df4a-4b13-9bf4-c2105095685f",
    },
  },
};

export default config;
