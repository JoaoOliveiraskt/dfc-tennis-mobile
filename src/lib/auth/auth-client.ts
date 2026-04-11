import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { AUTH_BASE_URL, AUTH_SCHEME } from "@/lib/config/auth-config";
const STORAGE_PREFIX = "dfc-tennis-mobile";

const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  plugins: [
    expoClient({
      scheme: AUTH_SCHEME,
      storage: SecureStore,
      storagePrefix: STORAGE_PREFIX,
      cookiePrefix: "better-auth",
    }),
  ],
});

export { AUTH_BASE_URL };
export { AUTH_SCHEME };
export { authClient };
