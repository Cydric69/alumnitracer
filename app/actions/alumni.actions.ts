// app/actions/alumni.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import Alumni from "@/models/Alumni";
import Campus from "@/models/Campus";
import Department from "@/models/Department";
import Course from "@/models/Course";
import { AlumniInput, Alumni as AlumniType } from "@/types/alumni";

// Helper function to safely get object ID
const safeGetId = (obj: any): string => {
  if (!obj) return "";
  if (obj._id && typeof obj._id.toString === "function") {
    return obj._id.toString();
  }
  if (typeof obj.toString === "function") {
    return obj.toString();
  }
  return "";
};

// Helper function to safely get name
const safeGetName = (obj: any, fallback: string = ""): string => {
  if (!obj) return fallback;
  return obj.name || fallback;
};

// Type for internal alumni data
interface InternalAlumniData {
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated";
  email: string;
  phoneNumber: string;
  address: string;
  yearGraduated: string;
  campusId?: number; // Changed to number for custom ID
  campusName: string;
  departmentId?: number; // Changed to number for custom ID
  departmentName: string;
  courseId?: string;
  courseName: string;
  degree: string;
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
  [key: string]: any;
}

// Main function to get all alumni
export async function getAlumni(): Promise<AlumniType[]> {
  try {
    await dbConnect();

    console.log("Fetching alumni data...");

    // Fetch alumni WITHOUT population since names are stored directly
    const alumni = await Alumni.find().sort({ createdAt: -1 });

    console.log(`Successfully fetched ${alumni.length} alumni records`);

    return alumni.map((alum) => {
      // Now we use the directly stored names and custom IDs
      const alumniObj: AlumniType = {
        id: alum._id.toString(),
        firstName: alum.firstName || "",
        lastName: alum.lastName || "",
        gender: alum.gender || "",
        civilStatus: alum.civilStatus || "",
        email: alum.email || "",
        phoneNumber: alum.phoneNumber || "",
        address: alum.address || "",
        studentId: alum.studentId || "",
        facebookAccount: alum.facebookAccount || "",
        yearGraduated: alum.yearGraduated || "",
        dateOfBirth: alum.dateOfBirth || "",
        placeOfBirth: alum.placeOfBirth || "",
        // Use directly stored names and custom IDs
        campus: {
          id: alum.campusId?.toString() || "", // Custom campus ID
          name: alum.campusName || "Unknown Campus",
        },
        // Use directly stored names and custom IDs
        department: {
          id: alum.departmentId?.toString() || "", // Custom department ID
          name: alum.departmentName || "Unknown Department",
        },
        // Use directly stored names
        course: {
          id: alum.courseId?.toString() || "",
          name: alum.courseName || "Unknown Course",
        },
        degree: alum.degree || "",
        employmentStatus: alum.employmentStatus || "",
        employmentSector: alum.employmentSector || "",
        presentEmploymentStatus: alum.presentEmploymentStatus || "",
        locationOfEmployment: alum.locationOfEmployment || "",
        currentPosition: alum.currentPosition || "",
        employer: alum.employer || "",
        companyAddress: alum.companyAddress || "",
        boardExamPassed: alum.boardExamPassed || "",
        yearPassedBoardExam: alum.yearPassedBoardExam || "",
        dateEmploymentAfterBoardExam: alum.dateEmploymentAfterBoardExam || "",
        jobInformationSource: alum.jobInformationSource || "",
        firstJobDuration: alum.firstJobDuration || "",
        isFirstJobRelatedToDegree: alum.isFirstJobRelatedToDegree || false,
        firstJobReasons: alum.firstJobReasons || [],
        isCurrentJobRelatedToDegree: alum.isCurrentJobRelatedToDegree || false,
        currentJobReasons: alum.currentJobReasons || [],
        employmentProof: alum.employmentProof || "",
        awardsRecognition: alum.awardsRecognition || [],
        scholarshipsDuringEmployment: alum.scholarshipsDuringEmployment || [],
        eligibility: alum.eligibility || [],
        willingToMentor: alum.willingToMentor || false,
        receiveUpdates: alum.receiveUpdates || false,
        suggestions: alum.suggestions || "",
        createdAt: alum.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: alum.updatedAt?.toISOString() || new Date().toISOString(),
      };

      return alumniObj;
    });
  } catch (error: any) {
    console.error("Error fetching alumni:", error);
    console.error("Error stack:", error.stack);
    return [];
  }
}

