// hooks/useAuth.ts
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    checkAuth,
    initializeAuth,
    setLoading,
  } = useAuthStore();

  // Initialize auth on mount - CLIENT SIDE ONLY
  useEffect(() => {
    if (typeof window !== "undefined") {
      initializeAuth();
    }
  }, [initializeAuth]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    checkAuth,
    setLoading,
  };
};
