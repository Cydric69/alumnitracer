import mongoose, { Schema, Document, Model, models } from "mongoose";
import { z } from "zod";
import { Counter } from "@/models/Counter";

// Zod validation schema
export const courseSchema = z.object({
  courseId: z.string().regex(/^\d{3}$/, "Course ID must be a 3-digit number"),
  courseName: z
    .string()
    .min(1, "Course name is required")
    .max(200, "Course name is too long"),
  campusId: z
    .string()
    .min(1, "Campus ID is required")
    .max(50, "Campus ID is too long"),
  campusName: z
    .string()
    .min(1, "Campus name is required")
    .max(100, "Campus name is too long"),
  departmentId: z
    .string()
    .min(1, "Department ID is required")
    .max(50, "Department ID is too long"),
  departmentName: z
    .string()
    .min(1, "Department name is required")
    .max(100, "Department name is too long"),
  courseAvailability: z
    .enum(["Active", "Inactive", "Archived"])
    .default("Active"),
  timestamp: z.date().default(() => new Date()),
});

// TypeScript type from Zod schema
export type CourseType = z.infer<typeof courseSchema>;

// Type for Course document with MongoDB _id
export interface ICourseDocument extends CourseType, Document {
  _id: mongoose.Types.ObjectId;
}

// Type for creating a new course (without courseId and timestamp)
export type CreateCourseInput = Omit<CourseType, "courseId" | "timestamp">;

// Type for updating a course
export type UpdateCourseInput = Partial<
  Omit<CourseType, "courseId" | "timestamp">
>;

// Mongoose Model interface with static methods
interface CourseModel extends Model<ICourseDocument> {
  getNextCourseId(): Promise<string>;
}

// Mongoose Schema
const CourseSchema = new Schema<ICourseDocument>(
  {
    courseId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    campusId: {
      type: String,
      required: true,
      index: true,
    },
    campusName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    departmentId: {
      type: String,
      required: true,
      index: true,
    },
    departmentName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    courseAvailability: {
      type: String,
      enum: ["Active", "Inactive", "Archived"],
      default: "Active",
      index: true,
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: {
      createdAt: "timestamp",
      updatedAt: false,
    },
  },
);

// Static method to get next course ID
CourseSchema.statics.getNextCourseId = async function (): Promise<string> {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "courseId" },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true },
  );
  return counter.sequenceValue.toString().padStart(3, "0");
};

// Pre-save hook removed since we'll generate IDs manually in actions

// Export the model
export const Course =
  (models.Course as CourseModel) ||
  mongoose.model<ICourseDocument, CourseModel>("Course", CourseSchema);

export default Course;