// Create new alumni - UPDATED FOR CUSTOM IDS
export async function createAlumni(data: AlumniInput): Promise<AlumniType> {
  try {
    await dbConnect();

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "gender",
      "civilStatus",
      "email",
      "phoneNumber",
      "address",
      "yearGraduated",
      "campus",
      "department",
      "course",
      "degree",
      "employmentStatus",
      "employmentSector",
      "presentEmploymentStatus",
      "locationOfEmployment",
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof AlumniInput]) {
        throw new Error(`${field} is required`);
      }
    }

    // Check if email already exists
    const existingAlumni = await Alumni.findOne({
      email: data.email.toLowerCase().trim(),
    });

    if (existingAlumni) {
      throw new Error("An alumni with this email already exists");
    }

    // Check if student ID exists (if provided)
    if (data.studentId) {
      const existingStudentId = await Alumni.findOne({
        studentId: data.studentId.trim(),
      });

      if (existingStudentId) {
        throw new Error("An alumni with this student ID already exists");
      }
    }

    // Fetch names and custom IDs from references
    const [campus, department, course] = await Promise.all([
      Campus.findById(data.campus),
      Department.findById(data.department),
      Course.findById(data.course),
    ]);

    if (!campus) {
      throw new Error("Campus not found");
    }
    if (!department) {
      throw new Error("Department not found");
    }
    if (!course) {
      throw new Error("Course not found");
    }

    // Verify department belongs to campus
    if (department.campus.toString() !== data.campus) {
      throw new Error("Department does not belong to selected campus");
    }

    // Verify course belongs to department
    if (course.department.toString() !== data.department) {
      throw new Error("Course does not belong to selected department");
    }

    // Prepare data for creation with BOTH custom IDs and Names
    const alumniData: InternalAlumniData = {
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      civilStatus: data.civilStatus,
      email: data.email.toLowerCase().trim(),
      phoneNumber: data.phoneNumber,
      address: data.address,
      yearGraduated: data.yearGraduated,
      // Store custom IDs (numbers)
      campusId: campus.campusId,
      departmentId: department.departmentId,
      // Store Names fetched from references
      campusName: campus.name,
      departmentName: department.name,
      courseName: course.name,
      degree: data.degree,
      employmentStatus: data.employmentStatus,
      employmentSector: data.employmentSector,
      presentEmploymentStatus: data.presentEmploymentStatus,
      locationOfEmployment: data.locationOfEmployment,
      // Optional fields
      studentId: data.studentId?.trim(),
      facebookAccount: data.facebookAccount,
      dateOfBirth: data.dateOfBirth,
      placeOfBirth: data.placeOfBirth,
      currentPosition: data.currentPosition,
      employer: data.employer,
      companyAddress: data.companyAddress,
      boardExamPassed: data.boardExamPassed,
      yearPassedBoardExam: data.yearPassedBoardExam,
      dateEmploymentAfterBoardExam: data.dateEmploymentAfterBoardExam,
      jobInformationSource: data.jobInformationSource,
      firstJobDuration: data.firstJobDuration,
      isFirstJobRelatedToDegree: data.isFirstJobRelatedToDegree,
      isCurrentJobRelatedToDegree: data.isCurrentJobRelatedToDegree,
      employmentProof: data.employmentProof,
      willingToMentor: data.willingToMentor ?? false,
      receiveUpdates: data.receiveUpdates ?? true,
      suggestions: data.suggestions,
    };

    // Store course ID (MongoDB ObjectId)
    alumniData.courseId = data.course;

    // Clean up array fields - remove empty strings
    if (data.firstJobReasons) {
      alumniData.firstJobReasons = data.firstJobReasons.filter(
        (reason: string) => reason && reason.trim() !== "",
      );
    }
    if (data.currentJobReasons) {
      alumniData.currentJobReasons = data.currentJobReasons.filter(
        (reason: string) => reason && reason.trim() !== "",
      );
    }
    if (data.awardsRecognition) {
      alumniData.awardsRecognition = data.awardsRecognition.filter(
        (award: string) => award && award.trim() !== "",
      );
    }
    if (data.scholarshipsDuringEmployment) {
      alumniData.scholarshipsDuringEmployment =
        data.scholarshipsDuringEmployment.filter(
          (scholarship: string) => scholarship && scholarship.trim() !== "",
        );
    }
    if (data.eligibility) {
      alumniData.eligibility = data.eligibility.filter(
        (eligibility: string) => eligibility && eligibility.trim() !== "",
      );
    }

    // Create alumni
    const alumni = await Alumni.create(alumniData);

    if (!alumni) {
      throw new Error("Failed to create alumni");
    }

    revalidatePath("/dashboard/alumni");

    // Return the properly formatted data
    const alumniObj: AlumniType = {
      id: alumni._id.toString(),
      firstName: alumni.firstName,
      lastName: alumni.lastName,
      gender: alumni.gender,
      civilStatus: alumni.civilStatus,
      email: alumni.email,
      phoneNumber: alumni.phoneNumber,
      address: alumni.address,
      studentId: alumni.studentId || "",
      facebookAccount: alumni.facebookAccount || "",
      yearGraduated: alumni.yearGraduated,
      dateOfBirth: alumni.dateOfBirth || "",
      placeOfBirth: alumni.placeOfBirth || "",
      // Return as object structure with custom IDs
      campus: {
        id: alumni.campusId?.toString() || "",
        name: alumni.campusName || "Unknown Campus",
      },
      department: {
        id: alumni.departmentId?.toString() || "",
        name: alumni.departmentName || "Unknown Department",
      },
      course: {
        id: alumni.courseId?.toString() || "",
        name: alumni.courseName || "Unknown Course",
      },
      degree: alumni.degree,
      employmentStatus: alumni.employmentStatus,
      employmentSector: alumni.employmentSector,
      presentEmploymentStatus: alumni.presentEmploymentStatus,
      locationOfEmployment: alumni.locationOfEmployment,
      currentPosition: alumni.currentPosition || "",
      employer: alumni.employer || "",
      companyAddress: alumni.companyAddress || "",
      boardExamPassed: alumni.boardExamPassed || "",
      yearPassedBoardExam: alumni.yearPassedBoardExam || "",
      dateEmploymentAfterBoardExam: alumni.dateEmploymentAfterBoardExam || "",
      jobInformationSource: alumni.jobInformationSource || "",
      firstJobDuration: alumni.firstJobDuration || "",
      isFirstJobRelatedToDegree: alumni.isFirstJobRelatedToDegree || false,
      firstJobReasons: alumni.firstJobReasons || [],
      isCurrentJobRelatedToDegree: alumni.isCurrentJobRelatedToDegree || false,
      currentJobReasons: alumni.currentJobReasons || [],
      employmentProof: alumni.employmentProof || "",
      awardsRecognition: alumni.awardsRecognition || [],
      scholarshipsDuringEmployment: alumni.scholarshipsDuringEmployment || [],
      eligibility: alumni.eligibility || [],
      willingToMentor: alumni.willingToMentor || false,
      receiveUpdates: alumni.receiveUpdates || false,
      suggestions: alumni.suggestions || "",
      createdAt: alumni.createdAt.toISOString(),
      updatedAt: alumni.updatedAt.toISOString(),
    };

    return alumniObj;
  } catch (error: any) {
    console.error("Error creating alumni:", error);
    console.error("Validation errors:", error.errors);
    throw new Error(error.message || "Failed to create alumni");
  }
}

