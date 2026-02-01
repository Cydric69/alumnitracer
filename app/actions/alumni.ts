// app/actions/alumni.ts
"use server";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import Alumni, { AlumniZodSchema } from "@/models/Alumni";
import Campus from "@/models/Campus";
import Department from "@/models/Department";
import Course from "@/models/Course";
import mongoose, { Types } from "mongoose";

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
  campusId?: string;
  campusName?: string;
  departmentId?: string;
  departmentName?: string;
  courseId?: string;
  courseName?: string;
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
  employmentProof?: string;
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
  campus: { id?: string; name: string };
  department: { id?: string; name: string };
  course: { id?: string; name: string };
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
  employmentProof?: string;
  awardsRecognition?: string[];
  scholarshipsDuringEmployment?: string[];
  eligibility?: string[];
  willingToMentor?: boolean;
  receiveUpdates?: boolean;
  suggestions?: string;
  createdAt: string;
  updatedAt: string;
};

const toObjectId = (id: string | undefined): Types.ObjectId | undefined => {
  if (!id || id.trim() === "") return undefined;
  try {
    return new Types.ObjectId(id.trim());
  } catch {
    return undefined;
  }
};

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

    // Convert ObjectId → string to match AlumniFormData
    const alumniInput: AlumniFormData = {
      ...validated,
      campusId: validated.campusId ? validated.campusId.toString() : undefined,
      departmentId: validated.departmentId
        ? validated.departmentId.toString()
        : undefined,
      courseId: validated.courseId ? validated.courseId.toString() : undefined,
    };

    const existingEmail = await Alumni.findOne({
      email: alumniInput.email.toLowerCase().trim(),
    });
    if (existingEmail) {
      return {
        success: false,
        message: "An alumni with this email already exists",
        error: "DUPLICATE_EMAIL",
      };
    }

    if (alumniInput.studentId) {
      const existingStudentId = await Alumni.findOne({
        studentId: alumniInput.studentId.trim(),
      });
      if (existingStudentId) {
        return {
          success: false,
          message: "An alumni with this student ID already exists",
          error: "DUPLICATE_STUDENT_ID",
        };
      }
    }

    const campusId = toObjectId(alumniInput.campusId);
    const departmentId = toObjectId(alumniInput.departmentId);
    const courseId = toObjectId(alumniInput.courseId);

    let campusName = alumniInput.campusName || "";
    let departmentName = alumniInput.departmentName || "";
    let courseName = alumniInput.courseName || "";

    if (campusId) {
      const campus = await Campus.findById(campusId);
      if (campus) campusName = campus.campusName || campusName;
    }

    if (departmentId) {
      const department = await Department.findById(departmentId);
      if (department) departmentName = department.name || departmentName;
    }

    if (courseId) {
      const course = await Course.findById(courseId);
      if (course) courseName = course.courseName || courseName;
    }

    const finalData = {
      ...alumniInput,
      campusId,
      departmentId,
      courseId,
      campusName,
      departmentName,
      courseName,
    };

    const alumni = await Alumni.create(finalData);
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
          id: alumni.campusId?.toString(),
          name: alumni.campusName,
        },
        department: {
          id: alumni.departmentId?.toString(),
          name: alumni.departmentName,
        },
        course: {
          id: alumni.courseId?.toString(),
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
        employmentProof: alumni.employmentProof,
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

// ─────────────────────────────────────────────────────────────
// Remaining functions (getAlumni, updateAlumni, etc.) unchanged
// ─────────────────────────────────────────────────────────────

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
        campus: { id: alum.campusId?.toString(), name: alum.campusName },
        department: {
          id: alum.departmentId?.toString(),
          name: alum.departmentName,
        },
        course: { id: alum.courseId?.toString(), name: alum.courseName },
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
        employmentProof: alum.employmentProof,
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
    const campusId = data.campusId ? toObjectId(data.campusId) : undefined;
    const departmentId = data.departmentId
      ? toObjectId(data.departmentId)
      : undefined;
    const courseId = data.courseId ? toObjectId(data.courseId) : undefined;
    const updateData: any = { ...data };
    if (campusId !== undefined) updateData.campusId = campusId;
    if (departmentId !== undefined) updateData.departmentId = departmentId;
    if (courseId !== undefined) updateData.courseId = courseId;
    if (campusId) {
      const campus = await Campus.findById(campusId);
      if (campus) updateData.campusName = campus.campusName;
    }
    if (departmentId) {
      const department = await Department.findById(departmentId);
      if (department) updateData.departmentName = department.name;
    }
    if (courseId) {
      const course = await Course.findById(courseId);
      if (course) updateData.courseName = course.courseName;
    }
    const alumni = await Alumni.findByIdAndUpdate(id, updateData, {
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
          id: alumni.campusId?.toString(),
          name: alumni.campusName,
        },
        department: {
          id: alumni.departmentId?.toString(),
          name: alumni.departmentName,
        },
        course: {
          id: alumni.courseId?.toString(),
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
        employmentProof: alumni.employmentProof,
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
          id: alumni.campusId?.toString(),
          name: alumni.campusName,
        },
        department: {
          id: alumni.departmentId?.toString(),
          name: alumni.departmentName,
        },
        course: {
          id: alumni.courseId?.toString(),
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
        employmentProof: alumni.employmentProof,
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
          id: alum.campusId?.toString(),
          name: alum.campusName,
        },
        department: {
          id: alum.departmentId?.toString(),
          name: alum.departmentName,
        },
        course: {
          id: alum.courseId?.toString(),
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

// Get form data (campuses, departments, courses)
export async function getFormData() {
  try {
    await dbConnect();
    const [campuses, departments, courses] = await Promise.all([
      Campus.find().sort({ campusName: 1 }).lean(),
      Department.find().sort({ name: 1 }).lean(),
      Course.find().sort({ courseName: 1 }).lean(),
    ]);
    return {
      success: true,
      data: {
        campuses: campuses.map((campus: any) => ({
          id: campus._id.toString(),
          campusId: campus.campusId || "",
          name: campus.campusName || "Unknown Campus",
        })),
        departments: departments.map((dept: any) => ({
          id: dept._id.toString(),
          departmentId: dept.departmentId || "",
          name: dept.name || "Unknown Department",
          campusId: dept.campusId || "",
        })),
        courses: courses.map((course: any) => ({
          id: course._id.toString(),
          courseId: course.courseId || "",
          name: course.courseName || "Unknown Course",
          departmentId: course.departmentId || "",
        })),
      },
    };
  } catch (error: any) {
    console.error("Error fetching form data:", error);
    return {
      success: false,
      message: "Failed to fetch form data",
      error: error.message || "Unknown error",
      data: {
        campuses: [],
        departments: [],
        courses: [],
      },
    };
  }
}

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
