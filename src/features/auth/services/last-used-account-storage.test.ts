import * as SecureStore from "expo-secure-store";
import {
  clearLastUsedAccount,
  getLastUsedAccount,
  saveLastUsedAccount,
} from "@/features/auth/services/last-used-account-storage";

jest.mock("expo-secure-store", () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe("last-used-account-storage", () => {
  const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("saves only non-sensitive account metadata", async () => {
    await saveLastUsedAccount({
      userId: "user-1",
      name: "Elisa Beckett",
      email: "elisa.g.beckett@gmail.com",
      avatarUrl: "https://example.com/avatar.png",
      provider: "google",
    });

    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledTimes(1);
    const [, rawPayload] = mockedSecureStore.setItemAsync.mock.calls[0];
    const payload = JSON.parse(rawPayload);

    expect(payload).toEqual({
      userId: "user-1",
      name: "Elisa Beckett",
      email: "elisa.g.beckett@gmail.com",
      avatarUrl: "https://example.com/avatar.png",
      provider: "google",
    });
    expect(payload.idToken).toBeUndefined();
    expect(payload.accessToken).toBeUndefined();
    expect(payload.refreshToken).toBeUndefined();
    expect(payload.session).toBeUndefined();
  });

  it("returns null when storage is empty", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValueOnce(null);

    const result = await getLastUsedAccount();

    expect(result).toBeNull();
  });

  it("returns null when storage value is corrupted", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValueOnce("{not-valid-json");

    const result = await getLastUsedAccount();

    expect(result).toBeNull();
  });

  it("clears persisted metadata", async () => {
    await clearLastUsedAccount();
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
  });
});
