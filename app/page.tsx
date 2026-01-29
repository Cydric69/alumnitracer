"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Bell,
  ArrowDown,
} from "lucide-react";
import {
  getEvents,
  getAnnouncements,
  getEventsAnnouncementsStats,
} from "@/app/actions/events-announcements.actions";

interface Event {
  _id: string;
  title: string;
  date: string;
  time?: string;
  description: string;
  year: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Announcement {
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

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showCampuses, setShowCampuses] = useState(false);
  const [showPrograms, setShowPrograms] = useState(false);
  const [latestEvents, setLatestEvents] = useState<Event[]>([]);
  const [latestAnnouncements, setLatestAnnouncements] = useState<
    Announcement[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    activeEvents: number;
    activeAnnouncements: number;
  } | null>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          router.replace("/dashboard");
          return;
        }
      } catch (error) {
        console.log("User not authenticated");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
    fetchLatestData();
  }, [router]);

  const fetchLatestData = async () => {
    try {
      setLoading(true);

      // Get active events and announcements (limit to 5 each)
      const [eventsData, announcementsData, statsData] = await Promise.all([
        getEvents({ status: "active" }),
        getAnnouncements({ status: "active" }),
        getEventsAnnouncementsStats(),
      ]);

      // Sort by date (newest first) and take latest
      const sortedEvents = eventsData
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      const sortedAnnouncements = announcementsData
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setLatestEvents(sortedEvents);
      setLatestAnnouncements(sortedAnnouncements);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching latest data:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white p-4 md:p-6 font-serif">
      {/* Newspaper Masthead with Navigation */}
      <div className="max-w-7xl mx-auto border-b-4 border-black pb-6 mb-8">
        <div className="text-center mb-6">
          <h1 className="text-7xl md:text-8xl font-['Manufacturing_Consent'] tracking-relaxed text-green-800 mb-2">
            CHMSU Alumni Registry
          </h1>

          {/* Navigation Bar - Clean & Minimalistic */}
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

              <button
                onClick={() => scrollToSection("events-announcements-section")}
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
              </button>

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

        {/* Main Newspaper Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Featured Story - Full Width */}
          <div className="lg:col-span-8 space-y-8">
            {/* Main Feature - Now full width */}
            <article className="border-b-2 border-black pb-8">
              <div className="mb-4">
                <span className="bg-green-800 text-white px-3 py-1 text-sm uppercase tracking-widest">
                  Official Announcement
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-['Times_New_Roman'] leading-tight mb-4">
                CHMSU Launches Alumni Information Registry System
              </h2>
              <div className="flex items-center mb-6 text-sm text-gray-600">
                <span className="mr-4">By ALUMNI RELATIONS OFFICE</span>
                <span>Published Today</span>
              </div>

              <div className="mb-6">
                <p className="text-lg leading-relaxed mb-4">
                  Carlos Hilado Memorial State University announces the launch
                  of its official Alumni Information Registry System. This
                  platform allows all graduates from Talisay Main Campus,
                  Alijis, Fortune Towne, and Binalbagan to submit their contact
                  information to stay connected with the university.
                </p>
                <p className="text-lg leading-relaxed mb-4">
                  "No registration required! Simply provide your basic
                  information, and we'll ensure you receive all updates about
                  alumni events, anniversary celebrations, and university news,"
                  said Dr. Maria Lourdes D. Santos, University President. "This
                  will help us properly organize our Golden Anniversary
                  celebrations next year."
                </p>
              </div>

              {/* Campuses Accordion */}
              <div className="mb-6">
                <button
                  onClick={() => setShowCampuses(!showCampuses)}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  <h4 className="font-bold text-lg text-green-800">
                    View All CHMSU Campuses
                  </h4>
                  {showCampuses ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>

                {showCampuses && (
                  <div className="border border-gray-300 border-t-0 p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="p-3 border border-gray-300 bg-gray-50">
                          <h5 className="font-bold text-green-800">
                            Talisay Main Campus
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Primary campus with comprehensive facilities
                          </p>
                        </div>
                        <div className="p-3 border border-gray-300 bg-gray-50">
                          <h5 className="font-bold text-green-800">
                            Alijis Campus
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Technology and engineering programs
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="p-3 border border-gray-300 bg-gray-50">
                          <h5 className="font-bold text-green-800">
                            Fortune Towne Campus
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Education and business programs
                          </p>
                        </div>
                        <div className="p-3 border border-gray-300 bg-gray-50">
                          <h5 className="font-bold text-green-800">
                            Binalbagan Campus
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Criminology and security programs
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Programs Accordion */}
              <div className="mb-6">
                <button
                  onClick={() => setShowPrograms(!showPrograms)}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  <h4 className="font-bold text-lg text-green-800">
                    View All CHMSU Programs
                  </h4>
                  {showPrograms ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>

                {showPrograms && (
                  <div className="border border-gray-300 border-t-0 p-4 bg-white">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      <div className="p-2 border border-gray-300 bg-gray-50 text-center">
                        <div className="font-bold">BSIT</div>
                        <div className="text-xs text-gray-600">
                          Information Technology
                        </div>
                      </div>
                      <div className="p-2 border border-gray-300 bg-gray-50 text-center">
                        <div className="font-bold">BSED</div>
                        <div className="text-xs text-gray-600">
                          Secondary Education
                        </div>
                      </div>
                      <div className="p-2 border border-gray-300 bg-gray-50 text-center">
                        <div className="font-bold">BEED</div>
                        <div className="text-xs text-gray-600">
                          Elementary Education
                        </div>
                      </div>
                      <div className="p-2 border border-gray-300 bg-gray-50 text-center">
                        <div className="font-bold">BA</div>
                        <div className="text-xs text-gray-600">
                          Business Administration
                        </div>
                      </div>
                      <div className="p-2 border border-gray-300 bg-gray-50 text-center">
                        <div className="font-bold">BSFI</div>
                        <div className="text-xs text-gray-600">Finance</div>
                      </div>
                      <div className="p-2 border border-gray-300 bg-gray-50 text-center">
                        <div className="font-bold">BSCRIM</div>
                        <div className="text-xs text-gray-600">Criminology</div>
                      </div>
                      <div className="p-2 border border-gray-300 bg-gray-50 text-center">
                        <div className="font-bold">BSIS</div>
                        <div className="text-xs text-gray-600">
                          Information Systems
                        </div>
                      </div>
                      <div className="p-2 border border-gray-300 bg-gray-50 text-center">
                        <div className="font-bold">BSIE</div>
                        <div className="text-xs text-gray-600">
                          Industrial Engineering
                        </div>
                      </div>
                      <div className="p-2 border border-gray-300 bg-gray-50 text-center">
                        <div className="font-bold">BSE</div>
                        <div className="text-xs text-gray-600">
                          Science Education
                        </div>
                      </div>
                      <div className="p-2 border border-gray-300 bg-gray-50 text-center">
                        <div className="font-bold">POLSCI</div>
                        <div className="text-xs text-gray-600">
                          Political Science
                        </div>
                      </div>
                      <div className="p-2 border border-gray-300 bg-gray-50 text-center col-span-2 md:col-span-1">
                        <div className="font-bold">BSPSYCH</div>
                        <div className="text-xs text-gray-600">Psychology</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      Plus all other degree programs offered across CHMSU
                      campuses
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-6 p-5 bg-gray-50 border-l-4 border-green-800">
                <h4 className="font-bold text-xl mb-3 text-green-800">
                  Why Submit Your Information?
                </h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li className="font-medium">
                    Receive invitations to alumni events and homecomings
                  </li>
                  <li className="font-medium">
                    Get notified about batch reunions and anniversary
                    celebrations
                  </li>
                  <li className="font-medium">
                    Stay updated on university developments and achievements
                  </li>
                  <li className="font-medium">
                    Connect with former classmates and professors
                  </li>
                  <li className="font-medium">
                    Access exclusive alumni benefits and discounts
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <Link
                  href="/information-form"
                  className="inline-block bg-green-800 text-white px-10 py-5 font-bold hover:bg-green-900 transition-colors text-xl w-full md:w-auto"
                >
                  SUBMIT YOUR ALUMNI INFORMATION NOW
                </Link>
                <p className="text-sm text-gray-600 mt-3">
                  No registration required • Takes only 3-5 minutes • All
                  information is confidential
                </p>
              </div>
            </article>

            {/* Events & Announcements Section */}
            <div id="events-announcements-section" className="space-y-8">
              {/* Secondary Stories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Latest Events Section */}
                <article className="border-b border-gray-300 pb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-green-800" />
                    <h3 className="text-2xl font-bold font-['Times_New_Roman']">
                      Latest Events
                    </h3>
                    {stats && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {stats.activeEvents} active
                      </span>
                    )}
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-800"></div>
                    </div>
                  ) : latestEvents.length === 0 ? (
                    <div className="text-center py-6">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No upcoming events yet.</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Check back soon for upcoming events!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(showAllEvents
                        ? latestEvents
                        : latestEvents.slice(0, 3)
                      ).map((event, index) => {
                        const isPast = new Date(event.date) < new Date();
                        return (
                          <div
                            key={event._id}
                            className={`p-4 border rounded-lg ${isPast ? "bg-gray-50 border-gray-200" : "bg-green-50 border-green-200"}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-gray-900">
                                {event.title}
                              </h4>
                              <span className="text-xs text-gray-600">
                                {formatDate(event.date)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                              {event.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${isPast ? "bg-gray-200 text-gray-800" : "bg-green-100 text-green-800"}`}
                              >
                                {isPast ? "PAST" : "UPCOMING"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {event.year}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {latestEvents.length > 3 && (
                        <button
                          onClick={() => setShowAllEvents(!showAllEvents)}
                          className="text-green-800 hover:text-green-900 font-medium text-sm flex items-center gap-1"
                        >
                          {showAllEvents
                            ? "Show Less"
                            : `Show All ${latestEvents.length} Events`}
                          <ArrowDown
                            className={`h-4 w-4 transition-transform ${showAllEvents ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      onClick={() => scrollToSection("all-events-section")}
                      className="text-green-800 hover:text-green-900 font-medium text-sm flex items-center gap-1"
                    >
                      View All Events →
                    </button>
                  </div>
                </article>

                {/* Latest Announcements Section */}
                <article className="border-b border-gray-300 pb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="h-5 w-5 text-green-800" />
                    <h3 className="text-2xl font-bold font-['Times_New_Roman']">
                      Latest Announcements
                    </h3>
                    {stats && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {stats.activeAnnouncements} active
                      </span>
                    )}
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-800"></div>
                    </div>
                  ) : latestAnnouncements.length === 0 ? (
                    <div className="text-center py-6">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No announcements yet.</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Check back soon for updates!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(showAllAnnouncements
                        ? latestAnnouncements
                        : latestAnnouncements.slice(0, 3)
                      ).map((announcement) => (
                        <div
                          key={announcement._id}
                          className="p-4 border border-blue-200 rounded-lg bg-blue-50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900">
                              {announcement.title}
                            </h4>
                            <span className="text-xs text-gray-600">
                              {formatDate(announcement.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                            {announcement.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              ANNOUNCEMENT
                            </span>
                            <span className="text-xs text-gray-500">
                              {announcement.year}
                            </span>
                          </div>
                        </div>
                      ))}

                      {latestAnnouncements.length > 3 && (
                        <button
                          onClick={() =>
                            setShowAllAnnouncements(!showAllAnnouncements)
                          }
                          className="text-green-800 hover:text-green-900 font-medium text-sm flex items-center gap-1"
                        >
                          {showAllAnnouncements
                            ? "Show Less"
                            : `Show All ${latestAnnouncements.length} Announcements`}
                          <ArrowDown
                            className={`h-4 w-4 transition-transform ${showAllAnnouncements ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      onClick={() =>
                        scrollToSection("all-announcements-section")
                      }
                      className="text-green-800 hover:text-green-900 font-medium text-sm flex items-center gap-1"
                    >
                      View All Announcements →
                    </button>
                  </div>
                </article>
              </div>

              {/* All Events Section (For More Details) */}
              <div
                id="all-events-section"
                className="border-t border-gray-300 pt-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold font-['Times_New_Roman'] text-gray-900">
                    All Upcoming Events
                  </h3>
                  <Link
                    href="/events-announcements?tab=events"
                    className="text-green-800 hover:text-green-900 font-medium text-sm"
                  >
                    Full Events Page →
                  </Link>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800"></div>
                  </div>
                ) : latestEvents.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      No upcoming events scheduled
                    </h4>
                    <p className="text-gray-600">
                      Check back soon for upcoming events and reunions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {latestEvents
                      .filter((event) => new Date(event.date) >= new Date())
                      .map((event) => (
                        <div
                          key={event._id}
                          className="p-4 border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {event.title}
                              </h4>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-gray-600">
                                  {formatDate(event.date)}
                                </span>
                                {event.time && (
                                  <span className="text-sm text-gray-600">
                                    {event.time}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {event.year}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {event.description}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* All Announcements Section (For More Details) */}
              <div
                id="all-announcements-section"
                className="border-t border-gray-300 pt-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold font-['Times_New_Roman'] text-gray-900">
                    All Announcements
                  </h3>
                  <Link
                    href="/events-announcements?tab=announcements"
                    className="text-green-800 hover:text-green-900 font-medium text-sm"
                  >
                    Full Announcements Page →
                  </Link>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800"></div>
                  </div>
                ) : latestAnnouncements.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      No announcements available
                    </h4>
                    <p className="text-gray-600">
                      Check back later for important updates.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {latestAnnouncements.map((announcement) => (
                      <div
                        key={announcement._id}
                        className="p-4 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {announcement.title}
                            </h4>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-600">
                                {formatDate(announcement.date)}
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                FROM: ALUMNI OFFICE
                              </span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {announcement.year}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {announcement.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar & Additional Content */}
          <div className="lg:col-span-4 space-y-8">
            {/* Information Registry Callout */}
            <div className="bg-gray-50 p-6 border-2 border-green-800">
              <h3 className="text-2xl font-bold font-['Times_New_Roman'] mb-4 border-b border-green-800 pb-2">
                ALUMNI REGISTRY
              </h3>
              <p className="mb-4">
                <strong>Simple Process:</strong>
              </p>
              <ol className="list-decimal pl-5 mb-4 space-y-2">
                <li>Click "Submit Information" button</li>
                <li>Fill out your details (3-5 minutes)</li>
                <li>No registration or login required</li>
                <li>Receive confirmation email</li>
                <li>Get notified about upcoming events</li>
              </ol>
              <Link
                href="/information-form"
                target="_blank"
                className="inline-block w-full bg-green-800 text-white py-4 font-bold hover:bg-green-900 transition-colors text-center text-lg"
              >
                SUBMIT INFORMATION
              </Link>
              <p className="text-sm text-gray-600 mt-3">
                All information is confidential and used only for alumni
                communications
              </p>
            </div>

            {/* Information Required Section */}
            <div className="border-t-4 border-black pt-6">
              <h3 className="text-2xl font-bold font-['Times_New_Roman'] mb-4">
                INFORMATION WE COLLECT
              </h3>
              <ul className="space-y-4">
                <li className="border-b border-gray-200 pb-3">
                  <h4 className="font-bold">Basic Information</h4>
                  <p className="text-sm text-gray-600">
                    Full name, graduation year, campus, and program
                  </p>
                </li>
                <li className="border-b border-gray-200 pb-3">
                  <h4 className="font-bold">Contact Details</h4>
                  <p className="text-sm text-gray-600">
                    Email address, mobile number, current city
                  </p>
                </li>
                <li className="border-b border-gray-200 pb-3">
                  <h4 className="font-bold">Professional Information</h4>
                  <p className="text-sm text-gray-600">
                    Current occupation and organization (optional)
                  </p>
                </li>
                <li className="pb-3">
                  <h4 className="font-bold">Event Preferences</h4>
                  <p className="text-sm text-gray-600">
                    Types of alumni events you'd like to attend
                  </p>
                </li>
              </ul>
            </div>

            {/* Data Privacy Section */}
            <div className="bg-gray-50 p-6 border border-gray-300">
              <h3 className="text-xl font-bold font-['Times_New_Roman'] mb-4 border-b border-gray-400 pb-2">
                DATA PRIVACY
              </h3>
              <div className="space-y-4 text-sm">
                <div className="border-b border-gray-300 pb-3">
                  <h4 className="font-bold uppercase">Protected Information</h4>
                  <p>
                    Your data is protected under the Data Privacy Act of 2012.
                  </p>
                </div>
                <div className="border-b border-gray-300 pb-3">
                  <h4 className="font-bold uppercase">Limited Use</h4>
                  <p>
                    Information used only for alumni communications and event
                    invitations.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold uppercase">No Sharing</h4>
                  <p>
                    Your contact details will never be shared with third
                    parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Important Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 border-t-4 border-black pt-8">
          <article>
            <h3 className="text-2xl font-bold font-['Times_New_Roman'] mb-3">
              Data Privacy Assurance
            </h3>
            <p className="text-gray-700">
              Your information is protected under the Data Privacy Act. We
              collect data solely for alumni communications, event invitations,
              and university updates. Information will never be shared with
              third parties without your consent.
            </p>
          </article>

          <article>
            <h3 className="text-2xl font-bold font-['Times_New_Roman'] mb-3">
              Why This Registry Matters
            </h3>
            <p className="text-gray-700">
              With thousands of alumni across four campuses, maintaining
              accurate contact information ensures everyone receives important
              announcements about reunions, anniversary events, and
              opportunities to reconnect with the CHMSU community.
            </p>
          </article>

          <article>
            <h3 className="text-2xl font-bold font-['Times_New_Roman'] mb-3">
              Update Your Information
            </h3>
            <p className="text-gray-700">
              If you've already submitted your information but need to update
              your contact details, simply submit the form again. Our system
              will automatically update your existing record with the new
              information.
            </p>
          </article>
        </div>

        {/* Call to Action Section */}
        <div className="mt-12 bg-gray-50 border-4 border-green-800 p-8 text-center">
          <h2 className="text-3xl font-bold font-['Times_New_Roman'] mb-4">
            Help Us Build a Complete Alumni Network
          </h2>
          <p className="text-lg mb-6 max-w-3xl mx-auto">
            Whether you graduated from Talisay Main, Alijis, Fortune Towne, or
            Binalbagan, your information helps us create meaningful connections
            and organize memorable anniversary celebrations.
          </p>
          <Link
            href="/information-form"
            className="inline-block bg-green-800 text-white px-10 py-4 text-xl font-bold hover:bg-green-900 transition-colors"
          >
            SUBMIT YOUR ALUMNI INFORMATION
          </Link>
          <p className="text-sm text-gray-600 mt-4">
            No registration required • Takes only 3-5 minutes • All information
            is confidential
          </p>
        </div>

        {/* Footer Section */}
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
              © 2026 CHMSU Alumni Information Registry System. All rights
              reserved.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
