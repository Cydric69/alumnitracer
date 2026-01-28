"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  CalendarIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AlumniInput } from "@/types/alumni";
import {
  createAlumni,
  getCampuses,
  getDepartments,
  getCourses,
} from "@/app/actions/alumni.actions";
// Import the functions (not a component)
import {
  regions,
  provinces,
  cities,
  barangays,
} from "select-philippines-address";
import { format } from "date-fns";

// Import ShadCN components
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

// Address interfaces based on select-philippines-address
interface Region {
  id: string;
  psgc_code: string;
  region_name: string;
  region_code: string;
}

interface Province {
  psgc_code: string;
  province_name: string;
  province_code: string;
  region_code: string;
}

interface City {
  city_name: string;
  city_code: string;
  province_code: string;
  region_desc: string;
}

interface Barangay {
  brgy_name: string;
  brgy_code: string;
  province_code: string;
  region_code: string;
}

interface FormData {
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

export default function InformationFormPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SurveyStep>("personal");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    gender: "",
    civilStatus: "",
    dateOfBirth: "",

    // Birth Place Address
    birthRegion: "",
    birthProvince: "",
    birthCity: "",
    birthBarangay: "",
    birthZipCode: "",

    // Contact Information
    email: "",
    phoneNumber: "",
    facebookAccount: "",

    // Current Address
    currentRegion: "",
    currentProvince: "",
    currentCity: "",
    currentBarangay: "",
    currentStreet: "",
    currentZipCode: "",

    // Academic Information
    studentId: "",
    yearGraduated: "",
    campus: "",
    department: "",
    course: "",
    degree: "",

    // Employment Information
    employmentStatus: "",
    employmentSector: "",
    presentEmploymentStatus: "",
    locationOfEmployment: "",

    // Job Details
    currentPosition: "",
    employer: "",

    // Company Address
    companyRegion: "",
    companyProvince: "",
    companyCity: "",
    companyBarangay: "",
    companyStreet: "",
    companyZipCode: "",

    // Board Exam Information
    boardExamPassed: "",
    yearPassedBoardExam: "",
    dateEmploymentAfterBoardExam: "",

    // Job Search Information
    jobInformationSource: "",
    firstJobDuration: "",

    // Job Relationship Questions
    isFirstJobRelatedToDegree: undefined,
    firstJobReasons: [],
    isCurrentJobRelatedToDegree: undefined,
    currentJobReasons: [],

    // Awards & Scholarships
    awardsRecognition: [""],
    scholarshipsDuringEmployment: [""],
    eligibility: [""],

    // Preferences
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Address data states
  const [regionList, setRegionList] = useState<Region[]>([]);
  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [cityList, setCityList] = useState<City[]>([]);
  const [barangayList, setBarangayList] = useState<Barangay[]>([]);
  const [birthProvinceList, setBirthProvinceList] = useState<Province[]>([]);
  const [birthCityList, setBirthCityList] = useState<City[]>([]);
  const [birthBarangayList, setBirthBarangayList] = useState<Barangay[]>([]);
  const [companyProvinceList, setCompanyProvinceList] = useState<Province[]>(
    [],
  );
  const [companyCityList, setCompanyCityList] = useState<City[]>([]);
  const [companyBarangayList, setCompanyBarangayList] = useState<Barangay[]>(
    [],
  );

  // Date states
  const [dateOfBirth, setDateOfBirth] = useState<Date>();

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

  // Custom date formatter for natural language
  const formatDateNatural = (date: Date): string => {
    return format(date, "MMMM, dd, yyyy");
  };

  const formatDateWithDay = (date: Date): string => {
    return format(date, "MMMM, dd, EEEE, yyyy");
  };

  // Effect to sync dateOfBirth with formData
  useEffect(() => {
    if (dateOfBirth) {
      // Format date to YYYY-MM-DD for formData
      const formattedDate = format(dateOfBirth, "yyyy-MM-dd");
      handleInputChange("dateOfBirth", formattedDate);
    } else {
      handleInputChange("dateOfBirth", "");
    }
  }, [dateOfBirth]);

  // Fetch initial data
  useEffect(() => {
    fetchCampuses();
    fetchRegions();
  }, []);

  // Fetch departments when campus changes
  useEffect(() => {
    if (formData.campus) {
      fetchDepartments(formData.campus);
    } else {
      setDepartments([]);
      setCourses([]);
      setFormData((prev) => ({ ...prev, department: "", course: "" }));
    }
  }, [formData.campus]);

  // Fetch courses when department changes
  useEffect(() => {
    if (formData.department) {
      fetchCourses(formData.department);
    } else {
      setCourses([]);
      setFormData((prev) => ({ ...prev, course: "" }));
    }
  }, [formData.department]);

  // Fetch provinces when current region changes
  useEffect(() => {
    if (formData.currentRegion) {
      fetchProvinces(formData.currentRegion, "current");
    } else {
      setProvinceList([]);
      setCityList([]);
      setBarangayList([]);
      setFormData((prev) => ({
        ...prev,
        currentProvince: "",
        currentCity: "",
        currentBarangay: "",
      }));
    }
  }, [formData.currentRegion]);

  // Fetch cities when current province changes
  useEffect(() => {
    if (formData.currentProvince) {
      fetchCities(formData.currentProvince, "current");
    } else {
      setCityList([]);
      setBarangayList([]);
      setFormData((prev) => ({
        ...prev,
        currentCity: "",
        currentBarangay: "",
      }));
    }
  }, [formData.currentProvince]);

  // Fetch barangays when current city changes
  useEffect(() => {
    if (formData.currentCity) {
      fetchBarangays(formData.currentCity, "current");
    } else {
      setBarangayList([]);
      setFormData((prev) => ({ ...prev, currentBarangay: "" }));
    }
  }, [formData.currentCity]);

  // Fetch provinces when birth region changes
  useEffect(() => {
    if (formData.birthRegion) {
      fetchProvinces(formData.birthRegion, "birth");
    } else {
      setBirthProvinceList([]);
      setBirthCityList([]);
      setBirthBarangayList([]);
      setFormData((prev) => ({
        ...prev,
        birthProvince: "",
        birthCity: "",
        birthBarangay: "",
      }));
    }
  }, [formData.birthRegion]);

