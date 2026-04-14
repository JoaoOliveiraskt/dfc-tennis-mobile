type NativeGoogleSignInErrorReason =
  | "in_progress"
  | "developer_error"
  | "sign_in_required"
  | "missing_configuration"
  | "missing_id_token"
  | "network"
  | "play_services_not_available"
  | "provider_rejected"
  | "session_not_established"
  | "unknown";

type NativeGoogleSignInResult =
  | { status: "success" }
  | { status: "cancelled" }
  | { status: "error"; reason: NativeGoogleSignInErrorReason };

type NativeSignOutResult =
  | { status: "success" }
  | { status: "error"; message: string };

export type {
  NativeGoogleSignInErrorReason,
  NativeGoogleSignInResult,
  NativeSignOutResult,
};