// Update alumni - UPDATED FOR CUSTOM IDS
export async function updateAlumni(
  id: string,
  data: AlumniInput,
): Promise<AlumniType> {
  try {
    await dbConnect();

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "gender",
      "civilStatus",
      "email",
      "phoneNumber",
      "address",
      "yearGraduated",
      "campus",
      "department",
      "course",
      "degree",
      "employmentStatus",
      "employmentSector",
      "presentEmploymentStatus",
      "locationOfEmployment",
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof AlumniInput]) {
        throw new Error(`${field} is required`);
      }
    }

    // Check if email already exists (excluding current alumni)
    const existingEmail = await Alumni.findOne({
      email: data.email.toLowerCase().trim(),
      _id: { $ne: id },
    });

    if (existingEmail) {
      throw new Error("An alumni with this email already exists");
    }

    // Check if student ID exists (if provided)
    if (data.studentId) {
      const existingStudentId = await Alumni.findOne({
        studentId: data.studentId.trim(),
        _id: { $ne: id },
      });

      if (existingStudentId) {
        throw new Error("An alumni with this student ID already exists");
      }
    }

    // Fetch names and custom IDs from references
    const [campus, department, course] = await Promise.all([
      Campus.findById(data.campus),
      Department.findById(data.department),
      Course.findById(data.course),
    ]);

    if (!campus) {
      throw new Error("Campus not found");
    }
    if (!department) {
      throw new Error("Department not found");
    }
    if (!course) {
      throw new Error("Course not found");
    }

    // Verify department belongs to campus
    if (department.campus.toString() !== data.campus) {
      throw new Error("Department does not belong to selected campus");
    }

    // Verify course belongs to department
    if (course.department.toString() !== data.department) {
      throw new Error("Course does not belong to selected department");
    }

    // Prepare update data with BOTH custom IDs and Names
    const updateData: InternalAlumniData = {
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      civilStatus: data.civilStatus,
      email: data.email.toLowerCase().trim(),
      phoneNumber: data.phoneNumber,
      address: data.address,
      yearGraduated: data.yearGraduated,
      // Store custom IDs (numbers)
      campusId: campus.campusId,
      departmentId: department.departmentId,
      // Store Names
      campusName: campus.name,
      departmentName: department.name,
      courseName: course.name,
      degree: data.degree,
      employmentStatus: data.employmentStatus,
      employmentSector: data.employmentSector,
      presentEmploymentStatus: data.presentEmploymentStatus,
      locationOfEmployment: data.locationOfEmployment,
      // Optional fields
      studentId: data.studentId?.trim(),
      facebookAccount: data.facebookAccount,
      dateOfBirth: data.dateOfBirth,
      placeOfBirth: data.placeOfBirth,
      currentPosition: data.currentPosition,
      employer: data.employer,
      companyAddress: data.companyAddress,
      boardExamPassed: data.boardExamPassed,
      yearPassedBoardExam: data.yearPassedBoardExam,
      dateEmploymentAfterBoardExam: data.dateEmploymentAfterBoardExam,
      jobInformationSource: data.jobInformationSource,
      firstJobDuration: data.firstJobDuration,
      isFirstJobRelatedToDegree: data.isFirstJobRelatedToDegree,
      isCurrentJobRelatedToDegree: data.isCurrentJobRelatedToDegree,
      employmentProof: data.employmentProof,
      willingToMentor: data.willingToMentor ?? false,
      receiveUpdates: data.receiveUpdates ?? true,
      suggestions: data.suggestions,
    };

    // Store course ID (MongoDB ObjectId)
    updateData.courseId = data.course;

    // Clean up array fields - remove empty strings
    if (data.firstJobReasons) {
      updateData.firstJobReasons = data.firstJobReasons.filter(
        (reason: string) => reason && reason.trim() !== "",
      );
    }
    if (data.currentJobReasons) {
      updateData.currentJobReasons = data.currentJobReasons.filter(
        (reason: string) => reason && reason.trim() !== "",
      );
    }
    if (data.awardsRecognition) {
      updateData.awardsRecognition = data.awardsRecognition.filter(
        (award: string) => award && award.trim() !== "",
      );
    }
    if (data.scholarshipsDuringEmployment) {
      updateData.scholarshipsDuringEmployment =
        data.scholarshipsDuringEmployment.filter(
          (scholarship: string) => scholarship && scholarship.trim() !== "",
        );
    }
    if (data.eligibility) {
      updateData.eligibility = data.eligibility.filter(
        (eligibility: string) => eligibility && eligibility.trim() !== "",
      );
    }

    const alumni = await Alumni.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!alumni) {
      throw new Error("Alumni not found");
    }

    revalidatePath("/dashboard/alumni");

    // Return the properly formatted data
    const alumniObj: AlumniType = {
      id: alumni._id.toString(),
      firstName: alumni.firstName,
      lastName: alumni.lastName,
      gender: alumni.gender,
      civilStatus: alumni.civilStatus,
      email: alumni.email,
      phoneNumber: alumni.phoneNumber,
      address: alumni.address,
      studentId: alumni.studentId || "",
      facebookAccount: alumni.facebookAccount || "",
      yearGraduated: alumni.yearGraduated,
      dateOfBirth: alumni.dateOfBirth || "",
      placeOfBirth: alumni.placeOfBirth || "",
      // Return as object structure with custom IDs
      campus: {
        id: alumni.campusId?.toString() || "",
        name: alumni.campusName || "Unknown Campus",
      },
      department: {
        id: alumni.departmentId?.toString() || "",
        name: alumni.departmentName || "Unknown Department",
      },
      course: {
        id: alumni.courseId?.toString() || "",
        name: alumni.courseName || "Unknown Course",
      },
      degree: alumni.degree,
      employmentStatus: alumni.employmentStatus,
      employmentSector: alumni.employmentSector,
      presentEmploymentStatus: alumni.presentEmploymentStatus,
      locationOfEmployment: alumni.locationOfEmployment,
      currentPosition: alumni.currentPosition || "",
      employer: alumni.employer || "",
      companyAddress: alumni.companyAddress || "",
      boardExamPassed: alumni.boardExamPassed || "",
      yearPassedBoardExam: alumni.yearPassedBoardExam || "",
      dateEmploymentAfterBoardExam: alumni.dateEmploymentAfterBoardExam || "",
      jobInformationSource: alumni.jobInformationSource || "",
      firstJobDuration: alumni.firstJobDuration || "",
      isFirstJobRelatedToDegree: alumni.isFirstJobRelatedToDegree || false,
      firstJobReasons: alumni.firstJobReasons || [],
      isCurrentJobRelatedToDegree: alumni.isCurrentJobRelatedToDegree || false,
      currentJobReasons: alumni.currentJobReasons || [],
      employmentProof: alumni.employmentProof || "",
      awardsRecognition: alumni.awardsRecognition || [],
      scholarshipsDuringEmployment: alumni.scholarshipsDuringEmployment || [],
      eligibility: alumni.eligibility || [],
      willingToMentor: alumni.willingToMentor || false,
      receiveUpdates: alumni.receiveUpdates || false,
      suggestions: alumni.suggestions || "",
      createdAt: alumni.createdAt.toISOString(),
      updatedAt: alumni.updatedAt.toISOString(),
    };

    return alumniObj;
  } catch (error: any) {
    console.error("Error updating alumni:", error);
    console.error("Validation errors:", error.errors);
    throw new Error(error.message || "Failed to update alumni");
  }
}

