import React, { createContext, useContext, useEffect } from "react";

interface AppShellChromeState {
  readonly onHeaderActionPress?: (() => void) | undefined;
  readonly walletBalanceLabel?: string | null | undefined;
}

interface AppShellChromeContextValue {
  readonly chrome: AppShellChromeState;
  readonly setChrome: (value: AppShellChromeState) => void;
}

const DEFAULT_APP_SHELL_CHROME_STATE: AppShellChromeState = {
  onHeaderActionPress: undefined,
  walletBalanceLabel: null,
};

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

  useEffect(() => {
    if (!setChrome) {
      return;
    }

    return () => {
      setChrome(DEFAULT_APP_SHELL_CHROME_STATE);
    };
  }, [setChrome]);
}

export { AppShellChromeContext, useAppShellChrome };
export type { AppShellChromeContextValue, AppShellChromeState };
