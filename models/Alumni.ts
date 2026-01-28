// models/Alumni.ts
import mongoose, { Document, Schema, Types } from "mongoose";
import { z } from "zod";

// Zod Schema based on your AlumniInput type
export const AlumniZodSchema = z.object({
  // Personal Information
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name cannot exceed 100 characters")
    .transform((val) => val.toUpperCase().trim()),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name cannot exceed 100 characters")
    .transform((val) => val.toUpperCase().trim()),

  gender: z.enum(["Male", "Female", "Other"]),

  civilStatus: z.enum(["Single", "Married", "Widowed", "Separated"]),

  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),

  placeOfBirth: z
    .string()
    .max(500, "Place of birth cannot exceed 500 characters")
    .transform((val) => val.trim())
    .optional(),

  // Contact Information
  email: z
    .string()
    .email("Please enter a valid email address")
    .transform((val) => val.toLowerCase().trim()),

  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number cannot exceed 20 characters")
    .transform((val) => val.trim()),

  facebookAccount: z
    .string()
    .max(200, "Facebook account cannot exceed 200 characters")
    .transform((val) => val.trim())
    .optional(),

  address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address cannot exceed 500 characters")
    .transform((val) => val.trim()),

  // Academic Information
  studentId: z
    .string()
    .max(50, "Student ID cannot exceed 50 characters")
    .transform((val) => val.trim())
    .optional(),

  yearGraduated: z.string().regex(/^\d{4}$/, "Year must be 4 digits"),

  campus: z.string().transform((val) => val.trim()),

  department: z.string().transform((val) => val.trim()),

  course: z.string().transform((val) => val.trim()),

  degree: z
    .string()
    .min(5, "Degree must be at least 5 characters")
    .max(200, "Degree cannot exceed 200 characters")
    .transform((val) => val.toUpperCase().trim()),

  // Employment Information
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

  // Job Details
  currentPosition: z
    .string()
    .max(100, "Current position cannot exceed 100 characters")
    .transform((val) => val.trim())
    .optional(),

  employer: z
    .string()
    .max(200, "Employer cannot exceed 200 characters")
    .transform((val) => val.trim())
    .optional(),

  companyAddress: z
    .string()
    .max(500, "Company address cannot exceed 500 characters")
    .transform((val) => val.trim())
    .optional(),

  // Board Exam Information
  boardExamPassed: z
    .string()
    .max(100, "Board exam passed cannot exceed 100 characters")
    .transform((val) => val.trim())
    .optional(),

  yearPassedBoardExam: z
    .string()
    .regex(/^\d{4}$/, "Year must be 4 digits")
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

  // Job Search Information
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

  // Job Relationship Questions
  isFirstJobRelatedToDegree: z.boolean().optional(),
  isCurrentJobRelatedToDegree: z.boolean().optional(),

  firstJobReasons: z
    .array(
      z
        .string()
        .max(100, "Reason cannot exceed 100 characters")
        .transform((val) => val.trim()),
    )
    .optional(),

  currentJobReasons: z
    .array(
      z
        .string()
        .max(100, "Reason cannot exceed 100 characters")
        .transform((val) => val.trim()),
    )
    .optional(),

  // File Upload
  employmentProof: z
    .string()
    .transform((val) => val.trim())
    .optional(),

  // Awards & Scholarships
  awardsRecognition: z
    .array(
      z
        .string()
        .max(200, "Award/Recognition cannot exceed 200 characters")
        .transform((val) => val.trim()),
    )
    .optional(),

  scholarshipsDuringEmployment: z
    .array(
      z
        .string()
        .max(200, "Scholarship name cannot exceed 200 characters")
        .transform((val) => val.trim()),
    )
    .optional(),

  eligibility: z
    .array(
      z
        .string()
        .max(100, "Eligibility cannot exceed 100 characters")
        .transform((val) => val.trim()),
    )
    .optional(),

  // Preferences
  willingToMentor: z.boolean().default(false),
  receiveUpdates: z.boolean().default(true),

  suggestions: z
    .string()
    .max(1000, "Suggestions cannot exceed 1000 characters")
    .transform((val) => val.trim())
    .optional(),
});

// Extract TypeScript type from Zod schema (matches AlumniInput)
export type IAlumni = z.infer<typeof AlumniZodSchema> & Document;

