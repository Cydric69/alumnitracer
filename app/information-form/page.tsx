"use client";

import React, { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AlumniFormData } from "@/app/actions/alumni";
import { createAlumni } from "@/app/actions/alumni";
import {
  regions,
  provinces,
  cities,
  barangays,
} from "select-philippines-address";
import { format } from "date-fns";

// Import ShadCN components
import { Button } from "@/components/ui/button";

// Import components
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import StepProgress from "@/components/landing/StepProgress";
import InformationNote from "@/components/landing/InformationNote";

// Import step components
import PersonalStep from "@/components/landing/PersonalStep";
import ContactStep from "@/components/landing/ContactStep";
import AcademicStep from "@/components/landing/AcademicStep";
import EmploymentStep from "@/components/landing/EmploymentStep";
import JobDetailsStep from "@/components/landing/JobDetailsStep";
import BoardExamStep from "@/components/landing/BoardExamStep";
import JobSearchStep from "@/components/landing/JobSearchStep";
import JobRelationshipStep from "@/components/landing/JobRelationshipStep";
import AwardsStep from "@/components/landing/AwardStep";
import PreferencesStep from "@/components/landing/PreferenceStep";
import ReviewStep from "@/components/landing/ReviewStep";

// Import types
import {
  SurveyStep,
  Region,
  Province,
  City,
  Barangay,
  FormData,
  jobReasonsOptions,
} from "@/types/landing";
import {
  campusesData,
  getAllCampuses,
  getDepartmentsByCampusId,
  getCoursesByDepartmentId,
  Campus,
  Department,
  Course,
} from "@/types/academic";

// Steps configuration
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

