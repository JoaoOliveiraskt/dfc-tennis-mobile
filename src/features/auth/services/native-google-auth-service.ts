import { Platform } from "react-native";
import { isLikelyNetworkError } from "@/features/auth/domain/auth-error-classification";
import type {
  NativeGoogleSignInErrorReason,
  NativeGoogleSignInResult,
  NativeSignOutResult,
} from "@/features/auth/domain/google-auth-types";
import {
  NATIVE_GOOGLE_CONFIG,
  getMissingNativeGoogleConfig,
} from "@/lib/config/auth-config";
import { emitLoginLifecycleEvent } from "@/features/auth/services/auth-observability-service";
import {
  exchangeGoogleIdTokenForSession,
  signOutAuthenticatedSession,
} from "@/features/auth/services/better-auth-session-service";

let isGoogleSigninConfigured = false;
let googleSigninModulePromise: Promise<typeof import("@react-native-google-signin/google-signin")> | null =
  null;
let googleSigninConfigurationPromise: Promise<void> | null = null;
let activeAuthMutation: "sign_in" | "sign_out" | null = null;

async function loadGoogleSigninModule() {
  if (!googleSigninModulePromise) {
    googleSigninModulePromise = import("@react-native-google-signin/google-signin");
  }

  return googleSigninModulePromise;
}

function matchesGoogleStatusCode(
  receivedCode: unknown,
  expectedCode: unknown,
): boolean {
  const hasReceivedCode =
    typeof receivedCode === "string" || typeof receivedCode === "number";
  const hasExpectedCode =
    typeof expectedCode === "string" || typeof expectedCode === "number";

  if (!hasReceivedCode || !hasExpectedCode) {
    return false;
  }

  return String(receivedCode) === String(expectedCode);
}

function beginAuthMutation(type: "sign_in" | "sign_out"): boolean {
  if (activeAuthMutation !== null) {
    return false;
  }

  activeAuthMutation = type;
  return true;
}

function finishAuthMutation(type: "sign_in" | "sign_out"): void {
  if (activeAuthMutation === type) {
    activeAuthMutation = null;
  }
}

function failureResult(
  reason: NativeGoogleSignInErrorReason,
): NativeGoogleSignInResult {
  emitLoginLifecycleEvent({ name: "login_failed", reason });
  return {
    status: "error",
    reason,
  };
}

async function ensureGoogleSigninConfigured(): Promise<
  NativeGoogleSignInResult | null
> {
  const missingConfig = getMissingNativeGoogleConfig(Platform.OS);
  if (missingConfig.length > 0) {
    return failureResult("missing_configuration");
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
      return failureResult("unknown");
    }
  }

  return null;
}

async function signInWithGoogleNative(): Promise<NativeGoogleSignInResult> {
  if (!beginAuthMutation("sign_in")) {
    return failureResult("in_progress");
  }

  emitLoginLifecycleEvent({ name: "login_started" });

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
      emitLoginLifecycleEvent({ name: "login_failed", reason: "cancelled" });
      return {
        status: "cancelled",
      };
    }

    if (!isSuccessResponse(googleResponse) || !googleResponse.data.idToken) {
      return failureResult("missing_id_token");
    }

    const exchangeResult = await exchangeGoogleIdTokenForSession(
      googleResponse.data.idToken,
    );
    if (exchangeResult === "provider_rejected") {
      return failureResult("provider_rejected");
    }
    if (exchangeResult === "session_not_established") {
      return failureResult("session_not_established");
    }

    emitLoginLifecycleEvent({ name: "login_success" });
    return {
      status: "success",
    };
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (matchesGoogleStatusCode(error.code, statusCodes.SIGN_IN_CANCELLED)) {
        emitLoginLifecycleEvent({ name: "login_failed", reason: "cancelled" });
        return {
          status: "cancelled",
        };
      }

      if (
        matchesGoogleStatusCode(
          error.code,
          statusCodes.PLAY_SERVICES_NOT_AVAILABLE,
        )
      ) {
        return failureResult("play_services_not_available");
      }

      if (matchesGoogleStatusCode(error.code, statusCodes.IN_PROGRESS)) {
        return failureResult("in_progress");
      }

      if (
        "DEVELOPER_ERROR" in statusCodes &&
        matchesGoogleStatusCode(error.code, statusCodes.DEVELOPER_ERROR)
      ) {
        return failureResult("developer_error");
      }

      if (
        "SIGN_IN_REQUIRED" in statusCodes &&
        matchesGoogleStatusCode(error.code, statusCodes.SIGN_IN_REQUIRED)
      ) {
        return failureResult("sign_in_required");
      }
    }

    if (isLikelyNetworkError(error)) {
      return failureResult("network");
    }

    return failureResult("unknown");
  } finally {
    finishAuthMutation("sign_in");
  }
}

async function signOutUser(): Promise<NativeSignOutResult> {
  const fallbackMessage = "Não foi possível sair da sua conta agora.";
  if (!beginAuthMutation("sign_out")) {
    return {
      status: "error",
      message: fallbackMessage,
    };
  }

  try {
    const signOutResult = await signOutAuthenticatedSession();
    if (signOutResult === "network") {
      return {
        status: "error",
        message: "Sem conexão no momento. Verifique sua internet e tente novamente.",
      };
    }
    if (signOutResult === "unknown") {
      return {
        status: "error",
        message: fallbackMessage,
      };
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
  } finally {
    finishAuthMutation("sign_out");
  }
}

export { signInWithGoogleNative, signOutUser };
export type {
  NativeGoogleSignInErrorReason,
  NativeGoogleSignInResult,
  NativeSignOutResult,
};
