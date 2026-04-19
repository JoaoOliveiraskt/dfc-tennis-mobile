import { useEffect, useMemo, useState } from "react";
import { useAppShellChrome } from "@/features/app-shell";
import { useSignOut } from "@/features/auth";
import { toApiError } from "@/lib/api/errors";
import { getAccountData } from "@/features/account/services/account-service";
import type { AccountData } from "@/features/account/types/account";

interface UseAccountResult {
  readonly data: AccountData | null;
  readonly errorMessage: string | null;
  readonly isLoading: boolean;
  readonly isSigningOut: boolean;
  readonly signOutErrorMessage: string | null;
  readonly signOut: () => Promise<void>;
}

function useAccount(): UseAccountResult {
  const [data, setData] = useState<AccountData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const result = await getAccountData();

        if (!isCancelled) {
          setData(result);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(toApiError(error).message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

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