  // Fetch cities when birth province changes
  useEffect(() => {
    if (formData.birthProvince) {
      fetchCities(formData.birthProvince, "birth");
    } else {
      setBirthCityList([]);
      setBirthBarangayList([]);
      setFormData((prev) => ({
        ...prev,
        birthCity: "",
        birthBarangay: "",
      }));
    }
  }, [formData.birthProvince]);

  // Fetch barangays when birth city changes
  useEffect(() => {
    if (formData.birthCity) {
      fetchBarangays(formData.birthCity, "birth");
    } else {
      setBirthBarangayList([]);
      setFormData((prev) => ({ ...prev, birthBarangay: "" }));
    }
  }, [formData.birthCity]);

  // Fetch provinces when company region changes
  useEffect(() => {
    if (formData.companyRegion) {
      fetchProvinces(formData.companyRegion, "company");
    } else {
      setCompanyProvinceList([]);
      setCompanyCityList([]);
      setCompanyBarangayList([]);
      setFormData((prev) => ({
        ...prev,
        companyProvince: "",
        companyCity: "",
        companyBarangay: "",
      }));
    }
  }, [formData.companyRegion]);

  // Fetch cities when company province changes
  useEffect(() => {
    if (formData.companyProvince) {
      fetchCities(formData.companyProvince, "company");
    } else {
      setCompanyCityList([]);
      setCompanyBarangayList([]);
      setFormData((prev) => ({
        ...prev,
        companyCity: "",
        companyBarangay: "",
      }));
    }
  }, [formData.companyProvince]);

  // Fetch barangays when company city changes
  useEffect(() => {
    if (formData.companyCity) {
      fetchBarangays(formData.companyCity, "company");
    } else {
      setCompanyBarangayList([]);
      setFormData((prev) => ({ ...prev, companyBarangay: "" }));
    }
  }, [formData.companyCity]);

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

