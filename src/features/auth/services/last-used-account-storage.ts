import * as SecureStore from "expo-secure-store";
import type { LastUsedAccount } from "@/features/auth/types/last-used-account";

const LAST_USED_ACCOUNT_STORAGE_KEY = "dfc-tennis-mobile.auth.last-used-account.v1";

function normalizeText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function parseLastUsedAccount(rawValue: string): LastUsedAccount | null {
  try {
    const parsed = JSON.parse(rawValue) as Partial<LastUsedAccount>;
    if (parsed.provider !== "google") {
      return null;
    }

    const userId = normalizeText(parsed.userId);
    const name = normalizeText(parsed.name);
    const email = normalizeText(parsed.email);
    const avatarUrl = normalizeText(parsed.avatarUrl);

    if (!userId || !name || !email) {
      return null;
    }

    return {
      userId,
      name,
      email,
      avatarUrl: avatarUrl || undefined,
      provider: "google",
    };
  } catch {
    return null;
  }
}

async function getLastUsedAccount(): Promise<LastUsedAccount | null> {
  const rawValue = await SecureStore.getItemAsync(LAST_USED_ACCOUNT_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  return parseLastUsedAccount(rawValue);
}

async function saveLastUsedAccount(account: LastUsedAccount): Promise<void> {
  const payload: LastUsedAccount = {
    userId: normalizeText(account.userId),
    name: normalizeText(account.name),
    email: normalizeText(account.email),
    avatarUrl: normalizeText(account.avatarUrl) || undefined,
    provider: "google",
  };

  await SecureStore.setItemAsync(
    LAST_USED_ACCOUNT_STORAGE_KEY,
    JSON.stringify(payload),
  );
}

async function clearLastUsedAccount(): Promise<void> {
  await SecureStore.deleteItemAsync(LAST_USED_ACCOUNT_STORAGE_KEY);
}

export { clearLastUsedAccount, getLastUsedAccount, saveLastUsedAccount };
