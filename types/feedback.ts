// types/feedback.ts

export interface FeedbackInput {
  // Respondent Information (Optional)
  alumniId?: string;
  email?: string;

  // Likert Scale Questions (1-5 scale)
  jobSearchPreparation: number; // CHMSU has prepared me for job searching
  careerPreparation: number; // My education in CHMSU has prepared me for my career
  otherJobsPreparation: number; // My education in CHMSU has prepared me for other jobs

  // Multiple Selection Questions (Array of selected values)
  developedValues: string[]; // What VALUES did CHMSU help you develop?
  developedSkills: string[]; // What SKILLS did CHMSU help you develop?

  // Open-ended Questions
  likeMost: string; // What did you LIKE MOST about your Alma Mater?
  needImprovement: string; // What did you NOT LIKE MOST that needs IMPROVED?
  suggestions?: string; // Any SUGGESTION(S) for CHMSU to be better?

  // Final Questions
  wouldEnroll: "Yes" | "No"; // Would you enroll your child or sibling in CHMSU?
  whyReason: string; // Why?
}

// Base interface for Feedback
export interface IFeedbackBase {
  alumniId?: string;
  email?: string;
  jobSearchPreparation: number;
  careerPreparation: number;
  otherJobsPreparation: number;
  developedValues: string[];
  developedSkills: string[];
  likeMost: string;
  needImprovement: string;
  suggestions?: string;
  wouldEnroll: "Yes" | "No";
  whyReason: string;
  createdAt: string;
  updatedAt: string;
  alumni?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

// Interface for transformed feedback data (used in frontend)
export interface IFeedback extends IFeedbackBase {
  id: string;
}

// Interface for database feedback (extends Document for Mongoose)
export interface IFeedbackDocument extends IFeedbackBase, Document {
  _id: string;
}

// Constants for the form - using tuple types for Zod enum
export const VALUE_OPTIONS = [
  "Communication",
  "Creativity",
  "Adaptability",
  "Decision-making",
  "Self-motivation",
  "Teamwork",
  "Problem-solving",
  "Handling conflicts",
  "Leadership",
  "Ability to work under pressure",
] as const;

export const SKILL_OPTIONS = [
  "Communication",
  "Creativity",
  "Adaptability",
  "Decision-making",
  "Self-motivation",
  "Teamwork",
  "Problem-solving",
  "Handling conflicts",
  "Leadership",
  "Ability to work under pressure",
] as const;

// Type for the actual values
export type ValueOption = (typeof VALUE_OPTIONS)[number];
export type SkillOption = (typeof SKILL_OPTIONS)[number];

// Filter options interfaces
export interface FilterOption {
  value: string;
  label: string;
}