// Delete alumni - NO CHANGES NEEDED
export async function deleteAlumni(id: string) {
  try {
    await dbConnect();

    const alumni = await Alumni.findByIdAndDelete(id);

    if (!alumni) {
      throw new Error("Alumni not found");
    }

    revalidatePath("/dashboard/alumni");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting alumni:", error);
    throw new Error(error.message || "Failed to delete alumni");
  }
}

// Get single alumni by ID - UPDATED FOR CUSTOM IDS
export async function getAlumniById(id: string): Promise<AlumniType> {
  try {
    await dbConnect();

    const alumni = await Alumni.findById(id);

    if (!alumni) {
      throw new Error("Alumni not found");
    }

    // Return with directly stored names and custom IDs
    return {
      id: alumni._id.toString(),
      firstName: alumni.firstName || "",
      lastName: alumni.lastName || "",
      gender: alumni.gender || "",
      civilStatus: alumni.civilStatus || "",
      email: alumni.email || "",
      phoneNumber: alumni.phoneNumber || "",
      address: alumni.address || "",
      studentId: alumni.studentId || "",
      facebookAccount: alumni.facebookAccount || "",
      yearGraduated: alumni.yearGraduated || "",
      dateOfBirth: alumni.dateOfBirth || "",
      placeOfBirth: alumni.placeOfBirth || "",
      // Use directly stored names and custom IDs
      campus: {
        id: alumni.campusId?.toString() || "",
        name: alumni.campusName || "Unknown Campus",
      },
      department: {
        id: alumni.departmentId?.toString() || "",
        name: alumni.departmentName || "Unknown Department",
      },
      course: {
        id: alumni.courseId?.toString() || "",
        name: alumni.courseName || "Unknown Course",
      },
      degree: alumni.degree || "",
      employmentStatus: alumni.employmentStatus || "",
      employmentSector: alumni.employmentSector || "",
      presentEmploymentStatus: alumni.presentEmploymentStatus || "",
      locationOfEmployment: alumni.locationOfEmployment || "",
      currentPosition: alumni.currentPosition || "",
      employer: alumni.employer || "",
      companyAddress: alumni.companyAddress || "",
      boardExamPassed: alumni.boardExamPassed || "",
      yearPassedBoardExam: alumni.yearPassedBoardExam || "",
      dateEmploymentAfterBoardExam: alumni.dateEmploymentAfterBoardExam || "",
      jobInformationSource: alumni.jobInformationSource || "",
      firstJobDuration: alumni.firstJobDuration || "",
      isFirstJobRelatedToDegree: alumni.isFirstJobRelatedToDegree || false,
      firstJobReasons: alumni.firstJobReasons || [],
      isCurrentJobRelatedToDegree: alumni.isCurrentJobRelatedToDegree || false,
      currentJobReasons: alumni.currentJobReasons || [],
      employmentProof: alumni.employmentProof || "",
      awardsRecognition: alumni.awardsRecognition || [],
      scholarshipsDuringEmployment: alumni.scholarshipsDuringEmployment || [],
      eligibility: alumni.eligibility || [],
      willingToMentor: alumni.willingToMentor || false,
      receiveUpdates: alumni.receiveUpdates || false,
      suggestions: alumni.suggestions || "",
      createdAt: alumni.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: alumni.updatedAt?.toISOString() || new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Error fetching alumni by ID:", error);
    throw new Error(error.message || "Failed to fetch alumni");
  }
}

// Helper functions for filters - UPDATED FOR CUSTOM IDS
export async function getAlumniYears() {
  try {
    await dbConnect();
    const years = await Alumni.distinct("yearGraduated").sort({
      yearGraduated: -1,
    });
    return years
      .filter((year) => year != null && year !== "")
      .map((year) => ({
        value: year.toString(),
        label: year.toString(),
      }));
  } catch (error: any) {
    console.error("Error fetching alumni years:", error);
    return [];
  }
}

export async function getAlumniCampuses() {
  try {
    await dbConnect();

    // Get distinct campus names from alumni (directly stored names)
    const campusNames = await Alumni.distinct("campusName");

    return campusNames
      .filter((name) => name != null && name.trim() !== "")
      .sort()
      .map((name) => ({
        value: name,
        label: name,
      }));
  } catch (error: any) {
    console.error("Error fetching alumni campuses:", error);
    return [];
  }
}

export async function getAlumniDepartments() {
  try {
    await dbConnect();

    // Get distinct department names from alumni (directly stored names)
    const departmentNames = await Alumni.distinct("departmentName");

    return departmentNames
      .filter((name) => name != null && name.trim() !== "")
      .sort()
      .map((name) => ({
        value: name,
        label: name,
      }));
  } catch (error: any) {
    console.error("Error fetching alumni departments:", error);
    return [];
  }
}

// Get all campuses - UPDATED FOR CUSTOM IDS
export async function getCampuses() {
  try {
    await dbConnect();
    const campuses = await Campus.find().sort({ name: 1 });
    return campuses.map((campus) => ({
      id: campus._id.toString(),
      campusId: campus.campusId, // Custom ID
      name: campus.name,
    }));
  } catch (error: any) {
    console.error("Error fetching campuses:", error);
    throw new Error(error.message || "Failed to fetch campuses");
  }
}

// Get departments (with optional campus filter) - UPDATED FOR CUSTOM IDS
export async function getDepartments(campusId?: string) {
  try {
    await dbConnect();

    let query = {};
    if (campusId) {
      query = { campus: campusId };
    }

    const departments = await Department.find(query)
      .populate("campus", "name campusId") // Include custom ID
      .sort({ name: 1 });

    return departments.map((dept) => ({
      id: dept._id.toString(),
      departmentId: dept.departmentId, // Custom ID
      name: dept.name,
      campus: {
        id: dept.campus._id.toString(),
        campusId: dept.campus.campusId, // Campus custom ID
        name: dept.campus.name,
      },
    }));
  } catch (error: any) {
    console.error("Error fetching departments:", error);
    throw new Error(error.message || "Failed to fetch departments");
  }
}

// Get courses (with optional department filter) - NO CHANGES NEEDED
export async function getCourses(departmentId?: string) {
  try {
    await dbConnect();

    let query = {};
    if (departmentId) {
      query = { department: departmentId };
    }

    const courses = await Course.find(query)
      .populate("department", "name")
      .sort({ name: 1 });

    return courses.map((course) => ({
      id: course._id.toString(),
      name: course.name,
      department: {
        id: course.department._id.toString(),
        name: course.department.name,
      },
    }));
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    throw new Error(error.message || "Failed to fetch courses");
  }
}

// Get all form data (campuses, departments, courses) - UPDATED FOR CUSTOM IDS
export async function getFormData() {
  try {
    await dbConnect();

    const [campuses, departments, courses] = await Promise.all([
      Campus.find().sort({ name: 1 }),
      Department.find().populate("campus", "name campusId").sort({ name: 1 }),
      Course.find().populate("department", "name").sort({ name: 1 }),
    ]);

    return {
      campuses: campuses.map((campus) => ({
        id: campus._id.toString(),
        campusId: campus.campusId, // Custom ID
        name: campus.name,
      })),
      departments: departments.map((dept) => ({
        id: dept._id.toString(),
        departmentId: dept.departmentId, // Custom ID
        name: dept.name,
        campus: {
          id: dept.campus._id.toString(),
          campusId: dept.campus.campusId, // Campus custom ID
          name: dept.campus.name,
        },
      })),
      courses: courses.map((course) => ({
        id: course._id.toString(),
        name: course.name,
        department: {
          id: course.department._id.toString(),
          name: course.department.name,
        },
      })),
    };
  } catch (error: any) {
    console.error("Error fetching form data:", error);
    throw new Error(error.message || "Failed to fetch form data");
  }
}

// Search alumni - UPDATED FOR CUSTOM IDS
export async function searchAlumni(query: string): Promise<AlumniType[]> {
  try {
    if (!query || query.trim() === "") {
      return [];
    }

    await dbConnect();

    // Search alumni directly
    const alumni = await Alumni.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { studentId: { $regex: query, $options: "i" } },
        { campusName: { $regex: query, $options: "i" } },
        { departmentName: { $regex: query, $options: "i" } },
        { courseName: { $regex: query, $options: "i" } },
      ],
    }).limit(10);

    return alumni.map((alum) => {
      // Format with directly stored names and custom IDs
      return {
        id: alum._id.toString(),
        firstName: alum.firstName || "",
        lastName: alum.lastName || "",
        gender: alum.gender || "",
        civilStatus: alum.civilStatus || "",
        email: alum.email || "",
        phoneNumber: alum.phoneNumber || "",
        address: alum.address || "",
        studentId: alum.studentId || "",
        facebookAccount: alum.facebookAccount || "",
        yearGraduated: alum.yearGraduated || "",
        campus: {
          id: alum.campusId?.toString() || "",
          name: alum.campusName || "Unknown Campus",
        },
        department: {
          id: alum.departmentId?.toString() || "",
          name: alum.departmentName || "Unknown Department",
        },
        course: {
          id: alum.courseId?.toString() || "",
          name: alum.courseName || "Unknown Course",
        },
        degree: alum.degree || "",
        employmentStatus: alum.employmentStatus || "",
        employmentSector: alum.employmentSector || "",
        presentEmploymentStatus: alum.presentEmploymentStatus || "",
        locationOfEmployment: alum.locationOfEmployment || "",
        currentPosition: alum.currentPosition || "",
        employer: alum.employer || "",
        companyAddress: alum.companyAddress || "",
        boardExamPassed: alum.boardExamPassed || "",
        yearPassedBoardExam: alum.yearPassedBoardExam || "",
        dateEmploymentAfterBoardExam: alum.dateEmploymentAfterBoardExam || "",
        jobInformationSource: alum.jobInformationSource || "",
        firstJobDuration: alum.firstJobDuration || "",
        isFirstJobRelatedToDegree: alum.isFirstJobRelatedToDegree || false,
        firstJobReasons: alum.firstJobReasons || [],
        isCurrentJobRelatedToDegree: alum.isCurrentJobRelatedToDegree || false,
        currentJobReasons: alum.currentJobReasons || [],
        employmentProof: alum.employmentProof || "",
        awardsRecognition: alum.awardsRecognition || [],
        scholarshipsDuringEmployment: alum.scholarshipsDuringEmployment || [],
        eligibility: alum.eligibility || [],
        willingToMentor: alum.willingToMentor || false,
        receiveUpdates: alum.receiveUpdates || false,
        suggestions: alum.suggestions || "",
        createdAt: alum.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: alum.updatedAt?.toISOString() || new Date().toISOString(),
      };
    });
  } catch (error: any) {
    console.error("Error searching alumni:", error);
    return [];
  }
}

