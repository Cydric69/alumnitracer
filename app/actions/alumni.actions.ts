// app/actions/alumni.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import Alumni from "@/models/Alumni";
import Campus from "@/models/Campus";
import Department from "@/models/Department";
import Course from "@/models/Course";
import { AlumniInput } from "@/types/alumni";

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

// Main function to get all alumni
export async function getAlumni() {
  try {
    await dbConnect();

    console.log("Fetching alumni data...");

    const alumni = await Alumni.find()
      .populate({
        path: "campus",
        select: "name",
      })
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

    console.log(`Successfully fetched ${alumni.length} alumni records`);

    return alumni.map((alum) => {
      // Safely handle all data access
      const campusId = safeGetId(alum.campus);
      const campusName = safeGetName(alum.campus, "Unknown Campus");

      const departmentId = safeGetId(alum.department);
      const departmentName = safeGetName(alum.department, "Unknown Department");

      // Handle nested campus in department
      let departmentCampusId = "";
      let departmentCampusName = "Unknown Campus";
      if (alum.department && alum.department.campus) {
        departmentCampusId = safeGetId(alum.department.campus);
        departmentCampusName = safeGetName(
          alum.department.campus,
          "Unknown Campus",
        );
      }

      const courseId = safeGetId(alum.course);
      const courseName = safeGetName(alum.course, "Unknown Course");

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
        dateOfBirth: alum.dateOfBirth || "",
        placeOfBirth: alum.placeOfBirth || "",
        campus: {
          id: campusId,
          name: campusName,
        },
        department: {
          id: departmentId,
          name: departmentName,
          campus: {
            id: departmentCampusId,
            name: departmentCampusName,
          },
        },
        course: {
          id: courseId,
          name: courseName,
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
    console.error("Error fetching alumni:", error);
    console.error("Error stack:", error.stack);

    // Fallback: try without population if population fails
    try {
      const fallbackAlumni = await Alumni.find().lean();
      console.log("Returning fallback alumni data:", fallbackAlumni.length);

      // Try to populate individually for each alumni
      const alumniWithPopulatedData = await Promise.all(
        fallbackAlumni.map(async (alum: any) => {
          try {
            const [campus, department, course] = await Promise.all([
              Campus.findById(alum.campus).select("name").lean(),
              Department.findById(alum.department)
                .select("name")
                .populate("campus", "name")
                .lean(),
              Course.findById(alum.course).select("name").lean(),
            ]);

            return {
              id: alum._id?.toString() || "",
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
              campus: {
                id: campus?._id?.toString() || "",
                name: campus?.name || "Unknown Campus",
              },
              department: {
                id: department?._id?.toString() || "",
                name: department?.name || "Unknown Department",
                campus: {
                  id: department?.campus?._id?.toString() || "",
                  name: department?.campus?.name || "Unknown Campus",
                },
              },
              course: {
                id: course?._id?.toString() || "",
                name: course?.name || "Unknown Course",
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
              dateEmploymentAfterBoardExam:
                alum.dateEmploymentAfterBoardExam || "",
              jobInformationSource: alum.jobInformationSource || "",
              firstJobDuration: alum.firstJobDuration || "",
              isFirstJobRelatedToDegree:
                alum.isFirstJobRelatedToDegree || false,
              firstJobReasons: alum.firstJobReasons || [],
              isCurrentJobRelatedToDegree:
                alum.isCurrentJobRelatedToDegree || false,
              currentJobReasons: alum.currentJobReasons || [],
              employmentProof: alum.employmentProof || "",
              awardsRecognition: alum.awardsRecognition || [],
              scholarshipsDuringEmployment:
                alum.scholarshipsDuringEmployment || [],
              eligibility: alum.eligibility || [],
              willingToMentor: alum.willingToMentor || false,
              receiveUpdates: alum.receiveUpdates || false,
              suggestions: alum.suggestions || "",
              createdAt:
                alum.createdAt?.toISOString() || new Date().toISOString(),
              updatedAt:
                alum.updatedAt?.toISOString() || new Date().toISOString(),
            };
          } catch (populateError) {
            console.error("Error populating individual alumni:", populateError);
            return {
              id: alum._id?.toString() || "",
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
              campus: { id: "", name: "Unknown Campus" },
              department: {
                id: "",
                name: "Unknown Department",
                campus: { id: "", name: "Unknown Campus" },
              },
              course: { id: "", name: "Unknown Course" },
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
              dateEmploymentAfterBoardExam:
                alum.dateEmploymentAfterBoardExam || "",
              jobInformationSource: alum.jobInformationSource || "",
              firstJobDuration: alum.firstJobDuration || "",
              isFirstJobRelatedToDegree:
                alum.isFirstJobRelatedToDegree || false,
              firstJobReasons: alum.firstJobReasons || [],
              isCurrentJobRelatedToDegree:
                alum.isCurrentJobRelatedToDegree || false,
              currentJobReasons: alum.currentJobReasons || [],
              employmentProof: alum.employmentProof || "",
              awardsRecognition: alum.awardsRecognition || [],
              scholarshipsDuringEmployment:
                alum.scholarshipsDuringEmployment || [],
              eligibility: alum.eligibility || [],
              willingToMentor: alum.willingToMentor || false,
              receiveUpdates: alum.receiveUpdates || false,
              suggestions: alum.suggestions || "",
              createdAt:
                alum.createdAt?.toISOString() || new Date().toISOString(),
              updatedAt:
                alum.updatedAt?.toISOString() || new Date().toISOString(),
            };
          }
        }),
      );

      return alumniWithPopulatedData;
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return [];
    }
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

    // Prepare data for creation
    const alumniData: any = {
      ...data,
      email: data.email.toLowerCase().trim(),
      studentId: data.studentId?.trim(),
    };

    // Clean up array fields - remove empty strings
    if (alumniData.firstJobReasons) {
      alumniData.firstJobReasons = alumniData.firstJobReasons.filter(
        (reason: string) => reason && reason.trim() !== "",
      );
    }
    if (alumniData.currentJobReasons) {
      alumniData.currentJobReasons = alumniData.currentJobReasons.filter(
        (reason: string) => reason && reason.trim() !== "",
      );
    }
    if (alumniData.awardsRecognition) {
      alumniData.awardsRecognition = alumniData.awardsRecognition.filter(
        (award: string) => award && award.trim() !== "",
      );
    }
    if (alumniData.scholarshipsDuringEmployment) {
      alumniData.scholarshipsDuringEmployment =
        alumniData.scholarshipsDuringEmployment.filter(
          (scholarship: string) => scholarship && scholarship.trim() !== "",
        );
    }
    if (alumniData.eligibility) {
      alumniData.eligibility = alumniData.eligibility.filter(
        (eligibility: string) => eligibility && eligibility.trim() !== "",
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

    // Return the properly formatted data
    const campusId = safeGetId(newAlumni.campus);
    const campusName = safeGetName(newAlumni.campus, "Unknown Campus");

    const departmentId = safeGetId(newAlumni.department);
    const departmentName = safeGetName(
      newAlumni.department,
      "Unknown Department",
    );

    let departmentCampusId = "";
    let departmentCampusName = "Unknown Campus";
    if (newAlumni.department && newAlumni.department.campus) {
      departmentCampusId = safeGetId(newAlumni.department.campus);
      departmentCampusName = safeGetName(
        newAlumni.department.campus,
        "Unknown Campus",
      );
    }

    const courseId = safeGetId(newAlumni.course);
    const courseName = safeGetName(newAlumni.course, "Unknown Course");

    return {
      id: newAlumni._id.toString(),
      firstName: newAlumni.firstName,
      lastName: newAlumni.lastName,
      gender: newAlumni.gender,
      civilStatus: newAlumni.civilStatus,
      email: newAlumni.email,
      phoneNumber: newAlumni.phoneNumber,
      address: newAlumni.address,
      studentId: newAlumni.studentId || "",
      facebookAccount: newAlumni.facebookAccount || "",
      yearGraduated: newAlumni.yearGraduated,
      campus: {
        id: campusId,
        name: campusName,
      },
      department: {
        id: departmentId,
        name: departmentName,
        campus: {
          id: departmentCampusId,
          name: departmentCampusName,
        },
      },
      course: {
        id: courseId,
        name: courseName,
      },
      degree: newAlumni.degree,
      employmentStatus: newAlumni.employmentStatus,
      employmentSector: newAlumni.employmentSector,
      presentEmploymentStatus: newAlumni.presentEmploymentStatus,
      locationOfEmployment: newAlumni.locationOfEmployment,
      currentPosition: newAlumni.currentPosition || "",
      employer: newAlumni.employer || "",
      companyAddress: newAlumni.companyAddress || "",
      boardExamPassed: newAlumni.boardExamPassed || "",
      yearPassedBoardExam: newAlumni.yearPassedBoardExam || "",
      dateEmploymentAfterBoardExam:
        newAlumni.dateEmploymentAfterBoardExam || "",
      jobInformationSource: newAlumni.jobInformationSource || "",
      firstJobDuration: newAlumni.firstJobDuration || "",
      isFirstJobRelatedToDegree: newAlumni.isFirstJobRelatedToDegree || false,
      firstJobReasons: newAlumni.firstJobReasons || [],
      isCurrentJobRelatedToDegree:
        newAlumni.isCurrentJobRelatedToDegree || false,
      currentJobReasons: newAlumni.currentJobReasons || [],
      employmentProof: newAlumni.employmentProof || "",
      awardsRecognition: newAlumni.awardsRecognition || [],
      scholarshipsDuringEmployment:
        newAlumni.scholarshipsDuringEmployment || [],
      eligibility: newAlumni.eligibility || [],
      willingToMentor: newAlumni.willingToMentor || false,
      receiveUpdates: newAlumni.receiveUpdates || false,
      suggestions: newAlumni.suggestions || "",
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

    // Prepare update data
    const updateData: any = {
      ...data,
      email: data.email.toLowerCase().trim(),
      studentId: data.studentId?.trim(),
    };

    // Clean up array fields - remove empty strings
    if (updateData.firstJobReasons) {
      updateData.firstJobReasons = updateData.firstJobReasons.filter(
        (reason: string) => reason && reason.trim() !== "",
      );
    }
    if (updateData.currentJobReasons) {
      updateData.currentJobReasons = updateData.currentJobReasons.filter(
        (reason: string) => reason && reason.trim() !== "",
      );
    }
    if (updateData.awardsRecognition) {
      updateData.awardsRecognition = updateData.awardsRecognition.filter(
        (award: string) => award && award.trim() !== "",
      );
    }
    if (updateData.scholarshipsDuringEmployment) {
      updateData.scholarshipsDuringEmployment =
        updateData.scholarshipsDuringEmployment.filter(
          (scholarship: string) => scholarship && scholarship.trim() !== "",
        );
    }
    if (updateData.eligibility) {
      updateData.eligibility = updateData.eligibility.filter(
        (eligibility: string) => eligibility && eligibility.trim() !== "",
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

    // Return the properly formatted data
    const campusId = safeGetId(alumni.campus);
    const campusName = safeGetName(alumni.campus, "Unknown Campus");

    const departmentId = safeGetId(alumni.department);
    const departmentName = safeGetName(alumni.department, "Unknown Department");

    let departmentCampusId = "";
    let departmentCampusName = "Unknown Campus";
    if (alumni.department && alumni.department.campus) {
      departmentCampusId = safeGetId(alumni.department.campus);
      departmentCampusName = safeGetName(
        alumni.department.campus,
        "Unknown Campus",
      );
    }

    const courseId = safeGetId(alumni.course);
    const courseName = safeGetName(alumni.course, "Unknown Course");

    return {
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
      campus: {
        id: campusId,
        name: campusName,
      },
      department: {
        id: departmentId,
        name: departmentName,
        campus: {
          id: departmentCampusId,
          name: departmentCampusName,
        },
      },
      course: {
        id: courseId,
        name: courseName,
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

    // Safely handle all data access
    const campusId = safeGetId(alumni.campus);
    const campusName = safeGetName(alumni.campus, "Unknown Campus");

    const departmentId = safeGetId(alumni.department);
    const departmentName = safeGetName(alumni.department, "Unknown Department");

    // Handle nested campus in department
    let departmentCampusId = "";
    let departmentCampusName = "Unknown Campus";
    if (alumni.department && alumni.department.campus) {
      departmentCampusId = safeGetId(alumni.department.campus);
      departmentCampusName = safeGetName(
        alumni.department.campus,
        "Unknown Campus",
      );
    }

    const courseId = safeGetId(alumni.course);
    const courseName = safeGetName(alumni.course, "Unknown Course");

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
      campus: {
        id: campusId,
        name: campusName,
      },
      department: {
        id: departmentId,
        name: departmentName,
        campus: {
          id: departmentCampusId,
          name: departmentCampusName,
        },
      },
      course: {
        id: courseId,
        name: courseName,
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

// Helper functions for filters
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

    // Get all campuses that have alumni
    const alumniCampuses = await Alumni.distinct("campus");

    // Get campus details for these IDs
    const campuses = await Campus.find({
      _id: { $in: alumniCampuses.filter((id) => id != null) },
    })
      .select("name")
      .sort({ name: 1 });

    return campuses.map((campus) => ({
      value: campus._id.toString(),
      label: campus.name,
    }));
  } catch (error: any) {
    console.error("Error fetching alumni campuses:", error);
    return [];
  }
}

export async function getAlumniDepartments() {
  try {
    await dbConnect();

    // Get all departments that have alumni
    const alumniDepartments = await Alumni.distinct("department");

    // Get department details for these IDs
    const departments = await Department.find({
      _id: { $in: alumniDepartments.filter((id) => id != null) },
    })
      .populate("campus", "name")
      .select("name campus")
      .sort({ name: 1 });

    return departments.map((dept) => ({
      value: dept._id.toString(),
      label: dept.name,
      campus: dept.campus?.name || "Unknown Campus",
    }));
  } catch (error: any) {
    console.error("Error fetching alumni departments:", error);
    return [];
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
    if (!query || query.trim() === "") {
      return [];
    }

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

    return alumni.map((alum) => {
      const campusId = safeGetId(alum.campus);
      const campusName = safeGetName(alum.campus, "Unknown Campus");

      const departmentId = safeGetId(alum.department);
      const departmentName = safeGetName(alum.department, "Unknown Department");

      let departmentCampusId = "";
      let departmentCampusName = "Unknown Campus";
      if (alum.department && alum.department.campus) {
        departmentCampusId = safeGetId(alum.department.campus);
        departmentCampusName = safeGetName(
          alum.department.campus,
          "Unknown Campus",
        );
      }

      const courseId = safeGetId(alum.course);
      const courseName = safeGetName(alum.course, "Unknown Course");

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
          id: campusId,
          name: campusName,
        },
        department: {
          id: departmentId,
          name: departmentName,
          campus: {
            id: departmentCampusId,
            name: departmentCampusName,
          },
        },
        course: {
          id: courseId,
          name: courseName,
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

// Get alumni statistics
export async function getAlumniStats() {
  try {
    await dbConnect();

    const total = await Alumni.countDocuments();
    const employed = await Alumni.countDocuments({
      employmentStatus: { $in: ["Employed", "Self-Employed"] },
    });

    // Get unique campuses and departments
    const uniqueCampuses = await Alumni.distinct("campus");
    const uniqueDepartments = await Alumni.distinct("department");

    return {
      total,
      employed,
      campuses: uniqueCampuses.filter((c) => c != null).length,
      departments: uniqueDepartments.filter((d) => d != null).length,
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

// Export alumni data
export async function exportAlumniData(format: "csv" | "excel" = "csv") {
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
      });

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
      Campus: alum.campus?.name || "Unknown",
      Department: alum.department?.name || "Unknown",
      Course: alum.course?.name || "Unknown",
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

// Bulk delete alumni
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

// Update alumni batch
export async function updateAlumniBatch(
  updates: Array<{ id: string; data: Partial<AlumniInput> }>,
) {
  try {
    await dbConnect();

    const results = [];

    for (const update of updates) {
      try {
        const alumni = await Alumni.findByIdAndUpdate(
          update.id,
          { ...update.data, updatedAt: new Date() },
          { new: true, runValidators: true },
        )
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
