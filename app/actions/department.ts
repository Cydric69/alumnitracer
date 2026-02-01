"use server";

import { dbConnect } from "@/lib/dbConnect";
import { Department } from "@/models/Department";
import { Campus } from "@/models/Campus";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export type DepartmentFormData = {
  name: string;
  campusId: string; // This should be the campus's custom ID like "002"
  campusName: string;
};

export type UpdateDepartmentData = Partial<
  Omit<DepartmentFormData, "departmentId">
>;

export async function createDepartment(data: DepartmentFormData) {
  try {
    await dbConnect();

    // First, find the campus by its custom ID to get the MongoDB _id
    const campus = await Campus.findOne({ campusId: data.campusId });
    if (!campus) {
      return {
        success: false,
        message: "Campus not found",
        error: "CAMPUS_NOT_FOUND",
      };
    }

    // Check if department with same name already exists in this campus
    const existingDepartment = await Department.findOne({
      name: data.name,
      campusId: data.campusId, // Use the custom campus ID
    });
    if (existingDepartment) {
      return {
        success: false,
        message: "Department with this name already exists in this campus",
        error: "DUPLICATE_DEPARTMENT",
      };
    }

    const departmentId = await Department.getNextDepartmentId();

    const department = new Department({
      departmentId,
      name: data.name,
      campusId: data.campusId, // Store the custom campus ID
      campusName: data.campusName,
    });

    const savedDepartment = await department.save();

    const plainDepartment = {
      _id: savedDepartment._id.toString(),
      id: savedDepartment._id.toString(),
      departmentId: savedDepartment.departmentId,
      name: savedDepartment.name,
      campusId: savedDepartment.campusId, // This will be "002"
      campusName: savedDepartment.campusName,
      timestamp: savedDepartment.timestamp?.toISOString(),
    };

    revalidatePath("/dashboard/departments");
    revalidatePath(`/campuses/${data.campusId}/departments`);

    return {
      success: true,
      message: "Department created successfully",
      data: plainDepartment,
    };
  } catch (error) {
    console.error("Error creating department:", error);
    return {
      success: false,
      message: "Failed to create department",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getDepartments() {
  try {
    await dbConnect();
    const departments = await Department.find({}).sort({ name: 1 }).lean();

    return {
      success: true,
      data: departments.map((dept) => ({
        _id: dept._id.toString(),
        id: dept._id.toString(),
        departmentId: dept.departmentId,
        name: dept.name,
        campusId: dept.campusId, // This is the custom campus ID like "002"
        campusName: dept.campusName,
        timestamp: dept.timestamp?.toISOString(),
        createdAt: dept.timestamp?.toISOString(),
        updatedAt: dept.timestamp?.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return {
      success: false,
      message: "Failed to fetch departments",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function getDepartmentById(id: string) {
  try {
    await dbConnect();
    let department;
    if (mongoose.Types.ObjectId.isValid(id)) {
      department = await Department.findById(id).lean();
    } else {
      department = await Department.findOne({ departmentId: id }).lean();
    }
    if (!department) {
      return {
        success: false,
        message: "Department not found",
        error: "NOT_FOUND",
      };
    }

    const plainDepartment = {
      _id: department._id.toString(),
      id: department._id.toString(),
      departmentId: department.departmentId,
      name: department.name,
      campusId: department.campusId, // Custom campus ID
      campusName: department.campusName,
      timestamp: department.timestamp?.toISOString(),
    };

    return {
      success: true,
      data: plainDepartment,
    };
  } catch (error) {
    console.error("Error fetching department:", error);
    return {
      success: false,
      message: "Failed to fetch department",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getDepartmentsByCampusId(campusId: string) {
  try {
    await dbConnect();
    const departments = await Department.find({ campusId: campusId }) // Use custom campus ID
      .sort({ name: 1 })
      .lean();

    return {
      success: true,
      data: departments.map((dept) => ({
        _id: dept._id.toString(),
        id: dept._id.toString(),
        departmentId: dept.departmentId,
        name: dept.name,
        campusId: dept.campusId, // Custom campus ID
        campusName: dept.campusName,
        timestamp: dept.timestamp?.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching departments by campus:", error);
    return {
      success: false,
      message: "Failed to fetch departments for campus",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function updateDepartment(id: string, data: UpdateDepartmentData) {
  try {
    await dbConnect();

    // If campusId is being updated, verify the campus exists
    if (data.campusId) {
      const campus = await Campus.findOne({ campusId: data.campusId });
      if (!campus) {
        return {
          success: false,
          message: "Campus not found",
          error: "CAMPUS_NOT_FOUND",
        };
      }
    }

    if (data.name) {
      const currentDept = await Department.findById(id)
        .select("campusId")
        .lean();
      const campusIdToCheck = data.campusId || currentDept?.campusId;

      if (campusIdToCheck) {
        const existingDepartment = await Department.findOne({
          name: data.name,
          campusId: campusIdToCheck,
          _id: { $ne: id },
        });
        if (existingDepartment) {
          return {
            success: false,
            message: "Department with this name already exists in this campus",
            error: "DUPLICATE_DEPARTMENT",
          };
        }
      }
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedDepartment) {
      return {
        success: false,
        message: "Department not found",
        error: "NOT_FOUND",
      };
    }

    const plainDepartment = {
      _id: updatedDepartment._id.toString(),
      id: updatedDepartment._id.toString(),
      departmentId: updatedDepartment.departmentId,
      name: updatedDepartment.name,
      campusId: updatedDepartment.campusId, // Custom campus ID
      campusName: updatedDepartment.campusName,
      timestamp: updatedDepartment.timestamp?.toISOString(),
    };

    revalidatePath("/dashboard/departments");
    revalidatePath(`/departments/${id}`);
    revalidatePath(`/campuses/${updatedDepartment.campusId}/departments`);

    return {
      success: true,
      message: "Department updated successfully",
      data: plainDepartment,
    };
  } catch (error) {
    console.error("Error updating department:", error);
    return {
      success: false,
      message: "Failed to update department",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteDepartment(id: string) {
  try {
    await dbConnect();

    const department = await Department.findById(id).select("campusId").lean();
    const deletedDepartment = await Department.findByIdAndDelete(id).lean();

    if (!deletedDepartment) {
      return {
        success: false,
        message: "Department not found",
        error: "NOT_FOUND",
      };
    }

    const plainDepartment = {
      _id: deletedDepartment._id.toString(),
      id: deletedDepartment._id.toString(),
      departmentId: deletedDepartment.departmentId,
      name: deletedDepartment.name,
      campusId: deletedDepartment.campusId, // Custom campus ID
      campusName: deletedDepartment.campusName,
      timestamp: deletedDepartment.timestamp?.toISOString(),
    };

    revalidatePath("/dashboard/departments");
    if (department?.campusId) {
      revalidatePath(`/campuses/${department.campusId}/departments`);
    }

    return {
      success: true,
      message: "Department deleted successfully",
      data: plainDepartment,
    };
  } catch (error) {
    console.error("Error deleting department:", error);
    return {
      success: false,
      message: "Failed to delete department",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getNextDepartmentId() {
  try {
    await dbConnect();
    const nextId = await Department.getNextDepartmentId();
    return {
      success: true,
      data: nextId,
    };
  } catch (error) {
    console.error("Error getting next department ID:", error);
    return {
      success: false,
      message: "Failed to get next department ID",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function searchDepartments(searchTerm: string) {
  try {
    await dbConnect();

    const departments = await Department.find({
      $or: [
        { departmentId: { $regex: searchTerm, $options: "i" } },
        { name: { $regex: searchTerm, $options: "i" } },
        { campusName: { $regex: searchTerm, $options: "i" } },
        { campusId: { $regex: searchTerm, $options: "i" } }, // Search by campus ID too
      ],
    })
      .sort({ name: 1 })
      .limit(20)
      .lean();

    return {
      success: true,
      data: departments.map((dept) => ({
        _id: dept._id.toString(),
        id: dept._id.toString(),
        departmentId: dept.departmentId,
        name: dept.name,
        campusId: dept.campusId, // Custom campus ID
        campusName: dept.campusName,
        timestamp: dept.timestamp?.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error searching departments:", error);
    return {
      success: false,
      message: "Failed to search departments",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function getDepartmentsWithCampus() {
  try {
    await dbConnect();

    const departments = await Department.find({})
      .sort({ campusName: 1, name: 1 })
      .lean();

    return {
      success: true,
      data: departments.map((dept) => ({
        _id: dept._id.toString(),
        id: dept._id.toString(),
        departmentId: dept.departmentId,
        name: dept.name,
        campusId: dept.campusId, // Custom campus ID
        campusName: dept.campusName,
        timestamp: dept.timestamp?.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching departments with campus:", error);
    return {
      success: false,
      message: "Failed to fetch departments with campus details",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function getDepartmentCountByCampus() {
  try {
    await dbConnect();

    const departmentCounts = await Department.aggregate([
      {
        $group: {
          _id: "$campusId", // Group by custom campus ID
          campusName: { $first: "$campusName" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { campusName: 1 },
      },
    ]);

    // Convert aggregation results
    const plainCounts = departmentCounts.map((item) => ({
      campusId: item._id, // This is the custom campus ID
      campusName: item.campusName,
      count: item.count,
    }));

    return {
      success: true,
      data: plainCounts,
    };
  } catch (error) {
    console.error("Error getting department count by campus:", error);
    return {
      success: false,
      message: "Failed to get department count by campus",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

// Helper function to get departments with full campus details
export async function getDepartmentsWithFullCampusDetails() {
  try {
    await dbConnect();

    // Use aggregation to join departments with campuses
    const departments = await Department.aggregate([
      {
        $lookup: {
          from: "campuses",
          localField: "campusId", // Match with campusId field in Campus
          foreignField: "campusId", // Match with campusId field in Campus
          as: "campusDetails",
        },
      },
      {
        $unwind: {
          path: "$campusDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          departmentId: 1,
          name: 1,
          campusId: 1,
          campusName: 1,
          timestamp: 1,
          campusLocation: "$campusDetails.location",
          campusDescription: "$campusDetails.description",
        },
      },
      {
        $sort: { campusName: 1, name: 1 },
      },
    ]);

    // Convert to plain objects
    const plainDepartments = departments.map((dept) => ({
      ...dept,
      _id: dept._id.toString(),
      id: dept._id.toString(),
      timestamp: dept.timestamp?.toISOString(),
    }));

    return {
      success: true,
      data: plainDepartments,
    };
  } catch (error) {
    console.error(
      "Error fetching departments with full campus details:",
      error,
    );
    return {
      success: false,
      message: "Failed to fetch departments with campus details",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}
