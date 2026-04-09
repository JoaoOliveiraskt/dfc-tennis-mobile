import * as SplashScreen from "expo-splash-screen";

declare global {
  // eslint-disable-next-line no-var
  var __dfcSplashPrevented: boolean | undefined;
  // eslint-disable-next-line no-var
  var __dfcSplashPreventPromise: Promise<boolean | undefined> | undefined;
  // eslint-disable-next-line no-var
  var __dfcSplashHidden: boolean | undefined;
}

function preventNativeSplashAutoHideOnce(): void {
  if (globalThis.__dfcSplashPrevented || globalThis.__dfcSplashPreventPromise) {
    return;
  }

  globalThis.__dfcSplashPreventPromise = SplashScreen.preventAutoHideAsync()
    .catch(() => undefined)
    .finally(() => {
      globalThis.__dfcSplashPrevented = true;
    });
}

function hideNativeSplashOnce(): void {
  if (globalThis.__dfcSplashHidden) {
    return;
  }

  globalThis.__dfcSplashHidden = true;
  SplashScreen.hide();
}

export { preventNativeSplashAutoHideOnce, hideNativeSplashOnce };