// Get alumni statistics - UPDATED FOR CUSTOM IDS
export async function getAlumniStats() {
  try {
    await dbConnect();

    const total = await Alumni.countDocuments();
    const employed = await Alumni.countDocuments({
      employmentStatus: { $in: ["Employed", "Self-Employed"] },
    });

    // Get unique campuses and departments using directly stored names
    const uniqueCampuses = await Alumni.distinct("campusName");
    const uniqueDepartments = await Alumni.distinct("departmentName");

    return {
      total,
      employed,
      campuses: uniqueCampuses.filter((c) => c != null && c.trim() !== "")
        .length,
      departments: uniqueDepartments.filter((d) => d != null && d.trim() !== "")
        .length,
    };
  } catch (error: any) {
    console.error("Error fetching alumni stats:", error);
    return {
      total: 0,
      employed: 0,
      campuses: 0,
      departments: 0,
    };
  }
}

// Export alumni data - UPDATED FOR CUSTOM IDS
export async function exportAlumniData(format: "csv" | "excel" = "csv") {
  try {
    await dbConnect();

    const alumni = await Alumni.find();

    // Prepare data for export
    const exportData = alumni.map((alum) => ({
      "First Name": alum.firstName || "",
      "Last Name": alum.lastName || "",
      Gender: alum.gender || "",
      "Civil Status": alum.civilStatus || "",
      Email: alum.email || "",
      "Phone Number": alum.phoneNumber || "",
      Address: alum.address || "",
      "Facebook Account": alum.facebookAccount || "",
      "Student ID": alum.studentId || "",
      "Year Graduated": alum.yearGraduated || "",
      Campus: alum.campusName || "Unknown",
      Department: alum.departmentName || "Unknown",
      Course: alum.courseName || "Unknown",
      Degree: alum.degree || "",
      "Employment Status": alum.employmentStatus || "",
      "Employment Sector": alum.employmentSector || "",
      "Present Employment Status": alum.presentEmploymentStatus || "",
      "Location of Employment": alum.locationOfEmployment || "",
      "Current Position": alum.currentPosition || "",
      Employer: alum.employer || "",
      "Company Address": alum.companyAddress || "",
      "Board Exam Passed": alum.boardExamPassed || "",
      "Year Passed Board Exam": alum.yearPassedBoardExam || "",
      "Date Employment After Board Exam":
        alum.dateEmploymentAfterBoardExam || "",
      "Job Information Source": alum.jobInformationSource || "",
      "First Job Duration": alum.firstJobDuration || "",
      "First Job Related to Degree": alum.isFirstJobRelatedToDegree
        ? "Yes"
        : "No",
      "Current Job Related to Degree": alum.isCurrentJobRelatedToDegree
        ? "Yes"
        : "No",
      "Awards & Recognition": alum.awardsRecognition?.join("; ") || "",
      "Scholarships During Employment":
        alum.scholarshipsDuringEmployment?.join("; ") || "",
      Eligibility: alum.eligibility?.join("; ") || "",
      "Willing to Mentor": alum.willingToMentor ? "Yes" : "No",
      "Receive Updates": alum.receiveUpdates ? "Yes" : "No",
      Suggestions: alum.suggestions || "",
      "Date Created": alum.createdAt?.toISOString().split("T")[0] || "",
      "Last Updated": alum.updatedAt?.toISOString().split("T")[0] || "",
    }));

    return {
      data: exportData,
      format,
      count: exportData.length,
    };
  } catch (error: any) {
    console.error("Error exporting alumni data:", error);
    throw new Error(error.message || "Failed to export alumni data");
  }
}

