import jwt from "jsonwebtoken";

// NOTE: kept free of mongoose / next / @/models imports so it can be pulled into
// any runtime (middleware, root proxy) without dragging in the DB layer.
const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET environment variable is not set");
}

// Re-bound so the narrowing survives into the closure below.
const JWT_SECRET: string = secret;

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: "admin" | "super-admin";
  iat: number;
  exp: number;
}

/**
 * Verify an auth JWT. Returns null on any failure (malformed, bad signature,
 * expired, or a role outside the admin union) — never throws.
 */
export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId?: unknown;
      email?: unknown;
      role?: unknown;
      iat?: unknown;
      exp?: unknown;
    };

    // The signing payload types `role` as a plain string (services/authService.ts),
    // so the union has to be established at runtime rather than asserted.
    if (decoded.role !== "admin" && decoded.role !== "super-admin") {
      return null;
    }

    if (
      typeof decoded.userId !== "string" ||
      typeof decoded.email !== "string" ||
      typeof decoded.iat !== "number" ||
      typeof decoded.exp !== "number"
    ) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
}
