// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authService } from "@/services/authService";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/logout",
];

// Admin-only paths
const ADMIN_PATHS = [
  "/dashboard/admin",
  "/dashboard/settings",
  "/dashboard/users",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get("auth-token")?.value;

  // Skip middleware for static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // Check if trying to access public pages (landing or login)
  if (pathname === "/" || pathname === "/login") {
    // If user has a valid token, redirect to dashboard
    if (token) {
      const tokenResult = authService.verifyToken(token);

      if (tokenResult && !authService.isTokenExpired(token)) {
        // User is authenticated, redirect to dashboard
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
    // If no valid token, allow access to public pages
    return NextResponse.next();
  }

  // For all other protected routes, check authentication
  if (!token) {
    // No token and trying to access protected route, redirect to login
    return redirectToLogin(request, pathname);
  }

  // Verify token
  const tokenResult = authService.verifyToken(token);

  if (!tokenResult) {
    // Clear invalid token and redirect to login
    const response = redirectToLogin(request, pathname);
    response.cookies.delete("auth-token");
    response.cookies.delete("user-info");
    return response;
  }

  // Check if token is expired
  if (authService.isTokenExpired(token)) {
    const response = redirectToLogin(request, pathname);
    response.cookies.delete("auth-token");
    response.cookies.delete("user-info");
    return response;
  }

  // Check for admin-only routes
  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    if (tokenResult.role !== "admin" && tokenResult.role !== "super-admin") {
      // Redirect to dashboard if not admin
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Add user info to headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", tokenResult.userId || "");
  requestHeaders.set("x-user-email", tokenResult.email || "");
  requestHeaders.set("x-user-role", tokenResult.role || "");

  // Clone the request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth/login & logout (public API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth/(login|logout)|_next/static|_next/image|favicon.ico).*)",
  ],
};

function redirectToLogin(
  request: NextRequest,
  currentPath: string
): NextResponse {
  const loginUrl = new URL("/login", request.url);

  // Only add redirect param if not already going to login
  if (currentPath !== "/login") {
    loginUrl.searchParams.set("redirect", currentPath);
  }

  return NextResponse.redirect(loginUrl);
}
