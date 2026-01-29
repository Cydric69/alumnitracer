import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  date: Date;
  description: string;
  year: string;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Announcement date is required"],
    },
    description: {
      type: String,
      required: [true, "Announcement description is required"],
      trim: true,
    },
    year: {
      type: String,
      required: [true, "Announcement year is required"],
      trim: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Create index for year filtering and active status
announcementSchema.index({ year: 1, isActive: 1 });
announcementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Announcement =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>("Announcement", announcementSchema);

export default Announcement;
