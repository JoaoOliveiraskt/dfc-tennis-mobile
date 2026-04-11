import type { NativeGoogleSignInErrorReason } from "@/features/auth/services/native-google-auth-service";

function mapGoogleSignInErrorToMessage(
  reason: NativeGoogleSignInErrorReason,
): string | null {
  switch (reason) {
    case "in_progress":
      return null;
    case "network":
      return "Sem conexão no momento. Verifique sua internet e tente novamente.";
    case "play_services_not_available":
      return "Atualize os serviços do Google Play para entrar com sua conta.";
    case "missing_configuration":
    case "provider_rejected":
    case "session_not_established":
    case "missing_id_token":
    case "unavailable_in_expo_go":
    case "unknown":
    default:
      return "Não foi possível entrar agora. Tente novamente.";
  }
}

export { mapGoogleSignInErrorToMessage };
