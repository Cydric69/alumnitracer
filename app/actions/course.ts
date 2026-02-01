// app/actions/course.ts
"use server";

import { dbConnect } from "@/lib/dbConnect";
import { Course } from "@/models/Course";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

// Type for course form data (matches your model but without courseId and timestamp)
export type CourseFormData = {
  courseName: string;
  campusId: string;
  campusName: string;
  departmentId: string;
  departmentName: string;
  courseAvailability: "Active" | "Inactive" | "Archived";
};

// Helper function for Mongoose errors
function formatMongooseError(error: mongoose.Error.ValidationError): string {
  return Object.values(error.errors)
    .map((err: any) => err.message)
    .join(", ");
}

// Validate course data
function validateCourseData(data: CourseFormData): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  if (!data.courseName?.trim()) {
    errors.push("Course name is required");
  } else if (data.courseName.length > 200) {
    errors.push("Course name is too long (max 200 characters)");
  }

  if (!data.campusId?.trim()) {
    errors.push("Campus ID is required");
  } else if (data.campusId.length > 50) {
    errors.push("Campus ID is too long (max 50 characters)");
  }

  if (!data.campusName?.trim()) {
    errors.push("Campus name is required");
  } else if (data.campusName.length > 100) {
    errors.push("Campus name is too long (max 100 characters)");
  }

  if (!data.departmentId?.trim()) {
    errors.push("Department ID is required");
  } else if (data.departmentId.length > 50) {
    errors.push("Department ID is too long (max 50 characters)");
  }

  if (!data.departmentName?.trim()) {
    errors.push("Department name is required");
  } else if (data.departmentName.length > 100) {
    errors.push("Department name is too long (max 100 characters)");
  }

  if (
    !data.courseAvailability ||
    !["Active", "Inactive", "Archived"].includes(data.courseAvailability)
  ) {
    errors.push(
      "Course availability must be one of: Active, Inactive, Archived",
    );
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// Create a new course
export async function createCourse(data: CourseFormData) {
  try {
    await dbConnect();

    // Validate input data
    const validation = validateCourseData(data);
    if (!validation.valid) {
      return {
        success: false,
        message: "Validation failed",
        error: validation.errors?.join(", ") || "Invalid data",
      };
    }

    // Check if course with same name already exists in this department
    const existingCourse = await Course.findOne({
      courseName: data.courseName.trim(),
      departmentId: data.departmentId,
      campusId: data.campusId,
    });

    if (existingCourse) {
      return {
        success: false,
        message: "Course with this name already exists in this department",
        error: "DUPLICATE_COURSE",
      };
    }

    // Manually generate course ID
    const courseId = await Course.getNextCourseId();

    // Create new course with the generated ID
    const course = new Course({
      courseId,
      courseName: data.courseName.trim(),
      campusId: data.campusId,
      campusName: data.campusName.trim(),
      departmentId: data.departmentId,
      departmentName: data.departmentName.trim(),
      courseAvailability: data.courseAvailability,
    });

    const savedCourse = await course.save();

    // Convert to plain object for serialization
    const plainCourse = {
      _id: savedCourse._id.toString(),
      id: savedCourse._id.toString(),
      courseId: savedCourse.courseId,
      courseName: savedCourse.courseName,
      campusId: savedCourse.campusId,
      campusName: savedCourse.campusName,
      departmentId: savedCourse.departmentId,
      departmentName: savedCourse.departmentName,
      courseAvailability: savedCourse.courseAvailability,
      timestamp: savedCourse.timestamp?.toISOString(),
    };

    revalidatePath("/dashboard/courses");
    revalidatePath(`/campuses/${data.campusId}/courses`);
    revalidatePath(`/departments/${data.departmentId}/courses`);

    return {
      success: true,
      message: "Course created successfully",
      data: plainCourse,
    };
  } catch (error) {
    console.error("Error creating course:", error);

    // Handle Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      return {
        success: false,
        message: "Validation failed",
        error: formatMongooseError(error),
      };
    }

    return {
      success: false,
      message: "Failed to create course",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get all courses
export async function getCourses() {
  try {
    await dbConnect();
    const courses = await Course.find({}).sort({ courseName: 1 }).lean();

    // Convert to plain objects
    const plainCourses = courses.map((course) => ({
      _id: course._id.toString(),
      id: course._id.toString(),
      courseId: course.courseId,
      courseName: course.courseName,
      campusId: course.campusId,
      campusName: course.campusName,
      departmentId: course.departmentId,
      departmentName: course.departmentName,
      courseAvailability: course.courseAvailability,
      timestamp: course.timestamp?.toISOString(),
      createdAt: course.timestamp?.toISOString(),
    }));

    return {
      success: true,
      data: plainCourses,
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return {
      success: false,
      message: "Failed to fetch courses",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

// Get course by ID
export async function getCourseById(id: string) {
  try {
    await dbConnect();

    let course;
    if (mongoose.Types.ObjectId.isValid(id)) {
      course = await Course.findById(id).lean();
    } else {
      course = await Course.findOne({ courseId: id }).lean();
    }

    if (!course) {
      return {
        success: false,
        message: "Course not found",
        error: "NOT_FOUND",
      };
    }

    const plainCourse = {
      _id: course._id.toString(),
      id: course._id.toString(),
      courseId: course.courseId,
      courseName: course.courseName,
      campusId: course.campusId,
      campusName: course.campusName,
      departmentId: course.departmentId,
      departmentName: course.departmentName,
      courseAvailability: course.courseAvailability,
      timestamp: course.timestamp?.toISOString(),
    };

    return {
      success: true,
      data: plainCourse,
    };
  } catch (error) {
    console.error("Error fetching course:", error);
    return {
      success: false,
      message: "Failed to fetch course",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get courses by campus ID
export async function getCoursesByCampusId(campusId: string) {
  try {
    await dbConnect();
    const courses = await Course.find({ campusId })
      .sort({ courseName: 1 })
      .lean();

    const plainCourses = courses.map((course) => ({
      _id: course._id.toString(),
      id: course._id.toString(),
      courseId: course.courseId,
      courseName: course.courseName,
      campusId: course.campusId,
      campusName: course.campusName,
      departmentId: course.departmentId,
      departmentName: course.departmentName,
      courseAvailability: course.courseAvailability,
      timestamp: course.timestamp?.toISOString(),
    }));

    return {
      success: true,
      data: plainCourses,
    };
  } catch (error) {
    console.error("Error fetching courses by campus:", error);
    return {
      success: false,
      message: "Failed to fetch courses for campus",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

// Get courses by department ID
export async function getCoursesByDepartmentId(departmentId: string) {
  try {
    await dbConnect();
    const courses = await Course.find({ departmentId })
      .sort({ courseName: 1 })
      .lean();

    const plainCourses = courses.map((course) => ({
      _id: course._id.toString(),
      id: course._id.toString(),
      courseId: course.courseId,
      courseName: course.courseName,
      campusId: course.campusId,
      campusName: course.campusName,
      departmentId: course.departmentId,
      departmentName: course.departmentName,
      courseAvailability: course.courseAvailability,
      timestamp: course.timestamp?.toISOString(),
    }));

    return {
      success: true,
      data: plainCourses,
    };
  } catch (error) {
    console.error("Error fetching courses by department:", error);
    return {
      success: false,
      message: "Failed to fetch courses for department",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

// Get courses by campus and department
export async function getCoursesByCampusAndDepartment(
  campusId: string,
  departmentId: string,
) {
  try {
    await dbConnect();
    const courses = await Course.find({ campusId, departmentId })
      .sort({ courseName: 1 })
      .lean();

    const plainCourses = courses.map((course) => ({
      _id: course._id.toString(),
      id: course._id.toString(),
      courseId: course.courseId,
      courseName: course.courseName,
      campusId: course.campusId,
      campusName: course.campusName,
      departmentId: course.departmentId,
      departmentName: course.departmentName,
      courseAvailability: course.courseAvailability,
      timestamp: course.timestamp?.toISOString(),
    }));

    return {
      success: true,
      data: plainCourses,
    };
  } catch (error) {
    console.error("Error fetching courses by campus and department:", error);
    return {
      success: false,
      message: "Failed to fetch courses",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

// Update course
export async function updateCourse(id: string, data: Partial<CourseFormData>) {
  try {
    await dbConnect();

    // Validate update data if provided
    if (
      data.courseName ||
      data.campusId ||
      data.campusName ||
      data.departmentId ||
      data.departmentName ||
      data.courseAvailability
    ) {
      const validation = validateCourseData({
        courseName: data.courseName || "",
        campusId: data.campusId || "",
        campusName: data.campusName || "",
        departmentId: data.departmentId || "",
        departmentName: data.departmentName || "",
        courseAvailability: data.courseAvailability || "Active",
      });

      if (!validation.valid) {
        return {
          success: false,
          message: "Validation failed",
          error: validation.errors?.join(", ") || "Invalid data",
        };
      }
    }

    // Check if updating name to an existing one in the same department
    if (data.courseName) {
      const currentCourse = await Course.findById(id)
        .select("campusId departmentId")
        .lean();

      if (currentCourse) {
        const existingCourse = await Course.findOne({
          courseName: data.courseName.trim(),
          campusId: data.campusId || currentCourse.campusId,
          departmentId: data.departmentId || currentCourse.departmentId,
          _id: { $ne: id },
        });

        if (existingCourse) {
          return {
            success: false,
            message: "Course with this name already exists in this department",
            error: "DUPLICATE_COURSE",
          };
        }
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (data.courseName) updateData.courseName = data.courseName.trim();
    if (data.campusId) updateData.campusId = data.campusId;
    if (data.campusName) updateData.campusName = data.campusName.trim();
    if (data.departmentId) updateData.departmentId = data.departmentId;
    if (data.departmentName)
      updateData.departmentName = data.departmentName.trim();
    if (data.courseAvailability)
      updateData.courseAvailability = data.courseAvailability;

    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedCourse) {
      return {
        success: false,
        message: "Course not found",
        error: "NOT_FOUND",
      };
    }

    const plainCourse = {
      _id: updatedCourse._id.toString(),
      id: updatedCourse._id.toString(),
      courseId: updatedCourse.courseId,
      courseName: updatedCourse.courseName,
      campusId: updatedCourse.campusId,
      campusName: updatedCourse.campusName,
      departmentId: updatedCourse.departmentId,
      departmentName: updatedCourse.departmentName,
      courseAvailability: updatedCourse.courseAvailability,
      timestamp: updatedCourse.timestamp?.toISOString(),
    };

    revalidatePath("/dashboard/courses");
    revalidatePath(`/courses/${id}`);
    revalidatePath(`/campuses/${updatedCourse.campusId}/courses`);
    revalidatePath(`/departments/${updatedCourse.departmentId}/courses`);

    return {
      success: true,
      message: "Course updated successfully",
      data: plainCourse,
    };
  } catch (error) {
    console.error("Error updating course:", error);

    // Handle Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      return {
        success: false,
        message: "Validation failed",
        error: formatMongooseError(error),
      };
    }

    return {
      success: false,
      message: "Failed to update course",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Delete course
export async function deleteCourse(id: string) {
  try {
    await dbConnect();

    const course = await Course.findById(id)
      .select("campusId departmentId")
      .lean();
    const deletedCourse = await Course.findByIdAndDelete(id).lean();

    if (!deletedCourse) {
      return {
        success: false,
        message: "Course not found",
        error: "NOT_FOUND",
      };
    }

    const plainCourse = {
      _id: deletedCourse._id.toString(),
      id: deletedCourse._id.toString(),
      courseId: deletedCourse.courseId,
      courseName: deletedCourse.courseName,
      campusId: deletedCourse.campusId,
      campusName: deletedCourse.campusName,
      departmentId: deletedCourse.departmentId,
      departmentName: deletedCourse.departmentName,
      courseAvailability: deletedCourse.courseAvailability,
      timestamp: deletedCourse.timestamp?.toISOString(),
    };

    revalidatePath("/dashboard/courses");
    if (course?.campusId) {
      revalidatePath(`/campuses/${course.campusId}/courses`);
    }
    if (course?.departmentId) {
      revalidatePath(`/departments/${course.departmentId}/courses`);
    }

    return {
      success: true,
      message: "Course deleted successfully",
      data: plainCourse,
    };
  } catch (error) {
    console.error("Error deleting course:", error);
    return {
      success: false,
      message: "Failed to delete course",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
