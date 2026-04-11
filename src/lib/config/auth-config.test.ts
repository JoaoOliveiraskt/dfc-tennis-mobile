describe("auth-config", () => {
  const originalEnv = process.env;

  afterEach(() => {
    jest.resetModules();
    process.env = originalEnv;
  });

  it("requires web client id on all platforms and ios client id only on iOS", () => {
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "",
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "",
    };

    const { getMissingNativeGoogleConfig } = require("./auth-config") as typeof import("./auth-config");

    expect(getMissingNativeGoogleConfig("android")).toEqual([
      "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
    ]);
    expect(getMissingNativeGoogleConfig("ios")).toEqual([
      "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
      "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
    ]);
  });

  it("accepts fully configured native google ids", () => {
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "web-client-id",
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "ios-client-id",
    };

    const { getMissingNativeGoogleConfig } = require("./auth-config") as typeof import("./auth-config");

    expect(getMissingNativeGoogleConfig("android")).toEqual([]);
    expect(getMissingNativeGoogleConfig("ios")).toEqual([]);
  });
});
