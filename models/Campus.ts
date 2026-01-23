// models/Campus.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ICampus extends Document {
  name: string;
  description: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const CampusSchema = new Schema<ICampus>(
  {
    name: {
      type: String,
      required: [true, "Campus name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Campus name must be at least 2 characters"],
      maxlength: [200, "Campus name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Campus description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    address: {
      type: String,
      required: [true, "Campus address is required"],
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    collection: "campuses",
  }
);

// Create index for better query performance
CampusSchema.index({ name: 1 });

// Prevent model recompilation in development
export default mongoose.models.Campus ||
  mongoose.model<ICampus>("Campus", CampusSchema);
