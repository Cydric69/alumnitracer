// hooks/useAuthClient.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const useAuthClient = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth from localStorage/sessionStorage
  useEffect(() => {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");
    if (token) {
      // Decode JWT token to get user info (client-side only)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          id: payload.userId,
          email: payload.email,
          name: payload.name || "Admin",
          role: payload.role,
        });
      } catch {
        // Invalid token
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success && result.token) {
        // Store token based on remember me preference
        const rememberMe = localStorage.getItem("remember-me") === "true";
        if (rememberMe) {
          localStorage.setItem("auth-token", result.token);
        } else {
          sessionStorage.setItem("auth-token", result.token);
        }

        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        setError(result.message || "Login failed");
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      setError("An error occurred. Please try again.");
      return { success: false, message: "Network error" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear all storage
    localStorage.removeItem("auth-token");
    localStorage.removeItem("remember-me");
    sessionStorage.removeItem("auth-token");
    setUser(null);

    // Redirect to login
    router.push("/login");
  };

  const checkAuth = () => {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // Check if token is expired
      if (Date.now() >= payload.exp * 1000) {
        logout();
        return false;
      }
      return true;
    } catch {
      logout();
      return false;
    }
  };

  const clearError = () => setError(null);

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
    clearError,
  };
};