export default function InformationFormPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SurveyStep>("personal");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    gender: "",
    civilStatus: "",
    dateOfBirth: "",

    birthRegion: "",
    birthProvince: "",
    birthCity: "",
    birthBarangay: "",
    birthZipCode: "",

    email: "",
    phoneNumber: "",
    facebookAccount: "",

    currentRegion: "",
    currentProvince: "",
    currentCity: "",
    currentBarangay: "",
    currentStreet: "",
    currentZipCode: "",

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

    companyRegion: "",
    companyProvince: "",
    companyCity: "",
    companyBarangay: "",
    companyStreet: "",
    companyZipCode: "",

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
  const [error, setError] = useState<string | JSX.Element | null>(null);
  const [success, setSuccess] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const [dateOfBirth, setDateOfBirth] = useState<Date>();

  const formatDateNatural = (date: Date): string => {
    return format(date, "MMMM, dd, yyyy");
  };

  useEffect(() => {
    if (dateOfBirth) {
      const formattedDate = format(dateOfBirth, "yyyy-MM-dd");
      handleInputChange("dateOfBirth", formattedDate);
    } else {
      handleInputChange("dateOfBirth", "");
    }
  }, [dateOfBirth]);

  useEffect(() => {
    fetchCampuses();
    fetchRegions();
  }, []);

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
    if (formData.campus && formData.department) {
      fetchCourses(formData.campus, formData.department);
    } else {
      setCourses([]);
      setFormData((prev) => ({ ...prev, course: "" }));
    }
  }, [formData.campus, formData.department]);

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

  useEffect(() => {
    if (formData.currentCity) {
      fetchBarangays(formData.currentCity, "current");
    } else {
      setBarangayList([]);
      setFormData((prev) => ({ ...prev, currentBarangay: "" }));
    }
  }, [formData.currentCity]);

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

  useEffect(() => {
    if (formData.birthCity) {
      fetchBarangays(formData.birthCity, "birth");
    } else {
      setBirthBarangayList([]);
      setFormData((prev) => ({ ...prev, birthBarangay: "" }));
    }
  }, [formData.birthCity]);

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
      const campuses = getAllCampuses();
      setCampuses(campuses);
    } catch (err: any) {
      setError(err.message || "Failed to load campuses");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async (campusId: string) => {
    try {
      const departments = getDepartmentsByCampusId(campusId);
      setDepartments(departments);
    } catch (err: any) {
      setError(err.message || "Failed to load departments");
      setDepartments([]);
    }
  };

  const fetchCourses = async (campusId: string, departmentId: string) => {
    try {
      const departments = getDepartmentsByCampusId(campusId);
      const department = departments.find((d) => d.id === departmentId);

      if (department) {
        setCourses(department.courses);
      } else {
        setCourses([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load courses");
      setCourses([]);
    }
  };

  const fetchRegions = async () => {
    try {
      const data = await regions();
      if (Array.isArray(data)) setRegionList(data);
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
        if (type === "current") setProvinceList(data);
        else if (type === "birth") setBirthProvinceList(data);
        else if (type === "company") setCompanyProvinceList(data);
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
        if (type === "current") setCityList(data);
        else if (type === "birth") setBirthCityList(data);
        else if (type === "company") setCompanyCityList(data);
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
        if (type === "current") setBarangayList(data);
        else if (type === "birth") setBirthBarangayList(data);
        else if (type === "company") setCompanyBarangayList(data);
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

      birthRegion: "",
      birthProvince: "",
      birthCity: "",
      birthBarangay: "",
      birthZipCode: "",

      email: "",
      phoneNumber: "",
      facebookAccount: "",

      currentRegion: "",
      currentProvince: "",
      currentCity: "",
      currentBarangay: "",
      currentStreet: "",
      currentZipCode: "",

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

      companyRegion: "",
      companyProvince: "",
      companyCity: "",
      companyBarangay: "",
      companyStreet: "",
      companyZipCode: "",

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

    setDateOfBirth(undefined);
  };

  const handleInputChange = (field: string, value: any) => {
    const formDataField = field as keyof FormData;

    if (
      field === "firstName" ||
      field === "lastName" ||
      field === "currentPosition" ||
      field === "employer" ||
      field === "boardExamPassed" ||
      field === "degree"
    ) {
      if (typeof value === "string") value = value.toUpperCase();
    }

    if (field === "currentStreet" || field === "companyStreet") {
      if (typeof value === "string") value = value.toUpperCase();
    }

    if (field === "dateOfBirth" && value === "") {
      setDateOfBirth(undefined);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

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
    value = value.toUpperCase();

    setFormData((prev) => {
      const array = [...prev[field]];
      array[index] = value;
      return { ...prev, [field]: array };
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
    const currentReasons = formData[field as keyof FormData] as string[];

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
        if (!formData.firstName.trim())
          newFieldErrors.firstName = "First name is required";
        if (!formData.lastName.trim())
          newFieldErrors.lastName = "Last name is required";
        if (!formData.gender) newFieldErrors.gender = "Gender is required";
        if (!formData.civilStatus)
          newFieldErrors.civilStatus = "Civil status is required";
        break;

      case "contact":
        if (!formData.email.trim()) newFieldErrors.email = "Email is required";
        if (!/^\S+@\S+\.\S+$/.test(formData.email))
          newFieldErrors.email = "Invalid email";
        if (!formData.phoneNumber.trim())
          newFieldErrors.phoneNumber = "Phone number is required";
        if (!formData.currentRegion)
          newFieldErrors.currentRegion = "Region is required";
        if (!formData.currentProvince)
          newFieldErrors.currentProvince = "Province is required";
        if (!formData.currentCity)
          newFieldErrors.currentCity = "City is required";
        if (!formData.currentBarangay)
          newFieldErrors.currentBarangay = "Barangay is required";
        if (!formData.currentStreet?.trim())
          newFieldErrors.currentStreet = "Street is required";
        break;

      case "academic":
        if (!formData.yearGraduated.trim())
          newFieldErrors.yearGraduated = "Year graduated is required";
        if (!/^\d{4}$/.test(formData.yearGraduated))
          newFieldErrors.yearGraduated = "Must be 4 digits";
        if (!formData.campus) newFieldErrors.campus = "Campus is required";
        if (!formData.department)
          newFieldErrors.department = "Department is required";
        if (!formData.course) newFieldErrors.course = "Course is required";
        if (!formData.degree.trim())
          newFieldErrors.degree = "Degree is required";
        break;

      case "employment":
        if (!formData.employmentStatus)
          newFieldErrors.employmentStatus = "Status is required";
        if (!formData.employmentSector)
          newFieldErrors.employmentSector = "Sector is required";
        if (!formData.presentEmploymentStatus)
          newFieldErrors.presentEmploymentStatus = "Present status required";
        if (!formData.locationOfEmployment)
          newFieldErrors.locationOfEmployment = "Location required";
        break;

      case "jobDetails":
        if (["Employed", "Self-Employed"].includes(formData.employmentStatus)) {
          if (!formData.currentPosition?.trim())
            newFieldErrors.currentPosition = "Position required";
          if (!formData.employer?.trim())
            newFieldErrors.employer = "Employer required";
        }
        break;

      case "boardExam":
        if (
          formData.boardExamPassed?.trim() &&
          !formData.yearPassedBoardExam?.trim()
        )
          newFieldErrors.yearPassedBoardExam =
            "Year required if board exam entered";
        break;
    }

    if (Object.keys(newFieldErrors).length > 0) {
      isValid = false;
      setStepErrors((prev) => ({
        ...prev,
        [currentStep]: "Required fields missing",
      }));
      setFieldErrors((prev) => ({ ...prev, ...newFieldErrors }));
    } else {
      setStepErrors((prev) => {
        const n = { ...prev };
        delete n[currentStep];
        return n;
      });
      setFieldErrors((prev) => {
        const n = { ...prev };
        Object.keys(newFieldErrors).forEach((k) => delete n[k]);
        return n;
      });
    }

    return isValid;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      const idx = steps.findIndex((s) => s.id === currentStep);
      if (idx < steps.length - 1) {
        setCurrentStep(steps[idx + 1].id);
        setStepErrors((p) => {
          const n = { ...p };
          delete n[currentStep];
          return n;
        });
      }
    }
  };

  const prevStep = () => {
    const idx = steps.findIndex((s) => s.id === currentStep);
    if (idx > 0) {
      setCurrentStep(steps[idx - 1].id);
      setStepErrors((p) => {
        const n = { ...p };
        delete n[currentStep];
        return n;
      });
    }
  };

  const isFormComplete = (): { isValid: boolean; missingFields: string[] } => {
    const missing: string[] = [];

    if (!formData.firstName?.trim()) missing.push("firstName");
    if (!formData.lastName?.trim()) missing.push("lastName");
    if (!formData.gender) missing.push("gender");
    if (!formData.civilStatus) missing.push("civilStatus");

    if (!formData.email?.trim()) missing.push("email");
    if (!/^\S+@\S+\.\S+$/.test(formData.email || "")) missing.push("email");
    if (!formData.phoneNumber?.trim()) missing.push("phoneNumber");

    if (!formData.currentRegion) missing.push("currentRegion");
    if (!formData.currentProvince) missing.push("currentProvince");
    if (!formData.currentCity) missing.push("currentCity");
    if (!formData.currentBarangay) missing.push("currentBarangay");
    if (!formData.currentStreet?.trim()) missing.push("currentStreet");

    if (!formData.yearGraduated?.trim()) missing.push("yearGraduated");
    if (!formData.campus) missing.push("campus");
    if (!formData.department) missing.push("department");
    if (!formData.course) missing.push("course");
    if (!formData.degree?.trim()) missing.push("degree");

    if (!formData.employmentStatus) missing.push("employmentStatus");
    if (!formData.employmentSector) missing.push("employmentSector");
    if (!formData.presentEmploymentStatus)
      missing.push("presentEmploymentStatus");
    if (!formData.locationOfEmployment) missing.push("locationOfEmployment");

    if (["Employed", "Self-Employed"].includes(formData.employmentStatus)) {
      if (!formData.currentPosition?.trim()) missing.push("currentPosition");
      if (!formData.employer?.trim()) missing.push("employer");
    }

    return { isValid: missing.length === 0, missingFields: missing };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, missingFields } = isFormComplete();

    if (!isValid) {
      setError("Please complete all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

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

      // Get selected academic data from hardcoded structure
      const selectedCampus = campuses.find((c) => c.id === formData.campus);
      const selectedDepartment = departments.find(
        (d) => d.id === formData.department,
      );
      const selectedCourse = courses.find((c) => c.id === formData.course);

      // Use the course's degree if available, otherwise use the manually entered degree
      const finalDegree = selectedCourse?.degree || formData.degree;

      // Update the handleSubmit function in page.tsx
      const alumniData: AlumniFormData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender as "Male" | "Female" | "Other",
        civilStatus: formData.civilStatus as
          | "Single"
          | "Married"
          | "Widowed"
          | "Separated",
        dateOfBirth: formData.dateOfBirth || undefined,
        placeOfBirth,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address,
        studentId: formData.studentId || undefined,
        facebookAccount: formData.facebookAccount || undefined,
        yearGraduated: formData.yearGraduated,

        // All these fields are now REQUIRED strings
        campusId: selectedCampus?.campusId || formData.campus, // Use campus ID
        campusName: selectedCampus?.campusName || "",
        departmentId: selectedDepartment?.departmentId || formData.department, // Use department ID
        departmentName: selectedDepartment?.name || "",
        courseId: selectedCourse?.courseId || formData.course, // Use course ID
        courseName: selectedCourse?.courseName || "",

        degree: finalDegree,
        employmentStatus: formData.employmentStatus as any,
        employmentSector: formData.employmentSector as any,
        presentEmploymentStatus: formData.presentEmploymentStatus as any,
        locationOfEmployment: formData.locationOfEmployment as any,
        currentPosition: formData.currentPosition || undefined,
        employer: formData.employer || undefined,
        companyAddress,
        boardExamPassed: formData.boardExamPassed || undefined,
        yearPassedBoardExam: formData.yearPassedBoardExam || undefined,
        dateEmploymentAfterBoardExam:
          formData.dateEmploymentAfterBoardExam || undefined,
        jobInformationSource: formData.jobInformationSource || undefined,
        firstJobDuration: formData.firstJobDuration || undefined,
        isFirstJobRelatedToDegree: formData.isFirstJobRelatedToDegree,
        firstJobReasons: formData.firstJobReasons.filter((r) => r.trim()),
        isCurrentJobRelatedToDegree: formData.isCurrentJobRelatedToDegree,
        currentJobReasons: formData.currentJobReasons.filter((r) => r.trim()),
        awardsRecognition: formData.awardsRecognition.filter((a) => a.trim()),
        scholarshipsDuringEmployment:
          formData.scholarshipsDuringEmployment.filter((s) => s.trim()),
        eligibility: formData.eligibility.filter((e) => e.trim()),
        willingToMentor: formData.willingToMentor,
        receiveUpdates: formData.receiveUpdates,
        suggestions: formData.suggestions || undefined,
      };

      const result = await createAlumni(alumniData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
          resetForm();
        }, 3000);
      } else {
        if (result.error === "DUPLICATE_EMAIL") {
          setError("Email already registered.");
        } else if (result.error === "DUPLICATE_STUDENT_ID") {
          setError("Student ID already used.");
        } else if (result.errors) {
          setError(
            <div>
              <p>Please fix:</p>
              <ul>
                {result.errors.map((e: string, i: number) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>,
          );
        } else {
          setError(result.message || "Submission failed.");
        }
      }
    } catch (err: any) {
      setError("Error submitting form.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "personal":
        return (
          <PersonalStep
            formData={formData}
            handleInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            stepErrors={stepErrors}
            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}
            regionList={regionList}
            birthProvinceList={birthProvinceList}
            birthCityList={birthCityList}
            birthBarangayList={birthBarangayList}
          />
        );
      case "contact":
        return (
          <ContactStep
            formData={formData}
            handleInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            stepErrors={stepErrors}
            regionList={regionList}
            provinceList={provinceList}
            cityList={cityList}
            barangayList={barangayList}
          />
        );
      case "academic":
        return (
          <AcademicStep
            formData={formData}
            handleInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            stepErrors={stepErrors}
            campuses={campuses}
            departments={departments}
            courses={courses}
            loading={loading}
          />
        );
      case "employment":
        return (
          <EmploymentStep
            formData={formData}
            handleInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            stepErrors={stepErrors}
          />
        );
      case "jobDetails":
        return (
          <JobDetailsStep
            formData={formData}
            handleInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            stepErrors={stepErrors}
            regionList={regionList}
            companyProvinceList={companyProvinceList}
            companyCityList={companyCityList}
            companyBarangayList={companyBarangayList}
          />
        );
      case "boardExam":
        return (
          <BoardExamStep
            formData={formData}
            handleInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            stepErrors={stepErrors}
          />
        );
      case "jobSearch":
        return (
          <JobSearchStep
            formData={formData}
            handleInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            stepErrors={stepErrors}
          />
        );
      case "jobRelationship":
        return (
          <JobRelationshipStep
            formData={formData}
            handleInputChange={handleInputChange}
            handleJobReasonToggle={handleJobReasonToggle}
            fieldErrors={fieldErrors}
            stepErrors={stepErrors}
            jobReasonsOptions={jobReasonsOptions}
          />
        );
      case "awards":
        return (
          <AwardsStep
            formData={formData}
            handleArrayChange={handleArrayChange}
            addArrayField={addArrayField}
            removeArrayField={removeArrayField}
            fieldErrors={fieldErrors}
            stepErrors={stepErrors}
          />
        );
      case "preferences":
        return (
          <PreferencesStep
            formData={formData}
            handleInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            stepErrors={stepErrors}
          />
        );
      case "review":
        return (
          <ReviewStep
            formData={formData}
            dateOfBirth={dateOfBirth}
            campuses={campuses}
            departments={departments}
            courses={courses}
            formatDateNatural={formatDateNatural}
          />
        );
      default:
        return null;
    }
  };

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const hasStepError = !!stepErrors[currentStep];

  return (
    <main className="min-h-screen bg-white p-4 md:p-6 font-serif">
      <div className="max-w-6xl mx-auto">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12">
            <div className="bg-white border-none">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <h2 className="text-2xl font-bold font-['Times_New_Roman'] text-green-800">
                      Alumni Information Form
                    </h2>
                    <p className="text-gray-600 mt-1 text-base">
                      Step {currentStepIndex + 1} of {steps.length}:{" "}
                      {steps[currentStepIndex]?.description}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-gray-500">No registration required</p>
                    <p className="text-gray-500">
                      All information is confidential
                    </p>
                  </div>
                </div>
                <StepProgress
                  currentStep={currentStep}
                  steps={steps}
                  stepErrors={stepErrors}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="px-6 py-6 min-h-[50vh]">
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

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-300">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                    <Button
                      type="button"
                      onClick={prevStep}
                      disabled={currentStepIndex === 0}
                      variant="outline"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <div className="text-center max-w-md">
                      {error && (
                        <div className="bg-red-50 p-3 rounded text-red-700 text-sm">
                          {error}
                        </div>
                      )}
                      {success && (
                        <div className="bg-green-50 p-3 rounded text-green-700 text-sm">
                          Submitted successfully! Redirecting...
                        </div>
                      )}
                    </div>

                    {currentStepIndex === steps.length - 1 ? (
                      <Button type="submit" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit"}
                      </Button>
                    ) : (
                      <Button type="button" onClick={nextStep}>
                        Next <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
            <InformationNote />
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}