// Bulk delete alumni - NO CHANGES NEEDED
export async function bulkDeleteAlumni(ids: string[]) {
  try {
    await dbConnect();

    const result = await Alumni.deleteMany({ _id: { $in: ids } });

    revalidatePath("/dashboard/alumni");

    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} alumni records`,
    };
  } catch (error: any) {
    console.error("Error bulk deleting alumni:", error);
    throw new Error(error.message || "Failed to bulk delete alumni");
  }
}

// Update alumni batch - UPDATED FOR CUSTOM IDS
export async function updateAlumniBatch(
  updates: Array<{ id: string; data: Partial<AlumniInput> }>,
) {
  try {
    await dbConnect();

    const results = [];

    for (const update of updates) {
      try {
        // If campus/department/course IDs are being updated, we need to fetch their names and custom IDs
        let updateData: any = { ...update.data };

        if (
          update.data.campus ||
          update.data.department ||
          update.data.course
        ) {
          // Fetch data for any updated references
          const promises = [];

          if (update.data.campus) {
            promises.push(Campus.findById(update.data.campus));
          }
          if (update.data.department) {
            promises.push(Department.findById(update.data.department));
          }
          if (update.data.course) {
            promises.push(Course.findById(update.data.course));
          }

          const [campus, department, course] = await Promise.all(promises);

          // Add names and custom IDs to update data
          if (campus) {
            updateData = {
              ...updateData,
              campusId: campus.campusId,
              campusName: campus.name,
            };
          }
          if (department) {
            updateData = {
              ...updateData,
              departmentId: department.departmentId,
              departmentName: department.name,
            };
          }
          if (course) {
            updateData = {
              ...updateData,
              courseId: update.data.course,
              courseName: course.name,
            };
          }
        }

        const alumni = await Alumni.findByIdAndUpdate(
          update.id,
          { ...updateData, updatedAt: new Date() },
          { new: true, runValidators: true },
        );

        if (alumni) {
          results.push({
            id: alumni._id.toString(),
            success: true,
            name: `${alumni.firstName} ${alumni.lastName}`,
          });
        } else {
          results.push({
            id: update.id,
            success: false,
            error: "Alumni not found",
          });
        }
      } catch (error: any) {
        results.push({
          id: update.id,
          success: false,
          error: error.message,
        });
      }
    }

    revalidatePath("/dashboard/alumni");

    return {
      success: true,
      results,
      updatedCount: results.filter((r) => r.success).length,
      failedCount: results.filter((r) => !r.success).length,
    };
  } catch (error: any) {
    console.error("Error updating alumni batch:", error);
    throw new Error(error.message || "Failed to update alumni batch");
  }
}
