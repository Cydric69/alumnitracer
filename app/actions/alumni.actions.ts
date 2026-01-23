// app/actions/alumni.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import Alumni from "@/models/Alumni";
import Campus from "@/models/Campus";
import Department from "@/models/Department";
import Course from "@/models/Course";
import { AlumniInput } from "@/types/alumni";

// Main function to get all alumni
export async function getAlumni() {
  try {
    await dbConnect();
    const alumni = await Alumni.find()
      .populate("campus", "name")
      .populate({
        path: "department",
        select: "name",
        populate: {
          path: "campus",
          select: "name",
        },
      })
      .populate({
        path: "course",
        select: "name",
        populate: {
          path: "department",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    return alumni.map((alum) => ({
      id: alum._id.toString(),
      firstName: alum.firstName,
      lastName: alum.lastName,
      gender: alum.gender,
      civilStatus: alum.civilStatus,
      email: alum.email,
      phoneNumber: alum.phoneNumber,
      address: alum.address,
      facebookAccount: alum.facebookAccount,
      yearGraduated: alum.yearGraduated,
      campus: {
        id: alum.campus._id.toString(),
        name: alum.campus.name,
      },
      department: {
        id: alum.department._id.toString(),
        name: alum.department.name,
        campus: {
          id: alum.department.campus._id.toString(),
          name: alum.department.campus.name,
        },
      },
      course: {
        id: alum.course?._id.toString(),
        name: alum.course?.name,
      },
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
      firstJobReasons: alum.firstJobReasons,
      isCurrentJobRelatedToDegree: alum.isCurrentJobRelatedToDegree,
      currentJobReasons: alum.currentJobReasons,
      employmentProof: alum.employmentProof,
      awardsRecognition: alum.awardsRecognition,
      scholarshipsDuringEmployment: alum.scholarshipsDuringEmployment,
      eligibility: alum.eligibility,
      willingToMentor: alum.willingToMentor,
      receiveUpdates: alum.receiveUpdates,
      suggestions: alum.suggestions,
      createdAt: alum.createdAt.toISOString(),
      updatedAt: alum.updatedAt.toISOString(),
    }));
  } catch (error: any) {
    console.error("Error fetching alumni:", error);
    throw new Error(error.message || "Failed to fetch alumni");
  }
}

// Create new alumni
export async function createAlumni(data: AlumniInput) {
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

    // Validate campus, department, and course relationships
    const campusExists = await Campus.findById(data.campus);
    if (!campusExists) {
      throw new Error("Campus not found");
    }

    const departmentExists = await Department.findById(
      data.department,
    ).populate("campus");
    if (!departmentExists) {
      throw new Error("Department not found");
    }

    if (departmentExists.campus._id.toString() !== data.campus) {
      throw new Error("Department does not belong to selected campus");
    }

    const courseExists = await Course.findById(data.course).populate(
      "department",
    );
    if (!courseExists) {
      throw new Error("Course not found");
    }

    if (courseExists.department._id.toString() !== data.department) {
      throw new Error("Course does not belong to selected department");
    }

    // Prepare data for creation - handle empty enum values
    const alumniData: any = {
      ...data,
      email: data.email.toLowerCase().trim(),
      studentId: data.studentId?.trim(),
    };

    // Remove empty string values for enum fields to avoid validation errors
    if (alumniData.dateEmploymentAfterBoardExam === "") {
      delete alumniData.dateEmploymentAfterBoardExam;
    }
    if (alumniData.jobInformationSource === "") {
      delete alumniData.jobInformationSource;
    }
    if (alumniData.firstJobDuration === "") {
      delete alumniData.firstJobDuration;
    }

    // Clean up array fields - remove empty strings
    if (alumniData.firstJobReasons) {
      alumniData.firstJobReasons = alumniData.firstJobReasons.filter(
        (reason: string) => reason.trim() !== "",
      );
    }
    if (alumniData.currentJobReasons) {
      alumniData.currentJobReasons = alumniData.currentJobReasons.filter(
        (reason: string) => reason.trim() !== "",
      );
    }
    if (alumniData.awardsRecognition) {
      alumniData.awardsRecognition = alumniData.awardsRecognition.filter(
        (award: string) => award.trim() !== "",
      );
    }
    if (alumniData.scholarshipsDuringEmployment) {
      alumniData.scholarshipsDuringEmployment =
        alumniData.scholarshipsDuringEmployment.filter(
          (scholarship: string) => scholarship.trim() !== "",
        );
    }
    if (alumniData.eligibility) {
      alumniData.eligibility = alumniData.eligibility.filter(
        (eligibility: string) => eligibility.trim() !== "",
      );
    }

    const alumni = await Alumni.create(alumniData);

    // Get populated alumni
    const newAlumni = await Alumni.findById(alumni._id)
      .populate("campus", "name")
      .populate({
        path: "department",
        select: "name",
        populate: {
          path: "campus",
          select: "name",
        },
      })
      .populate({
        path: "course",
        select: "name",
      });

    if (!newAlumni) {
      throw new Error("Failed to create alumni");
    }

    revalidatePath("/dashboard/alumni");

    return {
      id: newAlumni._id.toString(),
      firstName: newAlumni.firstName,
      lastName: newAlumni.lastName,
      gender: newAlumni.gender,
      civilStatus: newAlumni.civilStatus,
      email: newAlumni.email,
      phoneNumber: newAlumni.phoneNumber,
      address: newAlumni.address,
      facebookAccount: newAlumni.facebookAccount,
      yearGraduated: newAlumni.yearGraduated,
      campus: {
        id: newAlumni.campus._id.toString(),
        name: newAlumni.campus.name,
      },
      department: {
        id: newAlumni.department._id.toString(),
        name: newAlumni.department.name,
        campus: {
          id: newAlumni.department.campus._id.toString(),
          name: newAlumni.department.campus.name,
        },
      },
      course: {
        id: newAlumni.course?._id.toString(),
        name: newAlumni.course?.name,
      },
      degree: newAlumni.degree,
      employmentStatus: newAlumni.employmentStatus,
      employmentSector: newAlumni.employmentSector,
      presentEmploymentStatus: newAlumni.presentEmploymentStatus,
      locationOfEmployment: newAlumni.locationOfEmployment,
      currentPosition: newAlumni.currentPosition,
      employer: newAlumni.employer,
      companyAddress: newAlumni.companyAddress,
      boardExamPassed: newAlumni.boardExamPassed,
      yearPassedBoardExam: newAlumni.yearPassedBoardExam,
      dateEmploymentAfterBoardExam: newAlumni.dateEmploymentAfterBoardExam,
      jobInformationSource: newAlumni.jobInformationSource,
      firstJobDuration: newAlumni.firstJobDuration,
      isFirstJobRelatedToDegree: newAlumni.isFirstJobRelatedToDegree,
      firstJobReasons: newAlumni.firstJobReasons,
      isCurrentJobRelatedToDegree: newAlumni.isCurrentJobRelatedToDegree,
      currentJobReasons: newAlumni.currentJobReasons,
      employmentProof: newAlumni.employmentProof,
      awardsRecognition: newAlumni.awardsRecognition,
      scholarshipsDuringEmployment: newAlumni.scholarshipsDuringEmployment,
      eligibility: newAlumni.eligibility,
      willingToMentor: newAlumni.willingToMentor,
      receiveUpdates: newAlumni.receiveUpdates,
      suggestions: newAlumni.suggestions,
      createdAt: newAlumni.createdAt.toISOString(),
      updatedAt: newAlumni.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error creating alumni:", error);
    console.error("Validation errors:", error.errors);
    throw new Error(error.message || "Failed to create alumni");
  }
}

// Update alumni
export async function updateAlumni(id: string, data: AlumniInput) {
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

    // Validate campus, department, and course relationships
    const campusExists = await Campus.findById(data.campus);
    if (!campusExists) {
      throw new Error("Campus not found");
    }

    const departmentExists = await Department.findById(
      data.department,
    ).populate("campus");
    if (!departmentExists) {
      throw new Error("Department not found");
    }

    if (departmentExists.campus._id.toString() !== data.campus) {
      throw new Error("Department does not belong to selected campus");
    }

    const courseExists = await Course.findById(data.course).populate(
      "department",
    );
    if (!courseExists) {
      throw new Error("Course not found");
    }

    if (courseExists.department._id.toString() !== data.department) {
      throw new Error("Course does not belong to selected department");
    }

    // Prepare update data - handle empty enum values
    const updateData: any = {
      ...data,
      email: data.email.toLowerCase().trim(),
      studentId: data.studentId?.trim(),
    };

    // Remove empty string values for enum fields to avoid validation errors
    if (updateData.dateEmploymentAfterBoardExam === "") {
      updateData.dateEmploymentAfterBoardExam = undefined;
    }
    if (updateData.jobInformationSource === "") {
      updateData.jobInformationSource = undefined;
    }
    if (updateData.firstJobDuration === "") {
      updateData.firstJobDuration = undefined;
    }

    // Clean up array fields - remove empty strings
    if (updateData.firstJobReasons) {
      updateData.firstJobReasons = updateData.firstJobReasons.filter(
        (reason: string) => reason.trim() !== "",
      );
    }
    if (updateData.currentJobReasons) {
      updateData.currentJobReasons = updateData.currentJobReasons.filter(
        (reason: string) => reason.trim() !== "",
      );
    }
    if (updateData.awardsRecognition) {
      updateData.awardsRecognition = updateData.awardsRecognition.filter(
        (award: string) => award.trim() !== "",
      );
    }
    if (updateData.scholarshipsDuringEmployment) {
      updateData.scholarshipsDuringEmployment =
        updateData.scholarshipsDuringEmployment.filter(
          (scholarship: string) => scholarship.trim() !== "",
        );
    }
    if (updateData.eligibility) {
      updateData.eligibility = updateData.eligibility.filter(
        (eligibility: string) => eligibility.trim() !== "",
      );
    }

    const alumni = await Alumni.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("campus", "name")
      .populate({
        path: "department",
        select: "name",
        populate: {
          path: "campus",
          select: "name",
        },
      })
      .populate({
        path: "course",
        select: "name",
      });

    if (!alumni) {
      throw new Error("Alumni not found");
    }

    revalidatePath("/dashboard/alumni");

    return {
      id: alumni._id.toString(),
      firstName: alumni.firstName,
      lastName: alumni.lastName,
      gender: alumni.gender,
      civilStatus: alumni.civilStatus,
      email: alumni.email,
      phoneNumber: alumni.phoneNumber,
      address: alumni.address,
      facebookAccount: alumni.facebookAccount,
      yearGraduated: alumni.yearGraduated,
      campus: {
        id: alumni.campus._id.toString(),
        name: alumni.campus.name,
      },
      department: {
        id: alumni.department._id.toString(),
        name: alumni.department.name,
        campus: {
          id: alumni.department.campus._id.toString(),
          name: alumni.department.campus.name,
        },
      },
      course: {
        id: alumni.course?._id.toString(),
        name: alumni.course?.name,
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
      firstJobReasons: alumni.firstJobReasons,
      isCurrentJobRelatedToDegree: alumni.isCurrentJobRelatedToDegree,
      currentJobReasons: alumni.currentJobReasons,
      employmentProof: alumni.employmentProof,
      awardsRecognition: alumni.awardsRecognition,
      scholarshipsDuringEmployment: alumni.scholarshipsDuringEmployment,
      eligibility: alumni.eligibility,
      willingToMentor: alumni.willingToMentor,
      receiveUpdates: alumni.receiveUpdates,
      suggestions: alumni.suggestions,
      createdAt: alumni.createdAt.toISOString(),
      updatedAt: alumni.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error updating alumni:", error);
    console.error("Validation errors:", error.errors);
    throw new Error(error.message || "Failed to update alumni");
  }
}

// Delete alumni
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

// Get single alumni by ID
export async function getAlumniById(id: string) {
  try {
    await dbConnect();

    const alumni = await Alumni.findById(id)
      .populate("campus", "name")
      .populate({
        path: "department",
        select: "name",
        populate: {
          path: "campus",
          select: "name",
        },
      })
      .populate({
        path: "course",
        select: "name",
      });

    if (!alumni) {
      throw new Error("Alumni not found");
    }

    return {
      id: alumni._id.toString(),
      firstName: alumni.firstName,
      lastName: alumni.lastName,
      gender: alumni.gender,
      civilStatus: alumni.civilStatus,
      email: alumni.email,
      phoneNumber: alumni.phoneNumber,
      address: alumni.address,
      facebookAccount: alumni.facebookAccount,
      yearGraduated: alumni.yearGraduated,
      campus: {
        id: alumni.campus._id.toString(),
        name: alumni.campus.name,
      },
      department: {
        id: alumni.department._id.toString(),
        name: alumni.department.name,
        campus: {
          id: alumni.department.campus._id.toString(),
          name: alumni.department.campus.name,
        },
      },
      course: {
        id: alumni.course?._id.toString(),
        name: alumni.course?.name,
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
      firstJobReasons: alumni.firstJobReasons,
      isCurrentJobRelatedToDegree: alumni.isCurrentJobRelatedToDegree,
      currentJobReasons: alumni.currentJobReasons,
      employmentProof: alumni.employmentProof,
      awardsRecognition: alumni.awardsRecognition,
      scholarshipsDuringEmployment: alumni.scholarshipsDuringEmployment,
      eligibility: alumni.eligibility,
      willingToMentor: alumni.willingToMentor,
      receiveUpdates: alumni.receiveUpdates,
      suggestions: alumni.suggestions,
      createdAt: alumni.createdAt.toISOString(),
      updatedAt: alumni.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error fetching alumni:", error);
    throw new Error(error.message || "Failed to fetch alumni");
  }
}

// Helper functions for filters
export async function getAlumniYears() {
  try {
    await dbConnect();
    const years = await Alumni.distinct("yearGraduated").sort({
      yearGraduated: -1,
    });
    return years.map((year) => ({
      value: year,
      label: year,
    }));
  } catch (error: any) {
    console.error("Error fetching alumni years:", error);
    throw new Error(error.message || "Failed to fetch alumni years");
  }
}

export async function getAlumniCampuses() {
  try {
    await dbConnect();
    const alumni = await Alumni.find().populate("campus", "name");
    const campuses = [
      ...new Set(
        alumni.map((a) => ({
          id: a.campus._id.toString(),
          name: a.campus.name,
        })),
      ),
    ].sort((a, b) => a.name.localeCompare(b.name));

    return campuses.map((campus) => ({
      value: campus.id,
      label: campus.name,
    }));
  } catch (error: any) {
    console.error("Error fetching alumni campuses:", error);
    throw new Error(error.message || "Failed to fetch alumni campuses");
  }
}

export async function getAlumniDepartments() {
  try {
    await dbConnect();
    const alumni = await Alumni.find().populate({
      path: "department",
      select: "name",
      populate: {
        path: "campus",
        select: "name",
      },
    });

    const departments = [
      ...new Set(
        alumni.map((a) => ({
          id: a.department._id.toString(),
          name: a.department.name,
          campus: a.department.campus.name,
        })),
      ),
    ].sort((a, b) => a.name.localeCompare(b.name));

    return departments.map((dept) => ({
      value: dept.id,
      label: dept.name,
      campus: dept.campus,
    }));
  } catch (error: any) {
    console.error("Error fetching alumni departments:", error);
    throw new Error(error.message || "Failed to fetch alumni departments");
  }
}

// Get all campuses
export async function getCampuses() {
  try {
    await dbConnect();
    const campuses = await Campus.find().sort({ name: 1 });
    return campuses.map((campus) => ({
      id: campus._id.toString(),
      name: campus.name,
    }));
  } catch (error: any) {
    console.error("Error fetching campuses:", error);
    throw new Error(error.message || "Failed to fetch campuses");
  }
}

// Get departments (with optional campus filter)
export async function getDepartments(campusId?: string) {
  try {
    await dbConnect();

    let query = {};
    if (campusId) {
      query = { campus: campusId };
    }

    const departments = await Department.find(query)
      .populate("campus", "name")
      .sort({ name: 1 });

    return departments.map((dept) => ({
      id: dept._id.toString(),
      name: dept.name,
      campus: {
        id: dept.campus._id.toString(),
        name: dept.campus.name,
      },
    }));
  } catch (error: any) {
    console.error("Error fetching departments:", error);
    throw new Error(error.message || "Failed to fetch departments");
  }
}

// Get courses (with optional department filter)
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

// Get all form data (campuses, departments, courses)
export async function getFormData() {
  try {
    await dbConnect();

    const [campuses, departments, courses] = await Promise.all([
      Campus.find().sort({ name: 1 }),
      Department.find().populate("campus", "name").sort({ name: 1 }),
      Course.find().populate("department", "name").sort({ name: 1 }),
    ]);

    return {
      campuses: campuses.map((campus) => ({
        id: campus._id.toString(),
        name: campus.name,
      })),
      departments: departments.map((dept) => ({
        id: dept._id.toString(),
        name: dept.name,
        campus: {
          id: dept.campus._id.toString(),
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

// Search alumni
export async function searchAlumni(query: string) {
  try {
    await dbConnect();

    const alumni = await Alumni.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { studentId: { $regex: query, $options: "i" } },
      ],
    })
      .populate("campus", "name")
      .populate({
        path: "department",
        select: "name",
        populate: {
          path: "campus",
          select: "name",
        },
      })
      .populate({
        path: "course",
        select: "name",
      })
      .limit(10);

    return alumni.map((alum) => ({
      id: alum._id.toString(),
      firstName: alum.firstName,
      lastName: alum.lastName,
      gender: alum.gender,
      civilStatus: alum.civilStatus,
      email: alum.email,
      phoneNumber: alum.phoneNumber,
      address: alum.address,
      facebookAccount: alum.facebookAccount,
      yearGraduated: alum.yearGraduated,
      campus: {
        id: alum.campus._id.toString(),
        name: alum.campus.name,
      },
      department: {
        id: alum.department._id.toString(),
        name: alum.department.name,
        campus: {
          id: alum.department.campus._id.toString(),
          name: alum.department.campus.name,
        },
      },
      course: {
        id: alum.course?._id.toString(),
        name: alum.course?.name,
      },
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
      firstJobReasons: alum.firstJobReasons,
      isCurrentJobRelatedToDegree: alum.isCurrentJobRelatedToDegree,
      currentJobReasons: alum.currentJobReasons,
      employmentProof: alum.employmentProof,
      awardsRecognition: alum.awardsRecognition,
      scholarshipsDuringEmployment: alum.scholarshipsDuringEmployment,
      eligibility: alum.eligibility,
      willingToMentor: alum.willingToMentor,
      receiveUpdates: alum.receiveUpdates,
      suggestions: alum.suggestions,
      createdAt: alum.createdAt.toISOString(),
      updatedAt: alum.updatedAt.toISOString(),
    }));
  } catch (error: any) {
    console.error("Error searching alumni:", error);
    throw new Error(error.message || "Failed to search alumni");
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

    const alumni = await Alumni.find()
      .populate("campus", "name")
      .populate({
        path: "department",
        select: "name",
        populate: {
          path: "campus",
          select: "name",
        },
      });

    const uniqueCampuses = [
      ...new Set(alumni.map((a) => a.campus._id.toString())),
    ];

    const uniqueDepartments = [
      ...new Set(alumni.map((a) => a.department._id.toString())),
    ];

    return {
      total,
      employed,
      campuses: uniqueCampuses.length,
      departments: uniqueDepartments.length,
    };
  } catch (error: any) {
    console.error("Error fetching alumni stats:", error);
    throw new Error(error.message || "Failed to fetch alumni stats");
  }
}
