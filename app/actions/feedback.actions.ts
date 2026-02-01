"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import Feedback from "@/models/Feedback";
import Alumni from "@/models/Alumni";
import { FeedbackInput, IFeedback } from "@/types/feedback";

// Helper function to transform feedback data
const transformFeedbackData = (feedback: any): IFeedback => {
  if (!feedback) {
    console.error("transformFeedbackData: Feedback is null or undefined");
    throw new Error("Feedback data is null or undefined");
  }

  // Convert to plain object if it's a Mongoose document
  const feedbackObj = feedback.toObject ? feedback.toObject() : feedback;

  console.log("Transforming feedback:", {
    id: feedbackObj._id?.toString(),
    hasAlumniId: !!feedbackObj.alumniId,
    alumniId: feedbackObj.alumniId,
    alumniData: feedbackObj.alumniId, // This might be populated
  });

  // Extract alumni data if populated
  let alumniData = null;
  if (feedbackObj.alumniId && typeof feedbackObj.alumniId === "object") {
    // If alumniId is populated (it's an object with alumni data)
    alumniData = {
      id: feedbackObj.alumniId._id?.toString() || "",
      firstName: feedbackObj.alumniId.firstName || "",
      lastName: feedbackObj.alumniId.lastName || "",
      email: feedbackObj.alumniId.email || "",
    };
  }

  return {
    id: feedbackObj._id?.toString() || "",
    alumniId: alumniData
      ? alumniData.id
      : feedbackObj.alumniId?.toString() || undefined,
    email: feedbackObj.email || undefined,
    jobSearchPreparation: feedbackObj.jobSearchPreparation || 0,
    careerPreparation: feedbackObj.careerPreparation || 0,
    otherJobsPreparation: feedbackObj.otherJobsPreparation || 0,
    developedValues: feedbackObj.developedValues || [],
    developedSkills: feedbackObj.developedSkills || [],
    likeMost: feedbackObj.likeMost || "",
    needImprovement: feedbackObj.needImprovement || "",
    suggestions: feedbackObj.suggestions || undefined,
    wouldEnroll: feedbackObj.wouldEnroll || "No",
    whyReason: feedbackObj.whyReason || "",
    createdAt: feedbackObj.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: feedbackObj.updatedAt?.toISOString() || new Date().toISOString(),
    alumni: alumniData,
  };
};

// Create new feedback
export async function createFeedback(data: FeedbackInput) {
  try {
    await dbConnect();

    // Validate required fields
    const requiredFields = [
      "jobSearchPreparation",
      "careerPreparation",
      "otherJobsPreparation",
      "developedValues",
      "developedSkills",
      "likeMost",
      "needImprovement",
      "wouldEnroll",
      "whyReason",
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof FeedbackInput]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate numeric ratings
    const ratings = [
      "jobSearchPreparation",
      "careerPreparation",
      "otherJobsPreparation",
    ];
    for (const rating of ratings) {
      const value = data[rating as keyof FeedbackInput];
      if (typeof value !== "number" || value < 1 || value > 5) {
        throw new Error(`${rating} must be a number between 1 and 5`);
      }
    }

    // Validate arrays
    if (
      !Array.isArray(data.developedValues) ||
      data.developedValues.length === 0
    ) {
      throw new Error("Please select at least one value");
    }

    if (
      !Array.isArray(data.developedSkills) ||
      data.developedSkills.length === 0
    ) {
      throw new Error("Please select at least one skill");
    }

    // If alumniId is provided, verify it exists
    if (data.alumniId) {
      const alumniExists = await Alumni.findById(data.alumniId);
      if (!alumniExists) {
        throw new Error("Alumni not found");
      }
    }

    // If email is provided, validate format
    if (data.email && !data.email.includes("@")) {
      throw new Error("Please enter a valid email address");
    }

    // Prepare data for creation
    const feedbackData: any = {
      ...data,
      email: data.email?.toLowerCase().trim(),
    };

    console.log("Creating feedback with data:", feedbackData);
    const feedback = await Feedback.create(feedbackData);
    console.log("Feedback created successfully:", feedback._id.toString());

    revalidatePath("/dashboard/feedbacks");
    revalidatePath("/feedback");

    return {
      success: true,
      id: feedback._id.toString(),
      message: "Thank you for your feedback!",
    };
  } catch (error: any) {
    console.error("Error creating feedback:", error);
    console.error("Error details:", error.message);
    if (error.errors) {
      console.error("Validation errors:", error.errors);
    }
    throw new Error(error.message || "Failed to submit feedback");
  }
}

