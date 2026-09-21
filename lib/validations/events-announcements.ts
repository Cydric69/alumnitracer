import { z } from "zod";

// z.object() strips unknown and `$`-prefixed keys by default, which is what keeps
// mongo operators out of Event.create / findByIdAndUpdate payloads.
//
// LENGTH CAPS APPLY ON CREATE ONLY. `models/Events.ts` sets no `maxlength` on
// any of these, and `year` is a free-text input, so rows predating this schema
// can legitimately exceed the caps — e.g. `year: "Academic Year 2024-2025"`.
// Capping on update would make such a row UNEDITABLE: the admin changes the
// title, the save fails, and the error points at a field they never touched.
// The caps bound what can be newly written without holding existing data hostage.
export const eventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  date: z.coerce.date(),
  time: z.string().trim().max(50).optional(),
  location: z.string().trim().max(300).optional(),
  description: z.string().trim().min(1).max(5000),
  year: z.string().trim().min(1).max(20),
  expiresAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
});

// Uncapped counterpart — same shape, same stripping of unknown/`$` keys, no
// length ceilings. See the note above.
const eventUpdateBase = z.object({
  title: z.string().trim().min(1),
  date: z.coerce.date(),
  time: z.string().trim().optional(),
  location: z.string().trim().optional(),
  description: z.string().trim().min(1),
  year: z.string().trim().min(1),
  expiresAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const eventUpdateSchema = eventUpdateBase.partial();

export const announcementSchema = eventSchema.omit({
  time: true,
  location: true,
});

export const announcementUpdateSchema = eventUpdateBase
  .omit({ time: true, location: true })
  .partial();

// ── Read filters ──────────────────────────────────────────────────────────
//
// Parsed PER FIELD, never as one object. `safeParse` on a whole object is
// all-or-nothing, so a single bad field used to discard every other narrowing —
// an admin selecting a year would silently get the unfiltered list while the
// dropdown still read as applied. Per-field parsing drops only the offender.
//
// `year` mirrors the write side (a free trimmed string, not /^\d{4}$/ and not
// length-capped): it is free text on the create form and getYears() offers
// whatever was stored, so a stricter read schema rejects values the app itself
// produced. Being a STRING is what prevents operator injection; the shape never
// added safety, only a disagreement between the two schemas.
const statusFilterSchema = z.enum(["all", "active", "inactive"]).optional();
const yearFilterSchema = z.string().trim().min(1).optional();

export const eventFiltersSchema = z.object({
  status: statusFilterSchema,
  year: yearFilterSchema,
});

export type EventFilters = z.infer<typeof eventFiltersSchema>;

export interface ContentFilterResult {
  filters: Record<string, unknown>;
  /** Field names whose value failed to parse and was ignored. */
  dropped: string[];
}

/**
 * Build a mongo filter from caller-supplied params.
 *
 * `allowInactive` is the security boundary, not a convenience flag, and it is
 * resolved from the SESSION — never from the caller. A public caller may narrow
 * what it sees but must never widen it: `isActive: true` is pinned for them
 * regardless of what `status` they send and regardless of whether anything
 * parses. Failing to parse must never produce a BROADER result set than
 * succeeding — that is what turned one bad field into a disclosure of
 * unpublished content.
 *
 * Lives here, not in the `"use server"` actions module, so the invariant can be
 * exercised directly by scripts/verify/content-filters.mjs. A guard that tests
 * a hand-written copy of the function tests nothing.
 */
export function buildContentFilters(
  params: unknown,
  { allowInactive }: { allowInactive: boolean },
): ContentFilterResult {
  // `params` is whatever crossed the server-action boundary: it may be null, a
  // string, an array, or carry a `__proto__` key. Reading fields off it is safe
  // because every value is parsed individually below.
  const raw: Record<string, unknown> =
    typeof params === "object" && params !== null && !Array.isArray(params)
      ? (params as Record<string, unknown>)
      : {};

  const status = statusFilterSchema.safeParse(raw.status);
  const year = yearFilterSchema.safeParse(raw.year);

  const filters: Record<string, unknown> = {};
  const dropped: string[] = [];

  if (allowInactive) {
    if (status.success && status.data && status.data !== "all") {
      filters.isActive = status.data === "active";
    }
  } else {
    filters.isActive = true;
  }
  if (!status.success) dropped.push("status");

  if (year.success) {
    if (year.data && year.data !== "all") {
      filters.year = year.data;
    }
  } else {
    dropped.push("year");
  }

  return { filters, dropped };
}
