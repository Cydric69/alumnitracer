import mongoose, { Schema, Document, Model, models } from "mongoose";
import { Counter } from "./Counter";

export interface ICampus {
  campusId: string;
  campusName: string;
  location?: string;
  description?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICampusDocument extends ICampus, Document {
  _id: mongoose.Types.ObjectId;
}

const CampusSchema = new Schema<ICampusDocument>(
  {
    campusId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    campusName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    createdBy: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // uses createdAt & updatedAt automatically
  },
);

CampusSchema.pre("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "campusId" },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true },
    );
    this.campusId = counter.sequenceValue.toString().padStart(3, "0");
  }
});

CampusSchema.statics.getNextCampusId = async function (): Promise<string> {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "campusId" },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true },
  );
  return counter.sequenceValue.toString().padStart(3, "0");
};

CampusSchema.index({ campusId: 1 }, { unique: true });
CampusSchema.index({ campusName: 1 });

interface CampusModel extends Model<ICampusDocument> {
  getNextCampusId(): Promise<string>;
}

export const Campus: CampusModel =
  (models.Campus as CampusModel) ||
  mongoose.model<ICampusDocument, CampusModel>("Campus", CampusSchema);

export default Campus;
