import { z } from "zod";

// z.object() strips unknown and `$`-prefixed keys by default, which is what keeps
// mongo operators out of Event.create / findByIdAndUpdate payloads.
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

export const eventUpdateSchema = eventSchema.partial();

export const announcementSchema = eventSchema.omit({
  time: true,
  location: true,
});

export const announcementUpdateSchema = announcementSchema.partial();

// Announcements take the same filter shape as events.
export const eventFiltersSchema = z.object({
  status: z.enum(["all", "active", "inactive"]).optional(),
  year: z
    .string()
    .regex(/^\d{4}$/)
    .optional()
    .or(z.literal("all")),
});

export type EventFilters = z.infer<typeof eventFiltersSchema>;
