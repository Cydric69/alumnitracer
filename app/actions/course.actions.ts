// app/actions/course.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import Course from "@/models/Course";
import Department from "@/models/Department";
import { CourseInput } from "@/types/course";

export async function getCourses() {
  try {
    await dbConnect();
    const courses = await Course.find()
      .populate({
        path: "department",
        select: "name campus",
        populate: {
          path: "campus",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    return courses.map((course) => ({
      id: course._id.toString(),
      name: course.name,
      department: {
        id: course.department._id.toString(),
        name: course.department.name,
        campus: {
          id: course.department.campus._id.toString(),
          name: course.department.campus.name,
        },
      },
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    }));
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    throw new Error(error.message || "Failed to fetch courses");
  }
}

export async function getDepartmentsForSelection() {
  try {
    await dbConnect();
    const departments = await Department.find()
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
    console.error("Error fetching departments for selection:", error);
    throw new Error(error.message || "Failed to fetch departments");
  }
}

export async function getCoursesByDepartment(departmentId: string) {
  try {
    await dbConnect();
    const courses = await Course.find({ department: departmentId }).sort({
      name: 1,
    });

    return courses.map((course) => ({
      id: course._id.toString(),
      name: course.name,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    }));
  } catch (error: any) {
    console.error("Error fetching courses by department:", error);
    throw new Error(error.message || "Failed to fetch courses");
  }
}

export async function createCourse(data: CourseInput) {
  try {
    await dbConnect();

    // Validate input
    if (!data.name || !data.department) {
      throw new Error("All fields are required");
    }

    // Check if department exists and get its campus
    const department = await Department.findById(data.department).populate(
      "campus",
      "name"
    );

    if (!department) {
      throw new Error("Department not found");
    }

    // Check if course already exists in this department
    const existingCourse = await Course.findOne({
      name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
      department: data.department,
    });

    if (existingCourse) {
      throw new Error(
        "A course with this name already exists in this department"
      );
    }

    const course = await Course.create({
      name: data.name.trim(),
      department: data.department,
    });

    // Get the populated course
    const newCourse = await Course.findById(course._id).populate({
      path: "department",
      select: "name campus",
      populate: {
        path: "campus",
        select: "name",
      },
    });

    if (!newCourse) {
      throw new Error("Failed to create course");
    }

    revalidatePath("/dashboard/courses");

    return {
      id: newCourse._id.toString(),
      name: newCourse.name,
      department: {
        id: newCourse.department._id.toString(),
        name: newCourse.department.name,
        campus: {
          id: newCourse.department.campus._id.toString(),
          name: newCourse.department.campus.name,
        },
      },
      createdAt: newCourse.createdAt.toISOString(),
      updatedAt: newCourse.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error creating course:", error);
    throw new Error(error.message || "Failed to create course");
  }
}

export async function updateCourse(id: string, data: CourseInput) {
  try {
    await dbConnect();

    // Validate input
    if (!data.name || !data.department) {
      throw new Error("All fields are required");
    }

    // Check if department exists
    const departmentExists = await Department.findById(data.department);
    if (!departmentExists) {
      throw new Error("Department not found");
    }

    // Check if another course has the same name in the same department
    const existingCourse = await Course.findOne({
      name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
      department: data.department,
      _id: { $ne: id },
    });

    if (existingCourse) {
      throw new Error(
        "A course with this name already exists in this department"
      );
    }

    const course = await Course.findByIdAndUpdate(
      id,
      {
        name: data.name.trim(),
        department: data.department,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: "department",
      select: "name campus",
      populate: {
        path: "campus",
        select: "name",
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    revalidatePath("/dashboard/courses");

    return {
      id: course._id.toString(),
      name: course.name,
      department: {
        id: course.department._id.toString(),
        name: course.department.name,
        campus: {
          id: course.department.campus._id.toString(),
          name: course.department.campus.name,
        },
      },
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error updating course:", error);
    throw new Error(error.message || "Failed to update course");
  }
}

export async function deleteCourse(id: string) {
  try {
    await dbConnect();

    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      throw new Error("Course not found");
    }

    revalidatePath("/dashboard/courses");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting course:", error);
    throw new Error(error.message || "Failed to delete course");
  }
}

export async function getCourseById(id: string) {
  try {
    await dbConnect();

    const course = await Course.findById(id).populate({
      path: "department",
      select: "name campus",
      populate: {
        path: "campus",
        select: "name",
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    return {
      id: course._id.toString(),
      name: course.name,
      department: {
        id: course.department._id.toString(),
        name: course.department.name,
        campus: {
          id: course.department.campus._id.toString(),
          name: course.department.campus.name,
        },
      },
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error fetching course:", error);
    throw new Error(error.message || "Failed to fetch course");
  }
}

export async function getCoursesByCampus(campusId: string) {
  try {
    await dbConnect();

    // First get all departments in this campus
    const departments = await Department.find({ campus: campusId }).select(
      "_id"
    );
    const departmentIds = departments.map((dept) => dept._id);

    // Then get all courses in those departments
    const courses = await Course.find({
      department: { $in: departmentIds },
    })
      .populate({
        path: "department",
        select: "name",
      })
      .sort({ name: 1 });

    return courses.map((course) => ({
      id: course._id.toString(),
      name: course.name,
      department: {
        id: course.department._id.toString(),
        name: course.department.name,
      },
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    }));
  } catch (error: any) {
    console.error("Error fetching courses by campus:", error);
    throw new Error(error.message || "Failed to fetch courses");
  }
}
