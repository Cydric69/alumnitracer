import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface ICounter extends Document<string> {
  _id: string;
  sequenceValue: number;
}

const CounterSchema = new Schema<ICounter>(
  {
    _id: {
      type: String,
      required: true,
    },
    sequenceValue: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    _id: false, // disable automatic _id
    versionKey: false, // optional
    timestamps: true,
  },
);

export const Counter =
  (models.Counter as Model<ICounter>) ||
  mongoose.model<ICounter>("Counter", CounterSchema);

export default Counter;
