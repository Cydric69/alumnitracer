/**
 * Server actions return this instead of throwing: React strips thrown error
 * messages from server actions in production builds, so a thrown validation
 * message never reaches the user.
 */
export type ActionResult<T = undefined> =
  | { success: true; message: string; data?: T }
  | { success: false; message: string; error?: string; errors?: string[] };

export function fail(
  message: string,
  error?: string,
  errors?: string[],
): ActionResult<never> {
  return { success: false, message, error, errors };
}

export function unauthorized(): ActionResult<never> {
  return {
    success: false,
    message: "You must be signed in as an administrator.",
    error: "UNAUTHORIZED",
  };
}
