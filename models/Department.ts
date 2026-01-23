// models/Department.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  campus: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
    },

    campus: {
      type: Schema.Types.ObjectId,
      ref: "Campus",
      required: [true, "Campus is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Optional: Create unique index for name per campus
departmentSchema.index({ name: 1, campus: 1 }, { unique: true });

const Department =
  mongoose.models.Department ||
  mongoose.model<IDepartment>("Department", departmentSchema);

export default Department;
