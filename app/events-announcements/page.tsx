"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Bell, Clock, MapPin, Users, Newspaper } from "lucide-react";
import {
  getEvents,
  getAnnouncements,
  getYears,
} from "@/app/actions/events-announcements.actions";

// Types for events and announcements
interface Event {
  _id: string;
  title: string;
  date: string;
  time?: string;
  description: string;
  year: string;
  createdAt: string;
  updatedAt: string;
}

interface Announcement {
  _id: string;
  title: string;
  date: string;
  description: string;
  year: string;
  createdAt: string;
  updatedAt: string;
}

export default function EventsAnnouncementsPage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"events" | "announcements">(
    "events",
  );
  const [filterYear, setFilterYear] = useState<string>("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<
    { value: string; label: string }[]
  >([]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  // Fetch data and years
  useEffect(() => {
    fetchData();
    fetchYears();
  }, [filterYear, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get active items only (isActive: true)
      const params = {
        status: "active",
        year: filterYear !== "all" ? filterYear : undefined,
      };

      if (activeTab === "events") {
        const eventsData = await getEvents(params);
        setEvents(eventsData);
      } else {
        const announcementsData = await getAnnouncements(params);
        setAnnouncements(announcementsData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchYears = async () => {
    try {
      const years = await getYears("all");
      setAvailableYears([{ value: "all", label: "All Years" }, ...years]);
    } catch (err) {
      console.error("Error fetching years:", err);
      // Don't show error for years, just use empty array
    }
  };

  // Filter events by year (client-side filtering as backup)
  const filteredEvents =
    filterYear === "all"
      ? events
      : events.filter((event) => event.year === filterYear);

  // Filter announcements by year (client-side filtering as backup)
  const filteredAnnouncements =
    filterYear === "all"
      ? announcements
      : announcements.filter(
          (announcement) => announcement.year === filterYear,
        );

  // Get all years from current data (fallback)
  const allYearsFromData = [
    "all",
    ...new Set([
      ...events.map((e) => e.year),
      ...announcements.map((a) => a.year),
    ]),
  ].sort((a, b) => {
    if (a === "all") return -1;
    if (b === "all") return 1;
    return parseInt(b) - parseInt(a);
  });

  // Use availableYears if we have them, otherwise use data-based years
  const yearOptions =
    availableYears.length > 1
      ? availableYears
      : allYearsFromData.map((year) => ({
          value: year,
          label: year === "all" ? "All Years" : year,
        }));

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format date and time for events
  const formatDateTime = (dateString: string, time?: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return time ? `${formattedDate} at ${time}` : formattedDate;
  };

  if (loading && events.length === 0 && announcements.length === 0) {
    return (
      <main className="min-h-screen bg-white p-4 md:p-6 font-serif">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto"></div>
            <p className="text-gray-600 mt-4">
              Loading events and announcements...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error && events.length === 0 && announcements.length === 0) {
    return (
      <main className="min-h-screen bg-white p-4 md:p-6 font-serif">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={() => {
                fetchData();
                fetchYears();
              }}
              className="mt-4 bg-green-800 hover:bg-green-900 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-4 md:p-6 font-serif">
      {/* Newspaper Masthead with Navigation - SAME AS HOME PAGE */}
      <div className="max-w-7xl mx-auto border-b-4 border-black pb-6 mb-8">
        <div className="text-center mb-6">
          <h1 className="text-7xl md:text-8xl font-['Manufacturing_Consent'] tracking-relaxed text-green-800 mb-2">
            CHMSU Alumni Registry
          </h1>

          {/* Navigation Bar - Clean & Minimalistic - SAME AS HOME PAGE */}
          <div className="flex flex-col md:flex-row justify-between items-center text-sm uppercase tracking-widest border-t border-b border-black py-3 gap-4 md:gap-0">
            {/* Navigation Links - Clean Design */}
            <nav className="flex items-center gap-6 md:gap-8">
              <Link
                href="/"
                className={`
                  transition-all duration-200 font-medium
                  ${
                    isActive("/")
                      ? "text-black font-bold border-b-2 border-black pb-1"
                      : "text-gray-700 hover:text-black hover:border-b-2 hover:border-gray-400 hover:pb-1"
                  }
                `}
              >
                Home
              </Link>

              <Link
                href="/events-announcements"
                className={`
                  transition-all duration-200 font-medium
                  ${
                    isActive("/events-announcements")
                      ? "text-black font-bold border-b-2 border-black pb-1"
                      : "text-gray-700 hover:text-black hover:border-b-2 hover:border-gray-400 hover:pb-1"
                  }
                `}
              >
                Events & Announcements
              </Link>

              <Link
                href="/login"
                className={`
                  transition-all duration-200 font-medium
                  ${
                    isActive("/login")
                      ? "text-gray-800 font-bold border-b-2 border-gray-800 pb-1"
                      : "text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-600 hover:pb-1"
                  }
                `}
              >
                Admin
              </Link>
            </nav>

            {/* Date Display */}
            <div className="text-gray-700">
              <span className="text-xs md:text-sm">
                {new Date()
                  .toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  .toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Events & Announcements Page Specific Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="h-10 w-10 text-green-800" />
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-['Manufacturing_Consent'] tracking-relaxed text-green-800">
                Events & Announcements
              </h2>
              <p className="text-lg text-gray-700 mt-2">
                Stay updated with the latest events, reunions, and important
                announcements from CHMSU Alumni Relations.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white border-2 border-green-800 rounded-lg mb-8">
          <div className="border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4">
              {/* Tabs */}
              <div className="flex space-x-1 mb-4 md:mb-0">
                <button
                  onClick={() => setActiveTab("events")}
                  className={`px-6 py-3 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "events"
                      ? "bg-green-800 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Events ({events.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("announcements")}
                  className={`px-6 py-3 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "announcements"
                      ? "bg-green-800 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Announcements ({announcements.length})
                  </div>
                </button>
              </div>

              {/* Year Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Filter by year:
                </span>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                  disabled={loading}
                >
                  {yearOptions.map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {/* Events Tab Content */}
            {activeTab === "events" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold font-['Times_New_Roman'] text-gray-900">
                    Upcoming & Past Events
                  </h3>
                  <div className="text-sm text-gray-600">
                    {filteredEvents.length}{" "}
                    {filteredEvents.length === 1 ? "event" : "events"} found
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading events...</p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {events.length === 0
                        ? "No events available yet"
                        : "No events match your filter"}
                    </h4>
                    <p className="text-gray-600">
                      {events.length === 0
                        ? "Check back later for upcoming events and reunions."
                        : "Try selecting a different year filter."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => {
                      const isPast = new Date(event.date) < new Date();
                      return (
                        <div
                          key={event._id}
                          className={`border rounded-lg overflow-hidden transition-all hover:shadow-lg ${
                            isPast
                              ? "border-gray-300 bg-gray-50"
                              : "border-green-800 hover:border-green-900"
                          }`}
                        >
                          <div className="p-5">
                            {/* Event Header */}
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    isPast
                                      ? "bg-gray-200 text-gray-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {isPast ? "PAST" : "UPCOMING"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {event.year}
                              </div>
                            </div>

                            {/* Event Title */}
                            <h4 className="text-xl font-bold font-['Times_New_Roman'] mb-3 text-gray-900">
                              {event.title}
                            </h4>

                            {/* Event Details */}
                            <div className="space-y-3 mb-4">
                              <div className="flex items-center text-gray-700">
                                <Calendar className="h-4 w-4 mr-2 text-green-800" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                              {event.time && (
                                <div className="flex items-center text-gray-700">
                                  <Clock className="h-4 w-4 mr-2 text-green-800" />
                                  <span>{event.time}</span>
                                </div>
                              )}
                            </div>

                            {/* Event Description */}
                            <p className="text-gray-700 mb-4 line-clamp-3">
                              {event.description}
                            </p>

                            {/* Action Button */}
                            <div className="pt-4 border-t border-gray-200">
                              {!isPast ? (
                                <button className="w-full bg-green-800 hover:bg-green-900 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                  Register Interest
                                </button>
                              ) : (
                                <button className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                  View Photos
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Announcements Tab Content */}
            {activeTab === "announcements" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold font-['Times_New_Roman'] text-gray-900">
                    Latest Announcements
                  </h3>
                  <div className="text-sm text-gray-600">
                    {filteredAnnouncements.length}{" "}
                    {filteredAnnouncements.length === 1
                      ? "announcement"
                      : "announcements"}{" "}
                    found
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800 mx-auto"></div>
                    <p className="text-gray-600 mt-4">
                      Loading announcements...
                    </p>
                  </div>
                ) : filteredAnnouncements.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {announcements.length === 0
                        ? "No announcements available yet"
                        : "No announcements match your filter"}
                    </h4>
                    <p className="text-gray-600">
                      {announcements.length === 0
                        ? "Check back later for important updates."
                        : "Try selecting a different year filter."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAnnouncements.map((announcement) => (
                      <div
                        key={announcement._id}
                        className="border border-gray-300 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-5">
                          {/* Announcement Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span
                                className={`px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800`}
                              >
                                ANNOUNCEMENT
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {announcement.year}
                            </div>
                          </div>

                          {/* Announcement Title and Date */}
                          <div className="mb-3">
                            <h4 className="text-xl font-bold font-['Times_New_Roman'] text-gray-900 mb-1">
                              {announcement.title}
                            </h4>
                            <div className="flex items-center text-gray-600 text-sm">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{formatDate(announcement.date)}</span>
                            </div>
                          </div>

                          {/* Announcement Description */}
                          <p className="text-gray-700 mb-4 line-clamp-3">
                            {announcement.description}
                          </p>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                              From: Alumni Relations Office
                            </div>
                            <button className="text-green-800 hover:text-green-900 font-medium text-sm flex items-center gap-1">
                              Read More →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Subscribe Section */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
            <h3 className="text-xl font-bold font-['Times_New_Roman'] mb-4 text-gray-900">
              Stay Updated
            </h3>
            <p className="text-gray-700 mb-4">
              Get notifications about upcoming events and important
              announcements directly to your email.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
              />
              <button className="w-full bg-green-800 hover:bg-green-900 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                Subscribe to Updates
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-bold font-['Times_New_Roman'] mb-4 text-green-900">
              Contact Alumni Office
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-800 mb-1">
                  For Event Inquiries:
                </h4>
                <p className="text-gray-700">Email: events@chmsu.edu.ph</p>
                <p className="text-gray-700">Phone: (034) 495-0001</p>
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-1">
                  For Announcements:
                </h4>
                <p className="text-gray-700">
                  Email: announcements@chmsu.edu.ph
                </p>
                <p className="text-gray-700">Phone: (034) 495-0002</p>
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-1">
                  Office Hours:
                </h4>
                <p className="text-gray-700">
                  Monday to Friday, 8:00 AM - 5:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gray-50 border-4 border-green-800 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold font-['Times_New_Roman'] mb-4 text-gray-900">
            Want to Organize an Event?
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Planning a batch reunion or special gathering? Contact the Alumni
            Relations Office for support, venue arrangements, and promotion of
            your event.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/information-form"
              className="inline-block bg-green-800 hover:bg-green-900 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Update Your Information
            </Link>
            <button className="inline-block border-2 border-green-800 hover:bg-green-800 hover:text-white text-green-800 font-bold py-3 px-8 rounded-lg transition-colors">
              Contact Event Coordinator
            </button>
          </div>
        </div>

        {/* Footer Section - SAME AS HOME PAGE */}
        <footer className="mt-12 pt-6 border-t-4 border-black text-center text-sm text-gray-600">
          <p className="font-bold">
            CHMSU ALUMNI RELATIONS OFFICE • CONNECTING GRADUATES SINCE 1946
          </p>
          <p className="mt-2">
            Carlos Hilado Memorial State University • Talisay, Negros
            Occidental, Philippines
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 md:gap-6">
            <Link
              href="/information-form"
              target="_blank"
              className="hover:text-black transition-colors font-medium"
            >
              Submit Information
            </Link>
            <Link
              href="/events-announcements"
              className="hover:text-black transition-colors font-medium"
            >
              Events & Announcements
            </Link>
            <a
              href="mailto:alumni@chmsu.edu.ph"
              className="hover:text-black transition-colors font-medium"
            >
              Email: alumni@chmsu.edu.ph
            </a>
          </div>
          <div className="mt-4">
            <p className="text-xs">
              Contact Alumni Office: (034) 495-0000 | Email: alumni@chmsu.edu.ph
            </p>
            <p className="text-xs mt-2">
              © {new Date().getFullYear()} CHMSU Alumni Information Registry
              System. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