  // Address fetching functions
  const fetchRegions = async () => {
    try {
      const data = await regions();
      if (Array.isArray(data)) {
        setRegionList(data);
      } else {
        console.error("Failed to fetch regions:", data);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  const fetchProvinces = async (
    regionCode: string,
    type: "current" | "birth" | "company",
  ) => {
    try {
      const data = await provinces(regionCode);
      if (Array.isArray(data)) {
        if (type === "current") {
          setProvinceList(data);
        } else if (type === "birth") {
          setBirthProvinceList(data);
        } else if (type === "company") {
          setCompanyProvinceList(data);
        }
      } else {
        console.error("Failed to fetch provinces:", data);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchCities = async (
    provinceCode: string,
    type: "current" | "birth" | "company",
  ) => {
    try {
      const data = await cities(provinceCode);
      if (Array.isArray(data)) {
        if (type === "current") {
          setCityList(data);
        } else if (type === "birth") {
          setBirthCityList(data);
        } else if (type === "company") {
          setCompanyCityList(data);
        }
      } else {
        console.error("Failed to fetch cities:", data);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchBarangays = async (
    cityCode: string,
    type: "current" | "birth" | "company",
  ) => {
    try {
      const data = await barangays(cityCode);
      if (Array.isArray(data)) {
        if (type === "current") {
          setBarangayList(data);
        } else if (type === "birth") {
          setBirthBarangayList(data);
        } else if (type === "company") {
          setCompanyBarangayList(data);
        }
      } else {
        console.error("Failed to fetch barangays:", data);
      }
    } catch (error) {
      console.error("Error fetching barangays:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      gender: "",
      civilStatus: "",
      dateOfBirth: "",

      // Birth Place Address
      birthRegion: "",
      birthProvince: "",
      birthCity: "",
      birthBarangay: "",
      birthZipCode: "",

      // Contact Information
      email: "",
      phoneNumber: "",
      facebookAccount: "",

      // Current Address
      currentRegion: "",
      currentProvince: "",
      currentCity: "",
      currentBarangay: "",
      currentStreet: "",
      currentZipCode: "",

      // Academic Information
      studentId: "",
      yearGraduated: "",
      campus: "",
      department: "",
      course: "",
      degree: "",

      // Employment Information
      employmentStatus: "",
      employmentSector: "",
      presentEmploymentStatus: "",
      locationOfEmployment: "",

      // Job Details
      currentPosition: "",
      employer: "",

      // Company Address
      companyRegion: "",
      companyProvince: "",
      companyCity: "",
      companyBarangay: "",
      companyStreet: "",
      companyZipCode: "",

      // Board Exam Information
      boardExamPassed: "",
      yearPassedBoardExam: "",
      dateEmploymentAfterBoardExam: "",

      // Job Search Information
      jobInformationSource: "",
      firstJobDuration: "",

      // Job Relationship Questions
      isFirstJobRelatedToDegree: undefined,
      firstJobReasons: [],
      isCurrentJobRelatedToDegree: undefined,
      currentJobReasons: [],

      // Awards & Scholarships
      awardsRecognition: [""],
      scholarshipsDuringEmployment: [""],
      eligibility: [""],

      // Preferences
      willingToMentor: false,
      receiveUpdates: true,
      suggestions: "",
    });

    setDateOfBirth(undefined);
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    // Auto capitalize for name fields
    if (
      field === "firstName" ||
      field === "lastName" ||
      field === "currentPosition" ||
      field === "employer" ||
      field === "boardExamPassed" ||
      field === "degree"
    ) {
      if (typeof value === "string") {
        value = value.toUpperCase();
      }
    }

    // Auto capitalize for street fields
    if (field === "currentStreet" || field === "companyStreet") {
      if (typeof value === "string") {
        value = value.toUpperCase();
      }
    }

    // Handle date of birth separately
    if (field === "dateOfBirth" && value === "") {
      setDateOfBirth(undefined);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

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
    // Auto capitalize array fields
    value = value.toUpperCase();

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
    const newFieldErrors: Record<string, string> = {};

    switch (currentStep) {
      case "personal":
        if (!formData.firstName.trim()) {
          newFieldErrors.firstName = "First name is required";
          isValid = false;
        } else if (formData.firstName.length < 2) {
          newFieldErrors.firstName = "First name must be at least 2 characters";
          isValid = false;
        }

        if (!formData.lastName.trim()) {
          newFieldErrors.lastName = "Last name is required";
          isValid = false;
        } else if (formData.lastName.length < 2) {
          newFieldErrors.lastName = "Last name must be at least 2 characters";
          isValid = false;
        }

        if (!formData.gender) {
          newFieldErrors.gender = "Gender is required";
          isValid = false;
        }

        if (!formData.civilStatus) {
          newFieldErrors.civilStatus = "Civil status is required";
          isValid = false;
        }
        break;

      case "contact":
        if (!formData.email.trim()) {
          newFieldErrors.email = "Email is required";
          isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
          newFieldErrors.email = "Please enter a valid email address";
          isValid = false;
        }

        if (!formData.phoneNumber.trim()) {
          newFieldErrors.phoneNumber = "Phone number is required";
          isValid = false;
        } else if (formData.phoneNumber.length < 10) {
          newFieldErrors.phoneNumber =
            "Phone number must be at least 10 characters";
          isValid = false;
        }

        if (!formData.currentRegion) {
          newFieldErrors.currentRegion = "Region is required";
          isValid = false;
        }

        if (!formData.currentProvince) {
          newFieldErrors.currentProvince = "Province is required";
          isValid = false;
        }

        if (!formData.currentCity) {
          newFieldErrors.currentCity = "City/Municipality is required";
          isValid = false;
        }

        if (!formData.currentBarangay) {
          newFieldErrors.currentBarangay = "Barangay is required";
          isValid = false;
        }

        if (!formData.currentStreet?.trim()) {
          newFieldErrors.currentStreet = "Street address is required";
          isValid = false;
        }
        break;

      case "academic":
        if (!formData.yearGraduated.trim()) {
          newFieldErrors.yearGraduated = "Year graduated is required";
          isValid = false;
        } else if (!/^\d{4}$/.test(formData.yearGraduated)) {
          newFieldErrors.yearGraduated = "Year must be 4 digits (e.g., 2023)";
          isValid = false;
        }

        if (!formData.campus) {
          newFieldErrors.campus = "Campus is required";
          isValid = false;
        }

        if (!formData.department) {
          newFieldErrors.department = "Department is required";
          isValid = false;
        }

        if (!formData.course) {
          newFieldErrors.course = "Course is required";
          isValid = false;
        }

        if (!formData.degree.trim()) {
          newFieldErrors.degree = "Degree is required";
          isValid = false;
        } else if (formData.degree.length < 5) {
          newFieldErrors.degree = "Degree must be at least 5 characters";
          isValid = false;
        }
        break;

      case "employment":
        if (!formData.employmentStatus) {
          newFieldErrors.employmentStatus = "Employment status is required";
          isValid = false;
        }

        if (!formData.employmentSector) {
          newFieldErrors.employmentSector = "Employment sector is required";
          isValid = false;
        }

        if (!formData.presentEmploymentStatus) {
          newFieldErrors.presentEmploymentStatus =
            "Present employment status is required";
          isValid = false;
        }

        if (!formData.locationOfEmployment) {
          newFieldErrors.locationOfEmployment =
            "Location of employment is required";
          isValid = false;
        }
        break;

      case "jobDetails":
        if (
          formData.employmentStatus === "Employed" ||
          formData.employmentStatus === "Self-Employed"
        ) {
          if (!formData.currentPosition?.trim()) {
            newFieldErrors.currentPosition = "Current position is required";
            isValid = false;
          }

          if (!formData.employer?.trim()) {
            newFieldErrors.employer = "Employer/Company name is required";
            isValid = false;
          }

          if (!formData.companyRegion) {
            newFieldErrors.companyRegion = "Company region is required";
            isValid = false;
          }

          if (!formData.companyProvince) {
            newFieldErrors.companyProvince = "Company province is required";
            isValid = false;
          }

          if (!formData.companyCity) {
            newFieldErrors.companyCity =
              "Company city/municipality is required";
            isValid = false;
          }

          if (!formData.companyStreet?.trim()) {
            newFieldErrors.companyStreet = "Company street address is required";
            isValid = false;
          }
        }
        break;

      case "boardExam":
        if (
          formData.boardExamPassed?.trim() &&
          !formData.yearPassedBoardExam?.trim()
        ) {
          newFieldErrors.yearPassedBoardExam =
            "Year passed is required when board exam is specified";
          isValid = false;
        }
        if (
          formData.yearPassedBoardExam?.trim() &&
          !/^\d{4}$/.test(formData.yearPassedBoardExam)
        ) {
          newFieldErrors.yearPassedBoardExam =
            "Year must be 4 digits (e.g., 2023)";
          isValid = false;
        }
        break;

      case "jobSearch":
        if (formData.jobInformationSource === undefined) {
          newFieldErrors.jobInformationSource = "Please select an option";
          isValid = false;
        }
        if (formData.firstJobDuration === undefined) {
          newFieldErrors.firstJobDuration = "Please select an option";
          isValid = false;
        }
        break;

      case "jobRelationship":
        if (formData.isFirstJobRelatedToDegree === undefined) {
          newFieldErrors.isFirstJobRelatedToDegree =
            "Please answer this question";
          isValid = false;
        }
        if (formData.isCurrentJobRelatedToDegree === undefined) {
          newFieldErrors.isCurrentJobRelatedToDegree =
            "Please answer this question";
          isValid = false;
        }
        break;

      case "preferences":
        // All preferences are optional, no validation needed
        break;

      case "review":
        // No validation needed for review step
        break;
    }

    if (!isValid) {
      setStepErrors((prev) => ({
        ...prev,
        [currentStep]: "Please complete all required fields",
      }));
      setFieldErrors((prev) => ({ ...prev, ...newFieldErrors }));
    } else {
      setStepErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[currentStep];
        return newErrors;
      });
      // Clear field errors for current step
      const stepFields = Object.keys(newFieldErrors);
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        stepFields.forEach((field) => delete newErrors[field]);
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

    let allValid = true;
    const allErrors: Record<string, string> = {};

    steps.forEach((step) => {
      if (step.id === "review") return;

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
      setCurrentStep("personal");
      setError("Please complete all required fields in all sections");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Format addresses according to AlumniInput type
      const address = [
        formData.currentStreet,
        formData.currentBarangay,
        formData.currentCity,
        formData.currentProvince,
        formData.currentRegion,
        formData.currentZipCode,
      ]
        .filter(Boolean)
        .join(", ")
        .toUpperCase();

      const placeOfBirth = formData.birthRegion
        ? [
            formData.birthBarangay,
            formData.birthCity,
            formData.birthProvince,
            formData.birthRegion,
            formData.birthZipCode,
          ]
            .filter(Boolean)
            .join(", ")
            .toUpperCase()
        : undefined;

      const companyAddress = formData.companyRegion
        ? [
            formData.companyStreet,
            formData.companyBarangay,
            formData.companyCity,
            formData.companyProvince,
            formData.companyRegion,
            formData.companyZipCode,
          ]
            .filter(Boolean)
            .join(", ")
            .toUpperCase()
        : undefined;

      const alumniData = {
        // Personal Information
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender as "Male" | "Female" | "Other",
        civilStatus: formData.civilStatus as
          | "Single"
          | "Married"
          | "Widowed"
          | "Separated",
        dateOfBirth: formData.dateOfBirth || undefined,
        placeOfBirth: placeOfBirth,

        // Contact Information
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        facebookAccount: formData.facebookAccount || undefined,
        address: address,

        // Academic Information
        studentId: formData.studentId || undefined,
        yearGraduated: formData.yearGraduated,
        campus: formData.campus,
        department: formData.department,
        course: formData.course,
        degree: formData.degree,

        // Employment Information
        employmentStatus: formData.employmentStatus as
          | "Employed"
          | "Self-Employed"
          | "Unemployed"
          | "Never Employed"
          | "Further Studies",
        employmentSector: formData.employmentSector as
          | "Government"
          | "Private"
          | "Entrepreneurial"
          | "Freelance"
          | "N/A",
        presentEmploymentStatus: formData.presentEmploymentStatus as
          | "Regular"
          | "Probationary"
          | "Casual"
          | "Others"
          | "N/A",
        locationOfEmployment: formData.locationOfEmployment as
          | "Local"
          | "Abroad"
          | "N/A",

        // Job Details
        currentPosition: formData.currentPosition || undefined,
        employer: formData.employer || undefined,
        companyAddress: companyAddress,

        // Board Exam Information
        boardExamPassed: formData.boardExamPassed || undefined,
        yearPassedBoardExam: formData.yearPassedBoardExam || undefined,
        dateEmploymentAfterBoardExam: formData.dateEmploymentAfterBoardExam as
          | "Within one month"
          | "1 to 3 months"
          | "3 to 6 months"
          | "6 months to 1 year"
          | "Within 2 years"
          | "After 2 years"
          | undefined,

        // Job Search Information
        jobInformationSource: formData.jobInformationSource as
          | "CHMSU Career Fair"
          | "Personal"
          | "Other Job Fairs"
          | "None"
          | undefined,
        firstJobDuration: formData.firstJobDuration as
          | "3 to 6 months"
          | "6 months to 1 year"
          | "1 to 2 years"
          | "2 years & above"
          | "Currently Working"
          | undefined,

        // Job Relationship Questions
        isFirstJobRelatedToDegree: formData.isFirstJobRelatedToDegree,
        firstJobReasons: formData.firstJobReasons.filter(
          (r) => r.trim() !== "",
        ),
        isCurrentJobRelatedToDegree: formData.isCurrentJobRelatedToDegree,
        currentJobReasons: formData.currentJobReasons.filter(
          (r) => r.trim() !== "",
        ),

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
        router.push("/");
        resetForm();
      }, 3000);
    } catch (err: any) {
      setError(
        err.message || "Failed to submit information. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to render address selects
  const renderAddressSelects = (type: "current" | "birth" | "company") => {
    const regionField =
      type === "current"
        ? "currentRegion"
        : type === "birth"
          ? "birthRegion"
          : "companyRegion";
    const provinceField =
      type === "current"
        ? "currentProvince"
        : type === "birth"
          ? "birthProvince"
          : "companyProvince";
    const cityField =
      type === "current"
        ? "currentCity"
        : type === "birth"
          ? "birthCity"
          : "companyCity";
    const barangayField =
      type === "current"
        ? "currentBarangay"
        : type === "birth"
          ? "birthBarangay"
          : "companyBarangay";
    const zipCodeField =
      type === "current"
        ? "currentZipCode"
        : type === "birth"
          ? "birthZipCode"
          : "companyZipCode";

    const provinces =
      type === "current"
        ? provinceList
        : type === "birth"
          ? birthProvinceList
          : companyProvinceList;
    const cities =
      type === "current"
        ? cityList
        : type === "birth"
          ? birthCityList
          : companyCityList;
    const barangays =
      type === "current"
        ? barangayList
        : type === "birth"
          ? birthBarangayList
          : companyBarangayList;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region
          </label>
          <select
            value={formData[regionField] || ""}
            onChange={(e) => handleInputChange(regionField, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
            required={type === "current" || type === "company"}
          >
            <option value="">Select Region</option>
            {regionList.map((region) => (
              <option key={region.region_code} value={region.region_code}>
                {region.region_name}
              </option>
            ))}
          </select>
          {fieldErrors[regionField] && (
            <div className="mt-2 flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-sm text-red-600">{fieldErrors[regionField]}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Province
          </label>
          <select
            value={formData[provinceField] || ""}
            onChange={(e) => handleInputChange(provinceField, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
            disabled={!formData[regionField]}
            required={type === "current" || type === "company"}
          >
            <option value="">Select Province</option>
            {provinces.map((province) => (
              <option
                key={province.province_code}
                value={province.province_code}
              >
                {province.province_name}
              </option>
            ))}
          </select>
          {fieldErrors[provinceField] && (
            <div className="mt-2 flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-sm text-red-600">
                {fieldErrors[provinceField]}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City/Municipality
          </label>
          <select
            value={formData[cityField] || ""}
            onChange={(e) => handleInputChange(cityField, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
            disabled={!formData[provinceField]}
            required={type === "current" || type === "company"}
          >
            <option value="">Select City/Municipality</option>
            {cities.map((city) => (
              <option key={city.city_code} value={city.city_code}>
                {city.city_name}
              </option>
            ))}
          </select>
          {fieldErrors[cityField] && (
            <div className="mt-2 flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-sm text-red-600">{fieldErrors[cityField]}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Barangay
          </label>
          <select
            value={formData[barangayField] || ""}
            onChange={(e) => handleInputChange(barangayField, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
            disabled={!formData[cityField]}
            required={type === "current" || type === "company"}
          >
            <option value="">Select Barangay</option>
            {barangays.map((barangay) => (
              <option key={barangay.brgy_code} value={barangay.brgy_code}>
                {barangay.brgy_name}
              </option>
            ))}
          </select>
          {fieldErrors[barangayField] && (
            <div className="mt-2 flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-sm text-red-600">
                {fieldErrors[barangayField]}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zip Code
          </label>
          <input
            type="text"
            value={formData[zipCodeField] || ""}
            onChange={(e) => handleInputChange(zipCodeField, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
            placeholder="Enter Zip Code"
          />
        </div>
      </div>
    );
  };

  const renderStep = () => {
    const hasStepError = !!stepErrors[currentStep];

    switch (currentStep) {
      case "personal":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
                Personal Information
              </h3>
              <p className="text-lg text-gray-600 mt-2">
                Tell us about yourself
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg uppercase placeholder-gray-400"
                    placeholder="ENTER FIRST NAME"
                    required
                    style={{ textTransform: "uppercase" }}
                  />
                  {fieldErrors.firstName && (
                    <div className="mt-2 flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                      <p className="text-sm text-red-600">
                        {fieldErrors.firstName}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg uppercase placeholder-gray-400"
                    placeholder="ENTER LAST NAME"
                    required
                    style={{ textTransform: "uppercase" }}
                  />
                  {fieldErrors.lastName && (
                    <div className="mt-2 flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                      <p className="text-sm text-red-600">
                        {fieldErrors.lastName}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {fieldErrors.gender && (
                    <div className="mt-2 flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                      <p className="text-sm text-red-600">
                        {fieldErrors.gender}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                    Civil Status
                  </label>
                  <select
                    value={formData.civilStatus}
                    onChange={(e) =>
                      handleInputChange("civilStatus", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
                    required
                  >
                    <option value="">Select Civil Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                  {fieldErrors.civilStatus && (
                    <div className="mt-2 flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                      <p className="text-sm text-red-600">
                        {fieldErrors.civilStatus}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                    Date of Birth
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        data-empty={!dateOfBirth}
                        className={cn(
                          "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg justify-start text-left font-normal h-auto",
                          !dateOfBirth && "text-muted-foreground uppercase",
                          "bg-white hover:bg-gray-50",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfBirth ? (
                          <span className="uppercase tracking-wide">
                            {formatDateNatural(dateOfBirth)}
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            SELECT DATE OF BIRTH
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={setDateOfBirth}
                        defaultMonth={dateOfBirth}
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        captionLayout="dropdown"
                        className="font-serif"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                    Place of Birth (Optional)
                  </label>
                  <div className="space-y-3">
                    {renderAddressSelects("birth")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
                Contact Information
              </h3>
              <p className="text-lg text-gray-600 mt-2">
                How can we reach you?
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg placeholder-gray-400"
                  placeholder="YOUR.EMAIL@EXAMPLE.COM"
                  required
                />
                {fieldErrors.email && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">{fieldErrors.email}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg placeholder-gray-400"
                  placeholder="0912 345 6789"
                  required
                />
                {fieldErrors.phoneNumber && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {fieldErrors.phoneNumber}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Facebook Account (Optional)
                </label>
                <input
                  type="text"
                  value={formData.facebookAccount}
                  onChange={(e) =>
                    handleInputChange("facebookAccount", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg placeholder-gray-400"
                  placeholder="FACEBOOK.COM/USERNAME"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Complete Current Address
                </label>
                <div className="space-y-4">
                  {renderAddressSelects("current")}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address, Building, House Number
                    </label>
                    <input
                      type="text"
                      value={formData.currentStreet}
                      onChange={(e) =>
                        handleInputChange("currentStreet", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg uppercase placeholder-gray-400"
                      placeholder="STREET, BUILDING, HOUSE NUMBER"
                      required
                      style={{ textTransform: "uppercase" }}
                    />
                    {fieldErrors.currentStreet && (
                      <div className="mt-2 flex items-start">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                        <p className="text-sm text-red-600">
                          {fieldErrors.currentStreet}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "academic":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
                Academic Information
              </h3>
              <p className="text-lg text-gray-600 mt-2">Your CHMSU journey</p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                    Student ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) =>
                      handleInputChange("studentId", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg placeholder-gray-400"
                    placeholder="2019-12345"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                    Year Graduated
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.yearGraduated}
                    onChange={(e) =>
                      handleInputChange("yearGraduated", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg placeholder-gray-400"
                    placeholder="2023"
                    required
                  />
                  {fieldErrors.yearGraduated && (
                    <div className="mt-2 flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                      <p className="text-sm text-red-600">
                        {fieldErrors.yearGraduated}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Campus
                </label>
                <select
                  value={formData.campus}
                  onChange={(e) => handleInputChange("campus", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
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
                {fieldErrors.campus && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">{fieldErrors.campus}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
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
                {fieldErrors.department && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {fieldErrors.department}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Course
                </label>
                <select
                  value={formData.course}
                  onChange={(e) => handleInputChange("course", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
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
                {fieldErrors.course && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">{fieldErrors.course}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Degree Earned
                </label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => handleInputChange("degree", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg uppercase placeholder-gray-400"
                  placeholder="BACHELOR OF SCIENCE IN COMPUTER SCIENCE"
                  required
                  style={{ textTransform: "uppercase" }}
                />
                {fieldErrors.degree && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">{fieldErrors.degree}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "employment":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
                Employment Information
              </h3>
              <p className="text-lg text-gray-600 mt-2">
                Current employment status
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Employment Status
                </label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) =>
                    handleInputChange("employmentStatus", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
                  required
                >
                  <option value="">Select Employment Status</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Never Employed">Never Employed</option>
                  <option value="Further Studies">Further Studies</option>
                </select>
                {fieldErrors.employmentStatus && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {fieldErrors.employmentStatus}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Employment Sector
                </label>
                <select
                  value={formData.employmentSector}
                  onChange={(e) =>
                    handleInputChange("employmentSector", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
                  required
                >
                  <option value="">Select Employment Sector</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Entrepreneurial">Entrepreneurial</option>
                  <option value="Freelance">Freelance</option>
                  <option value="N/A">N/A</option>
                </select>
                {fieldErrors.employmentSector && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {fieldErrors.employmentSector}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Present Employment Status
                </label>
                <select
                  value={formData.presentEmploymentStatus}
                  onChange={(e) =>
                    handleInputChange("presentEmploymentStatus", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
                  required
                >
                  <option value="">Select Present Employment Status</option>
                  <option value="Regular">Regular</option>
                  <option value="Probationary">Probationary</option>
                  <option value="Casual">Casual</option>
                  <option value="Others">Others</option>
                  <option value="N/A">N/A</option>
                </select>
                {fieldErrors.presentEmploymentStatus && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {fieldErrors.presentEmploymentStatus}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Location of Employment
                </label>
                <select
                  value={formData.locationOfEmployment}
                  onChange={(e) =>
                    handleInputChange("locationOfEmployment", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
                  required
                >
                  <option value="">Select Location</option>
                  <option value="Local">Local</option>
                  <option value="Abroad">Abroad</option>
                  <option value="N/A">N/A</option>
                </select>
                {fieldErrors.locationOfEmployment && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {fieldErrors.locationOfEmployment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "jobDetails":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
                Job Details
              </h3>
              <p className="text-lg text-gray-600 mt-2">
                Current employment information
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 p-4 rounded-lg">
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
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                    Current Position
                  </label>
                  <input
                    type="text"
                    value={formData.currentPosition}
                    onChange={(e) =>
                      handleInputChange("currentPosition", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg uppercase placeholder-gray-400"
                    placeholder="E.G., SOFTWARE DEVELOPER"
                    required
                    style={{ textTransform: "uppercase" }}
                  />
                  {fieldErrors.currentPosition && (
                    <div className="mt-2 flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                      <p className="text-sm text-red-600">
                        {fieldErrors.currentPosition}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                    Employer/Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.employer}
                    onChange={(e) =>
                      handleInputChange("employer", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg uppercase placeholder-gray-400"
                    placeholder="COMPANY NAME"
                    required
                    style={{ textTransform: "uppercase" }}
                  />
                  {fieldErrors.employer && (
                    <div className="mt-2 flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                      <p className="text-sm text-red-600">
                        {fieldErrors.employer}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                    Company Address
                  </label>
                  <div className="space-y-4">
                    {renderAddressSelects("company")}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address, Building Name, Floor Number
                      </label>
                      <input
                        type="text"
                        value={formData.companyStreet}
                        onChange={(e) =>
                          handleInputChange("companyStreet", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg uppercase placeholder-gray-400"
                        placeholder="STREET, BUILDING, FLOOR NUMBER"
                        required
                        style={{ textTransform: "uppercase" }}
                      />
                      {fieldErrors.companyStreet && (
                        <div className="mt-2 flex items-start">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                          <p className="text-sm text-red-600">
                            {fieldErrors.companyStreet}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600">
                  No job details required for your selected employment status.
                </p>
              </div>
            )}
          </div>
        );

      case "boardExam":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
                Board Exam Information
              </h3>
              <p className="text-lg text-gray-600 mt-2">
                Licensure examination details
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Board Exam Passed (Optional)
                </label>
                <input
                  type="text"
                  value={formData.boardExamPassed}
                  onChange={(e) =>
                    handleInputChange("boardExamPassed", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg uppercase placeholder-gray-400"
                  placeholder="E.G., CIVIL ENGINEER"
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Year Passed Board Exam (Optional)
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.yearPassedBoardExam}
                  onChange={(e) =>
                    handleInputChange("yearPassedBoardExam", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg placeholder-gray-400"
                  placeholder="2023"
                />
                {fieldErrors.yearPassedBoardExam && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {fieldErrors.yearPassedBoardExam}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  How long did it take you to get employed after passing the
                  board exam? (Optional)
                </label>
                <select
                  value={formData.dateEmploymentAfterBoardExam}
                  onChange={(e) =>
                    handleInputChange(
                      "dateEmploymentAfterBoardExam",
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
                >
                  <option value="">Select Duration</option>
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
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
                Job Search Information
              </h3>
              <p className="text-lg text-gray-600 mt-2">
                Finding employment after graduation
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Where did you find information about your first job?
                </label>
                <select
                  value={formData.jobInformationSource}
                  onChange={(e) =>
                    handleInputChange("jobInformationSource", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
                  required
                >
                  <option value="">Select Source</option>
                  <option value="CHMSU Career Fair">CHMSU Career Fair</option>
                  <option value="Personal">Personal</option>
                  <option value="Other Job Fairs">Other Job Fairs</option>
                  <option value="None">None</option>
                </select>
                {fieldErrors.jobInformationSource && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {fieldErrors.jobInformationSource}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  How long did it take you to get your first job after
                  graduation?
                </label>
                <select
                  value={formData.firstJobDuration}
                  onChange={(e) =>
                    handleInputChange("firstJobDuration", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg"
                  required
                >
                  <option value="">Select Duration</option>
                  <option value="3 to 6 months">3 to 6 months</option>
                  <option value="6 months to 1 year">6 months to 1 year</option>
                  <option value="1 to 2 years">1 to 2 years</option>
                  <option value="2 years & above">2 years & above</option>
                  <option value="Currently Working">Currently Working</option>
                </select>
                {fieldErrors.firstJobDuration && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {fieldErrors.firstJobDuration}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "jobRelationship":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
                Job Relationship Questions
              </h3>
              <p className="text-lg text-gray-600 mt-2">
                Career alignment with your degree
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="block text-base font-medium text-gray-700 font-serif">
                  Was your first job related to your degree?
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="firstJobRelated"
                      checked={formData.isFirstJobRelatedToDegree === true}
                      onChange={() =>
                        handleInputChange("isFirstJobRelatedToDegree", true)
                      }
                      className="h-5 w-5 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="firstJobRelated"
                      checked={formData.isFirstJobRelatedToDegree === false}
                      onChange={() =>
                        handleInputChange("isFirstJobRelatedToDegree", false)
                      }
                      className="h-5 w-5 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">No</span>
                  </label>
                </div>
                {fieldErrors.isFirstJobRelatedToDegree && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {fieldErrors.isFirstJobRelatedToDegree}
                    </p>
                  </div>
                )}
              </div>

              {formData.isFirstJobRelatedToDegree !== undefined && (
                <div className="space-y-4">
                  <label className="block text-base font-medium text-gray-700 font-serif">
                    Why did you choose your first job?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {jobReasonsOptions.map((reason) => (
                      <label
                        key={reason.id}
                        className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.firstJobReasons.includes(
                            reason.value,
                          )}
                          onChange={() =>
                            handleJobReasonToggle(reason.value, false)
                          }
                          className="h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-700">{reason.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-base font-medium text-gray-700 font-serif">
                  Is your current job related to your degree?
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="currentJobRelated"
                      checked={formData.isCurrentJobRelatedToDegree === true}
                      onChange={() =>
                        handleInputChange("isCurrentJobRelatedToDegree", true)
                      }
                      className="h-5 w-5 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="currentJobRelated"
                      checked={formData.isCurrentJobRelatedToDegree === false}
                      onChange={() =>
                        handleInputChange("isCurrentJobRelatedToDegree", false)
                      }
                      className="h-5 w-5 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">No</span>
                  </label>
                </div>
                {fieldErrors.isCurrentJobRelatedToDegree && (
                  <div className="mt-2 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {fieldErrors.isCurrentJobRelatedToDegree}
                    </p>
                  </div>
                )}
              </div>

              {formData.isCurrentJobRelatedToDegree !== undefined && (
                <div className="space-y-4">
                  <label className="block text-base font-medium text-gray-700 font-serif">
                    Why did you choose your current job?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {jobReasonsOptions.map((reason) => (
                      <label
                        key={reason.id}
                        className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.currentJobReasons.includes(
                            reason.value,
                          )}
                          onChange={() =>
                            handleJobReasonToggle(reason.value, true)
                          }
                          className="h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-700">{reason.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "awards":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
                Awards & Scholarships
              </h3>
              <p className="text-lg text-gray-600 mt-2">
                Your achievements and recognitions
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-base font-medium text-gray-700 font-serif">
                    Awards and Recognition Received (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => addArrayField("awardsRecognition")}
                    className="flex items-center space-x-2 text-green-700 hover:text-green-800"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Add Award</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.awardsRecognition.map((award, index) => (
                    <div key={index} className="flex items-center space-x-3">
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
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg uppercase placeholder-gray-400"
                        placeholder="AWARD NAME"
                        style={{ textTransform: "uppercase" }}
                      />
                      {formData.awardsRecognition.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayField("awardsRecognition", index)
                          }
                          className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-base font-medium text-gray-700 font-serif">
                    Scholarships During Employment (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      addArrayField("scholarshipsDuringEmployment")
                    }
                    className="flex items-center space-x-2 text-green-700 hover:text-green-800"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Add Scholarship</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.scholarshipsDuringEmployment.map(
                    (scholarship, index) => (
                      <div key={index} className="flex items-center space-x-3">
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
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg uppercase placeholder-gray-400"
                          placeholder="SCHOLARSHIP NAME"
                          style={{ textTransform: "uppercase" }}
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
                            className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-base font-medium text-gray-700 font-serif">
                    Eligibility (e.g., CSC, RA 1080) (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => addArrayField("eligibility")}
                    className="flex items-center space-x-2 text-green-700 hover:text-green-800"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Add Eligibility</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.eligibility.map((eligibility, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={eligibility}
                        onChange={(e) =>
                          handleArrayChange(
                            "eligibility",
                            index,
                            e.target.value,
                          )
                        }
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg uppercase placeholder-gray-400"
                        placeholder="ELIGIBILITY (E.G., CSC PROFESSIONAL)"
                        style={{ textTransform: "uppercase" }}
                      />
                      {formData.eligibility.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField("eligibility", index)}
                          className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
                Preferences
              </h3>
              <p className="text-lg text-gray-600 mt-2">
                Communication and involvement preferences
              </p>
            </div>

            {hasStepError && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">
                    {stepErrors[currentStep]}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700 font-serif">
                    Are you willing to mentor current CHMSU students?
                  </p>
                  <p className="text-sm text-gray-500">
                    Share your expertise and experience
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.willingToMentor}
                    onChange={(e) =>
                      handleInputChange("willingToMentor", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700 font-serif">
                    Receive updates and announcements from CHMSU
                  </p>
                  <p className="text-sm text-gray-500">
                    Stay connected with your alma mater
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.receiveUpdates}
                    onChange={(e) =>
                      handleInputChange("receiveUpdates", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2 font-serif">
                  Suggestions for CHMSU (Optional)
                </label>
                <textarea
                  value={formData.suggestions}
                  onChange={(e) =>
                    handleInputChange("suggestions", e.target.value)
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-serif text-lg resize-none placeholder-gray-400"
                  placeholder="Your suggestions for improvement..."
                />
              </div>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
                Review Your Information
              </h3>
              <p className="text-lg text-gray-600 mt-2">
                Please review all information before submitting
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-green-800 mb-4 font-serif">
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">First Name</p>
                    <p className="font-medium">{formData.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Name</p>
                    <p className="font-medium">{formData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">{formData.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Civil Status</p>
                    <p className="font-medium">{formData.civilStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">
                      {dateOfBirth
                        ? formatDateNatural(dateOfBirth)
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-green-800 mb-4 font-serif">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{formData.phoneNumber}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">
                      {formData.currentStreet || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-green-800 mb-4 font-serif">
                  Academic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Year Graduated</p>
                    <p className="font-medium">{formData.yearGraduated}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Campus</p>
                    <p className="font-medium">
                      {campuses.find((c) => c.id === formData.campus)?.name ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium">
                      {courses.find((c) => c.id === formData.course)?.name ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Degree Earned</p>
                    <p className="font-medium">{formData.degree}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-green-800 mb-4 font-serif">
                  Employment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Employment Status</p>
                    <p className="font-medium">{formData.employmentStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Employment Sector</p>
                    <p className="font-medium">{formData.employmentSector}</p>
                  </div>
                  {(formData.employmentStatus === "Employed" ||
                    formData.employmentStatus === "Self-Employed") && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">
                          Current Position
                        </p>
                        <p className="font-medium">
                          {formData.currentPosition}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Employer</p>
                        <p className="font-medium">{formData.employer}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-green-800 mb-4 font-serif">
                  Preferences
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Willing to Mentor</p>
                    <p className="font-medium">
                      {formData.willingToMentor ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Receive Updates</p>
                    <p className="font-medium">
                      {formData.receiveUpdates ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  <p className="text-yellow-700 text-sm font-serif">
                    By submitting this form, you confirm that all information
                    provided is accurate to the best of your knowledge.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
                {steps.find((s) => s.id === currentStep)?.description}
              </h3>
              <p className="text-lg text-gray-600 mt-2">
                Please complete this section
              </p>
            </div>
          </div>
        );
    }
  };

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const hasStepError = !!stepErrors[currentStep];

  return (
    <main className="min-h-screen bg-white p-4 md:p-6 font-serif">
      {/* Newspaper Masthead without Navigation Links */}
      <div className="max-w-7xl mx-auto border-b-4 border-black pb-6 mb-8">
        <div className="text-center mb-6">
          <h1 className="text-7xl md:text-8xl font-['Manufacturing_Consent'] tracking-relaxed text-green-800 mb-2">
            CHMSU Alumni Registry
          </h1>

          {/* Date Display Only - No Navigation */}
          <div className="text-sm uppercase tracking-widest border-t border-b border-black py-3">
            <div className="text-gray-700 text-center">
              <span className="text-xs md:text-sm">
                {formatDateWithDay(new Date())}
              </span>
            </div>
          </div>
        </div>

        {/* Main Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Column - Full Width */}
          <div className="lg:col-span-12">
            <div className="bg-white border-2 border-gray-300 rounded-lg">
              {/* Form Header */}
              <div className="px-8 py-6 bg-gray-50 border-b border-gray-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
                      Alumni Information Form
                    </h2>
                    <p className="text-gray-600 mt-1 text-lg">
                      Step {currentStepIndex + 1} of {steps.length}:{" "}
                      {steps[currentStepIndex]?.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      No registration required
                    </p>
                    <p className="text-sm text-gray-500">
                      All information is confidential
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-green-800"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between mt-4">
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`text-sm font-medium flex flex-col items-center ${currentStep === step.id ? "text-green-800 font-bold" : stepErrors[step.id] ? "text-red-600" : "text-gray-500"}`}
                      >
                        <div
                          className={`h-2 w-2 rounded-full mb-2 ${currentStep === step.id ? "bg-green-800" : stepErrors[step.id] ? "bg-red-600" : "bg-gray-300"}`}
                        ></div>
                        <span className="text-center text-xs md:text-sm">
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit}>
                <div className="px-8 py-8 min-h-[60vh]">
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

                {/* Form Footer */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-300">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={currentStepIndex === 0}
                      className={`px-8 py-3 flex items-center space-x-3 rounded-lg font-serif text-lg transition-all duration-200 ${
                        currentStepIndex === 0
                          ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                      <span className="font-bold">Previous</span>
                    </button>

                    <div className="text-center">
                      {error && (
                        <div className="mb-4 bg-red-50 p-4 rounded-lg">
                          <div className="flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                            <p className="text-red-700 text-sm font-serif">
                              {error}
                            </p>
                          </div>
                        </div>
                      )}
                      {success && (
                        <div className="mb-4 bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-400 mr-2" />
                            <p className="text-green-700 text-sm font-serif">
                              Information submitted successfully! Redirecting to
                              homepage...
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {currentStepIndex === steps.length - 1 ? (
                      <button
                        type="submit"
                        disabled={submitting || hasStepError}
                        className="px-10 py-3 bg-green-800 text-white hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 rounded-lg font-serif text-lg transition-all duration-200"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="font-bold">Submitting...</span>
                          </>
                        ) : (
                          <span className="font-bold">Submit Information</span>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={nextStep}
                        className={`px-10 py-3 bg-green-800 text-white flex items-center space-x-3 rounded-lg font-serif text-lg hover:bg-green-900 transition-all duration-200`}
                      >
                        <span className="font-bold">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-2">
                    <p className="text-sm text-gray-600">
                      Step {currentStepIndex + 1} of {steps.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      {hasStepError ? (
                        <span className="text-red-600 font-bold">
                          Please complete all required fields
                        </span>
                      ) : (
                        "All fields are required unless specified"
                      )}
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Information Note */}
            <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-300">
              <h3 className="text-xl font-bold font-['Times_New_Roman'] text-green-800 mb-3">
                Important Information
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>All information is protected under the Data Privacy Act</li>
                <li>No registration or login required</li>
                <li>
                  Your information will only be used for alumni communications
                </li>
                <li>
                  You can update your information anytime by submitting again
                </li>
                <li>For questions, contact: alumni@chmsu.edu.ph</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="mt-12 pt-6 border-t-4 border-black text-center text-sm text-gray-600">
          <p className="font-bold">
            CHMSU ALUMNI RELATIONS OFFICE • CONNECTING GRADUATES SINCE 1946
          </p>
          <p className="mt-2">
            Carlos Hilado Memorial State University • Talisay, Negros
            Occidental, Philippines
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 md:gap-6">
            <a
              href="/"
              className="hover:text-black transition-colors font-medium"
            >
              Back to Home
            </a>
            <a
              href="mailto:alumni@chmsu.edu.ph"
              className="hover:text-black transition-colors font-medium"
            >
              Email: alumni@chmsu.edu.ph
            </a>
          </div>
          <div className="mt-4">
            <p className="text-xs">
              Contact Alumni Office: (034) 495-0000 | Email: alumni@chmsu.edu.ph
            </p>
            <p className="text-xs mt-2">
              © 2026 CHMSU Alumni Information Registry System. All rights
              reserved.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
