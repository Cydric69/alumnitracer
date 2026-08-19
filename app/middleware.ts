// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authService } from "@/services/authService";

// Admin-only paths
const ADMIN_PATHS = [
  "/dashboard/admin",
  "/dashboard/settings",
  "/dashboard/users",
];

// Public paths that should be completely blocked for authenticated users
const BLOCKED_FOR_AUTHENTICATED = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get("auth-token")?.value;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Check if token exists and is valid
  const isValidToken =
    token &&
    authService.verifyToken(token) &&
    !authService.isTokenExpired(token);

  // Block access to public pages for authenticated users
  if (BLOCKED_FOR_AUTHENTICATED.some((path) => pathname === path)) {
    if (isValidToken) {
      // Instead of redirecting, return a 404 or show access denied
      const dashboardUrl = new URL("/dashboard", request.url);
      const response = NextResponse.redirect(dashboardUrl);

      // Add headers to prevent caching
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      response.headers.set("X-Robots-Tag", "noindex, nofollow");

      return response;
    }
    // Allow access for unauthenticated users
    return NextResponse.next();
  }

  // For all other protected routes, check authentication
  if (!token || !isValidToken) {
    return redirectToLogin(request, pathname);
  }

  // Verify token again for TypeScript
  const tokenResult = authService.verifyToken(token);
  if (!tokenResult) {
    const response = redirectToLogin(request, pathname);
    response.cookies.delete("auth-token");
    response.cookies.delete("user-info");
    return response;
  }

  // Check for admin-only routes
  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    if (tokenResult.role !== "admin" && tokenResult.role !== "super-admin") {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Add user info to headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", tokenResult.userId || "");
  requestHeaders.set("x-user-email", tokenResult.email || "");
  requestHeaders.set("x-user-role", tokenResult.role || "");

  // Add security headers to prevent caching
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Prevent browser caching of protected pages
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  return response;
}

export const config = {
  matcher: [
    "/((?!api/auth/(login|logout|verify|set-cookie)|_next/static|_next/image|favicon.ico).*)",
  ],
};

function redirectToLogin(
  request: NextRequest,
  currentPath: string,
): NextResponse {
  const loginUrl = new URL("/login", request.url);

  if (currentPath !== "/login") {
    loginUrl.searchParams.set("redirect", currentPath);
  }

  const response = NextResponse.redirect(loginUrl);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}
