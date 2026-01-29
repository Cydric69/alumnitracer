"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import Event from "@/models/Events";
import Announcement from "@/models/Announcement";

// ========== COMMON TYPES ==========

export interface EventInput {
  title: string;
  date: Date;
  time?: string;
  location?: string;
  description: string;
  year: string;
  expiresAt?: Date | null;
  isActive: boolean;
}

export interface AnnouncementInput {
  title: string;
  date: Date;
  description: string;
  year: string;
  expiresAt?: Date | null;
  isActive: boolean;
}

// ========== EVENT ACTIONS ==========

// Get all events with optional filters
export async function getEvents(
  params: {
    status?: string;
    year?: string;
  } = {},
) {
  try {
    await dbConnect();

    // Build filters
    const filters: any = {};

    // Status filter
    if (params.status && params.status !== "all") {
      filters.isActive = params.status === "active";
    }

    // Year filter
    if (params.year && params.year !== "all") {
      filters.year = params.year;
    }

    const events = await Event.find(filters)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return events.map((event) => ({
      _id: event._id.toString(),
      title: event.title,
      date: event.date.toISOString(),
      time: event.time,
      location: event.location,
      description: event.description,
      year: event.year,
      expiresAt: event.expiresAt ? event.expiresAt.toISOString() : undefined,
      isActive: event.isActive,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));
  } catch (error: any) {
    console.error("Error fetching events:", error);
    throw new Error(error.message || "Failed to fetch events");
  }
}

// Create new event
export async function createEvent(data: EventInput) {
  try {
    await dbConnect();

    // Validate required fields
    const requiredFields = ["title", "date", "description", "year"];
    for (const field of requiredFields) {
      if (!data[field as keyof EventInput]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate dates
    const eventDate = new Date(data.date);
    if (isNaN(eventDate.getTime())) {
      throw new Error("Invalid event date");
    }

    if (data.expiresAt) {
      const expiresAt = new Date(data.expiresAt);
      if (isNaN(expiresAt.getTime())) {
        throw new Error("Invalid expiration date");
      }
      if (expiresAt <= eventDate) {
        throw new Error("Expiration date must be after event date");
      }
    }

    // Create event
    const event = await Event.create({
      ...data,
      date: eventDate,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    });

    revalidatePath("/admin/events-announcements");
    revalidatePath("/events");

    return {
      _id: event._id.toString(),
      title: event.title,
      date: event.date.toISOString(),
      time: event.time,
      location: event.location,
      description: event.description,
      year: event.year,
      expiresAt: event.expiresAt ? event.expiresAt.toISOString() : undefined,
      isActive: event.isActive,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error creating event:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      throw new Error(errors.join(", "));
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      throw new Error("An event with similar details already exists");
    }

    throw new Error(error.message || "Failed to create event");
  }
}

// Update event
export async function updateEvent(id: string, data: Partial<EventInput>) {
  try {
    await dbConnect();

    // Check if event exists
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      throw new Error("Event not found");
    }

    // Validate dates if provided
    if (data.date) {
      const eventDate = new Date(data.date);
      if (isNaN(eventDate.getTime())) {
        throw new Error("Invalid event date");
      }
      data.date = eventDate;
    }

    if (data.expiresAt !== undefined) {
      if (data.expiresAt) {
        const expiresAt = new Date(data.expiresAt);
        if (isNaN(expiresAt.getTime())) {
          throw new Error("Invalid expiration date");
        }
        data.expiresAt = expiresAt;
      } else {
        data.expiresAt = null;
      }
    }

    // Check for date consistency
    const finalDate = data.date || existingEvent.date;
    const finalExpiresAt =
      data.expiresAt !== undefined ? data.expiresAt : existingEvent.expiresAt;

    if (finalExpiresAt && new Date(finalExpiresAt) <= new Date(finalDate)) {
      throw new Error("Expiration date must be after event date");
    }

    const event = await Event.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!event) {
      throw new Error("Event not found");
    }

    revalidatePath("/admin/events-announcements");
    revalidatePath("/events");

    return {
      _id: event._id.toString(),
      title: event.title,
      date: event.date.toISOString(),
      time: event.time,
      location: event.location,
      description: event.description,
      year: event.year,
      expiresAt: event.expiresAt ? event.expiresAt.toISOString() : undefined,
      isActive: event.isActive,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error updating event:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      throw new Error(errors.join(", "));
    }

    throw new Error(error.message || "Failed to update event");
  }
}

// Delete event
export async function deleteEvent(id: string) {
  try {
    await dbConnect();

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      throw new Error("Event not found");
    }

    revalidatePath("/admin/events-announcements");
    revalidatePath("/events");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting event:", error);
    throw new Error(error.message || "Failed to delete event");
  }
}

