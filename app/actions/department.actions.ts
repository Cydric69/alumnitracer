// app/actions/department.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import Department from "@/models/Department";
import Campus from "@/models/Campus";
import { DepartmentInput } from "@/types/department";

export async function getDepartments() {
  try {
    await dbConnect();
    const departments = await Department.find()
      .populate("campus", "name campusId") // Added campusId
      .sort({ createdAt: -1 });

    return departments.map((dept) => ({
      id: dept._id.toString(),
      departmentId: dept.departmentId, // Return custom ID
      name: dept.name,
      campus: {
        id: dept.campus._id.toString(),
        campusId: dept.campus.campusId, // Return campus custom ID
        name: dept.campus.name,
      },
      createdAt: dept.createdAt.toISOString(),
      updatedAt: dept.updatedAt.toISOString(),
    }));
  } catch (error: any) {
    console.error("Error fetching departments:", error);
    throw new Error(error.message || "Failed to fetch departments");
  }
}

export async function getDepartmentsByCampus(campusId: string) {
  try {
    await dbConnect();
    const departments = await Department.find({ campus: campusId })
      .populate("campus", "name campusId") // Added campusId
      .sort({ name: 1 });

    return departments.map((dept) => ({
      id: dept._id.toString(),
      departmentId: dept.departmentId, // Return custom ID
      name: dept.name,
      campus: {
        id: dept.campus._id.toString(),
        campusId: dept.campus.campusId, // Return campus custom ID
        name: dept.campus.name,
      },
      createdAt: dept.createdAt.toISOString(),
      updatedAt: dept.updatedAt.toISOString(),
    }));
  } catch (error: any) {
    console.error("Error fetching departments by campus:", error);
    throw new Error(error.message || "Failed to fetch departments");
  }
}

export async function createDepartment(data: DepartmentInput) {
  try {
    await dbConnect();

    // Validate input
    if (!data.name || !data.campus) {
      throw new Error("All fields are required");
    }

    // Check if campus exists
    const campusExists = await Campus.findById(data.campus);
    if (!campusExists) {
      throw new Error("Campus not found");
    }

    // Check if department already exists for this campus
    const existingDepartment = await Department.findOne({
      name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
      campus: data.campus,
    });

    if (existingDepartment) {
      throw new Error(
        "A department with this name already exists in this campus",
      );
    }

    const department = await Department.create({
      name: data.name.trim(),
      campus: data.campus,
    });

    // Populate to get the department with campus data
    const populatedDepartment = await Department.findById(
      department._id,
    ).populate("campus", "name campusId");

    if (!populatedDepartment) {
      throw new Error("Failed to create department");
    }

    revalidatePath("/dashboard/departments");

    return {
      id: populatedDepartment._id.toString(),
      departmentId: populatedDepartment.departmentId, // Return custom ID
      name: populatedDepartment.name,
      campus: {
        id: populatedDepartment.campus._id.toString(),
        campusId: populatedDepartment.campus.campusId, // Return campus custom ID
        name: populatedDepartment.campus.name,
      },
      createdAt: populatedDepartment.createdAt.toISOString(),
      updatedAt: populatedDepartment.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error creating department:", error);
    throw new Error(error.message || "Failed to create department");
  }
}

export async function updateDepartment(id: string, data: DepartmentInput) {
  try {
    await dbConnect();

    // Validate input
    if (!data.name || !data.campus) {
      throw new Error("All fields are required");
    }

    // Check if campus exists
    const campusExists = await Campus.findById(data.campus);
    if (!campusExists) {
      throw new Error("Campus not found");
    }

    // Check if another department has the same name in the same campus
    const existingDepartment = await Department.findOne({
      name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
      campus: data.campus,
      _id: { $ne: id },
    });

    if (existingDepartment) {
      throw new Error(
        "A department with this name already exists in this campus",
      );
    }

    const department = await Department.findByIdAndUpdate(
      id,
      {
        name: data.name.trim(),
        campus: data.campus,
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate("campus", "name campusId"); // Added campusId

    if (!department) {
      throw new Error("Department not found");
    }

    revalidatePath("/dashboard/departments");

    return {
      id: department._id.toString(),
      departmentId: department.departmentId, // Return custom ID
      name: department.name,
      campus: {
        id: department.campus._id.toString(),
        campusId: department.campus.campusId, // Return campus custom ID
        name: department.campus.name,
      },
      createdAt: department.createdAt.toISOString(),
      updatedAt: department.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error updating department:", error);
    throw new Error(error.message || "Failed to update department");
  }
}

export async function deleteDepartment(id: string) {
  try {
    await dbConnect();

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      throw new Error("Department not found");
    }

    revalidatePath("/dashboard/departments");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting department:", error);
    throw new Error(error.message || "Failed to delete department");
  }
}

export async function getDepartmentById(id: string) {
  try {
    await dbConnect();

    const department = await Department.findById(id).populate(
      "campus",
      "name campusId",
    ); // Added campusId

    if (!department) {
      throw new Error("Department not found");
    }

    return {
      id: department._id.toString(),
      departmentId: department.departmentId, // Return custom ID
      name: department.name,
      campus: {
        id: department.campus._id.toString(),
        campusId: department.campus.campusId, // Return campus custom ID
        name: department.campus.name,
      },
      createdAt: department.createdAt.toISOString(),
      updatedAt: department.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error fetching department:", error);
    throw new Error(error.message || "Failed to fetch department");
  }
}
