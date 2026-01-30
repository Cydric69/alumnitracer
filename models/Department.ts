import mongoose, { Schema, Document, Model, models } from "mongoose";
import { DepartmentType } from "@/types/department";
import { Counter } from "@/models/Counter";

export interface IDepartmentDocument extends DepartmentType, Document {
  _id: mongoose.Types.ObjectId;
}

interface DepartmentModel extends Model<IDepartmentDocument> {
  getNextDepartmentId(): Promise<string>;
}

const DepartmentSchema = new Schema<IDepartmentDocument>(
  {
    departmentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    campusId: {
      type: String,
      required: true,
      ref: "Campus",
    },
    campusName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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

DepartmentSchema.pre("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "departmentId" },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true },
    );
    this.departmentId = counter.sequenceValue.toString().padStart(3, "0");
  }
});

DepartmentSchema.statics.getNextDepartmentId =
  async function (): Promise<string> {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "departmentId" },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true },
    );
    return counter.sequenceValue.toString().padStart(3, "0");
  };

export const Department =
  (models.Department as DepartmentModel) ||
  mongoose.model<IDepartmentDocument, DepartmentModel>(
    "Department",
    DepartmentSchema,
  );

export default Department;
