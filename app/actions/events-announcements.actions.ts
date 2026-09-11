"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/dbConnect";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/require-admin";
import {
  fail,
  unauthorized,
  type ActionResult,
} from "@/lib/validations/action-result";
import {
  announcementSchema,
  announcementUpdateSchema,
  eventFiltersSchema,
  eventSchema,
  eventUpdateSchema,
} from "@/lib/validations/events-announcements";
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

export interface EventDto {
  _id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description: string;
  year: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementDto {
  _id: string;
  title: string;
  date: string;
  description: string;
  year: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// The admin list, the public events page and the landing page all render this data.
const REVALIDATE_PATHS = [
  "/dashboard/events-announcements",
  "/events-announcements",
  "/",
];

function revalidateContentPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function serializeEvent(event: any): EventDto {
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
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function serializeAnnouncement(announcement: any): AnnouncementDto {
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
}

function zodIssues(error: {
  issues: { path: (string | number | symbol)[]; message: string }[];
}) {
  return error.issues.map(
    (issue) => `${issue.path.join(".")}: ${issue.message}`,
  );
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function mongooseValidationErrors(error: any): string[] {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return Object.values(error.errors).map((err: any) => err.message);
}

// Never let a raw argument reach a mongo query filter: build the filter from the
// parsed values only, so `{"year":{"$ne":null}}` cannot become an operator.
function buildContentFilters(params: { status?: string; year?: string }) {
  const parsed = eventFiltersSchema.safeParse(params);
  const filters: Record<string, unknown> = {};

  if (!parsed.success) {
    return filters;
  }

  const { status, year } = parsed.data;

  if (status && status !== "all") {
    filters.isActive = status === "active";
  }

  if (year && year !== "all") {
    filters.year = year;
  }

  return filters;
}

// ========== EVENT ACTIONS ==========

// Get all events with optional filters (PUBLIC — landing page and events page)
export async function getEvents(
  params: {
    status?: string;
    year?: string;
  } = {},
) {
  try {
    await dbConnect();

    const events = await Event.find(buildContentFilters(params))
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return events.map(serializeEvent);
  } catch (error) {
    console.error("Error fetching events:", error);
    throw new Error("Failed to fetch events");
  }
}

// Create new event
export async function createEvent(
  data: EventInput,
): Promise<ActionResult<EventDto>> {
  try {
    await requireAdmin();
    await dbConnect();

    // Validate required fields
    const requiredFields = ["title", "date", "description", "year"];
    for (const field of requiredFields) {
      if (!data[field as keyof EventInput]) {
        return fail(`${field} is required`, "VALIDATION");
      }
    }

    // Validate dates
    const eventDate = new Date(data.date);
    if (isNaN(eventDate.getTime())) {
      return fail("Invalid event date", "VALIDATION");
    }

    if (data.expiresAt) {
      const expiresAt = new Date(data.expiresAt);
      if (isNaN(expiresAt.getTime())) {
        return fail("Invalid expiration date", "VALIDATION");
      }
      if (expiresAt <= eventDate) {
        return fail("Expiration date must be after event date", "VALIDATION");
      }
    }

    const parsed = eventSchema.safeParse(data);
    if (!parsed.success) {
      return fail(
        "Please correct the highlighted fields",
        "VALIDATION",
        zodIssues(parsed.error),
      );
    }

    const event = await Event.create({
      ...parsed.data,
      date: eventDate,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    });

    revalidateContentPaths();

    return {
      success: true,
      message: "Event created",
      data: serializeEvent(event),
    };
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    if (error instanceof UnauthorizedError) return unauthorized();
    console.error("createEvent error:", error);

    if (error?.name === "ValidationError") {
      return fail(
        "Please correct the highlighted fields",
        "VALIDATION",
        mongooseValidationErrors(error),
      );
    }

    if (error?.code === 11000) {
      return fail("An event with similar details already exists", "DUPLICATE");
    }

    return fail("Failed to create event");
  }
}

// Update event
export async function updateEvent(
  id: string,
  data: Partial<EventInput>,
): Promise<ActionResult<EventDto>> {
  try {
    await requireAdmin();
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Event not found", "NOT_FOUND");
    }

    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return fail("Event not found", "NOT_FOUND");
    }

    // Validate dates if provided
    if (data.date) {
      const eventDate = new Date(data.date);
      if (isNaN(eventDate.getTime())) {
        return fail("Invalid event date", "VALIDATION");
      }
      data.date = eventDate;
    }

    if (data.expiresAt !== undefined) {
      if (data.expiresAt) {
        const expiresAt = new Date(data.expiresAt);
        if (isNaN(expiresAt.getTime())) {
          return fail("Invalid expiration date", "VALIDATION");
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
      return fail("Expiration date must be after event date", "VALIDATION");
    }

    const parsed = eventUpdateSchema.safeParse(data);
    if (!parsed.success) {
      return fail(
        "Please correct the highlighted fields",
        "VALIDATION",
        zodIssues(parsed.error),
      );
    }

    const event = await Event.findByIdAndUpdate(
      id,
      { ...parsed.data, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!event) {
      return fail("Event not found", "NOT_FOUND");
    }

    revalidateContentPaths();

    return {
      success: true,
      message: "Event updated",
      data: serializeEvent(event),
    };
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    if (error instanceof UnauthorizedError) return unauthorized();
    console.error("updateEvent error:", error);

    if (error?.name === "ValidationError") {
      return fail(
        "Please correct the highlighted fields",
        "VALIDATION",
        mongooseValidationErrors(error),
      );
    }

    return fail("Failed to update event");
  }
}

// Delete event
export async function deleteEvent(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Event not found", "NOT_FOUND");
    }

    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return fail("Event not found", "NOT_FOUND");
    }

    revalidateContentPaths();

    return { success: true, message: "Event deleted" };
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorized();
    console.error("deleteEvent error:", error);
    return fail("Failed to delete event");
  }
}

// Toggle event active status
export async function toggleEventActive(
  id: string,
): Promise<ActionResult<EventDto>> {
  try {
    await requireAdmin();
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Event not found", "NOT_FOUND");
    }

    const event = await Event.findById(id);
    if (!event) {
      return fail("Event not found", "NOT_FOUND");
    }

    event.isActive = !event.isActive;
    await event.save();

    revalidateContentPaths();

    return {
      success: true,
      message: event.isActive ? "Event activated" : "Event deactivated",
      data: serializeEvent(event),
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorized();
    console.error("toggleEventActive error:", error);
    return fail("Failed to toggle event status");
  }
}

// Get single event by ID
export async function getEventById(id: string) {
  try {
    await requireAdmin();
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Event not found");
    }

    const event = await Event.findById(id);
    if (!event) {
      throw new Error("Event not found");
    }

    return serializeEvent(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error instanceof UnauthorizedError
      ? error
      : new Error("Failed to fetch event");
  }
}

// ========== ANNOUNCEMENT ACTIONS ==========

// Get all announcements with optional filters (PUBLIC — landing page and events page)
export async function getAnnouncements(
  params: {
    status?: string;
    year?: string;
  } = {},
) {
  try {
    await dbConnect();

    const announcements = await Announcement.find(buildContentFilters(params))
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return announcements.map(serializeAnnouncement);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw new Error("Failed to fetch announcements");
  }
}

// Create new announcement
export async function createAnnouncement(
  data: AnnouncementInput,
): Promise<ActionResult<AnnouncementDto>> {
  try {
    await requireAdmin();
    await dbConnect();

    // Validate required fields
    const requiredFields = ["title", "date", "description", "year"];
    for (const field of requiredFields) {
      if (!data[field as keyof AnnouncementInput]) {
        return fail(`${field} is required`, "VALIDATION");
      }
    }

    // Validate dates
    const announcementDate = new Date(data.date);
    if (isNaN(announcementDate.getTime())) {
      return fail("Invalid announcement date", "VALIDATION");
    }

    if (data.expiresAt) {
      const expiresAt = new Date(data.expiresAt);
      if (isNaN(expiresAt.getTime())) {
        return fail("Invalid expiration date", "VALIDATION");
      }
      if (expiresAt <= announcementDate) {
        return fail(
          "Expiration date must be after announcement date",
          "VALIDATION",
        );
      }
    }

    const parsed = announcementSchema.safeParse(data);
    if (!parsed.success) {
      return fail(
        "Please correct the highlighted fields",
        "VALIDATION",
        zodIssues(parsed.error),
      );
    }

    const announcement = await Announcement.create({
      ...parsed.data,
      date: announcementDate,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    });

    revalidateContentPaths();

    return {
      success: true,
      message: "Announcement created",
      data: serializeAnnouncement(announcement),
    };
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    if (error instanceof UnauthorizedError) return unauthorized();
    console.error("createAnnouncement error:", error);

    if (error?.name === "ValidationError") {
      return fail(
        "Please correct the highlighted fields",
        "VALIDATION",
        mongooseValidationErrors(error),
      );
    }

    if (error?.code === 11000) {
      return fail(
        "An announcement with similar details already exists",
        "DUPLICATE",
      );
    }

    return fail("Failed to create announcement");
  }
}

// Update announcement
export async function updateAnnouncement(
  id: string,
  data: Partial<AnnouncementInput>,
): Promise<ActionResult<AnnouncementDto>> {
  try {
    await requireAdmin();
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Announcement not found", "NOT_FOUND");
    }

    const existingAnnouncement = await Announcement.findById(id);
    if (!existingAnnouncement) {
      return fail("Announcement not found", "NOT_FOUND");
    }

    // Validate dates if provided
    if (data.date) {
      const announcementDate = new Date(data.date);
      if (isNaN(announcementDate.getTime())) {
        return fail("Invalid announcement date", "VALIDATION");
      }
      data.date = announcementDate;
    }

    if (data.expiresAt !== undefined) {
      if (data.expiresAt) {
        const expiresAt = new Date(data.expiresAt);
        if (isNaN(expiresAt.getTime())) {
          return fail("Invalid expiration date", "VALIDATION");
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
      return fail(
        "Expiration date must be after announcement date",
        "VALIDATION",
      );
    }

    const parsed = announcementUpdateSchema.safeParse(data);
    if (!parsed.success) {
      return fail(
        "Please correct the highlighted fields",
        "VALIDATION",
        zodIssues(parsed.error),
      );
    }

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { ...parsed.data, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!announcement) {
      return fail("Announcement not found", "NOT_FOUND");
    }

    revalidateContentPaths();

    return {
      success: true,
      message: "Announcement updated",
      data: serializeAnnouncement(announcement),
    };
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    if (error instanceof UnauthorizedError) return unauthorized();
    console.error("updateAnnouncement error:", error);

    if (error?.name === "ValidationError") {
      return fail(
        "Please correct the highlighted fields",
        "VALIDATION",
        mongooseValidationErrors(error),
      );
    }

    return fail("Failed to update announcement");
  }
}

// Delete announcement
export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Announcement not found", "NOT_FOUND");
    }

    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      return fail("Announcement not found", "NOT_FOUND");
    }

