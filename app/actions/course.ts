"use server";

import { dbConnect } from "@/lib/dbConnect";
import { Course } from "@/models/Course";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { z } from "zod";

// Zod schema for form validation (client-side compatible)
export const courseFormSchema = z.object({
  courseName: z
    .string()
    .min(1, "Course name is required")
    .max(200, "Course name is too long"),
  campusId: z
    .string()
    .min(1, "Campus ID is required")
    .max(50, "Campus ID is too long"),
  campusName: z
    .string()
    .min(1, "Campus name is required")
    .max(100, "Campus name is too long"),
  departmentId: z
    .string()
    .min(1, "Department ID is required")
    .max(50, "Department ID is too long"),
  departmentName: z
    .string()
    .min(1, "Department name is required")
    .max(100, "Department name is too long"),
  courseAvailability: z
    .enum(["Active", "Inactive", "Archived"])
    .default("Active"),
});

export type CourseFormData = z.infer<typeof courseFormSchema>;

// Helper function for Zod errors
function formatZodError(error: z.ZodError<CourseFormData>): string {
  return error.errors.map((err: z.ZodIssue) => err.message).join(", ");
}

// Helper function for Mongoose errors
function formatMongooseError(error: mongoose.Error.ValidationError): string {
  return Object.values(error.errors)
    .map((err: any) => err.message)
    .join(", ");
}

// Create a new course
export async function createCourse(data: CourseFormData) {
  try {
    await dbConnect();

    // Validate input data
    const validatedData = courseFormSchema.parse(data);

    // Check if course with same name already exists in this department
    const existingCourse = await Course.findOne({
      courseName: validatedData.courseName,
      departmentId: validatedData.departmentId,
      campusId: validatedData.campusId,
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
      ...validatedData,
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

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: formatZodError(error as z.ZodError<CourseFormData>),
      };
    }

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

    // Check if updating name to an existing one in the same department
    if (data.courseName) {
      const currentCourse = await Course.findById(id)
        .select("campusId departmentId")
        .lean();

      if (currentCourse) {
        const existingCourse = await Course.findOne({
          courseName: data.courseName,
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

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true },
    ).lean();

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

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: formatZodError(error as z.ZodError<CourseFormData>),
      };
    }

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

// Get next course ID
export async function getNextCourseId() {
  try {
    await dbConnect();
    const nextId = await Course.getNextCourseId();
    return {
      success: true,
      data: nextId,
    };
  } catch (error) {
    console.error("Error getting next course ID:", error);
    return {
      success: false,
      message: "Failed to get next course ID",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Search courses
export async function searchCourses(searchTerm: string) {
  try {
    await dbConnect();

    const courses = await Course.find({
      $or: [
        { courseId: { $regex: searchTerm, $options: "i" } },
        { courseName: { $regex: searchTerm, $options: "i" } },
        { campusName: { $regex: searchTerm, $options: "i" } },
        { departmentName: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .sort({ courseName: 1 })
      .limit(20)
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
    console.error("Error searching courses:", error);
    return {
      success: false,
      message: "Failed to search courses",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

// Get course count by campus
export async function getCourseCountByCampus() {
  try {
    await dbConnect();

    const courseCounts = await Course.aggregate([
      {
        $group: {
          _id: "$campusId",
          campusName: { $first: "$campusName" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { campusName: 1 },
      },
    ]);

    const plainCounts = courseCounts.map((item) => ({
      campusId: item._id,
      campusName: item.campusName,
      count: item.count,
    }));

    return {
      success: true,
      data: plainCounts,
    };
  } catch (error) {
    console.error("Error getting course count by campus:", error);
    return {
      success: false,
      message: "Failed to get course count by campus",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

// Get course count by department
export async function getCourseCountByDepartment() {
  try {
    await dbConnect();

    const courseCounts = await Course.aggregate([
      {
        $group: {
          _id: "$departmentId",
          departmentName: { $first: "$departmentName" },
          campusName: { $first: "$campusName" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { departmentName: 1 },
      },
    ]);

    const plainCounts = courseCounts.map((item) => ({
      departmentId: item._id,
      departmentName: item.departmentName,
      campusName: item.campusName,
      count: item.count,
    }));

    return {
      success: true,
      data: plainCounts,
    };
  } catch (error) {
    console.error("Error getting course count by department:", error);
    return {
      success: false,
      message: "Failed to get course count by department",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

// Get active courses count
export async function getActiveCoursesCount() {
  try {
    await dbConnect();

    const activeCount = await Course.countDocuments({
      courseAvailability: "Active",
    });
    const inactiveCount = await Course.countDocuments({
      courseAvailability: "Inactive",
    });
    const archivedCount = await Course.countDocuments({
      courseAvailability: "Archived",
    });
    const totalCount = await Course.countDocuments();

    return {
      success: true,
      data: {
        active: activeCount,
        inactive: inactiveCount,
        archived: archivedCount,
        total: totalCount,
      },
    };
  } catch (error) {
    console.error("Error getting active courses count:", error);
    return {
      success: false,
      message: "Failed to get course counts",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update course availability
export async function updateCourseAvailability(
  id: string,
  availability: "Active" | "Inactive" | "Archived",
) {
  try {
    await dbConnect();

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { courseAvailability: availability },
      { new: true },
    ).lean();

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
      message: `Course ${availability.toLowerCase()} successfully`,
      data: plainCourse,
    };
  } catch (error) {
    console.error("Error updating course availability:", error);
    return {
      success: false,
      message: "Failed to update course availability",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
