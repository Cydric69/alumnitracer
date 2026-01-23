// models/Alumni.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAlumni extends Document {
  // Personal Information
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated";
  dateOfBirth?: Date;
  placeOfBirth?: string;

  // Contact Information
  email: string;
  phoneNumber: string;
  facebookAccount?: string;
  address: string;

  // Academic Information
  studentId?: string;
  yearGraduated: string;
  campus: Types.ObjectId;
  department: Types.ObjectId;
  course: Types.ObjectId;
  degree: string;

  // Employment Information
  employmentStatus:
    | "Employed"
    | "Self-Employed"
    | "Unemployed"
    | "Never Employed"
    | "Further Studies";
  employmentSector:
    | "Government"
    | "Private"
    | "Entrepreneurial"
    | "Freelance"
    | "N/A";
  presentEmploymentStatus:
    | "Regular"
    | "Probationary"
    | "Casual"
    | "Others"
    | "N/A";
  locationOfEmployment: "Local" | "Abroad" | "N/A";

  // Job Details
  currentPosition?: string;
  employer?: string;
  companyAddress?: string;

  // Board Exam Information
  boardExamPassed?: string;
  yearPassedBoardExam?: string;
  dateEmploymentAfterBoardExam?:
    | "Within one month"
    | "1 to 3 months"
    | "3 to 6 months"
    | "6 months to 1 year"
    | "Within 2 years"
    | "After 2 years";

  // Job Search Information
  jobInformationSource?:
    | "CHMSU Career Fair"
    | "Personal"
    | "Other Job Fairs"
    | "None";
  firstJobDuration?:
    | "3 to 6 months"
    | "6 months to 1 year"
    | "1 to 2 years"
    | "2 years & above"
    | "Currently Working";

  // Job Relationship Questions
  isFirstJobRelatedToDegree?: boolean;
  firstJobReasons?: string[]; // Array of reasons for first job

  isCurrentJobRelatedToDegree?: boolean;
  currentJobReasons?: string[]; // Array of reasons for current job

  // File Upload (store file path or URL)
  employmentProof?: string;

  // Awards & Scholarships
  awardsRecognition?: string[];
  scholarshipsDuringEmployment?: string[];
  eligibility?: string[];

  // Preferences
  willingToMentor: boolean;
  receiveUpdates: boolean;
  suggestions?: string;

  createdAt: Date;
  updatedAt: Date;
}

