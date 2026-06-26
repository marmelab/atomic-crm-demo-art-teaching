/**
 * The capacity guard rejects an overbooking from two places that share the
 * same wording: the Postgres trigger (real backend, raised with errcode
 * `check_violation`) and the FakeRest beforeCreate callback (demo). Both
 * messages contain "fully booked", which is what we match on here.
 */
export const isSessionFullError = (error: unknown): boolean => {
  if (error == null) return false;
  const message =
    typeof error === "string"
      ? error
      : ((error as { message?: unknown }).message ?? "");
  return typeof message === "string" && message.includes("fully booked");
};
