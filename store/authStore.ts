// store/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService, type LoginResponse } from "@/services/authService";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super-admin";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => boolean;
  initializeAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const result = await authService.login(email, password);

          if (result.success && result.user && result.token) {
            set({
              user: result.user as User,
              token: result.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Also set cookie via API
            await fetch("/api/auth/set-cookie", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token: result.token }),
            });
          } else {
            set({
              isLoading: false,
              error: result.message || "Login failed",
            });
          }

          return result;
        } catch (error: any) {
          const errorMessage =
            error.message || "An error occurred during login";
          set({
            isLoading: false,
            error: errorMessage,
          });
          return {
            success: false,
            message: errorMessage,
          };
        }
      },

      logout: async () => {
        try {
          // Clear server cookie
          await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
          console.error("Logout error:", error);
        }

        // Clear local state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Clear localStorage
        localStorage.removeItem("auth-storage");
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: () => {
        const { token, isAuthenticated } = get();

        if (!token || !isAuthenticated) {
          return false;
        }

        if (authService.isTokenExpired(token)) {
          get().logout();
          return false;
        }

        return true;
      },

      initializeAuth: () => {
        const { token, user } = get();

        if (token && user) {
          const isValid = authService.verifyToken(token);
          if (isValid) {
            set({ isAuthenticated: true });
          } else {
            get().logout();
          }
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
