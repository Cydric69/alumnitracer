// app/actions/campus.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect"; // Changed from connectToDatabase
import Campus from "@/models/Campus";
import { CampusInput } from "@/types/campus";

export async function getCampuses() {
  try {
    await dbConnect();
    const campuses = await Campus.find().sort({ createdAt: -1 });
    return campuses.map((campus) => ({
      id: campus._id.toString(),
      name: campus.name,
      description: campus.description,
      address: campus.address,
      createdAt: campus.createdAt.toISOString(),
      updatedAt: campus.updatedAt.toISOString(),
    }));
  } catch (error: any) {
    console.error("Error fetching campuses:", error);
    throw new Error(error.message || "Failed to fetch campuses");
  }
}

export async function createCampus(data: CampusInput) {
  try {
    await dbConnect();

    // Validate input
    if (!data.name || !data.description || !data.address) {
      throw new Error("All fields are required");
    }

    // Check if campus already exists
    const existingCampus = await Campus.findOne({
      name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
    });

    if (existingCampus) {
      throw new Error("A campus with this name already exists");
    }

    const campus = await Campus.create({
      name: data.name.trim(),
      description: data.description.trim(),
      address: data.address.trim(),
    });

    revalidatePath("/dashboard/campuses");

    return {
      id: campus._id.toString(),
      name: campus.name,
      description: campus.description,
      address: campus.address,
      createdAt: campus.createdAt.toISOString(),
      updatedAt: campus.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error creating campus:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      throw new Error(errors.join(", "));
    }

    throw new Error(error.message || "Failed to create campus");
  }
}

export async function updateCampus(id: string, data: CampusInput) {
  try {
    await dbConnect();

    // Validate input
    if (!data.name || !data.description || !data.address) {
      throw new Error("All fields are required");
    }

    // Check if another campus has the same name (case-insensitive)
    const existingCampus = await Campus.findOne({
      name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
      _id: { $ne: id },
    });

    if (existingCampus) {
      throw new Error("A campus with this name already exists");
    }

    const campus = await Campus.findByIdAndUpdate(
      id,
      {
        name: data.name.trim(),
        description: data.description.trim(),
        address: data.address.trim(),
      },
      {
        new: true,
        runValidators: true, // Ensure validations run on update
      }
    );

    if (!campus) {
      throw new Error("Campus not found");
    }

    revalidatePath("/dashboard/campuses");

    return {
      id: campus._id.toString(),
      name: campus.name,
      description: campus.description,
      address: campus.address,
      createdAt: campus.createdAt.toISOString(),
      updatedAt: campus.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error updating campus:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      throw new Error(errors.join(", "));
    }

    throw new Error(error.message || "Failed to update campus");
  }
}

export async function deleteCampus(id: string) {
  try {
    await dbConnect();

    const campus = await Campus.findByIdAndDelete(id);

    if (!campus) {
      throw new Error("Campus not found");
    }

    revalidatePath("/dashboard/campuses");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting campus:", error);
    throw new Error(error.message || "Failed to delete campus");
  }
}

// Optional: Get single campus by ID
export async function getCampusById(id: string) {
  try {
    await dbConnect();

    const campus = await Campus.findById(id);

    if (!campus) {
      throw new Error("Campus not found");
    }

    return {
      id: campus._id.toString(),
      name: campus.name,
      description: campus.description,
      address: campus.address,
      createdAt: campus.createdAt.toISOString(),
      updatedAt: campus.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error fetching campus:", error);
    throw new Error(error.message || "Failed to fetch campus");
  }
}
