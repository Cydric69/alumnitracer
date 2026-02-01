// app/actions/alumni.ts
"use server";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import Alumni, { AlumniZodSchema } from "@/models/Alumni";
// app/actions/alumni.ts - Update the AlumniFormData type
export type AlumniFormData = {
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated";
  email: string;
  phoneNumber: string;
  address: string;
  studentId?: string;
  facebookAccount?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  yearGraduated: string;
  campusId: string; // Changed to string (required)
  campusName: string; // Changed to string (required)
  departmentId: string; // Changed to string (required)
  departmentName: string; // Changed to string (required)
  courseId: string; // Changed to string (required)
  courseName: string; // Changed to string (required)
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
  currentPosition?: string;
  employer?: string;
  companyAddress?: string;
  boardExamPassed?: string;
  yearPassedBoardExam?: string;
  dateEmploymentAfterBoardExam?: string;
  jobInformationSource?: string;
  firstJobDuration?: string;
  isFirstJobRelatedToDegree?: boolean;
  firstJobReasons?: string[];
  isCurrentJobRelatedToDegree?: boolean;
  currentJobReasons?: string[];
  awardsRecognition?: string[];
  scholarshipsDuringEmployment?: string[];
  eligibility?: string[];
  willingToMentor?: boolean;
  receiveUpdates?: boolean;
  suggestions?: string;
};

export type AlumniResponse = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  civilStatus: string;
  email: string;
  phoneNumber: string;
  address: string;
  studentId?: string;
  facebookAccount?: string;
  yearGraduated: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  campus: { id: string; name: string };
  department: { id: string; name: string };
  course: { id: string; name: string };
  degree: string;
  employmentStatus: string;
  employmentSector: string;
  presentEmploymentStatus: string;
  locationOfEmployment: string;
  currentPosition?: string;
  employer?: string;
  companyAddress?: string;
  boardExamPassed?: string;
  yearPassedBoardExam?: string;
  dateEmploymentAfterBoardExam?: string;
  jobInformationSource?: string;
  firstJobDuration?: string;
  isFirstJobRelatedToDegree?: boolean;
  firstJobReasons?: string[];
  isCurrentJobRelatedToDegree?: boolean;
  currentJobReasons?: string[];
  awardsRecognition?: string[];
  scholarshipsDuringEmployment?: string[];
  eligibility?: string[];
  willingToMentor?: boolean;
  receiveUpdates?: boolean;
  suggestions?: string;
  createdAt: string;
  updatedAt: string;
};

