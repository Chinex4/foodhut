import { useCallback } from "react";
import { useRouter } from "expo-router";

import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/redux/auth/auth.selectors";

export function useEnsureAuthenticated() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const redirectToLogin = useCallback(() => {
    router.replace("/(auth)/login");
  }, [router]);

  const ensureAuth = useCallback(
    (next?: () => void) => {
      if (!isAuthenticated) {
        redirectToLogin();
        return false;
      }
      next?.();
      return true;
    },
    [isAuthenticated, redirectToLogin]
  );

  return { isAuthenticated, ensureAuth, redirectToLogin };
}