// Toggle event active status
export async function toggleEventActive(id: string) {
  try {
    await dbConnect();

    const event = await Event.findById(id);
    if (!event) {
      throw new Error("Event not found");
    }

    event.isActive = !event.isActive;
    await event.save();

    revalidatePath("/admin/events-announcements");
    revalidatePath("/events");

    return {
      _id: event._id.toString(),
      title: event.title,
      date: event.date.toISOString(),
      time: event.time,
      location: event.location,
      description: event.description,
      year: event.year,
      expiresAt: event.expiresAt ? event.expiresAt.toISOString() : undefined,
      isActive: event.isActive,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error toggling event status:", error);
    throw new Error(error.message || "Failed to toggle event status");
  }
}

// Get single event by ID
export async function getEventById(id: string) {
  try {
    await dbConnect();

    const event = await Event.findById(id);

    if (!event) {
      throw new Error("Event not found");
    }

    return {
      _id: event._id.toString(),
      title: event.title,
      date: event.date.toISOString(),
      time: event.time,
      location: event.location,
      description: event.description,
      year: event.year,
      expiresAt: event.expiresAt ? event.expiresAt.toISOString() : undefined,
      isActive: event.isActive,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error fetching event:", error);
    throw new Error(error.message || "Failed to fetch event");
  }
}

// ========== ANNOUNCEMENT ACTIONS ==========

// Get all announcements with optional filters
export async function getAnnouncements(
  params: {
    status?: string;
    year?: string;
  } = {},
) {
  try {
    await dbConnect();

    // Build filters
    const filters: any = {};

    // Status filter
    if (params.status && params.status !== "all") {
      filters.isActive = params.status === "active";
    }

    // Year filter
    if (params.year && params.year !== "all") {
      filters.year = params.year;
    }

    const announcements = await Announcement.find(filters)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return announcements.map((announcement) => ({
      _id: announcement._id.toString(),
      title: announcement.title,
      date: announcement.date.toISOString(),
      description: announcement.description,
      year: announcement.year,
      expiresAt: announcement.expiresAt
        ? announcement.expiresAt.toISOString()
        : undefined,
      isActive: announcement.isActive,
      createdAt: announcement.createdAt.toISOString(),
      updatedAt: announcement.updatedAt.toISOString(),
    }));
  } catch (error: any) {
    console.error("Error fetching announcements:", error);
    throw new Error(error.message || "Failed to fetch announcements");
  }
}

// Create new announcement
export async function createAnnouncement(data: AnnouncementInput) {
  try {
    await dbConnect();

    // Validate required fields
    const requiredFields = ["title", "date", "description", "year"];
    for (const field of requiredFields) {
      if (!data[field as keyof AnnouncementInput]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate dates
    const announcementDate = new Date(data.date);
    if (isNaN(announcementDate.getTime())) {
      throw new Error("Invalid announcement date");
    }

    if (data.expiresAt) {
      const expiresAt = new Date(data.expiresAt);
      if (isNaN(expiresAt.getTime())) {
        throw new Error("Invalid expiration date");
      }
      if (expiresAt <= announcementDate) {
        throw new Error("Expiration date must be after announcement date");
      }
    }

    // Create announcement
    const announcement = await Announcement.create({
      ...data,
      date: announcementDate,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    });

    revalidatePath("/admin/events-announcements");
    revalidatePath("/announcements");

    return {
      _id: announcement._id.toString(),
      title: announcement.title,
      date: announcement.date.toISOString(),
      description: announcement.description,
      year: announcement.year,
      expiresAt: announcement.expiresAt
        ? announcement.expiresAt.toISOString()
        : undefined,
      isActive: announcement.isActive,
      createdAt: announcement.createdAt.toISOString(),
      updatedAt: announcement.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error creating announcement:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      throw new Error(errors.join(", "));
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      throw new Error("An announcement with similar details already exists");
    }

    throw new Error(error.message || "Failed to create announcement");
  }
}

// Update announcement
export async function updateAnnouncement(
  id: string,
  data: Partial<AnnouncementInput>,
) {
  try {
    await dbConnect();

    // Check if announcement exists
    const existingAnnouncement = await Announcement.findById(id);
    if (!existingAnnouncement) {
      throw new Error("Announcement not found");
    }

    // Validate dates if provided
    if (data.date) {
      const announcementDate = new Date(data.date);
      if (isNaN(announcementDate.getTime())) {
        throw new Error("Invalid announcement date");
      }
      data.date = announcementDate;
    }

    if (data.expiresAt !== undefined) {
      if (data.expiresAt) {
        const expiresAt = new Date(data.expiresAt);
        if (isNaN(expiresAt.getTime())) {
          throw new Error("Invalid expiration date");
        }
        data.expiresAt = expiresAt;
      } else {
        data.expiresAt = null;
      }
    }

    // Check for date consistency
    const finalDate = data.date || existingAnnouncement.date;
    const finalExpiresAt =
      data.expiresAt !== undefined
        ? data.expiresAt
        : existingAnnouncement.expiresAt;

    if (finalExpiresAt && new Date(finalExpiresAt) <= new Date(finalDate)) {
      throw new Error("Expiration date must be after announcement date");
    }

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!announcement) {
      throw new Error("Announcement not found");
    }

    revalidatePath("/admin/events-announcements");
    revalidatePath("/announcements");

    return {
      _id: announcement._id.toString(),
      title: announcement.title,
      date: announcement.date.toISOString(),
      description: announcement.description,
      year: announcement.year,
      expiresAt: announcement.expiresAt
        ? announcement.expiresAt.toISOString()
        : undefined,
      isActive: announcement.isActive,
      createdAt: announcement.createdAt.toISOString(),
      updatedAt: announcement.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error updating announcement:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      throw new Error(errors.join(", "));
    }

    throw new Error(error.message || "Failed to update announcement");
  }
}

// Delete announcement
export async function deleteAnnouncement(id: string) {
  try {
    await dbConnect();

    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      throw new Error("Announcement not found");
    }

    revalidatePath("/admin/events-announcements");
    revalidatePath("/announcements");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting announcement:", error);
    throw new Error(error.message || "Failed to delete announcement");
  }
}

// Toggle announcement active status
export async function toggleAnnouncementActive(id: string) {
  try {
    await dbConnect();

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      throw new Error("Announcement not found");
    }

    announcement.isActive = !announcement.isActive;
    await announcement.save();

    revalidatePath("/admin/events-announcements");
    revalidatePath("/announcements");

    return {
      _id: announcement._id.toString(),
      title: announcement.title,
      date: announcement.date.toISOString(),
      description: announcement.description,
      year: announcement.year,
      expiresAt: announcement.expiresAt
        ? announcement.expiresAt.toISOString()
        : undefined,
      isActive: announcement.isActive,
      createdAt: announcement.createdAt.toISOString(),
      updatedAt: announcement.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error toggling announcement status:", error);
    throw new Error(error.message || "Failed to toggle announcement status");
  }
}

// Get single announcement by ID
export async function getAnnouncementById(id: string) {
  try {
    await dbConnect();

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      throw new Error("Announcement not found");
    }

    return {
      _id: announcement._id.toString(),
      title: announcement.title,
      date: announcement.date.toISOString(),
      description: announcement.description,
      year: announcement.year,
      expiresAt: announcement.expiresAt
        ? announcement.expiresAt.toISOString()
        : undefined,
      isActive: announcement.isActive,
      createdAt: announcement.createdAt.toISOString(),
      updatedAt: announcement.updatedAt.toISOString(),
    };
  } catch (error: any) {
    console.error("Error fetching announcement:", error);
    throw new Error(error.message || "Failed to fetch announcement");
  }
}

// ========== HELPER FUNCTIONS ==========

// Get unique years from events and announcements
export async function getYears(
  contentType: "events" | "announcements" | "all" = "all",
) {
  try {
    await dbConnect();

    let years: string[] = [];

    if (contentType === "events" || contentType === "all") {
      const eventYears = await Event.distinct("year");
      years = [...years, ...eventYears];
    }

    if (contentType === "announcements" || contentType === "all") {
      const announcementYears = await Announcement.distinct("year");
      years = [...years, ...announcementYears];
    }

    // Remove duplicates, sort descending
    const uniqueYears = [...new Set(years)].sort((a, b) => {
      if (!a || !b) return 0;
      return parseInt(b) - parseInt(a);
    });

    return uniqueYears.map((year) => ({
      value: year || "",
      label: year || "Unknown",
    }));
  } catch (error: any) {
    console.error("Error fetching years:", error);
    throw new Error(error.message || "Failed to fetch years");
  }
}

// Get statistics
export async function getEventsAnnouncementsStats() {
  try {
    await dbConnect();

    const [totalEvents, activeEvents, totalAnnouncements, activeAnnouncements] =
      await Promise.all([
        Event.countDocuments(),
        Event.countDocuments({ isActive: true }),
        Announcement.countDocuments(),
        Announcement.countDocuments({ isActive: true }),
      ]);

    return {
      totalEvents,
      activeEvents,
      inactiveEvents: totalEvents - activeEvents,
      totalAnnouncements,
      activeAnnouncements,
      inactiveAnnouncements: totalAnnouncements - activeAnnouncements,
    };
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    throw new Error(error.message || "Failed to fetch statistics");
  }
}

// Search events and announcements
export async function searchContent(
  query: string,
  contentType: "events" | "announcements" | "all" = "all",
) {
  try {
    await dbConnect();

    if (!query || query.trim() === "") {
      return [];
    }

    const searchRegex = { $regex: query.trim(), $options: "i" };

    if (contentType === "events") {
      const events = await Event.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
        ],
      })
        .sort({ date: -1 })
        .limit(10)
        .lean();

      return events.map((event) => ({
        _id: event._id.toString(),
        title: event.title,
        date: event.date.toISOString(),
        time: event.time,
        location: event.location,
        description: event.description,
        year: event.year,
        expiresAt: event.expiresAt ? event.expiresAt.toISOString() : undefined,
        isActive: event.isActive,
        type: "event" as const,
      }));
    } else if (contentType === "announcements") {
      const announcements = await Announcement.find({
        $or: [{ title: searchRegex }, { description: searchRegex }],
      })
        .sort({ date: -1 })
        .limit(10)
        .lean();

      return announcements.map((announcement) => ({
        _id: announcement._id.toString(),
        title: announcement.title,
        date: announcement.date.toISOString(),
        description: announcement.description,
        year: announcement.year,
        expiresAt: announcement.expiresAt
          ? announcement.expiresAt.toISOString()
          : undefined,
        isActive: announcement.isActive,
        type: "announcement" as const,
      }));
    } else {
      // Search both
      const [events, announcements] = await Promise.all([
        Event.find({
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { location: searchRegex },
          ],
        })
          .sort({ date: -1 })
          .limit(5)
          .lean(),
        Announcement.find({
          $or: [{ title: searchRegex }, { description: searchRegex }],
        })
          .sort({ date: -1 })
          .limit(5)
          .lean(),
      ]);

      const combinedResults = [
        ...events.map((event) => ({
          _id: event._id.toString(),
          title: event.title,
          date: event.date.toISOString(),
          time: event.time,
          location: event.location,
          description: event.description,
          year: event.year,
          expiresAt: event.expiresAt
            ? event.expiresAt.toISOString()
            : undefined,
          isActive: event.isActive,
          type: "event" as const,
        })),
        ...announcements.map((announcement) => ({
          _id: announcement._id.toString(),
          title: announcement.title,
          date: announcement.date.toISOString(),
          description: announcement.description,
          year: announcement.year,
          expiresAt: announcement.expiresAt
            ? announcement.expiresAt.toISOString()
            : undefined,
          isActive: announcement.isActive,
          type: "announcement" as const,
        })),
      ];

      // Sort by date (most recent first)
      combinedResults.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      return combinedResults.slice(0, 10);
    }
  } catch (error: any) {
    console.error("Error searching content:", error);
    throw new Error(error.message || "Failed to search content");
  }
}
