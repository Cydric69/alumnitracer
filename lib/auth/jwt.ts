import jwt from "jsonwebtoken";

// NOTE: kept free of mongoose / next / @/models imports so it can be pulled into
// any runtime (middleware, root proxy) without dragging in the DB layer.
// Read once, NOT thrown on at module scope. This module is now reachable from
// the PUBLIC landing page (app/page.tsx -> events actions -> require-admin ->
// here), so a module-level throw would take the whole marketing site down — and
// fail `next build` collecting page data — in any environment missing the
// secret. Previously only the login endpoints depended on it. Verification
// fails closed instead: no secret means no token ever verifies.
const JWT_SECRET = process.env.JWT_SECRET;

let warnedMissingSecret = false;

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
  if (!JWT_SECRET) {
    // Once per process — this is a deployment fault, and a silent `null` here
    // is indistinguishable from "not signed in", which is how an outage hides.
    if (!warnedMissingSecret) {
      warnedMissingSecret = true;
      console.error(
        "verifyAuthToken: JWT_SECRET is not set — no session can be verified.",
      );
    }
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as {
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
  } catch (error) {
    // An expired or forged token is routine — stay quiet. Anything else means
    // the secret was rotated/mistyped or the crypto layer is broken, which
    // logs every admin out while looking identical to "not signed in". Without
    // this line that outage leaves no trace anywhere.
    const name = (error as { name?: string } | null)?.name;
    if (name !== "TokenExpiredError" && name !== "JsonWebTokenError") {
      console.error("verifyAuthToken: unexpected verification failure:", error);
    }
    return null;
  }
}
