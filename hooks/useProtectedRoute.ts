// hooks/useProtectedRoute.ts
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./useAuth";

export const useProtectedRoute = (redirectTo = "/login") => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, checkAuth } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading) {
      const isAuth = checkAuth();

      if (!isAuth && pathname !== redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, checkAuth, router, pathname, redirectTo]);

  return { isAuthenticated, isLoading };
};
