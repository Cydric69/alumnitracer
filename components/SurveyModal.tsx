"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AlumniInput } from "@/types/alumni";
import {
  createAlumni,
  getCampuses,
  getDepartments,
  getCourses,
} from "@/app/actions/alumni.actions";

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type SurveyStep =
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

interface Campus {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  campus: {
    id: string;
    name: string;
  };
}

interface Course {
  id: string;
  name: string;
  department: {
    id: string;
    name: string;
  };
}

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other" | "";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated" | "";
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
  campus: string;
  department: string;
  course: string;
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

const jobReasonsOptions = [
  { id: "salary", label: "Salary/Compensation", value: "Salary/Compensation" },
  { id: "location", label: "Location", value: "Location" },
  { id: "career", label: "Career Advancement", value: "Career Advancement" },
  { id: "skills", label: "Skills Match", value: "Skills Match" },
  { id: "availability", label: "Job Availability", value: "Job Availability" },
  { id: "experience", label: "Gain Experience", value: "Gain Experience" },
  { id: "flexibility", label: "Work Flexibility", value: "Work Flexibility" },
  { id: "passion", label: "Personal Passion", value: "Personal Passion" },
];

export default function SurveyModal({
  isOpen,
  onClose,
  onSuccess,
}: SurveyModalProps) {
  const [currentStep, setCurrentStep] = useState<SurveyStep>("personal");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    gender: "",
    civilStatus: "",
    dateOfBirth: "",
    placeOfBirth: "",
    email: "",
    phoneNumber: "",
    facebookAccount: "",
    address: "",
    studentId: "",
    yearGraduated: "",
    campus: "",
    department: "",
    course: "",
    degree: "",
    employmentStatus: "",
    employmentSector: "",
    presentEmploymentStatus: "",
    locationOfEmployment: "",
    currentPosition: "",
    employer: "",
    companyAddress: "",
    boardExamPassed: "",
    yearPassedBoardExam: "",
    dateEmploymentAfterBoardExam: "",
    jobInformationSource: "",
    firstJobDuration: "",
    isFirstJobRelatedToDegree: undefined,
    firstJobReasons: [],
    isCurrentJobRelatedToDegree: undefined,
    currentJobReasons: [],
    awardsRecognition: [""],
    scholarshipsDuringEmployment: [""],
    eligibility: [""],
    willingToMentor: false,
    receiveUpdates: true,
    suggestions: "",
  });

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const steps: { id: SurveyStep; label: string; description: string }[] = [
    { id: "personal", label: "Personal", description: "Basic Information" },
    { id: "contact", label: "Contact", description: "Contact Details" },
    { id: "academic", label: "Academic", description: "Education Background" },
    { id: "employment", label: "Employment", description: "Employment Status" },
    { id: "jobDetails", label: "Job Details", description: "Current Job" },
    { id: "boardExam", label: "Board Exam", description: "Licensure Details" },
    { id: "jobSearch", label: "Job Search", description: "Finding Work" },
    {
      id: "jobRelationship",
      label: "Job Fit",
      description: "Career Alignment",
    },
    { id: "awards", label: "Awards", description: "Achievements" },
    { id: "preferences", label: "Preferences", description: "Communication" },
    { id: "review", label: "Review", description: "Final Check" },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchCampuses();
      resetForm();
      setError(null);
      setSuccess(false);
      setCurrentStep("personal");
      setStepErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.campus) {
      fetchDepartments(formData.campus);
    } else {
      setDepartments([]);
      setCourses([]);
      setFormData((prev) => ({ ...prev, department: "", course: "" }));
    }
  }, [formData.campus]);

  useEffect(() => {
    if (formData.department) {
      fetchCourses(formData.department);
    } else {
      setCourses([]);
      setFormData((prev) => ({ ...prev, course: "" }));
    }
  }, [formData.department]);

  const fetchCampuses = async () => {
    try {
      setLoading(true);
      const campusesData = await getCampuses();
      setCampuses(campusesData);
    } catch (err: any) {
      setError(err.message || "Failed to load campuses");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async (campusId: string) => {
    try {
      const departmentsData = await getDepartments(campusId);
      setDepartments(departmentsData);
    } catch (err: any) {
      setError(err.message || "Failed to load departments");
    }
  };

  const fetchCourses = async (departmentId: string) => {
    try {
      const coursesData = await getCourses(departmentId);
      setCourses(coursesData);
    } catch (err: any) {
      setError(err.message || "Failed to load courses");
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      gender: "",
      civilStatus: "",
      dateOfBirth: "",
      placeOfBirth: "",
      email: "",
      phoneNumber: "",
      facebookAccount: "",
      address: "",
      studentId: "",
      yearGraduated: "",
      campus: "",
      department: "",
      course: "",
      degree: "",
      employmentStatus: "",
      employmentSector: "",
      presentEmploymentStatus: "",
      locationOfEmployment: "",
      currentPosition: "",
      employer: "",
      companyAddress: "",
      boardExamPassed: "",
      yearPassedBoardExam: "",
      dateEmploymentAfterBoardExam: "",
      jobInformationSource: "",
      firstJobDuration: "",
      isFirstJobRelatedToDegree: undefined,
      firstJobReasons: [],
      isCurrentJobRelatedToDegree: undefined,
      currentJobReasons: [],
      awardsRecognition: [""],
      scholarshipsDuringEmployment: [""],
      eligibility: [""],
      willingToMentor: false,
      receiveUpdates: true,
      suggestions: "",
    });
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear step errors when user starts typing
    setStepErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[currentStep];
      return newErrors;
    });
    setError(null);
  };

  const handleArrayChange = (
    field: "awardsRecognition" | "scholarshipsDuringEmployment" | "eligibility",
    index: number,
    value: string,
  ) => {
    setFormData((prev) => {
      const array = [...prev[field]];
      array[index] = value;
      return {
        ...prev,
        [field]: array,
      };
    });
  };

  const addArrayField = (
    field: "awardsRecognition" | "scholarshipsDuringEmployment" | "eligibility",
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (
    field: "awardsRecognition" | "scholarshipsDuringEmployment" | "eligibility",
    index: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleJobReasonToggle = (
    reason: string,
    isCurrentJob: boolean = false,
  ) => {
    const field = isCurrentJob ? "currentJobReasons" : "firstJobReasons";
    const currentReasons = formData[field];

    if (currentReasons.includes(reason)) {
      handleInputChange(
        field,
        currentReasons.filter((r) => r !== reason),
      );
    } else {
      handleInputChange(field, [...currentReasons, reason]);
    }
  };

  const validateCurrentStep = (): boolean => {
    let isValid = true;
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case "personal":
        if (!formData.firstName.trim()) {
          errors.firstName = "First name is required";
          isValid = false;
        } else if (formData.firstName.length < 2) {
          errors.firstName = "First name must be at least 2 characters";
          isValid = false;
        }

        if (!formData.lastName.trim()) {
          errors.lastName = "Last name is required";
          isValid = false;
        } else if (formData.lastName.length < 2) {
          errors.lastName = "Last name must be at least 2 characters";
          isValid = false;
        }

        if (!formData.gender) {
          errors.gender = "Gender is required";
          isValid = false;
        }

        if (!formData.civilStatus) {
          errors.civilStatus = "Civil status is required";
          isValid = false;
        }
        break;

      case "contact":
        if (!formData.email.trim()) {
          errors.email = "Email is required";
          isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
          errors.email = "Please enter a valid email address";
          isValid = false;
        }

        if (!formData.phoneNumber.trim()) {
          errors.phoneNumber = "Phone number is required";
          isValid = false;
        } else if (formData.phoneNumber.length < 10) {
          errors.phoneNumber = "Phone number must be at least 10 characters";
          isValid = false;
        }

        if (!formData.address.trim()) {
          errors.address = "Address is required";
          isValid = false;
        } else if (formData.address.length < 10) {
          errors.address = "Address must be at least 10 characters";
          isValid = false;
        }
        break;

      case "academic":
        if (!formData.yearGraduated.trim()) {
          errors.yearGraduated = "Year graduated is required";
          isValid = false;
        } else if (!/^\d{4}$/.test(formData.yearGraduated)) {
          errors.yearGraduated = "Year must be 4 digits (e.g., 2023)";
          isValid = false;
        }

        if (!formData.campus) {
          errors.campus = "Campus is required";
          isValid = false;
        }

        if (!formData.department) {
          errors.department = "Department is required";
          isValid = false;
        }

        if (!formData.course) {
          errors.course = "Course is required";
          isValid = false;
        }

        if (!formData.degree.trim()) {
          errors.degree = "Degree is required";
          isValid = false;
        } else if (formData.degree.length < 5) {
          errors.degree = "Degree must be at least 5 characters";
          isValid = false;
        }
        break;

      case "employment":
        if (!formData.employmentStatus) {
          errors.employmentStatus = "Employment status is required";
          isValid = false;
        }

        if (!formData.employmentSector) {
          errors.employmentSector = "Employment sector is required";
          isValid = false;
        }

        if (!formData.presentEmploymentStatus) {
          errors.presentEmploymentStatus =
            "Present employment status is required";
          isValid = false;
        }

        if (!formData.locationOfEmployment) {
          errors.locationOfEmployment = "Location of employment is required";
          isValid = false;
        }
        break;

      case "jobDetails":
        if (
          formData.employmentStatus === "Employed" ||
          formData.employmentStatus === "Self-Employed"
        ) {
          if (!formData.currentPosition?.trim()) {
            errors.currentPosition = "Current position is required";
            isValid = false;
          }

          if (!formData.employer?.trim()) {
            errors.employer = "Employer/Company name is required";
            isValid = false;
          }

          if (!formData.companyAddress?.trim()) {
            errors.companyAddress = "Company address is required";
            isValid = false;
          }
        }
        break;

      case "boardExam":
        if (
          formData.boardExamPassed?.trim() &&
          !formData.yearPassedBoardExam?.trim()
        ) {
          errors.yearPassedBoardExam =
            "Year passed is required when board exam is specified";
          isValid = false;
        }
        if (
          formData.yearPassedBoardExam?.trim() &&
          !/^\d{4}$/.test(formData.yearPassedBoardExam)
        ) {
          errors.yearPassedBoardExam = "Year must be 4 digits (e.g., 2023)";
          isValid = false;
        }
        break;

      case "jobRelationship":
        if (formData.isFirstJobRelatedToDegree === undefined) {
          errors.isFirstJobRelatedToDegree = "Please answer this question";
          isValid = false;
        }
        if (formData.isCurrentJobRelatedToDegree === undefined) {
          errors.isCurrentJobRelatedToDegree = "Please answer this question";
          isValid = false;
        }
        break;
    }

    if (!isValid) {
      setStepErrors((prev) => ({
        ...prev,
        [currentStep]: "Please complete all required fields",
      }));
    } else {
      setStepErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[currentStep];
        return newErrors;
      });
    }

    return isValid;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      const currentIndex = steps.findIndex((step) => step.id === currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1].id);
      }
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
      setStepErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[currentStep];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all steps before submission
    let allValid = true;
    const allErrors: Record<string, string> = {};

    // Validate each step
    steps.forEach((step) => {
      if (step.id === "review") return;

      // Simulate validation for each step
      const tempStep = currentStep;
      setCurrentStep(step.id);
      const isValid = validateCurrentStep();
      setCurrentStep(tempStep);

      if (!isValid) {
        allValid = false;
        allErrors[step.id] = "Please complete all required fields";
      }
    });

    if (!allValid) {
      setStepErrors(allErrors);
      setCurrentStep("personal"); // Go back to first step with errors
      setError("Please complete all required fields in all sections");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Convert FormData to AlumniInput
      const alumniData: AlumniInput = {
        // Personal Information
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender as any,
        civilStatus: formData.civilStatus as any,
        dateOfBirth: formData.dateOfBirth || undefined,
        placeOfBirth: formData.placeOfBirth || undefined,

        // Contact Information
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        facebookAccount: formData.facebookAccount || undefined,
        address: formData.address,

        // Academic Information
        studentId: formData.studentId || undefined,
        yearGraduated: formData.yearGraduated,
        campus: formData.campus,
        department: formData.department,
        course: formData.course,
        degree: formData.degree,

        // Employment Information
        employmentStatus: formData.employmentStatus as any,
        employmentSector: formData.employmentSector as any,
        presentEmploymentStatus: formData.presentEmploymentStatus as any,
        locationOfEmployment: formData.locationOfEmployment as any,

        // Job Details
        currentPosition: formData.currentPosition || undefined,
        employer: formData.employer || undefined,
        companyAddress: formData.companyAddress || undefined,

        // Board Exam Information
        boardExamPassed: formData.boardExamPassed || undefined,
        yearPassedBoardExam: formData.yearPassedBoardExam || undefined,
        dateEmploymentAfterBoardExam:
          formData.dateEmploymentAfterBoardExam as any,

        // Job Search Information
        jobInformationSource: formData.jobInformationSource as any,
        firstJobDuration: formData.firstJobDuration as any,

        // Job Relationship Questions
        isFirstJobRelatedToDegree: formData.isFirstJobRelatedToDegree,
        firstJobReasons: formData.firstJobReasons.filter(
          (r) => r.trim() !== "",
        ),
        isCurrentJobRelatedToDegree: formData.isCurrentJobRelatedToDegree,
        currentJobReasons: formData.currentJobReasons.filter(
          (r) => r.trim() !== "",
        ),

        // File Upload (you can add file handling separately)
        employmentProof: undefined,

        // Awards & Scholarships
        awardsRecognition: formData.awardsRecognition.filter(
          (a) => a.trim() !== "",
        ),
        scholarshipsDuringEmployment:
          formData.scholarshipsDuringEmployment.filter((s) => s.trim() !== ""),
        eligibility: formData.eligibility.filter((e) => e.trim() !== ""),

        // Preferences
        willingToMentor: formData.willingToMentor,
        receiveUpdates: formData.receiveUpdates,
        suggestions: formData.suggestions || undefined,
      };

      await createAlumni(alumniData);

      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        resetForm();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit survey. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    const hasStepError = !!stepErrors[currentStep];

    switch (currentStep) {
      case "personal":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Tell us about yourself
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {stepErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {stepErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {stepErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {stepErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {stepErrors.gender && (
                    <p className="mt-1 text-sm text-red-600">
                      {stepErrors.gender}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Civil Status *
                  </label>
                  <select
                    value={formData.civilStatus}
                    onChange={(e) =>
                      handleInputChange("civilStatus", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Civil Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                  {stepErrors.civilStatus && (
                    <p className="mt-1 text-sm text-red-600">
                      {stepErrors.civilStatus}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    value={formData.placeOfBirth}
                    onChange={(e) =>
                      handleInputChange("placeOfBirth", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Contact Information
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                How can we reach you?
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {stepErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {stepErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {stepErrors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {stepErrors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook Account (optional)
                </label>
                <input
                  type="text"
                  value={formData.facebookAccount}
                  onChange={(e) =>
                    handleInputChange("facebookAccount", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://facebook.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complete Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
                {stepErrors.address && (
                  <p className="mt-1 text-sm text-red-600">
                    {stepErrors.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "academic":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Academic Information
              </h3>
              <p className="text-sm text-gray-600 mt-1">Your CHMSU journey</p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) =>
                      handleInputChange("studentId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year Graduated *
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.yearGraduated}
                    onChange={(e) =>
                      handleInputChange("yearGraduated", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {stepErrors.yearGraduated && (
                    <p className="mt-1 text-sm text-red-600">
                      {stepErrors.yearGraduated}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campus *
                </label>
                <select
                  value={formData.campus}
                  onChange={(e) => handleInputChange("campus", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Select Campus</option>
                  {campuses.map((campus) => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name}
                    </option>
                  ))}
                </select>
                {stepErrors.campus && (
                  <p className="mt-1 text-sm text-red-600">
                    {stepErrors.campus}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.campus || departments.length === 0}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {stepErrors.department && (
                  <p className="mt-1 text-sm text-red-600">
                    {stepErrors.department}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course *
                </label>
                <select
                  value={formData.course}
                  onChange={(e) => handleInputChange("course", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.department || courses.length === 0}
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {stepErrors.course && (
                  <p className="mt-1 text-sm text-red-600">
                    {stepErrors.course}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree Earned *
                </label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => handleInputChange("degree", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Bachelor of Science in Computer Science"
                  required
                />
                {stepErrors.degree && (
                  <p className="mt-1 text-sm text-red-600">
                    {stepErrors.degree}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "employment":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Employment Information
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Your current professional status
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Status *
                </label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) =>
                    handleInputChange("employmentStatus", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Employment Status</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Never Employed">Never Employed</option>
                  <option value="Further Studies">Further Studies</option>
                </select>
                {stepErrors.employmentStatus && (
                  <p className="mt-1 text-sm text-red-600">
                    {stepErrors.employmentStatus}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Sector *
                </label>
                <select
                  value={formData.employmentSector}
                  onChange={(e) =>
                    handleInputChange("employmentSector", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Employment Sector</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Entrepreneurial">Entrepreneurial</option>
                  <option value="Freelance">Freelance</option>
                  <option value="N/A">Not Applicable</option>
                </select>
                {stepErrors.employmentSector && (
                  <p className="mt-1 text-sm text-red-600">
                    {stepErrors.employmentSector}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Present Employment Status *
                </label>
                <select
                  value={formData.presentEmploymentStatus}
                  onChange={(e) =>
                    handleInputChange("presentEmploymentStatus", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Present Employment Status</option>
                  <option value="Regular">Regular</option>
                  <option value="Probationary">Probationary</option>
                  <option value="Casual">Casual</option>
                  <option value="Others">Others</option>
                  <option value="N/A">Not Applicable</option>
                </select>
                {stepErrors.presentEmploymentStatus && (
                  <p className="mt-1 text-sm text-red-600">
                    {stepErrors.presentEmploymentStatus}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location of Employment *
                </label>
                <select
                  value={formData.locationOfEmployment}
                  onChange={(e) =>
                    handleInputChange("locationOfEmployment", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Location</option>
                  <option value="Local">Local</option>
                  <option value="Abroad">Abroad</option>
                  <option value="N/A">Not Applicable</option>
                </select>
                {stepErrors.locationOfEmployment && (
                  <p className="mt-1 text-sm text-red-600">
                    {stepErrors.locationOfEmployment}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "jobDetails":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Job Details
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Tell us about your current role
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            {formData.employmentStatus === "Employed" ||
            formData.employmentStatus === "Self-Employed" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Position/Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.currentPosition}
                    onChange={(e) =>
                      handleInputChange("currentPosition", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Software Engineer"
                    required
                  />
                  {stepErrors.currentPosition && (
                    <p className="mt-1 text-sm text-red-600">
                      {stepErrors.currentPosition}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employer/Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.employer}
                    onChange={(e) =>
                      handleInputChange("employer", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., TechCorp Inc."
                    required
                  />
                  {stepErrors.employer && (
                    <p className="mt-1 text-sm text-red-600">
                      {stepErrors.employer}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Address *
                  </label>
                  <textarea
                    value={formData.companyAddress}
                    onChange={(e) =>
                      handleInputChange("companyAddress", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Complete company address"
                    required
                  />
                  {stepErrors.companyAddress && (
                    <p className="mt-1 text-sm text-red-600">
                      {stepErrors.companyAddress}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No job details required for your employment status.
                </p>
              </div>
            )}
          </div>
        );

      case "boardExam":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Board Exam Information
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Professional licensure details
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Board Exam Passed (if any)
                </label>
                <input
                  type="text"
                  value={formData.boardExamPassed}
                  onChange={(e) =>
                    handleInputChange("boardExamPassed", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Civil Engineering Board Exam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year Passed Board Exam
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.yearPassedBoardExam}
                  onChange={(e) =>
                    handleInputChange("yearPassedBoardExam", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!formData.boardExamPassed}
                />
                {stepErrors.yearPassedBoardExam && (
                  <p className="mt-1 text-sm text-red-600">
                    {stepErrors.yearPassedBoardExam}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Employment After Board Exam
                </label>
                <select
                  value={formData.dateEmploymentAfterBoardExam}
                  onChange={(e) =>
                    handleInputChange(
                      "dateEmploymentAfterBoardExam",
                      e.target.value,
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!formData.boardExamPassed}
                >
                  <option value="">Select Timeframe</option>
                  <option value="Within one month">Within one month</option>
                  <option value="1 to 3 months">1 to 3 months</option>
                  <option value="3 to 6 months">3 to 6 months</option>
                  <option value="6 months to 1 year">6 months to 1 year</option>
                  <option value="Within 2 years">Within 2 years</option>
                  <option value="After 2 years">After 2 years</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "jobSearch":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Job Search Information
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                How you found opportunities
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How did you find information about your first job?
                </label>
                <select
                  value={formData.jobInformationSource}
                  onChange={(e) =>
                    handleInputChange("jobInformationSource", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Source</option>
                  <option value="CHMSU Career Fair">CHMSU Career Fair</option>
                  <option value="Personal">Personal (Networking)</option>
                  <option value="Other Job Fairs">Other Job Fairs</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration before getting first job
                </label>
                <select
                  value={formData.firstJobDuration}
                  onChange={(e) =>
                    handleInputChange("firstJobDuration", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Duration</option>
                  <option value="3 to 6 months">3 to 6 months</option>
                  <option value="6 months to 1 year">6 months to 1 year</option>
                  <option value="1 to 2 years">1 to 2 years</option>
                  <option value="2 years & above">2 years & above</option>
                  <option value="Currently Working">Currently Working</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "jobRelationship":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Job Relationship Questions
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Career alignment with your degree
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      id="firstJobRelated"
                      checked={formData.isFirstJobRelatedToDegree || false}
                      onChange={(e) =>
                        handleInputChange(
                          "isFirstJobRelatedToDegree",
                          e.target.checked,
                        )
                      }
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="firstJobRelated"
                      className="text-sm font-medium text-gray-700"
                    >
                      Was your first job directly related to your degree? *
                    </label>
                    {stepErrors.isFirstJobRelatedToDegree && (
                      <p className="mt-1 text-sm text-red-600">
                        {stepErrors.isFirstJobRelatedToDegree}
                      </p>
                    )}
                  </div>
                </div>

                {formData.isFirstJobRelatedToDegree !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reasons for accepting your first job:
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {jobReasonsOptions.map((reason) => (
                        <div key={reason.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`first-${reason.id}`}
                            checked={formData.firstJobReasons.includes(
                              reason.value,
                            )}
                            onChange={() =>
                              handleJobReasonToggle(reason.value, false)
                            }
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`first-${reason.id}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {reason.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      id="currentJobRelated"
                      checked={formData.isCurrentJobRelatedToDegree || false}
                      onChange={(e) =>
                        handleInputChange(
                          "isCurrentJobRelatedToDegree",
                          e.target.checked,
                        )
                      }
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="currentJobRelated"
                      className="text-sm font-medium text-gray-700"
                    >
                      Is your current job directly related to your degree? *
                    </label>
                    {stepErrors.isCurrentJobRelatedToDegree && (
                      <p className="mt-1 text-sm text-red-600">
                        {stepErrors.isCurrentJobRelatedToDegree}
                      </p>
                    )}
                  </div>
                </div>

                {formData.isCurrentJobRelatedToDegree !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reasons for accepting your current job:
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {jobReasonsOptions.map((reason) => (
                        <div key={reason.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`current-${reason.id}`}
                            checked={formData.currentJobReasons.includes(
                              reason.value,
                            )}
                            onChange={() =>
                              handleJobReasonToggle(reason.value, true)
                            }
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`current-${reason.id}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {reason.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "awards":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Awards & Scholarships
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Your achievements and recognitions
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Awards & Recognitions Received
                  </label>
                  <button
                    type="button"
                    onClick={() => addArrayField("awardsRecognition")}
                    className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Award
                  </button>
                </div>
                {formData.awardsRecognition.map((award, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={award}
                      onChange={(e) =>
                        handleArrayChange(
                          "awardsRecognition",
                          index,
                          e.target.value,
                        )
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Cum Laude, Best Thesis Award"
                    />
                    {formData.awardsRecognition.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeArrayField("awardsRecognition", index)
                        }
                        className="px-3 py-2 text-red-600 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Scholarships During Employment
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      addArrayField("scholarshipsDuringEmployment")
                    }
                    className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Scholarship
                  </button>
                </div>
                {formData.scholarshipsDuringEmployment.map(
                  (scholarship, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={scholarship}
                        onChange={(e) =>
                          handleArrayChange(
                            "scholarshipsDuringEmployment",
                            index,
                            e.target.value,
                          )
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., CHED Scholarship, Company Scholarship"
                      />
                      {formData.scholarshipsDuringEmployment.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayField(
                              "scholarshipsDuringEmployment",
                              index,
                            )
                          }
                          className="px-3 py-2 text-red-600 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ),
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Eligibility (Civil Service, PRC, etc.)
                  </label>
                  <button
                    type="button"
                    onClick={() => addArrayField("eligibility")}
                    className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Eligibility
                  </button>
                </div>
                {formData.eligibility.map((eligibility, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={eligibility}
                      onChange={(e) =>
                        handleArrayChange("eligibility", index, e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Civil Service Professional, Licensed Engineer"
                    />
                    {formData.eligibility.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField("eligibility", index)}
                        className="px-3 py-2 text-red-600 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Preferences
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Your communication preferences
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="willingToMentor"
                    checked={formData.willingToMentor}
                    onChange={(e) =>
                      handleInputChange("willingToMentor", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="willingToMentor"
                    className="text-sm font-medium text-gray-700"
                  >
                    I am willing to mentor current students
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="receiveUpdates"
                    checked={formData.receiveUpdates}
                    onChange={(e) =>
                      handleInputChange("receiveUpdates", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="receiveUpdates"
                    className="text-sm font-medium text-gray-700"
                  >
                    I want to receive updates from CHMSU
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suggestions for CHMSU improvement
                </label>
                <textarea
                  value={formData.suggestions}
                  onChange={(e) =>
                    handleInputChange("suggestions", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Your suggestions for improving CHMSU programs and services..."
                />
              </div>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Review Your Information
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Please review all details before submission
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Name:</div>
                  <div className="font-medium">
                    {formData.firstName} {formData.lastName}
                  </div>
                  <div>Gender:</div>
                  <div className="font-medium">{formData.gender}</div>
                  <div>Civil Status:</div>
                  <div className="font-medium">{formData.civilStatus}</div>
                  {formData.dateOfBirth && (
                    <>
                      <div>Date of Birth:</div>
                      <div className="font-medium">{formData.dateOfBirth}</div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-md">
                <h4 className="font-medium text-green-800 mb-2">
                  Academic Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Year Graduated:</div>
                  <div className="font-medium">{formData.yearGraduated}</div>
                  <div>Degree:</div>
                  <div className="font-medium">{formData.degree}</div>
                  {formData.studentId && (
                    <>
                      <div>Student ID:</div>
                      <div className="font-medium">{formData.studentId}</div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-md">
                <h4 className="font-medium text-purple-800 mb-2">
                  Employment Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Status:</div>
                  <div className="font-medium">{formData.employmentStatus}</div>
                  <div>Sector:</div>
                  <div className="font-medium">{formData.employmentSector}</div>
                  {formData.currentPosition && (
                    <>
                      <div>Position:</div>
                      <div className="font-medium">
                        {formData.currentPosition}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-400 mr-2" />
                    <p className="text-green-700 text-sm">
                      Survey submitted successfully!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const hasStepError = !!stepErrors[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Light backdrop instead of dark */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Alumni Survey Form
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Step {currentStepIndex + 1} of {steps.length}:{" "}
                {steps[currentStepIndex]?.label}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`text-xs font-medium flex flex-col items-center ${currentStep === step.id ? "text-blue-600" : stepErrors[step.id] ? "text-red-600" : "text-gray-500"}`}
                >
                  <div
                    className={`h-2 w-2 rounded-full mb-1 ${currentStep === step.id ? "bg-blue-600" : stepErrors[step.id] ? "bg-red-600" : "bg-gray-300"}`}
                  ></div>
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                  currentStepIndex === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {currentStepIndex === steps.length - 1 ? (
                <button
                  type="submit"
                  disabled={submitting || hasStepError}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Survey</span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-md flex items-center space-x-2 hover:bg-blue-700`}
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {currentStepIndex + 1} of {steps.length}
              </p>
              <p className="text-xs text-gray-500">
                {hasStepError ? (
                  <span className="text-red-600">
                    Please complete all required fields
                  </span>
                ) : (
                  "Fields marked with * are required"
                )}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
