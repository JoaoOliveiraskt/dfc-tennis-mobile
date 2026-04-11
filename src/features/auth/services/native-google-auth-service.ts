import Constants from "expo-constants";
import { Platform } from "react-native";
import { authClient } from "@/lib/auth";
import {
  NATIVE_GOOGLE_CONFIG,
  getMissingNativeGoogleConfig,
} from "@/lib/config/auth-config";

type NativeGoogleSignInErrorReason =
  | "in_progress"
  | "missing_configuration"
  | "missing_id_token"
  | "network"
  | "play_services_not_available"
  | "provider_rejected"
  | "session_not_established"
  | "unavailable_in_expo_go"
  | "unknown";

type NativeGoogleSignInResult =
  | { status: "success" }
  | { status: "cancelled" }
  | { status: "error"; reason: NativeGoogleSignInErrorReason };

type NativeSignOutResult =
  | { status: "success" }
  | { status: "error"; message: string };

let isGoogleSigninConfigured = false;
let googleSigninModulePromise: Promise<typeof import("@react-native-google-signin/google-signin")> | null =
  null;
let googleSigninConfigurationPromise: Promise<void> | null = null;

async function loadGoogleSigninModule() {
  if (!googleSigninModulePromise) {
    googleSigninModulePromise = import("@react-native-google-signin/google-signin");
  }

  return googleSigninModulePromise;
}

function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

function isLikelyNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("request failed") ||
    message.includes("timeout")
  );
}

async function ensureGoogleSigninConfigured(): Promise<
  NativeGoogleSignInResult | null
> {
  if (isRunningInExpoGo()) {
    return {
      status: "error",
      reason: "unavailable_in_expo_go",
    };
  }

  const missingConfig = getMissingNativeGoogleConfig(Platform.OS);
  if (missingConfig.length > 0) {
    return {
      status: "error",
      reason: "missing_configuration",
    };
  }

  if (!isGoogleSigninConfigured) {
    if (!googleSigninConfigurationPromise) {
      googleSigninConfigurationPromise = (async () => {
        const { GoogleSignin } = await loadGoogleSigninModule();
        GoogleSignin.configure({
          webClientId: NATIVE_GOOGLE_CONFIG.webClientId,
          iosClientId: NATIVE_GOOGLE_CONFIG.iosClientId,
        });
        isGoogleSigninConfigured = true;
      })().catch((error) => {
        googleSigninConfigurationPromise = null;
        throw error;
      });
    }

    try {
      await googleSigninConfigurationPromise;
    } catch {
      return {
        status: "error",
        reason: "unknown",
      };
    }
  }

  return null;
}

async function signInWithGoogleNative(): Promise<NativeGoogleSignInResult> {
  const configurationError = await ensureGoogleSigninConfigured();
  if (configurationError) {
    return configurationError;
  }

  const googleSigninModule = await loadGoogleSigninModule();
  const {
    GoogleSignin,
    isCancelledResponse,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes,
  } = googleSigninModule;

  try {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    const googleResponse = await GoogleSignin.signIn();

    if (isCancelledResponse(googleResponse)) {
      return {
        status: "cancelled",
      };
    }

    if (!isSuccessResponse(googleResponse) || !googleResponse.data.idToken) {
      return {
        status: "error",
        reason: "missing_id_token",
      };
    }

    const authResponse = await authClient.signIn.social({
      provider: "google",
      disableRedirect: true,
      idToken: {
        token: googleResponse.data.idToken,
      },
    });

    if (authResponse.error) {
      return {
        status: "error",
        reason: "provider_rejected",
      };
    }

    const sessionState = await authClient.getSession();
    if (!sessionState.data?.user?.id) {
      return {
        status: "error",
        reason: "session_not_established",
      };
    }

    return {
      status: "success",
    };
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return {
          status: "cancelled",
        };
      }

      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          status: "error",
          reason: "play_services_not_available",
        };
      }

      if (error.code === statusCodes.IN_PROGRESS) {
        return {
          status: "error",
          reason: "in_progress",
        };
      }
    }

    if (isLikelyNetworkError(error)) {
      return {
        status: "error",
        reason: "network",
      };
    }

    return {
      status: "error",
      reason: "unknown",
    };
  }
}

async function signOutUser(): Promise<NativeSignOutResult> {
  const fallbackMessage = "Não foi possível sair da sua conta agora.";

  try {
    const response = await authClient.signOut();

    if (response.error) {
      return {
        status: "error",
        message: fallbackMessage,
      };
    }

    try {
      const configurationError = await ensureGoogleSigninConfigured();
      if (!configurationError) {
        const { GoogleSignin } = await loadGoogleSigninModule();
        await GoogleSignin.signOut();
      }
    } catch {
      // Better Auth session invalidation is the source of truth; local Google sign-out is best-effort.
    }

    return {
      status: "success",
    };
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      return {
        status: "error",
        message: "Sem conexão no momento. Verifique sua internet e tente novamente.",
      };
    }

    return {
      status: "error",
      message: fallbackMessage,
    };
  }
}

export { signInWithGoogleNative, signOutUser };
export type {
  NativeGoogleSignInErrorReason,
  NativeGoogleSignInResult,
  NativeSignOutResult,
};
