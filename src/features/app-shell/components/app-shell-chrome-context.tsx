import React, { createContext, useContext, useEffect } from "react";

interface AppShellChromeState {
  readonly onHeaderActionPress?: (() => void) | undefined;
  readonly walletBalanceLabel?: string | null | undefined;
}

interface AppShellChromeContextValue {
  readonly chrome: AppShellChromeState;
  readonly resetChrome: () => void;
  readonly setChrome: (value: AppShellChromeState) => void;
}

const AppShellChromeContext = createContext<AppShellChromeContextValue | null>(
  null,
);

function useAppShellChrome(
  value: AppShellChromeState,
  deps: React.DependencyList = [],
): void {
  const context = useContext(AppShellChromeContext);
  const setChrome = context?.setChrome;

  useEffect(() => {
    if (!setChrome) {
      return;
    }

    setChrome(value);
  }, [setChrome, ...deps]);
}

export { AppShellChromeContext, useAppShellChrome };
export type { AppShellChromeContextValue, AppShellChromeState };
