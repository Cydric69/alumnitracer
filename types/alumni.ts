// types/alumni.ts
export interface Alumni {
  id: string;

  // Personal Information
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated";
  dateOfBirth?: string;
  placeOfBirth?: string;

  // Contact Information
  email: string;
  phoneNumber: string;
  facebookAccount?: string;
  address: string;

  // Academic Information
  studentId?: string;
  yearGraduated: string;
  campus: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  };
  course: {
    id: string;
    name: string;
  };
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
  firstJobReasons?: string[];

  isCurrentJobRelatedToDegree?: boolean;
  currentJobReasons?: string[];

  // File Upload
  employmentProof?: string;

  // Awards & Scholarships
  awardsRecognition?: string[];
  scholarshipsDuringEmployment?: string[];
  eligibility?: string[];

  // Preferences
  willingToMentor: boolean;
  receiveUpdates: boolean;
  suggestions?: string;

  createdAt: string;
  updatedAt: string;
}

export interface AlumniInput {
  // Personal Information
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated";
  dateOfBirth?: string;
  placeOfBirth?: string;

  // Contact Information
  email: string;
  phoneNumber: string;
  facebookAccount?: string;
  address: string;

  // Academic Information
  studentId?: string;
  yearGraduated: string;
  campus: string; // Campus ID
  department: string; // Department ID
  course: string; // Course ID
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
  firstJobReasons?: string[];

  isCurrentJobRelatedToDegree?: boolean;
  currentJobReasons?: string[];

  // File Upload
  employmentProof?: string;

  // Awards & Scholarships
  awardsRecognition?: string[];
  scholarshipsDuringEmployment?: string[];
  eligibility?: string[];

  // Preferences
  willingToMentor: boolean;
  receiveUpdates: boolean;
  suggestions?: string;
}