// Get all feedbacks
export async function getFeedbacks(): Promise<IFeedback[]> {
  try {
    console.log("🔄 Starting to fetch feedbacks...");
    await dbConnect();
    console.log("✅ Database connected");

    // Fetch feedbacks with alumni populated using alumniId field
    const feedbacks = await Feedback.find({})
      .populate({
        path: "alumniId", // Use alumniId, not alumni
        select: "firstName lastName email",
        model: Alumni,
      })
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    console.log(`✅ Found ${feedbacks.length} feedbacks in database`);

    if (feedbacks.length > 0) {
      console.log("📋 Sample feedback data:", {
        id: feedbacks[0]._id?.toString(),
        email: feedbacks[0].email,
        likeMost: feedbacks[0].likeMost?.substring(0, 50),
        wouldEnroll: feedbacks[0].wouldEnroll,
        alumniId: feedbacks[0].alumniId,
        hasAlumniData:
          !!feedbacks[0].alumniId && typeof feedbacks[0].alumniId === "object",
        jobSearchPreparation: feedbacks[0].jobSearchPreparation,
        careerPreparation: feedbacks[0].careerPreparation,
        otherJobsPreparation: feedbacks[0].otherJobsPreparation,
      });
    } else {
      console.log("ℹ️ No feedbacks found in database");
    }

    // Transform and return
    const transformed = feedbacks.map(transformFeedbackData);
    console.log(`✅ Transformed ${transformed.length} feedbacks`);

    if (transformed.length > 0) {
      console.log("📋 First transformed feedback:", {
        id: transformed[0].id,
        email: transformed[0].email,
        likeMost: transformed[0].likeMost?.substring(0, 50),
        alumni: transformed[0].alumni,
        wouldEnroll: transformed[0].wouldEnroll,
      });
    }

    return transformed;
  } catch (error: any) {
    console.error("❌ Error fetching feedbacks:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return [];
  }
}

// Get feedback by ID
export async function getFeedbackById(id: string): Promise<IFeedback | null> {
  try {
    await dbConnect();

    const feedback = await Feedback.findById(id)
      .populate({
        path: "alumniId",
        select: "firstName lastName email",
        model: Alumni,
      })
      .lean();

    if (!feedback) {
      throw new Error("Feedback not found");
    }

    return transformFeedbackData(feedback);
  } catch (error: any) {
    console.error("Error fetching feedback by ID:", error);
    throw new Error(error.message || "Failed to fetch feedback");
  }
}

// Delete feedback
export async function deleteFeedback(id: string) {
  try {
    await dbConnect();

    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      throw new Error("Feedback not found");
    }

    revalidatePath("/dashboard/feedbacks");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting feedback:", error);
    throw new Error(error.message || "Failed to delete feedback");
  }
}

// Bulk delete feedbacks
export async function bulkDeleteFeedbacks(ids: string[]) {
  try {
    await dbConnect();

    const result = await Feedback.deleteMany({ _id: { $in: ids } });

    revalidatePath("/dashboard/feedbacks");

    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} feedback responses`,
    };
  } catch (error: any) {
    console.error("Error bulk deleting feedbacks:", error);
    throw new Error(error.message || "Failed to bulk delete feedbacks");
  }
}

// Get feedback by alumni ID
export async function getFeedbackByAlumniId(
  alumniId: string,
): Promise<IFeedback | null> {
  try {
    await dbConnect();

    const feedback = await Feedback.findOne({ alumniId })
      .populate({
        path: "alumniId",
        select: "firstName lastName email",
        model: Alumni,
      })
      .lean();

    if (!feedback) {
      return null;
    }

    return transformFeedbackData(feedback);
  } catch (error: any) {
    console.error("Error fetching feedback by alumni ID:", error);
    return null;
  }
}

// Get feedback statistics
export async function getFeedbackStats() {
  try {
    await dbConnect();

    const total = await Feedback.countDocuments();
    const wouldEnrollYes = await Feedback.countDocuments({
      wouldEnroll: "Yes",
    });

    // Count feedbacks with high ratings (4 or 5)
    const highRatings = await Feedback.countDocuments({
      $or: [
        { jobSearchPreparation: { $gte: 4 } },
        { careerPreparation: { $gte: 4 } },
        { otherJobsPreparation: { $gte: 4 } },
      ],
    });

    // Get today's submissions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySubmissions = await Feedback.countDocuments({
      createdAt: { $gte: today },
    });

    // Calculate average ratings
    const averageRatings = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgJobSearch: { $avg: "$jobSearchPreparation" },
          avgCareer: { $avg: "$careerPreparation" },
          avgOtherJobs: { $avg: "$otherJobsPreparation" },
        },
      },
    ]);

    const avgRating =
      averageRatings.length > 0
        ? (
            (averageRatings[0].avgJobSearch +
              averageRatings[0].avgCareer +
              averageRatings[0].avgOtherJobs) /
            3
          ).toFixed(1)
        : "0.0";

    console.log("📊 Stats calculated:", {
      total,
      wouldEnrollYes,
      highRatings,
      todaySubmissions,
      avgRating,
    });

    return {
      total,
      wouldEnrollYes,
      highRatings,
      todaySubmissions,
      avgRating,
    };
  } catch (error: any) {
    console.error("Error fetching feedback stats:", error);
    return {
      total: 0,
      wouldEnrollYes: 0,
      highRatings: 0,
      todaySubmissions: 0,
      avgRating: "0.0",
    };
  }
}

// Get feedback years for filtering
export async function getFeedbackYears(): Promise<
  { value: string; label: string }[]
> {
  try {
    await dbConnect();

    // Get distinct years from createdAt
    const feedbacks = await Feedback.find({}, { createdAt: 1 })
      .sort({ createdAt: -1 })
      .lean();

    const yearsSet = new Set<number>();
    feedbacks.forEach((feedback) => {
      if (feedback.createdAt) {
        const year = new Date(feedback.createdAt).getFullYear();
        yearsSet.add(year);
      }
    });

    const yearsArray = Array.from(yearsSet).sort((a, b) => b - a);

    const result = [
      { value: "all", label: "All Years" },
      ...yearsArray.map((year) => ({
        value: year.toString(),
        label: year.toString(),
      })),
    ];

    console.log("📅 Years for filtering:", result);
    return result;
  } catch (error: any) {
    console.error("Error fetching feedback years:", error);
    return [{ value: "all", label: "All Years" }];
  }
}
