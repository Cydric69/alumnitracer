import { z } from "zod";
import { Types } from "mongoose";

// Zod validation schema
export const departmentSchema = z.object({
  departmentId: z
    .string()
    .regex(/^\d{3}$/, "Department ID must be a 3-digit number"),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  campusId: z.string().min(1, "Campus ID is required"),
  campusName: z
    .string()
    .min(1, "Campus name is required")
    .max(100, "Campus name is too long"),
  timestamp: z.date().optional(),
});

// TypeScript type
export type DepartmentType = z.infer<typeof departmentSchema>;

// Type for Department document with MongoDB _id
export interface IDepartment extends DepartmentType {
  _id: Types.ObjectId;
}

// Type for creating a new department (without departmentId as it will be auto-generated)
export type CreateDepartmentInput = Omit<
  DepartmentType,
  "departmentId" | "timestamp"
>;

// Type for updating a department
export type UpdateDepartmentInput = Partial<
  Omit<DepartmentType, "departmentId" | "timestamp">
>;
