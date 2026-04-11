import { mapGoogleSignInErrorToMessage } from "@/features/auth/services/google-sign-in-error-messages";

describe("mapGoogleSignInErrorToMessage", () => {
  it("returns no user-facing error for in-progress provider state", () => {
    expect(mapGoogleSignInErrorToMessage("in_progress")).toBeNull();
  });

  it("returns offline guidance for network errors", () => {
    expect(mapGoogleSignInErrorToMessage("network")).toBe(
      "Sem conexão no momento. Verifique sua internet e tente novamente.",
    );
  });

  it("returns generic safe message for provider/backend-sensitive failures", () => {
    expect(mapGoogleSignInErrorToMessage("provider_rejected")).toBe(
      "Não foi possível entrar agora. Tente novamente.",
    );
    expect(mapGoogleSignInErrorToMessage("session_not_established")).toBe(
      "Não foi possível entrar agora. Tente novamente.",
    );
    expect(mapGoogleSignInErrorToMessage("unknown")).toBe(
      "Não foi possível entrar agora. Tente novamente.",
    );
  });
});
