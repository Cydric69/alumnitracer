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
