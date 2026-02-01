import mongoose, { Document, Schema, Types } from "mongoose";
import { z } from "zod";

export const AlumniZodSchema = z.object({
  firstName: z
    .string()
    .min(2)
    .max(100)
    .transform((v) => v.toUpperCase().trim()),
  lastName: z
    .string()
    .min(2)
    .max(100)
    .transform((v) => v.toUpperCase().trim()),
  gender: z.enum(["Male", "Female", "Other"]),
  civilStatus: z.enum(["Single", "Married", "Widowed", "Separated"]),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  placeOfBirth: z
    .string()
    .max(500)
    .transform((v) => v.trim())
    .optional(),
  email: z
    .string()
    .email()
    .transform((v) => v.toLowerCase().trim()),
  phoneNumber: z
    .string()
    .min(10)
    .max(20)
    .transform((v) => v.trim()),
  facebookAccount: z
    .string()
    .max(200)
    .transform((v) => v.trim())
    .optional(),
  address: z
    .string()
    .min(10)
    .max(500)
    .transform((v) => v.trim()),

  studentId: z
    .string()
    .max(50)
    .transform((v) => v.trim())
    .optional(),
  yearGraduated: z.string().regex(/^\d{4}$/),

  campusId: z
    .union([
      z.instanceof(Types.ObjectId),
      z.string().transform((v, ctx) => {
        if (!v?.trim()) return undefined;
        try {
          return new Types.ObjectId(v.trim());
        } catch {
          ctx.addIssue({ code: "custom", message: "Invalid campusId" });
          return z.NEVER;
        }
      }),
      z.undefined(),
    ])
    .optional(),

  campusName: z
    .string()
    .min(2)
    .max(200)
    .transform((v) => v.trim())
    .optional(),

  departmentId: z
    .union([
      z.instanceof(Types.ObjectId),
      z.string().transform((v, ctx) => {
        if (!v?.trim()) return undefined;
        try {
          return new Types.ObjectId(v.trim());
        } catch {
          ctx.addIssue({ code: "custom", message: "Invalid departmentId" });
          return z.NEVER;
        }
      }),
      z.undefined(),
    ])
    .optional(),

  departmentName: z
    .string()
    .min(2)
    .max(200)
    .transform((v) => v.trim())
    .optional(),

  courseId: z
    .union([
      z.instanceof(Types.ObjectId),
      z.string().transform((v, ctx) => {
        if (!v?.trim()) return undefined;
        try {
          return new Types.ObjectId(v.trim());
        } catch {
          ctx.addIssue({ code: "custom", message: "Invalid courseId" });
          return z.NEVER;
        }
      }),
      z.undefined(),
    ])
    .optional(),

  courseName: z
    .string()
    .min(2)
    .max(200)
    .transform((v) => v.trim())
    .optional(),

  degree: z
    .string()
    .min(5)
    .max(200)
    .transform((v) => v.toUpperCase().trim()),

  employmentStatus: z.enum([
    "Employed",
    "Self-Employed",
    "Unemployed",
    "Never Employed",
    "Further Studies",
  ]),
  employmentSector: z.enum([
    "Government",
    "Private",
    "Entrepreneurial",
    "Freelance",
    "N/A",
  ]),
  presentEmploymentStatus: z.enum([
    "Regular",
    "Probationary",
    "Casual",
    "Others",
    "N/A",
  ]),
  locationOfEmployment: z.enum(["Local", "Abroad", "N/A"]),

  currentPosition: z
    .string()
    .max(100)
    .transform((v) => v.trim())
    .optional(),
  employer: z
    .string()
    .max(200)
    .transform((v) => v.trim())
    .optional(),
  companyAddress: z
    .string()
    .max(500)
    .transform((v) => v.trim())
    .optional(),

  boardExamPassed: z
    .string()
    .max(100)
    .transform((v) => v.trim())
    .optional(),
  yearPassedBoardExam: z
    .string()
    .regex(/^\d{4}$/)
    .optional(),
  dateEmploymentAfterBoardExam: z
    .enum([
      "Within one month",
      "1 to 3 months",
      "3 to 6 months",
      "6 months to 1 year",
      "Within 2 years",
      "After 2 years",
    ])
    .optional(),

  jobInformationSource: z
    .enum(["CHMSU Career Fair", "Personal", "Other Job Fairs", "None"])
    .optional(),
  firstJobDuration: z
    .enum([
      "3 to 6 months",
      "6 months to 1 year",
      "1 to 2 years",
      "2 years & above",
      "Currently Working",
    ])
    .optional(),

  isFirstJobRelatedToDegree: z.boolean().optional(),
  firstJobReasons: z
    .array(z.string().transform((v) => v.trim()))
    .optional()
    .default([]),
  isCurrentJobRelatedToDegree: z.boolean().optional(),
  currentJobReasons: z
    .array(z.string().transform((v) => v.trim()))
    .optional()
    .default([]),

  awardsRecognition: z
    .array(z.string().transform((v) => v.trim()))
    .optional()
    .default([]),
  scholarshipsDuringEmployment: z
    .array(z.string().transform((v) => v.trim()))
    .optional()
    .default([]),
  eligibility: z
    .array(z.string().transform((v) => v.trim()))
    .optional()
    .default([]),

  willingToMentor: z.boolean().default(false),
  receiveUpdates: z.boolean().default(true),
  suggestions: z
    .string()
    .max(1000)
    .transform((v) => v.trim())
    .optional(),
});

export type IAlumni = z.infer<typeof AlumniZodSchema> & Document;

const AlumniSchema = new Schema<IAlumni>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    civilStatus: {
      type: String,
      required: true,
      enum: ["Single", "Married", "Widowed", "Separated"],
    },
    dateOfBirth: { type: String },
    placeOfBirth: { type: String },

    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    facebookAccount: { type: String },
    address: { type: String, required: true },

    studentId: { type: String, sparse: true, unique: true },
    yearGraduated: { type: String, required: true },

    campusId: { type: Schema.Types.ObjectId, ref: "Campus" },
    campusName: { type: String },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    departmentName: { type: String },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    courseName: { type: String },

    degree: { type: String, required: true },

    employmentStatus: { type: String, required: true },
    employmentSector: { type: String, required: true },
    presentEmploymentStatus: { type: String, required: true },
    locationOfEmployment: { type: String, required: true },

    currentPosition: { type: String },
    employer: { type: String },
    companyAddress: { type: String },

    boardExamPassed: { type: String },
    yearPassedBoardExam: { type: String },
    dateEmploymentAfterBoardExam: { type: String },

    jobInformationSource: { type: String },
    firstJobDuration: { type: String },

    isFirstJobRelatedToDegree: { type: Boolean },
    firstJobReasons: [{ type: String }],
    isCurrentJobRelatedToDegree: { type: Boolean },
    currentJobReasons: [{ type: String }],

    awardsRecognition: [{ type: String }],
    scholarshipsDuringEmployment: [{ type: String }],
    eligibility: [{ type: String }],

    willingToMentor: { type: Boolean, default: false },
    receiveUpdates: { type: Boolean, default: true },
    suggestions: { type: String },
  },
  {
    timestamps: true,
  },
);

AlumniSchema.index({ email: 1 }, { unique: true });
AlumniSchema.index({ campusId: 1 });
AlumniSchema.index({ departmentId: 1 });
AlumniSchema.index({ courseId: 1 });

const Alumni =
  mongoose.models.Alumni || mongoose.model<IAlumni>("Alumni", AlumniSchema);
export default Alumni;
