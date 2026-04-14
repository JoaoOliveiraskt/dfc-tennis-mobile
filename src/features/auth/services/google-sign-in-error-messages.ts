import type { NativeGoogleSignInErrorReason } from "@/features/auth/domain/google-auth-types";

function mapGoogleSignInErrorToMessage(
  reason: NativeGoogleSignInErrorReason,
): string | null {
  switch (reason) {
    case "in_progress":
      return null;
    case "sign_in_required":
      return "Selecione uma conta do Google para continuar.";
    case "network":
      return "Sem conexão no momento. Verifique sua internet e tente novamente.";
    case "play_services_not_available":
      return "Atualize os serviços do Google Play para entrar com sua conta.";
    case "developer_error":
      return "Configuração do Google Sign-In inválida. Confira o SHA-1 do app e tente novamente.";
    case "missing_configuration":
      return "Configuração do Google Sign-In incompleta. Verifique as variáveis do app e tente novamente.";
    case "missing_id_token":
      return "Não foi possível obter o token do Google. Verifique o Web Client ID e tente novamente.";
    case "provider_rejected":
    case "session_not_established":
    case "unknown":
    default:
      return "Não foi possível entrar agora. Tente novamente.";
  }
}

export { mapGoogleSignInErrorToMessage };
