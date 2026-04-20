import { useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager } from "react-native";
import { useAppShellChrome } from "@/features/app-shell";
import { useSignOut } from "@/features/auth";
import { toApiError } from "@/lib/api/errors";
import { getAccountData } from "@/features/account/services/account-service";
import type { AccountData } from "@/features/account/types/account";
import {
  fetchCachedQuery,
  getCachedQueryData,
  isCachedQueryStale,
} from "@/lib/server-state/query-cache";

interface UseAccountResult {
  readonly data: AccountData | null;
  readonly errorMessage: string | null;
  readonly isLoading: boolean;
  readonly isSigningOut: boolean;
  readonly signOutErrorMessage: string | null;
  readonly signOut: () => Promise<void>;
}

const ACCOUNT_QUERY_KEY = "account:me";
const ACCOUNT_STALE_TIME_MS = 5 * 60 * 1000;

function useAccount(): UseAccountResult {
  const [data, setData] = useState<AccountData | null>(() =>
    getCachedQueryData<AccountData>(ACCOUNT_QUERY_KEY),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!data);
  const dataRef = useRef<AccountData | null>(data);
  dataRef.current = data;
  const signOutState = useSignOut();

  useAppShellChrome(
    {
      walletBalanceLabel: data?.balanceLabel ?? null,
    },
    [data?.balanceLabel],
  );

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      const shouldFetch = isCachedQueryStale(ACCOUNT_QUERY_KEY, ACCOUNT_STALE_TIME_MS);
      if (!shouldFetch) {
        setIsLoading(false);
        return;
      }

      try {
        if (!dataRef.current) {
          setIsLoading(true);
        }
        setErrorMessage(null);
        const result = await fetchCachedQuery(ACCOUNT_QUERY_KEY, getAccountData);

        if (!isCancelled) {
          setData(result);
        }
      } catch (error) {
        if (!isCancelled && !dataRef.current) {
          setErrorMessage(toApiError(error).message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    if (dataRef.current) {
      const interactionTask = InteractionManager.runAfterInteractions(() => {
        void load();
      });

      return () => {
        isCancelled = true;
        interactionTask.cancel();
      };
    }

    void load();

    return () => {
      isCancelled = true;
    };
  }, []);

  return useMemo(
    () => ({
      data,
      errorMessage,
      isLoading,
      isSigningOut: signOutState.isLoading,
      signOut: signOutState.signOut,
      signOutErrorMessage: signOutState.errorMessage,
    }),
    [data, errorMessage, isLoading, signOutState.errorMessage, signOutState.isLoading, signOutState.signOut],
  );
}

export { useAccount };