const AlumniSchema = new Schema<IAlumni>(
  {
    // Personal Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [100, "First name cannot exceed 100 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [100, "Last name cannot exceed 100 characters"],
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender must be Male, Female, or Other",
      },
    },

    civilStatus: {
      type: String,
      required: [true, "Civil status is required"],
      enum: {
        values: ["Single", "Married", "Widowed", "Separated"],
        message: "Civil status must be Single, Married, Widowed, or Separated",
      },
    },

    dateOfBirth: {
      type: Date,
    },

    placeOfBirth: {
      type: String,
      trim: true,
      maxlength: [200, "Place of birth cannot exceed 200 characters"],
    },

    // Contact Information
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      minlength: [10, "Phone number must be at least 10 characters"],
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },

    facebookAccount: {
      type: String,
      trim: true,
      maxlength: [200, "Facebook account cannot exceed 200 characters"],
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [10, "Address must be at least 10 characters"],
      maxlength: [500, "Address cannot exceed 500 characters"],
    },

    // Academic Information
    studentId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      maxlength: [50, "Student ID cannot exceed 50 characters"],
    },

    yearGraduated: {
      type: String,
      required: [true, "Year graduated is required"],
      match: [/^\d{4}$/, "Year must be 4 digits"],
    },

    campus: {
      type: Schema.Types.ObjectId,
      ref: "Campus",
      required: [true, "Campus is required"],
    },

    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },

    degree: {
      type: String,
      required: [true, "Degree is required"],
      trim: true,
      minlength: [5, "Degree must be at least 5 characters"],
      maxlength: [200, "Degree cannot exceed 200 characters"],
    },

    // Employment Information
    employmentStatus: {
      type: String,
      required: [true, "Employment status is required"],
      enum: {
        values: [
          "Employed",
          "Self-Employed",
          "Unemployed",
          "Never Employed",
          "Further Studies",
        ],
        message:
          "Employment status must be Employed, Self-Employed, Unemployed, Never Employed, or Further Studies",
      },
    },

    employmentSector: {
      type: String,
      required: [true, "Employment sector is required"],
      enum: {
        values: [
          "Government",
          "Private",
          "Entrepreneurial",
          "Freelance",
          "N/A",
        ],
        message:
          "Employment sector must be Government, Private, Entrepreneurial, Freelance, or N/A",
      },
    },

    presentEmploymentStatus: {
      type: String,
      required: [true, "Present employment status is required"],
      enum: {
        values: ["Regular", "Probationary", "Casual", "Others", "N/A"],
        message:
          "Present employment status must be Regular, Probationary, Casual, Others, or N/A",
      },
    },

    locationOfEmployment: {
      type: String,
      required: [true, "Location of employment is required"],
      enum: {
        values: ["Local", "Abroad", "N/A"],
        message: "Location of employment must be Local, Abroad, or N/A",
      },
    },

    // Job Details
    currentPosition: {
      type: String,
      trim: true,
      maxlength: [100, "Current position cannot exceed 100 characters"],
    },

    employer: {
      type: String,
      trim: true,
      maxlength: [200, "Employer cannot exceed 200 characters"],
    },

    companyAddress: {
      type: String,
      trim: true,
      maxlength: [500, "Company address cannot exceed 500 characters"],
    },

    // Board Exam Information
    boardExamPassed: {
      type: String,
      trim: true,
      maxlength: [100, "Board exam passed cannot exceed 100 characters"],
    },

    yearPassedBoardExam: {
      type: String,
      match: [/^\d{4}$/, "Year must be 4 digits"],
    },

    dateEmploymentAfterBoardExam: {
      type: String,
      enum: {
        values: [
          "Within one month",
          "1 to 3 months",
          "3 to 6 months",
          "6 months to 1 year",
          "Within 2 years",
          "After 2 years",
        ],
        message: "Invalid date of employment after board exam",
      },
    },

    // Job Search Information
    jobInformationSource: {
      type: String,
      enum: {
        values: ["CHMSU Career Fair", "Personal", "Other Job Fairs", "None"],
        message: "Invalid job information source",
      },
    },

    firstJobDuration: {
      type: String,
      enum: {
        values: [
          "3 to 6 months",
          "6 months to 1 year",
          "1 to 2 years",
          "2 years & above",
          "Currently Working",
        ],
        message: "Invalid first job duration",
      },
    },

    // Job Relationship Questions
    isFirstJobRelatedToDegree: {
      type: Boolean,
    },

    firstJobReasons: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Reason cannot exceed 100 characters"],
      },
    ],

    isCurrentJobRelatedToDegree: {
      type: Boolean,
    },

    currentJobReasons: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Reason cannot exceed 100 characters"],
      },
    ],

    // File Upload
    employmentProof: {
      type: String,
      trim: true,
    },

    // Awards & Scholarships
    awardsRecognition: [
      {
        type: String,
        trim: true,
        maxlength: [200, "Award/Recognition cannot exceed 200 characters"],
      },
    ],

    scholarshipsDuringEmployment: [
      {
        type: String,
        trim: true,
        maxlength: [200, "Scholarship name cannot exceed 200 characters"],
      },
    ],

    eligibility: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Eligibility cannot exceed 100 characters"],
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
      trim: true,
      maxlength: [1000, "Suggestions cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
    collection: "alumni",
  }
);

// Create indexes for better query performance
AlumniSchema.index({ email: 1 }, { unique: true });
AlumniSchema.index({ campus: 1 });
AlumniSchema.index({ department: 1 });
AlumniSchema.index({ course: 1 });
AlumniSchema.index({ yearGraduated: 1 });
AlumniSchema.index({ employmentStatus: 1 });
AlumniSchema.index({ firstName: 1, lastName: 1 });

// Prevent model recompilation in development
export default mongoose.models.Alumni ||
  mongoose.model<IAlumni>("Alumni", AlumniSchema);
