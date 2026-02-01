// types/landing.ts
import { Campus, Department, Course } from "./academic";

export type SurveyStep =
  | "personal"
  | "contact"
  | "academic"
  | "employment"
  | "jobDetails"
  | "boardExam"
  | "jobSearch"
  | "jobRelationship"
  | "awards"
  | "preferences"
  | "review";

// Remove the old Campus, Department, Course interfaces since we're importing them

export interface Region {
  id: string;
  psgc_code: string;
  region_name: string;
  region_code: string;
}

export interface Province {
  psgc_code: string;
  province_name: string;
  province_code: string;
  region_code: string;
}

export interface City {
  city_name: string;
  city_code: string;
  province_code: string;
  region_desc: string;
}

export interface Barangay {
  brgy_name: string;
  brgy_code: string;
  province_code: string;
  region_code: string;
}

export interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other" | "";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated" | "";
  dateOfBirth?: string;

  // Philippine Address Fields for Birth Place
  birthRegion?: string;
  birthProvince?: string;
  birthCity?: string;
  birthBarangay?: string;
  birthZipCode?: string;

  // Contact Information
  email: string;
  phoneNumber: string;
  facebookAccount?: string;

  // Philippine Address Fields for Current Address
  currentRegion?: string;
  currentProvince?: string;
  currentCity?: string;
  currentBarangay?: string;
  currentStreet?: string;
  currentZipCode?: string;

  // Academic Information
  studentId?: string;
  yearGraduated: string;
  campus: string; // campus id
  department: string; // department id
  course: string; // course id
  degree: string;

  // Employment Information
  employmentStatus:
    | "Employed"
    | "Self-Employed"
    | "Unemployed"
    | "Never Employed"
    | "Further Studies"
    | "";
  employmentSector:
    | "Government"
    | "Private"
    | "Entrepreneurial"
    | "Freelance"
    | "N/A"
    | "";
  presentEmploymentStatus:
    | "Regular"
    | "Probationary"
    | "Casual"
    | "Others"
    | "N/A"
    | "";
  locationOfEmployment: "Local" | "Abroad" | "N/A" | "";

  // Job Details
  currentPosition?: string;
  employer?: string;

  // Philippine Address Fields for Company Address
  companyRegion?: string;
  companyProvince?: string;
  companyCity?: string;
  companyBarangay?: string;
  companyStreet?: string;
  companyZipCode?: string;

  // Board Exam Information
  boardExamPassed?: string;
  yearPassedBoardExam?: string;
  dateEmploymentAfterBoardExam?:
    | "Within one month"
    | "1 to 3 months"
    | "3 to 6 months"
    | "6 months to 1 year"
    | "Within 2 years"
    | "After 2 years"
    | "";

  // Job Search Information
  jobInformationSource?:
    | "CHMSU Career Fair"
    | "Personal"
    | "Other Job Fairs"
    | "None"
    | "";
  firstJobDuration?:
    | "3 to 6 months"
    | "6 months to 1 year"
    | "1 to 2 years"
    | "2 years & above"
    | "Currently Working"
    | "";

  // Job Relationship Questions
  isFirstJobRelatedToDegree?: boolean;
  firstJobReasons: string[];
  isCurrentJobRelatedToDegree?: boolean;
  currentJobReasons: string[];

  // Awards & Scholarships
  awardsRecognition: string[];
  scholarshipsDuringEmployment: string[];
  eligibility: string[];

  // Preferences
  willingToMentor: boolean;
  receiveUpdates: boolean;
  suggestions?: string;
}

export const jobReasonsOptions = [
  { id: "salary", label: "Salary/Compensation", value: "Salary/Compensation" },
  { id: "location", label: "Location", value: "Location" },
  { id: "career", label: "Career Advancement", value: "Career Advancement" },
  { id: "skills", label: "Skills Match", value: "Skills Match" },
  { id: "availability", label: "Job Availability", value: "Job Availability" },
  { id: "experience", label: "Gain Experience", value: "Gain Experience" },
  { id: "flexibility", label: "Work Flexibility", value: "Work Flexibility" },
  { id: "passion", label: "Personal Passion", value: "Personal Passion" },
];

export type { Campus, Department, Course };
