// app/dashboard/announcements/page.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Search,
  Calendar,
  ExternalLink,
  Newspaper,
  GraduationCap,
  BookOpen,
  Users,
  Building,
  Trophy,
  ChevronRight,
  Filter,
  Clock,
  Mail,
  Phone,
  MapPin,
  Eye,
  Share2,
  Bookmark,
  CalendarDays,
  Tag,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const announcementsPerPage = 6;

  useEffect(() => {
    const loadAnnouncements = async () => {
      setIsLoading(true);

      const mockAnnouncements = [
        {
          id: 1,
          title: "CHMSU Alumni Survey 2024 Now Open",
          date: "October 15, 2024",
          description:
            "Help us improve alumni services by participating in our annual survey. Your feedback helps shape better programs and services for our alumni community. We value your input as we work to enhance the CHMSU alumni experience.",
          type: "survey",
          tags: ["alumni", "feedback", "survey", "improvement"],
          readTime: "2 min read",
          featured: true,
          department: "Alumni Affairs Office",
          views: 1245,
          shares: 45,
          bookmarks: 89,
        },
        {
          id: 2,
          title: "New Scholarship Opportunities Available for Alumni Children",
          date: "October 12, 2024",
          description:
            "CHMSU announces new scholarship programs for children of alumni. Application deadline is November 30, 2024. These scholarships aim to support the educational aspirations of our alumni families and strengthen the CHMSU community legacy.",
          type: "scholarship",
          tags: ["scholarship", "opportunity", "financial aid", "education"],
          readTime: "3 min read",
          featured: true,
          department: "Student Affairs",
          views: 987,
          shares: 32,
          bookmarks: 67,
        },
        {
          id: 3,
          title: "Campus Renovation Updates - Phase 2 Successfully Completed",
          date: "October 10, 2024",
          description:
            "Phase 2 of the comprehensive campus renovation project has been successfully completed. The new facilities include an upgraded library with digital resources, modern student lounge areas, and improved accessibility features across all campuses.",
          type: "campus",
          tags: ["campus", "facilities", "improvement", "renovation"],
          readTime: "4 min read",
          featured: false,
          department: "Campus Development",
          views: 876,
          shares: 21,
          bookmarks: 54,
        },
        {
          id: 4,
          title: "Alumni Directory Update - Keep Your Information Current",
          date: "October 8, 2024",
          description:
            "We're updating our alumni directory to ensure accurate records. Please verify your contact information to stay connected with fellow alumni and receive important university updates and event invitations.",
          type: "directory",
          tags: ["directory", "contact", "update", "network"],
          readTime: "1 min read",
          featured: false,
          department: "Alumni Affairs Office",
          views: 654,
          shares: 18,
          bookmarks: 42,
        },
        {
          id: 5,
          title: "CHMSU Ranked Among Top 50 State Universities in Philippines",
          date: "October 5, 2024",
          description:
            "Carlos Hilado Memorial State University has been ranked among the top 50 state universities in the Philippines for academic excellence in 2024. This achievement reflects our commitment to quality education and continuous improvement.",
          type: "achievement",
          tags: ["achievement", "ranking", "academic", "excellence"],
          readTime: "3 min read",
          featured: true,
          department: "University Administration",
          views: 1543,
          shares: 67,
          bookmarks: 123,
        },
        {
          id: 6,
          title: "Alumni Mentorship Program 2024 Now Accepting Applications",
          date: "October 3, 2024",
          description:
            "The new alumni mentorship program connects successful CHMSU graduates with current students. Share your professional experience and help guide the next generation of CHMSU alumni. Applications are now open for both mentors and mentees.",
          type: "program",
          tags: ["mentorship", "program", "career", "development"],
          readTime: "3 min read",
          featured: false,
          department: "Career Services",
          views: 732,
          shares: 29,
          bookmarks: 61,
        },
        {
          id: 7,
          title: "Library Extended Hours for Alumni Access",
          date: "October 1, 2024",
          description:
            "Alumni can now access the CHMSU main library during extended weekend hours. This includes access to digital resources, study areas, and research assistance. Present your alumni ID for entry and make use of these valuable resources.",
          type: "services",
          tags: ["library", "services", "access", "resources"],
          readTime: "2 min read",
          featured: false,
          department: "Library Services",
          views: 543,
          shares: 15,
          bookmarks: 38,
        },
        {
          id: 8,
          title: "Homecoming 2024 - Save the Date for December Celebration",
          date: "September 28, 2024",
          description:
            "Mark your calendars! The CHMSU Homecoming 2024 is scheduled for December 15. This year's event promises to be memorable with special activities, alumni recognition awards, and opportunities to reconnect with classmates and faculty.",
          type: "event",
          tags: ["homecoming", "event", "reunion", "celebration"],
          readTime: "2 min read",
          featured: true,
          department: "Alumni Affairs Office",
          views: 987,
          shares: 43,
          bookmarks: 78,
        },
        {
          id: 9,
          title: "Research Symposium 2024 - Call for Papers",
          date: "September 25, 2024",
          description:
            "CHMSU announces the 2024 Research Symposium, inviting alumni researchers to submit papers and participate. This event showcases innovative research and fosters collaboration between alumni and current faculty members.",
          type: "academic",
          tags: ["research", "symposium", "academic", "innovation"],
          readTime: "3 min read",
          featured: false,
          department: "Research and Development",
          views: 432,
          shares: 12,
          bookmarks: 29,
        },
        {
          id: 10,
          title: "Alumni Networking Platform Launch",
          date: "September 22, 2024",
          description:
            "Introducing the new CHMSU Alumni Networking Platform - a dedicated space for alumni to connect, collaborate, and share opportunities. Join the platform to expand your professional network and stay engaged with the CHMSU community.",
          type: "technology",
          tags: ["platform", "networking", "technology", "community"],
          readTime: "2 min read",
          featured: false,
          department: "Alumni Affairs Office",
          views: 654,
          shares: 27,
          bookmarks: 51,
        },
      ];

      setAnnouncements(mockAnnouncements);
      setFilteredAnnouncements(mockAnnouncements);
      setIsLoading(false);
    };

    loadAnnouncements();
  }, []);

  useEffect(() => {
    let filtered = announcements;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Apply type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    setFilteredAnnouncements(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedType, announcements]);

  // Pagination logic
  const indexOfLastAnnouncement = currentPage * announcementsPerPage;
  const indexOfFirstAnnouncement =
    indexOfLastAnnouncement - announcementsPerPage;
  const currentAnnouncements = filteredAnnouncements.slice(
    indexOfFirstAnnouncement,
    indexOfLastAnnouncement
  );
  const totalPages = Math.ceil(
    filteredAnnouncements.length / announcementsPerPage
  );

  const announcementTypes = [
    {
      id: "all",
      label: "All News",
      icon: Newspaper,
      count: announcements.length,
    },
    {
      id: "event",
      label: "Events",
      icon: Calendar,
      count: announcements.filter((a) => a.type === "event").length,
    },
    {
      id: "scholarship",
      label: "Scholarships",
      icon: GraduationCap,
      count: announcements.filter((a) => a.type === "scholarship").length,
    },
    {
      id: "program",
      label: "Programs",
      icon: Users,
      count: announcements.filter((a) => a.type === "program").length,
    },
    {
      id: "achievement",
      label: "Achievements",
      icon: Trophy,
      count: announcements.filter((a) => a.type === "achievement").length,
    },
    {
      id: "campus",
      label: "Campus",
      icon: Building,
      count: announcements.filter((a) => a.type === "campus").length,
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "event":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "scholarship":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "program":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "achievement":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "campus":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "event":
        return Calendar;
      case "scholarship":
        return GraduationCap;
      case "program":
        return Users;
      case "achievement":
        return Trophy;
      case "campus":
        return Building;
      default:
        return Newspaper;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Newspaper className="h-8 w-8 text-slate-600 animate-pulse" />
          </div>
          <p className="text-slate-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Newspaper Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-lg">
                <Newspaper className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  CHMSU Chronicle
                </h1>
                <p className="text-sm text-slate-600">
                  Official University Announcements
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-700">
                  Today:{" "}
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <Bell className="h-5 w-5 text-slate-600 cursor-pointer hover:text-slate-900" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Newspaper Layout */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Featured Announcement - Front Page Headline */}
        {filteredAnnouncements.filter((a) => a.featured).length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-0.5 w-12 bg-slate-300"></div>
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Today's Headline
              </span>
              <div className="h-0.5 flex-1 bg-slate-300"></div>
            </div>

            {filteredAnnouncements.filter((a) => a.featured)[0] &&
              (() => {
                const headline = filteredAnnouncements.filter(
                  (a) => a.featured
                )[0];
                const TypeIcon = getTypeIcon(headline.type);
                return (
                  <Card className="border border-slate-200 bg-white shadow-lg overflow-hidden">
                    <div className="h-1 bg-slate-900"></div>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={getTypeColor(headline.type)}>
                          <TypeIcon className="h-3 w-3 mr-1.5" />
                          {headline.type.charAt(0).toUpperCase() +
                            headline.type.slice(1)}
                        </Badge>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {headline.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {headline.readTime}
                          </span>
                        </div>
                      </div>
                      <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
                        {headline.title}
                      </CardTitle>
                      <CardDescription className="text-lg text-slate-600 leading-relaxed">
                        {headline.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <div className="flex flex-wrap gap-2 mb-6">
                        {headline.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-sm border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            <Tag className="h-3 w-3 mr-1.5" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4" />
                            {headline.views.toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Share2 className="h-4 w-4" />
                            {headline.shares} shares
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Bookmark className="h-4 w-4" />
                            {headline.bookmarks} bookmarks
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">
                          Department:{" "}
                          <span className="font-semibold">
                            {headline.department}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
                        <Button
                          size="lg"
                          className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
                        >
                          Read Full Story
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 border-slate-300"
                          >
                            <Bookmark className="h-4 w-4" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 border-slate-300"
                          >
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })()}
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search announcements, events, or news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>
            </div>

            {/* Type Filter - Horizontal Scroll on Mobile */}
            <div className="lg:w-auto">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {announcementTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant={selectedType === type.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        "gap-2 whitespace-nowrap border-slate-300",
                        selectedType === type.id &&
                          "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {type.label}
                      <Badge
                        variant="secondary"
                        className="ml-1 bg-white/20 text-xs"
                      >
                        {type.count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Newspaper Grid Layout */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Latest Announcements
              </h2>
              <p className="text-slate-600 mt-1">
                Showing {currentAnnouncements.length} of{" "}
                {filteredAnnouncements.length} articles
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Filter className="h-4 w-4" />
              <span>Sorted by: Most Recent</span>
            </div>
          </div>

          {currentAnnouncements.length > 0 ? (
            <div className="space-y-6">
              {currentAnnouncements.map((announcement, index) => {
                const TypeIcon = getTypeIcon(announcement.type);
                const isFeatured = announcement.featured;

                return (
                  <Card
                    key={announcement.id}
                    className={cn(
                      "border border-slate-200 bg-white hover:shadow-md transition-shadow duration-300",
                      isFeatured && "border-l-4 border-l-slate-900"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(announcement.type)}>
                            <TypeIcon className="h-3 w-3 mr-1.5" />
                            {announcement.type.charAt(0).toUpperCase() +
                              announcement.type.slice(1)}
                          </Badge>
                          {isFeatured && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {announcement.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {announcement.readTime}
                          </span>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-900 leading-snug mb-2 line-clamp-2">
                        {announcement.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <CardDescription className="text-slate-600 leading-relaxed line-clamp-3 mb-4">
                        {announcement.description}
                      </CardDescription>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          {announcement.tags.slice(0, 3).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs border-slate-200 text-slate-700"
                            >
                              #{tag}
                            </Badge>
                          ))}
                          {announcement.tags.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-slate-200"
                            >
                              +{announcement.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-600">
                          {announcement.department}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-slate-100 pt-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4" />
                            {announcement.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Share2 className="h-4 w-4" />
                            {announcement.shares}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 border-slate-300 hover:border-slate-400"
                        >
                          Read More
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Newspaper className="h-20 w-20 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-700 mb-3">
                No announcements found
              </h3>
              <p className="text-slate-600 max-w-md mx-auto mb-8">
                Try adjusting your search terms or select a different category
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="border-slate-300"
                >
                  Clear Search
                </Button>
                <Button
                  onClick={() => {
                    setSelectedType("all");
                    setSearchQuery("");
                  }}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  Show All Announcements
                </Button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="border-slate-300"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "border-slate-300",
                          currentPage === pageNum &&
                            "bg-slate-900 text-white border-slate-900"
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="border-slate-300"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Contact Information - Newspaper Style */}
        <Card className="mb-12 border border-slate-200 bg-white">
          <CardHeader className="pb-4 border-b border-slate-200">
            <CardTitle className="text-xl font-bold text-slate-900">
              Contact Information
            </CardTitle>
            <CardDescription className="text-slate-600">
              For inquiries and additional information
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-6 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                <div className="p-3 bg-slate-100 rounded-full mb-4">
                  <Mail className="h-6 w-6 text-slate-700" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Email</h4>
                <p className="text-slate-600 text-sm mb-1">
                  alumni@chmsu.edu.ph
                </p>
                <p className="text-slate-500 text-xs">
                  Response within 24 hours
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                <div className="p-3 bg-slate-100 rounded-full mb-4">
                  <Phone className="h-6 w-6 text-slate-700" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Phone</h4>
                <p className="text-slate-600 text-sm mb-1">(034) 432-1234</p>
                <p className="text-slate-500 text-xs">
                  Mon-Fri, 8:00 AM - 5:00 PM
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                <div className="p-3 bg-slate-100 rounded-full mb-4">
                  <MapPin className="h-6 w-6 text-slate-700" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Office</h4>
                <p className="text-slate-600 text-sm mb-1">
                  Alumni Affairs Office
                </p>
                <p className="text-slate-500 text-xs">Main Campus, Alijis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Archive Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-0.5 w-8 bg-slate-300"></div>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Archives
            </span>
            <div className="h-0.5 flex-1 bg-slate-300"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[2024, 2023, 2022, 2021].map((year) => (
              <Card
                key={year}
                className="text-center border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <CardContent className="pt-8 pb-6">
                  <div className="text-4xl font-bold text-slate-900 mb-2">
                    {year}
                  </div>
                  <p className="text-slate-600 text-sm mb-4">Academic Year</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <BookOpen className="h-4 w-4" />
                    Browse Archive
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 mt-12 py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-slate-900 rounded">
                  <Newspaper className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900">
                  CHMSU Chronicle
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Official announcements portal of Carlos Hilado Memorial State
                University
              </p>
            </div>
            <div className="text-sm text-slate-600 text-center md:text-right">
              <p>© {new Date().getFullYear()} CHMSU. All rights reserved.</p>
              <p className="mt-1">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