// app/actions/alumni.ts - Update createAlumni function
export async function createAlumni(data: AlumniFormData) {
  try {
    await dbConnect();

    const validation = AlumniZodSchema.safeParse(data);
    if (!validation.success) {
      const fieldErrors = validation.error.issues.map((issue) => {
        const field = issue.path.join(".");
        return `${field}: ${issue.message}`;
      });

      return {
        success: false,
        message: "Please correct the following errors",
        errors: fieldErrors,
      };
    }

    const validated = validation.data;

    // Check for duplicate email
    const existingEmail = await Alumni.findOne({
      email: validated.email.toLowerCase().trim(),
    });
    if (existingEmail) {
      return {
        success: false,
        message: "An alumni with this email already exists",
        error: "DUPLICATE_EMAIL",
      };
    }

    // Check for duplicate student ID if provided
    if (validated.studentId) {
      const existingStudentId = await Alumni.findOne({
        studentId: validated.studentId.trim(),
      });
      if (existingStudentId) {
        return {
          success: false,
          message: "An alumni with this student ID already exists",
          error: "DUPLICATE_STUDENT_ID",
        };
      }
    }

    // Create alumni with string IDs
    const alumni = await Alumni.create(validated);
    if (!alumni) {
      return {
        success: false,
        message: "Failed to create alumni",
        error: "CREATION_FAILED",
      };
    }

    revalidatePath("/dashboard/alumni");

    return {
      success: true,
      message: "Alumni created successfully",
      data: {
        id: alumni._id.toString(),
        firstName: alumni.firstName,
        lastName: alumni.lastName,
        gender: alumni.gender,
        civilStatus: alumni.civilStatus,
        email: alumni.email,
        phoneNumber: alumni.phoneNumber,
        address: alumni.address,
        studentId: alumni.studentId,
        facebookAccount: alumni.facebookAccount,
        yearGraduated: alumni.yearGraduated,
        dateOfBirth: alumni.dateOfBirth,
        placeOfBirth: alumni.placeOfBirth,
        campus: {
          id: alumni.campusId,
          name: alumni.campusName,
        },
        department: {
          id: alumni.departmentId,
          name: alumni.departmentName,
        },
        course: {
          id: alumni.courseId,
          name: alumni.courseName,
        },
        degree: alumni.degree,
        employmentStatus: alumni.employmentStatus,
        employmentSector: alumni.employmentSector,
        presentEmploymentStatus: alumni.presentEmploymentStatus,
        locationOfEmployment: alumni.locationOfEmployment,
        currentPosition: alumni.currentPosition,
        employer: alumni.employer,
        companyAddress: alumni.companyAddress,
        boardExamPassed: alumni.boardExamPassed,
        yearPassedBoardExam: alumni.yearPassedBoardExam,
        dateEmploymentAfterBoardExam: alumni.dateEmploymentAfterBoardExam,
        jobInformationSource: alumni.jobInformationSource,
        firstJobDuration: alumni.firstJobDuration,
        isFirstJobRelatedToDegree: alumni.isFirstJobRelatedToDegree,
        firstJobReasons: alumni.firstJobReasons || [],
        isCurrentJobRelatedToDegree: alumni.isCurrentJobRelatedToDegree,
        currentJobReasons: alumni.currentJobReasons || [],
        awardsRecognition: alumni.awardsRecognition || [],
        scholarshipsDuringEmployment: alumni.scholarshipsDuringEmployment || [],
        eligibility: alumni.eligibility || [],
        willingToMentor: alumni.willingToMentor || false,
        receiveUpdates: alumni.receiveUpdates ?? true,
        suggestions: alumni.suggestions,
        createdAt: alumni.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: alumni.updatedAt?.toISOString() || new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error creating alumni:", error);
    return {
      success: false,
      message: "Failed to create alumni",
      error: error.message || "Unknown error",
    };
  }
}

export async function getAlumni() {
  try {
    await dbConnect();
    const alumni = await Alumni.find().sort({ createdAt: -1 });
    return {
      success: true,
      data: alumni.map((alum) => ({
        id: alum._id.toString(),
        firstName: alum.firstName,
        lastName: alum.lastName,
        gender: alum.gender,
        civilStatus: alum.civilStatus,
        email: alum.email,
        phoneNumber: alum.phoneNumber,
        address: alum.address,
        studentId: alum.studentId,
        facebookAccount: alum.facebookAccount,
        yearGraduated: alum.yearGraduated,
        dateOfBirth: alum.dateOfBirth,
        placeOfBirth: alum.placeOfBirth,
        campus: { id: alum.campusId, name: alum.campusName },
        department: { id: alum.departmentId, name: alum.departmentName },
        course: { id: alum.courseId, name: alum.courseName },
        degree: alum.degree,
        employmentStatus: alum.employmentStatus,
        employmentSector: alum.employmentSector,
        presentEmploymentStatus: alum.presentEmploymentStatus,
        locationOfEmployment: alum.locationOfEmployment,
        currentPosition: alum.currentPosition,
        employer: alum.employer,
        companyAddress: alum.companyAddress,
        boardExamPassed: alum.boardExamPassed,
        yearPassedBoardExam: alum.yearPassedBoardExam,
        dateEmploymentAfterBoardExam: alum.dateEmploymentAfterBoardExam,
        jobInformationSource: alum.jobInformationSource,
        firstJobDuration: alum.firstJobDuration,
        isFirstJobRelatedToDegree: alum.isFirstJobRelatedToDegree,
        firstJobReasons: alum.firstJobReasons || [],
        isCurrentJobRelatedToDegree: alum.isCurrentJobRelatedToDegree,
        currentJobReasons: alum.currentJobReasons || [],
        awardsRecognition: alum.awardsRecognition || [],
        scholarshipsDuringEmployment: alum.scholarshipsDuringEmployment || [],
        eligibility: alum.eligibility || [],
        willingToMentor: alum.willingToMentor || false,
        receiveUpdates: alum.receiveUpdates ?? true,
        suggestions: alum.suggestions,
        createdAt: alum.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: alum.updatedAt?.toISOString() || new Date().toISOString(),
      })),
    };
  } catch (error: any) {
    console.error("Error fetching alumni:", error);
    return {
      success: false,
      message: "Failed to fetch alumni",
      error: error.message,
    };
  }
}

// Update alumni
export async function updateAlumni(id: string, data: Partial<AlumniFormData>) {
  try {
    await dbConnect();
    const existingAlumni = await Alumni.findById(id);
    if (!existingAlumni) {
      return {
        success: false,
        message: "Alumni not found",
        error: "NOT_FOUND",
      };
    }
    if (data.email) {
      const existingEmail = await Alumni.findOne({
        email: data.email.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (existingEmail) {
        return {
          success: false,
          message: "An alumni with this email already exists",
          error: "DUPLICATE_EMAIL",
        };
      }
    }
    if (data.studentId) {
      const existingStudentId = await Alumni.findOne({
        studentId: data.studentId.trim(),
        _id: { $ne: id },
      });
      if (existingStudentId) {
        return {
          success: false,
          message: "An alumni with this student ID already exists",
          error: "DUPLICATE_STUDENT_ID",
        };
      }
    }

    const alumni = await Alumni.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!alumni) {
      return {
        success: false,
        message: "Failed to update alumni",
        error: "UPDATE_FAILED",
      };
    }
    revalidatePath("/dashboard/alumni");
    return {
      success: true,
      message: "Alumni updated successfully",
      data: {
        id: alumni._id.toString(),
        firstName: alumni.firstName,
        lastName: alumni.lastName,
        gender: alumni.gender,
        civilStatus: alumni.civilStatus,
        email: alumni.email,
        phoneNumber: alumni.phoneNumber,
        address: alumni.address,
        studentId: alumni.studentId,
        facebookAccount: alumni.facebookAccount,
        yearGraduated: alumni.yearGraduated,
        dateOfBirth: alumni.dateOfBirth,
        placeOfBirth: alumni.placeOfBirth,
        campus: {
          id: alumni.campusId,
          name: alumni.campusName,
        },
        department: {
          id: alumni.departmentId,
          name: alumni.departmentName,
        },
        course: {
          id: alumni.courseId,
          name: alumni.courseName,
        },
        degree: alumni.degree,
        employmentStatus: alumni.employmentStatus,
        employmentSector: alumni.employmentSector,
        presentEmploymentStatus: alumni.presentEmploymentStatus,
        locationOfEmployment: alumni.locationOfEmployment,
        currentPosition: alumni.currentPosition,
        employer: alumni.employer,
        companyAddress: alumni.companyAddress,
        boardExamPassed: alumni.boardExamPassed,
        yearPassedBoardExam: alumni.yearPassedBoardExam,
        dateEmploymentAfterBoardExam: alumni.dateEmploymentAfterBoardExam,
        jobInformationSource: alumni.jobInformationSource,
        firstJobDuration: alumni.firstJobDuration,
        isFirstJobRelatedToDegree: alumni.isFirstJobRelatedToDegree,
        firstJobReasons: alumni.firstJobReasons || [],
        isCurrentJobRelatedToDegree: alumni.isCurrentJobRelatedToDegree,
        currentJobReasons: alumni.currentJobReasons || [],
        awardsRecognition: alumni.awardsRecognition || [],
        scholarshipsDuringEmployment: alumni.scholarshipsDuringEmployment || [],
        eligibility: alumni.eligibility || [],
        willingToMentor: alumni.willingToMentor || false,
        receiveUpdates: alumni.receiveUpdates ?? true,
        suggestions: alumni.suggestions,
        createdAt: alumni.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: alumni.updatedAt?.toISOString() || new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error updating alumni:", error);
    return {
      success: false,
      message: "Failed to update alumni",
      error: error.message || "Unknown error",
    };
  }
}

// Delete alumni
export async function deleteAlumni(id: string) {
  try {
    await dbConnect();
    const alumni = await Alumni.findByIdAndDelete(id);
    if (!alumni) {
      return {
        success: false,
        message: "Alumni not found",
        error: "NOT_FOUND",
      };
    }
    revalidatePath("/dashboard/alumni");
    return {
      success: true,
      message: "Alumni deleted successfully",
      data: {
        id: alumni._id.toString(),
        name: `${alumni.firstName} ${alumni.lastName}`,
      },
    };
  } catch (error: any) {
    console.error("Error deleting alumni:", error);
    return {
      success: false,
      message: "Failed to delete alumni",
      error: error.message || "Unknown error",
    };
  }
}

// Get single alumni by ID
export async function getAlumniById(id: string) {
  try {
    await dbConnect();
    const alumni = await Alumni.findById(id);
    if (!alumni) {
      return {
        success: false,
        message: "Alumni not found",
        error: "NOT_FOUND",
      };
    }
    return {
      success: true,
      data: {
        id: alumni._id.toString(),
        firstName: alumni.firstName,
        lastName: alumni.lastName,
        gender: alumni.gender,
        civilStatus: alumni.civilStatus,
        email: alumni.email,
        phoneNumber: alumni.phoneNumber,
        address: alumni.address,
        studentId: alumni.studentId,
        facebookAccount: alumni.facebookAccount,
        yearGraduated: alumni.yearGraduated,
        dateOfBirth: alumni.dateOfBirth,
        placeOfBirth: alumni.placeOfBirth,
        campus: {
          id: alumni.campusId,
          name: alumni.campusName,
        },
        department: {
          id: alumni.departmentId,
          name: alumni.departmentName,
        },
        course: {
          id: alumni.courseId,
          name: alumni.courseName,
        },
        degree: alumni.degree,
        employmentStatus: alumni.employmentStatus,
        employmentSector: alumni.employmentSector,
        presentEmploymentStatus: alumni.presentEmploymentStatus,
        locationOfEmployment: alumni.locationOfEmployment,
        currentPosition: alumni.currentPosition,
        employer: alumni.employer,
        companyAddress: alumni.companyAddress,
        boardExamPassed: alumni.boardExamPassed,
        yearPassedBoardExam: alumni.yearPassedBoardExam,
        dateEmploymentAfterBoardExam: alumni.dateEmploymentAfterBoardExam,
        jobInformationSource: alumni.jobInformationSource,
        firstJobDuration: alumni.firstJobDuration,
        isFirstJobRelatedToDegree: alumni.isFirstJobRelatedToDegree,
        firstJobReasons: alumni.firstJobReasons || [],
        isCurrentJobRelatedToDegree: alumni.isCurrentJobRelatedToDegree,
        currentJobReasons: alumni.currentJobReasons || [],
        awardsRecognition: alumni.awardsRecognition || [],
        scholarshipsDuringEmployment: alumni.scholarshipsDuringEmployment || [],
        eligibility: alumni.eligibility || [],
        willingToMentor: alumni.willingToMentor || false,
        receiveUpdates: alumni.receiveUpdates ?? true,
        suggestions: alumni.suggestions,
        createdAt: alumni.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: alumni.updatedAt?.toISOString() || new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error fetching alumni by ID:", error);
    return {
      success: false,
      message: "Failed to fetch alumni",
      error: error.message || "Unknown error",
    };
  }
}

// Get alumni statistics
export async function getAlumniStats() {
  try {
    await dbConnect();
    const total = await Alumni.countDocuments();
    const employed = await Alumni.countDocuments({
      employmentStatus: { $in: ["Employed", "Self-Employed"] },
    });
    const uniqueCampuses = await Alumni.distinct("campusName");
    const uniqueDepartments = await Alumni.distinct("departmentName");
    return {
      success: true,
      data: {
        total,
        employed,
        campuses: uniqueCampuses.filter((c) => c != null && c.trim() !== "")
          .length,
        departments: uniqueDepartments.filter(
          (d) => d != null && d.trim() !== "",
        ).length,
      },
    };
  } catch (error: any) {
    console.error("Error fetching alumni stats:", error);
    return {
      success: false,
      message: "Failed to fetch alumni statistics",
      error: error.message || "Unknown error",
    };
  }
}

// Search alumni
export async function searchAlumni(query: string) {
  try {
    if (!query || query.trim() === "") {
      return {
        success: true,
        data: [],
      };
    }
    await dbConnect();
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
    return {
      success: true,
      data: alumni.map((alum) => ({
        id: alum._id.toString(),
        firstName: alum.firstName,
        lastName: alum.lastName,
        gender: alum.gender,
        civilStatus: alum.civilStatus,
        email: alum.email,
        phoneNumber: alum.phoneNumber,
        address: alum.address,
        studentId: alum.studentId,
        facebookAccount: alum.facebookAccount,
        yearGraduated: alum.yearGraduated,
        campus: {
          id: alum.campusId,
          name: alum.campusName,
        },
        department: {
          id: alum.departmentId,
          name: alum.departmentName,
        },
        course: {
          id: alum.courseId,
          name: alum.courseName,
        },
        degree: alum.degree,
        employmentStatus: alum.employmentStatus,
        employmentSector: alum.employmentSector,
        presentEmploymentStatus: alum.presentEmploymentStatus,
        locationOfEmployment: alum.locationOfEmployment,
      })),
    };
  } catch (error: any) {
    console.error("Error searching alumni:", error);
    return {
      success: false,
      message: "Failed to search alumni",
      error: error.message || "Unknown error",
      data: [],
    };
  }
}

// Remove getFormData function since we're using hardcoded data
// The campuses, departments, and courses are now provided by types/academic.ts

// Bulk delete alumni
export async function bulkDeleteAlumni(ids: string[]) {
  try {
    await dbConnect();
    const result = await Alumni.deleteMany({ _id: { $in: ids } });
    revalidatePath("/dashboard/alumni");
    return {
      success: true,
      message: `Successfully deleted ${result.deletedCount} alumni records`,
      data: {
        deletedCount: result.deletedCount,
      },
    };
  } catch (error: any) {
    console.error("Error bulk deleting alumni:", error);
    return {
      success: false,
      message: "Failed to bulk delete alumni",
      error: error.message || "Unknown error",
    };
  }
}
