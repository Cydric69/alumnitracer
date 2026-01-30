"use server";

import { dbConnect } from "@/lib/dbConnect";
import { Campus, ICampus } from "@/models/Campus";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export type CampusFormData = Omit<
  ICampus,
  "campusId" | "createdAt" | "updatedAt"
>;

export async function createCampus(data: CampusFormData) {
  try {
    await dbConnect();

    const existingCampus = await Campus.findOne({
      campusName: data.campusName,
    });
    if (existingCampus) {
      return {
        success: false,
        message: "Campus name already exists",
        error: "DUPLICATE_NAME",
      };
    }

    const campusId = await Campus.getNextCampusId();

    const campus = new Campus({
      ...data,
      campusId,
    });

    const savedCampus = await campus.save();

    const plainCampus = {
      _id: savedCampus._id.toString(),
      campusId: savedCampus.campusId,
      campusName: savedCampus.campusName,
      location: savedCampus.location || "",
      description: savedCampus.description || "",
      createdAt: savedCampus.createdAt?.toISOString(),
      updatedAt: savedCampus.updatedAt?.toISOString(),
    };

    revalidatePath("/dashboard/campuses");

    return {
      success: true,
      message: "Campus created successfully",
      data: plainCampus,
    };
  } catch (error) {
    console.error("Error creating campus:", error);
    return {
      success: false,
      message: "Failed to create campus",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// app/actions/campus.ts - Update getCampuses function
export async function getCampuses() {
  try {
    await dbConnect();
    const campuses = await Campus.find({}).sort({ campusId: 1 }).lean(); // .lean() returns plain objects
    return {
      success: true,
      data: campuses.map((campus) => ({
        id: campus._id.toString(),
        campusId: campus.campusId,
        campusName: campus.campusName,
        location: campus.location || "",
        description: campus.description || "",
        createdAt: campus.createdAt?.toISOString(),
        updatedAt: campus.updatedAt?.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching campuses:", error);
    return {
      success: false,
      message: "Failed to fetch campuses",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export async function getCampusById(id: string) {
  try {
    await dbConnect();
    let campus;
    if (mongoose.Types.ObjectId.isValid(id)) {
      campus = await Campus.findById(id).lean();
    } else {
      campus = await Campus.findOne({ campusId: id }).lean();
    }
    if (!campus) {
      return {
        success: false,
        message: "Campus not found",
        error: "NOT_FOUND",
      };
    }
    const plainCampus = {
      _id: campus._id.toString(),
      campusId: campus.campusId,
      campusName: campus.campusName,
      location: campus.location || "",
      description: campus.description || "",
      createdAt: campus.createdAt?.toISOString(),
      updatedAt: campus.updatedAt?.toISOString(),
    };
    return { success: true, data: plainCampus };
  } catch (error) {
    console.error("Error fetching campus:", error);
    return {
      success: false,
      message: "Failed to fetch campus",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateCampus(id: string, data: Partial<CampusFormData>) {
  try {
    await dbConnect();

    if (data.campusName) {
      const existing = await Campus.findOne({
        campusName: data.campusName,
        _id: { $ne: id },
      });
      if (existing) {
        return {
          success: false,
          message: "Campus name already exists",
          error: "DUPLICATE_NAME",
        };
      }
    }

    const updatedCampus = await Campus.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedCampus) {
      return {
        success: false,
        message: "Campus not found",
        error: "NOT_FOUND",
      };
    }

    const plainCampus = {
      _id: updatedCampus._id.toString(),
      campusId: updatedCampus.campusId,
      campusName: updatedCampus.campusName,
      location: updatedCampus.location || "",
      description: updatedCampus.description || "",
      createdAt: updatedCampus.createdAt?.toISOString(),
      updatedAt: updatedCampus.updatedAt?.toISOString(),
    };

    revalidatePath("/dashboard/campuses");
    revalidatePath(`/dashboard/campuses/${id}`);

    return {
      success: true,
      message: "Campus updated successfully",
      data: plainCampus,
    };
  } catch (error) {
    console.error("Error updating campus:", error);
    return {
      success: false,
      message: "Failed to update campus",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteCampus(id: string) {
  try {
    await dbConnect();
    const deletedCampus = await Campus.findByIdAndDelete(id).lean();
    if (!deletedCampus) {
      return {
        success: false,
        message: "Campus not found",
        error: "NOT_FOUND",
      };
    }
    const plainCampus = {
      _id: deletedCampus._id.toString(),
      campusId: deletedCampus.campusId,
      campusName: deletedCampus.campusName,
      location: deletedCampus.location || "",
      description: deletedCampus.description || "",
      createdAt: deletedCampus.createdAt?.toISOString(),
      updatedAt: deletedCampus.updatedAt?.toISOString(),
    };
    revalidatePath("/dashboard/campuses");
    return {
      success: true,
      message: "Campus deleted successfully",
      data: plainCampus,
    };
  } catch (error) {
    console.error("Error deleting campus:", error);
    return {
      success: false,
      message: "Failed to delete campus",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getNextCampusId() {
  try {
    await dbConnect();
    const nextId = await Campus.getNextCampusId();
    return { success: true, data: nextId };
  } catch (error) {
    console.error("Error getting next campus ID:", error);
    return {
      success: false,
      message: "Failed to get next campus ID",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function searchCampuses(searchTerm: string) {
  try {
    await dbConnect();
    const campuses = await Campus.find({
      $or: [
        { campusId: { $regex: searchTerm, $options: "i" } },
        { campusName: { $regex: searchTerm, $options: "i" } },
        { location: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .sort({ campusId: 1 })
      .limit(20)
      .lean();
    return {
      success: true,
      data: campuses.map((campus) => ({
        _id: campus._id.toString(),
        campusId: campus.campusId,
        campusName: campus.campusName,
        location: campus.location || "",
        description: campus.description || "",
        createdAt: campus.createdAt?.toISOString(),
        updatedAt: campus.updatedAt?.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error searching campuses:", error);
    return {
      success: false,
      message: "Failed to search campuses",
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}
