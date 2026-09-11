import { cookies } from "next/headers";

import { verifyAuthToken, type AuthTokenPayload } from "@/lib/auth/jwt";

export class UnauthorizedError extends Error {
  readonly code = "UNAUTHORIZED";

  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

/**
 * True when the caller holds a valid admin session. Matches on the `code` rather
 * than `instanceof`, so it cannot silently start reporting "not an admin"
 * because two copies of the class ended up in different bundles.
 */
export function isUnauthorizedError(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === "UNAUTHORIZED";
}

/**
 * Gate for admin-only server actions. Throws UnauthorizedError when there is no
 * valid `auth-token` cookie; both `admin` and `super-admin` pass.
 */
export async function requireAdmin(): Promise<AuthTokenPayload> {
  const store = await cookies();
  const token = store.get("auth-token")?.value;

  if (!token) {
    throw new UnauthorizedError();
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    throw new UnauthorizedError();
  }

  return payload;
}

/**
 * Non-throwing form, for actions that serve BOTH the public site and the
 * dashboard: the public caller must never be able to widen what it sees, but it
 * must not be rejected either. Callers use this to decide how much to show, not
 * whether to answer.
 */
export async function isAdminSession(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return false;
    }
    // A non-auth failure here (e.g. cookies() outside a request scope) is a
    // malfunction, not a signed-out visitor. Fail closed, but leave a trace.
    console.error("isAdminSession: unexpected failure resolving session:", error);
    return false;
  }
}
