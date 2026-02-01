import { z } from "zod";
import { Types } from "mongoose";

// Zod validation schema
export const campusSchema = z.object({
  campusId: z.string().regex(/^\d{3}$/, "Campus ID must be a 3-digit number"),
  campusName: z
    .string()
    .min(1, "Campus name is required")
    .max(100, "Campus name is too long"),
  location: z.string().optional(),
  description: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// TypeScript type
export type CampusType = z.infer<typeof campusSchema>;

// Type for Campus document with MongoDB _id
export interface ICampus extends CampusType {
  _id: Types.ObjectId;
}

// Type for creating a new campus (without campusId and timestamps)
export type CreateCampusInput = Omit<
  CampusType,
  "campusId" | "createdAt" | "updatedAt"
>;

// Type for updating a campus
export type UpdateCampusInput = Partial<
  Omit<CampusType, "campusId" | "createdAt" | "updatedAt">
>;
