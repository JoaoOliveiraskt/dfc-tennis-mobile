import React, { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui";
import { AUTH_ROUTE, resolvePublicEntryRoute } from "@/features/auth/services/auth-entry-routes";

function PublicEntryScreen(): React.JSX.Element {
  const router = useRouter();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    const resolveAndNavigate = async () => {
      try {
        const targetRoute = await resolvePublicEntryRoute();
        if (isCancelled || hasNavigatedRef.current) {
          return;
        }

        hasNavigatedRef.current = true;
        router.replace(targetRoute);
      } catch {
        if (isCancelled || hasNavigatedRef.current) {
          return;
        }

        hasNavigatedRef.current = true;
        router.replace(AUTH_ROUTE);
      }
    };

    void resolveAndNavigate();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  return <Screen className="flex-1 bg-background" />;
}

export { PublicEntryScreen };