// Mongoose Schema
const AlumniSchema = new Schema<IAlumni>(
  {
    // Personal Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female", "Other"],
    },

    civilStatus: {
      type: String,
      required: [true, "Civil status is required"],
      enum: ["Single", "Married", "Widowed", "Separated"],
    },

    dateOfBirth: {
      type: String,
    },

    placeOfBirth: {
      type: String,
    },

    // Contact Information
    email: {
      type: String,
      required: [true, "Email is required"],
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },

    facebookAccount: {
      type: String,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
    },

    // Academic Information
    studentId: {
      type: String,
    },

    yearGraduated: {
      type: String,
      required: [true, "Year graduated is required"],
    },

    campus: {
      type: String,
      required: [true, "Campus is required"],
    },

    department: {
      type: String,
      required: [true, "Department is required"],
    },

    course: {
      type: String,
      required: [true, "Course is required"],
    },

    degree: {
      type: String,
      required: [true, "Degree is required"],
    },

    // Employment Information
    employmentStatus: {
      type: String,
      required: [true, "Employment status is required"],
      enum: [
        "Employed",
        "Self-Employed",
        "Unemployed",
        "Never Employed",
        "Further Studies",
      ],
    },

    employmentSector: {
      type: String,
      required: [true, "Employment sector is required"],
      enum: ["Government", "Private", "Entrepreneurial", "Freelance", "N/A"],
    },

    presentEmploymentStatus: {
      type: String,
      required: [true, "Present employment status is required"],
      enum: ["Regular", "Probationary", "Casual", "Others", "N/A"],
    },

    locationOfEmployment: {
      type: String,
      required: [true, "Location of employment is required"],
      enum: ["Local", "Abroad", "N/A"],
    },

    // Job Details
    currentPosition: {
      type: String,
    },

    employer: {
      type: String,
    },

    companyAddress: {
      type: String,
    },

    // Board Exam Information
    boardExamPassed: {
      type: String,
    },

    yearPassedBoardExam: {
      type: String,
    },

    dateEmploymentAfterBoardExam: {
      type: String,
      enum: [
        "Within one month",
        "1 to 3 months",
        "3 to 6 months",
        "6 months to 1 year",
        "Within 2 years",
        "After 2 years",
      ],
    },

    // Job Search Information
    jobInformationSource: {
      type: String,
      enum: ["CHMSU Career Fair", "Personal", "Other Job Fairs", "None"],
    },

    firstJobDuration: {
      type: String,
      enum: [
        "3 to 6 months",
        "6 months to 1 year",
        "1 to 2 years",
        "2 years & above",
        "Currently Working",
      ],
    },

    // Job Relationship Questions
    isFirstJobRelatedToDegree: {
      type: Boolean,
    },

    firstJobReasons: [
      {
        type: String,
      },
    ],

    isCurrentJobRelatedToDegree: {
      type: Boolean,
    },

    currentJobReasons: [
      {
        type: String,
      },
    ],

    // File Upload
    employmentProof: {
      type: String,
    },

    // Awards & Scholarships
    awardsRecognition: [
      {
        type: String,
      },
    ],

    scholarshipsDuringEmployment: [
      {
        type: String,
      },
    ],

    eligibility: [
      {
        type: String,
      },
    ],

    // Preferences
    willingToMentor: {
      type: Boolean,
      default: false,
    },

    receiveUpdates: {
      type: Boolean,
      default: true,
    },

    suggestions: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "alumni",
  },
);

// Create indexes for better query performance
AlumniSchema.index({ campus: 1 });
AlumniSchema.index({ department: 1 });
AlumniSchema.index({ course: 1 });
AlumniSchema.index({ yearGraduated: 1 });
AlumniSchema.index({ employmentStatus: 1 });
AlumniSchema.index({ firstName: 1, lastName: 1 });
AlumniSchema.index({ email: 1 });

// Static method for Zod validation
AlumniSchema.statics.validateData = async function (data: any) {
  return AlumniZodSchema.parseAsync(data);
};

// Static method for safe validation (returns errors instead of throwing)
AlumniSchema.statics.safeValidate = async function (data: any) {
  const result = await AlumniZodSchema.safeParseAsync(data);
  return result;
};

// Create and export the model
const Alumni =
  mongoose.models.Alumni || mongoose.model<IAlumni>("Alumni", AlumniSchema);
export default Alumni;
