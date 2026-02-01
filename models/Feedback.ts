// models/Feedback.ts
import mongoose, { Document, Schema, Types } from "mongoose";
import { z } from "zod";
import { VALUE_OPTIONS, SKILL_OPTIONS } from "@/types/feedback";

// Zod Schema for Feedback
export const FeedbackZodSchema = z.object({
  // Respondent Information (Optional)
  alumniId: z
    .instanceof(Types.ObjectId)
    .or(z.string().transform((val) => new Types.ObjectId(val)))
    .optional(),

  email: z
    .string()
    .email("Please enter a valid email address")
    .transform((val) => val.toLowerCase().trim())
    .optional(),

  // Likert Scale Questions (1-5 scale)
  jobSearchPreparation: z
    .number()
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),

  careerPreparation: z
    .number()
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),

  otherJobsPreparation: z
    .number()
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),

  // Multiple Selection Questions
  developedValues: z
    .array(z.enum(VALUE_OPTIONS as readonly [string, ...string[]]))
    .min(1, "Please select at least one value")
    .max(10, "Cannot select more than 10 values"),

  developedSkills: z
    .array(z.enum(SKILL_OPTIONS as readonly [string, ...string[]]))
    .min(1, "Please select at least one skill")
    .max(10, "Cannot select more than 10 skills"),

  // Open-ended Questions
  likeMost: z
    .string()
    .min(10, "Please provide at least 10 characters")
    .max(1000, "Response cannot exceed 1000 characters")
    .transform((val) => val.trim()),

  needImprovement: z
    .string()
    .min(10, "Please provide at least 10 characters")
    .max(1000, "Response cannot exceed 1000 characters")
    .transform((val) => val.trim()),

  suggestions: z
    .string()
    .max(1000, "Suggestions cannot exceed 1000 characters")
    .transform((val) => val.trim())
    .optional(),

  // Final Questions
  wouldEnroll: z.enum(["Yes", "No"], {
    message: "Please select an option",
  }),

  whyReason: z
    .string()
    .min(10, "Please provide at least 10 characters for your reason")
    .max(500, "Reason cannot exceed 500 characters")
    .transform((val) => val.trim()),
});

// Extract TypeScript type from Zod schema
export type IFeedback = z.infer<typeof FeedbackZodSchema> & Document;

// Mongoose Schema
const FeedbackSchema = new Schema<IFeedback>(
  {
    // Respondent Information
    alumniId: {
      type: Schema.Types.ObjectId,
      ref: "Alumni",
      index: true,
    },

    email: {
      type: String,
      index: true,
    },

    // Likert Scale Questions
    jobSearchPreparation: {
      type: Number,
      required: [true, "Job search preparation rating is required"],
      min: 1,
      max: 5,
    },

    careerPreparation: {
      type: Number,
      required: [true, "Career preparation rating is required"],
      min: 1,
      max: 5,
    },

    otherJobsPreparation: {
      type: Number,
      required: [true, "Other jobs preparation rating is required"],
      min: 1,
      max: 5,
    },

    // Multiple Selection Questions
    developedValues: [
      {
        type: String,
        enum: VALUE_OPTIONS,
        required: [true, "At least one value must be selected"],
      },
    ],

    developedSkills: [
      {
        type: String,
        enum: SKILL_OPTIONS,
        required: [true, "At least one skill must be selected"],
      },
    ],

    // Open-ended Questions
    likeMost: {
      type: String,
      required: [true, "What you like most is required"],
      minlength: [10, "Please provide at least 10 characters"],
      maxlength: [1000, "Cannot exceed 1000 characters"],
    },

    needImprovement: {
      type: String,
      required: [true, "What needs improvement is required"],
      minlength: [10, "Please provide at least 10 characters"],
      maxlength: [1000, "Cannot exceed 1000 characters"],
    },

    suggestions: {
      type: String,
      maxlength: [1000, "Cannot exceed 1000 characters"],
    },

    // Final Questions
    wouldEnroll: {
      type: String,
      required: [true, "Please indicate if you would enroll family"],
      enum: ["Yes", "No"],
    },

    whyReason: {
      type: String,
      required: [true, "Reason is required"],
      minlength: [10, "Please provide at least 10 characters"],
      maxlength: [500, "Cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    collection: "feedbacks",
  },
);

// Create indexes for better query performance
FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ alumniId: 1, email: 1 });

// Static method for Zod validation
FeedbackSchema.statics.validateData = async function (data: any) {
  return FeedbackZodSchema.parseAsync(data);
};

// Create and export the model
const Feedback =
  mongoose.models.Feedback ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);
export default Feedback;
