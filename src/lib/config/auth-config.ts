const DEFAULT_AUTH_BASE_URL = "https://dfc-tennis.vercel.app";
const AUTH_SCHEME = "dfctennismobile";

function normalizeBaseUrl(value?: string): string {
  const candidate = value?.trim() || DEFAULT_AUTH_BASE_URL;
  return candidate.replace(/\/$/, "");
}

const AUTH_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_AUTH_BASE_URL);

const NATIVE_GOOGLE_CONFIG = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || "",
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || "",
} as const;

function getMissingNativeGoogleConfig(platform?: string): string[] {
  const missing: string[] = [];

  if (!NATIVE_GOOGLE_CONFIG.webClientId) {
    missing.push("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID");
  }

  if (platform === "ios" && !NATIVE_GOOGLE_CONFIG.iosClientId) {
    missing.push("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID");
  }

  return missing;
}

export { AUTH_BASE_URL, AUTH_SCHEME, NATIVE_GOOGLE_CONFIG, getMissingNativeGoogleConfig };