    revalidateContentPaths();

    return { success: true, message: "Announcement deleted" };
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorized();
    console.error("deleteAnnouncement error:", error);
    return fail("Failed to delete announcement");
  }
}

// Toggle announcement active status
export async function toggleAnnouncementActive(
  id: string,
): Promise<ActionResult<AnnouncementDto>> {
  try {
    await requireAdmin();
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Announcement not found", "NOT_FOUND");
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return fail("Announcement not found", "NOT_FOUND");
    }

    announcement.isActive = !announcement.isActive;
    await announcement.save();

    revalidateContentPaths();

    return {
      success: true,
      message: announcement.isActive
        ? "Announcement activated"
        : "Announcement deactivated",
      data: serializeAnnouncement(announcement),
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorized();
    console.error("toggleAnnouncementActive error:", error);
    return fail("Failed to toggle announcement status");
  }
}

// Get single announcement by ID
export async function getAnnouncementById(id: string) {
  try {
    await requireAdmin();
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Announcement not found");
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      throw new Error("Announcement not found");
    }

    return serializeAnnouncement(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    throw error instanceof UnauthorizedError
      ? error
      : new Error("Failed to fetch announcement");
  }
}

// ========== HELPER FUNCTIONS ==========

// Get unique years from events and announcements (PUBLIC — events page filter)
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
  } catch (error) {
    console.error("Error fetching years:", error);
    throw new Error("Failed to fetch years");
  }
}

// Get statistics (PUBLIC — landing page)
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
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw new Error("Failed to fetch statistics");
  }
}

// Search events and announcements
export async function searchContent(
  query: string,
  contentType: "events" | "announcements" | "all" = "all",
) {
  try {
    await requireAdmin();
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
  } catch (error) {
    console.error("Error searching content:", error);
    throw error instanceof UnauthorizedError
      ? error
      : new Error("Failed to search content");
  }
}
