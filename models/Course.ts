// models/Course.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICourse extends Document {
  name: string;
  department: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
    },

    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Create unique index for course name per department
courseSchema.index({ name: 1, department: 1 }, { unique: true });

// Add virtual populate for department's campus
courseSchema.virtual("departmentWithCampus", {
  ref: "Department",
  localField: "department",
  foreignField: "_id",
  justOne: true,
  populate: {
    path: "campus",
    select: "name",
  },
});

const Course =
  mongoose.models.Course || mongoose.model<ICourse>("Course", courseSchema);

export default Course;
