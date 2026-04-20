import type { ExpoConfig } from "expo/config";

const APP_SCHEME = "dfctennismobile";
const IOS_BUNDLE_IDENTIFIER = "com.dfctennis.mobile";
const ANDROID_PACKAGE = "com.dfctennis.mobile";
const GOOGLE_IOS_URL_SCHEME_PLACEHOLDER =
  "com.googleusercontent.apps.replace-me";

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
  icon: "./assets/icons/ios-dark.png",
  scheme: APP_SCHEME,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/icons/splash-icon-dark.png",
    resizeMode: "contain",
    backgroundColor: "#f5f5f5",
    dark: {
      image: "./assets/icons/splash-icon-light.png",
      backgroundColor: "#0f0f0f",
    },
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: IOS_BUNDLE_IDENTIFIER,
    icon: {
      light: "./assets/icons/ios-light.png",
      dark: "./assets/icons/ios-dark.png",
      tinted: "./assets/icons/ios-tinted.png",
    },
  },
  android: {
    package: ANDROID_PACKAGE,
    softwareKeyboardLayoutMode: "resize",
    adaptiveIcon: {
      foregroundImage: "./assets/icons/adaptive-icon.png",
      monochromeImage: "./assets/icons/adaptive-icon.png",
      backgroundColor: "#141414",
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
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/geist/Geist-Regular.ttf",
          "./assets/fonts/geist/Geist-Medium.ttf",
          "./assets/fonts/geist/Geist-SemiBold.ttf",
          "./assets/fonts/geist/Geist-Bold.ttf",
          "./assets/fonts/geist/Geist-ExtraBold.ttf",
          "./assets/fonts/geist/Geist-Black.ttf",
        ],
        android: {
          fonts: [
            {
              fontFamily: "Geist",
              fontDefinitions: [
                {
                  path: "./assets/fonts/geist/Geist-Regular.ttf",
                  weight: 400,
                },
                {
                  path: "./assets/fonts/geist/Geist-Medium.ttf",
                  weight: 500,
                },
                {
                  path: "./assets/fonts/geist/Geist-SemiBold.ttf",
                  weight: 600,
                },
                {
                  path: "./assets/fonts/geist/Geist-Bold.ttf",
                  weight: 700,
                },
                {
                  path: "./assets/fonts/geist/Geist-ExtraBold.ttf",
                  weight: 800,
                },
                {
                  path: "./assets/fonts/geist/Geist-Black.ttf",
                  weight: 900,
                },
              ],
            },
          ],
        },
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/icons/splash-icon-dark.png",
        resizeMode: "contain",
        backgroundColor: "#f5f5f5",
        dark: {
          image: "./assets/icons/splash-icon-light.png",
          backgroundColor: "#060607",
        },
      },
    ],
    "expo-router",
    "./plugins/with-react-native-image-colors-jvm-target",
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
