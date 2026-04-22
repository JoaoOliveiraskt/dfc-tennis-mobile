import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { toApiError } from "@/lib/api/errors";
import {
  fetchMyProfile,
  updateMyProfile,
} from "@/features/account/services/profile-service";
import type {
  ProfileData,
  ProfileUpdateInput,
} from "@/features/account/types/profile";
import {
  fetchCachedQuery,
  getCachedQueryData,
  isCachedQueryStale,
  setCachedQueryData,
} from "@/lib/server-state/query-cache";

interface UseAccountProfileEditorResult {
  readonly errorMessage: string | null;
  readonly form: ProfileUpdateInput;
  readonly isLoading: boolean;
  readonly isSaving: boolean;
  readonly profile: ProfileData | null;
  readonly reload: () => void;
  readonly save: () => Promise<boolean>;
  readonly setField: <TKey extends keyof ProfileUpdateInput>(
    field: TKey,
    value: ProfileUpdateInput[TKey],
  ) => void;
}

const PROFILE_QUERY_KEY = "account:profile";
const PROFILE_STALE_TIME_MS = 60_000;
const ProfileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo."),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => {
      if (!value) {
        return true;
      }

      const digits = value.replace(/\D/g, "");
      return digits.length === 10 || digits.length === 11;
    }, "Telefone inválido."),
});

function useAccountProfileEditor(): UseAccountProfileEditorResult {
  const [reloadToken, setReloadToken] = useState(0);
  const [profile, setProfile] = useState<ProfileData | null>(() =>
    getCachedQueryData<ProfileData>(PROFILE_QUERY_KEY),
  );
  const [form, setForm] = useState<ProfileUpdateInput>(() => ({
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
  }));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!profile);
  const [isSaving, setIsSaving] = useState(false);
  const profileRef = useRef<ProfileData | null>(profile);
  profileRef.current = profile;

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      const shouldFetch =
        reloadToken > 0 ||
        !profileRef.current ||
        isCachedQueryStale(PROFILE_QUERY_KEY, PROFILE_STALE_TIME_MS);
      if (!shouldFetch) {
        setIsLoading(false);
        return;
      }

      try {
        if (!profileRef.current) {
          setIsLoading(true);
        }
        setErrorMessage(null);
        const result = await fetchCachedQuery(PROFILE_QUERY_KEY, fetchMyProfile);

        if (isCancelled) {
          return;
        }

        setProfile(result);
        setForm({
          name: result.name,
          phone: result.phone ?? "",
        });
      } catch (error) {
        if (!isCancelled && !profileRef.current) {
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
  }, [reloadToken]);

  const setField = useCallback(
    <TKey extends keyof ProfileUpdateInput>(
      field: TKey,
      value: ProfileUpdateInput[TKey],
    ) => {
      setForm((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const save = useCallback(async (): Promise<boolean> => {
    const parsedInput = ProfileUpdateSchema.safeParse({
      name: form.name,
      phone: form.phone?.trim() || undefined,
    });
    if (!parsedInput.success) {
      setErrorMessage(parsedInput.error.issues[0]?.message ?? "Dados inválidos.");
      return false;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload = await updateMyProfile({
        name: parsedInput.data.name,
        phone: parsedInput.data.phone ?? "",
      });
      setProfile(payload);
      setCachedQueryData(PROFILE_QUERY_KEY, payload);
      return true;
    } catch (error) {
      setErrorMessage(toApiError(error).message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [form.name, form.phone]);

  return useMemo(
    () => ({
      errorMessage,
      form,
      isLoading,
      isSaving,
      profile,
      reload,
      save,
      setField,
    }),
    [errorMessage, form, isLoading, isSaving, profile, reload, save, setField],
  );
}

export { useAccountProfileEditor };
