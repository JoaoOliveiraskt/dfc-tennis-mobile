import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { useSyncExternalStore } from "react";

const DEV_AUTH_STORAGE_KEY = "dfc-tennis-mobile.dev-auth-session";

interface DevAuthSnapshot {
  readonly canUseBypass: boolean;
  readonly isAuthenticated: boolean;
  readonly isHydrating: boolean;
}

type Listener = () => void;

const listeners = new Set<Listener>();

let hasHydrated = false;
let isAuthenticated = false;
let isHydrating = false;
let cachedSnapshot: DevAuthSnapshot = {
  canUseBypass: false,
  isAuthenticated: false,
  isHydrating: false,
};

function isExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

function canUseDevAuthBypass(): boolean {
  return __DEV__ && isExpoGo();
}

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function getSnapshot(): DevAuthSnapshot {
  const nextSnapshot: DevAuthSnapshot = {
    canUseBypass: canUseDevAuthBypass(),
    isAuthenticated,
    isHydrating,
  };

  if (
    cachedSnapshot.canUseBypass === nextSnapshot.canUseBypass &&
    cachedSnapshot.isAuthenticated === nextSnapshot.isAuthenticated &&
    cachedSnapshot.isHydrating === nextSnapshot.isHydrating
  ) {
    return cachedSnapshot;
  }

  cachedSnapshot = nextSnapshot;
  return cachedSnapshot;
}

async function hydrateDevAuthState(): Promise<void> {
  if (!canUseDevAuthBypass() || hasHydrated || isHydrating) {
    return;
  }

  isHydrating = true;
  emitChange();

  try {
    const storedValue = await SecureStore.getItemAsync(DEV_AUTH_STORAGE_KEY);
    isAuthenticated = storedValue === "true";
  } finally {
    hasHydrated = true;
    isHydrating = false;
    emitChange();
  }
}

async function enableDevAuthSession(): Promise<void> {
  if (!canUseDevAuthBypass()) {
    return;
  }

  await SecureStore.setItemAsync(DEV_AUTH_STORAGE_KEY, "true");
  isAuthenticated = true;
  hasHydrated = true;
  emitChange();
}

async function clearDevAuthSession(): Promise<void> {
  isAuthenticated = false;
  hasHydrated = true;

  if (canUseDevAuthBypass()) {
    await SecureStore.deleteItemAsync(DEV_AUTH_STORAGE_KEY);
  }

  emitChange();
}

function useDevAuthSession(): DevAuthSnapshot {
  const snapshot = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      void hydrateDevAuthState();

      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot,
    getSnapshot,
  );

  return snapshot;
}

export {
  canUseDevAuthBypass,
  clearDevAuthSession,
  enableDevAuthSession,
  useDevAuthSession,
};
export type { DevAuthSnapshot };
