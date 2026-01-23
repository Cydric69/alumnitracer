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
  Calendar,
  MapPin,
  Users,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Newspaper,
  CalendarDays,
  Eye,
  Share2,
  Bookmark,
  Tag,
  ChevronRight,
  Bell,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  Globe,
  Trophy,
  Users as UsersIcon,
  Building,
  MessageSquare,
  Award,
  Star,
  Phone,
  Mail,
  MapPin as MapPinIcon,
  BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const EventsContent = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);

      const mockEvents = [
        {
          id: 1,
          title:
            "CHMSU Grand Alumni Homecoming 2024: Golden Jubilee Celebration",
          date: "December 15, 2024",
          time: "6:00 PM - 11:00 PM",
          location: "CHMSU Main Gymnasium",
          venue: "CHMSU Grand Gymnasium",
          attendees: 500,
          registered: 450,
          capacity: 600,
          description:
            "Celebrate 50 years of excellence! Join alumni from all batches for an unforgettable night of reconnection, recognition, and reminiscing. This year marks CHMSU's 50th anniversary with special recognition for batches ending in '4' and '9'.",
          type: "homecoming",
          tags: ["homecoming", "anniversary", "gala", "networking"],
          readTime: "3 min read",
          featured: true,
          organizer: "CHMSU Alumni Relations Office",
          views: 1245,
          shares: 45,
          bookmarks: 89,
          registrationDeadline: "December 10, 2024",
          price: 1500,
          isFree: false,
          campus: "main",
        },
        {
          id: 2,
          title: "CHMSU Career Connect 2024: Future-Ready Professionals",
          date: "November 20-21, 2024",
          time: "9:00 AM - 5:00 PM Daily",
          location: "CHMSU Convention Center",
          venue: "CHMSU Multi-Purpose Hall",
          attendees: 1500,
          registered: 1200,
          capacity: 2000,
          description:
            "Connect with top employers from various industries. Career talks, resume workshops, and on-the-spot interviews available. Two-day career fair featuring 50+ companies from IT, healthcare, education, finance, and engineering sectors.",
          type: "career",
          tags: ["career", "recruitment", "workshop", "networking"],
          readTime: "4 min read",
          featured: true,
          organizer: "CHMSU Career Development Center",
          views: 987,
          shares: 32,
          bookmarks: 67,
          registrationDeadline: "November 18, 2024",
          price: 0,
          isFree: true,
          campus: "main",
        },
        {
          id: 3,
          title: "Digital Transformation Masterclass Series: AI in Business",
          date: "October 30, 2024",
          time: "2:00 PM - 4:00 PM",
          location: "Online Event",
          venue: "Zoom & Facebook Live",
          attendees: 300,
          registered: 280,
          capacity: 500,
          description:
            "Learn how artificial intelligence is reshaping industries and how you can leverage AI tools in your career. Interactive webinar series featuring industry experts discussing practical applications of AI in various sectors.",
          type: "webinar",
          tags: ["webinar", "ai", "technology", "professional-development"],
          readTime: "3 min read",
          featured: false,
          organizer: "CHMSU College of Computer Studies",
          views: 876,
          shares: 21,
          bookmarks: 54,
          price: 0,
          isFree: true,
          campus: "online",
        },
        {
          id: 4,
          title: "Alumni vs Students Sports Festival 2024",
          date: "October 25, 2024",
          time: "8:00 AM - 6:00 PM",
          location: "CHMSU Sports Complex",
          venue: "Main Arena",
          attendees: 200,
          registered: 150,
          capacity: 300,
          description:
            "Annual friendly competition between alumni and current students across multiple sports disciplines. Includes basketball, volleyball, badminton, chess tournaments, opening parade, awards ceremony, and fellowship dinner.",
          type: "sports",
          tags: ["sports", "competition", "wellness", "team-building"],
          readTime: "3 min read",
          featured: false,
          organizer: "CHMSU Sports Development Office",
          views: 654,
          shares: 18,
          bookmarks: 42,
          price: 500,
          isFree: false,
          campus: "main",
        },
        {
          id: 5,
          title: "Batch 2014 Decade of Excellence: 10-Year Reunion",
          date: "November 10, 2024",
          time: "5:00 PM onwards",
          location: "L' Fisher Hotel, Bacolod",
          venue: "Champagne Room",
          attendees: 100,
          registered: 85,
          capacity: 120,
          description:
            "Exclusive gathering for CHMSU Batch 2014 graduates. Celebrate a decade of achievements and rekindle friendships. Intimate dinner party with class photo session, batch updates presentation, and special recognition for class achievements.",
          type: "reunion",
          tags: ["reunion", "batch", "celebration", "exclusive"],
          readTime: "2 min read",
          featured: false,
          organizer: "CHMSU Batch 2014 Officers",
          views: 543,
          shares: 15,
          bookmarks: 38,
          registrationDeadline: "November 5, 2024",
          price: 2000,
          isFree: false,
          campus: "downtown",
        },
        {
          id: 6,
          title: "CHMSU Alumni Community Outreach: Medical Mission",
          date: "December 5, 2024",
          time: "7:00 AM - 3:00 PM",
          location: "Brgy. Taculing Health Center",
          venue: "Community Hall",
          attendees: 150,
          registered: 120,
          capacity: 200,
          description:
            "Give back to the community through free medical checkups, consultations, and health education. Collaboration between CHMSU Medical Alumni and local health workers providing free consultations and health seminars.",
          type: "community",
          tags: ["community-service", "medical", "outreach", "volunteer"],
          readTime: "3 min read",
          featured: true,
          organizer: "CHMSU Medical Alumni Association",
          views: 432,
          shares: 12,
          bookmarks: 29,
          price: 0,
          isFree: true,
          campus: "medical",
        },
        {
          id: 7,
          title: "Entrepreneurship Summit: Building Sustainable Businesses",
          date: "November 28, 2024",
          time: "9:00 AM - 4:00 PM",
          location: "CHMSU Business Innovation Center",
          venue: "Auditorium A",
          attendees: 250,
          registered: 200,
          capacity: 300,
          description:
            "Learn from successful alumni entrepreneurs about starting and scaling sustainable businesses in the Philippines. Full-day summit featuring panel discussions, case studies, and networking sessions.",
          type: "workshop",
          tags: ["entrepreneurship", "business", "startup", "networking"],
          readTime: "4 min read",
          featured: false,
          organizer: "CHMSU College of Business",
          views: 321,
          shares: 8,
          bookmarks: 23,
          price: 800,
          isFree: false,
          campus: "downtown",
        },
        {
          id: 8,
          title: "CHMSU Alumni Awards Night 2024",
          date: "December 20, 2024",
          time: "7:00 PM - 10:00 PM",
          location: "Seda Capitol Central",
          venue: "Grand Ballroom",
          attendees: 300,
          registered: 250,
          capacity: 350,
          description:
            "Celebrate outstanding alumni achievements across various fields and industries. Black-tie event recognizing alumni excellence in Professional Achievement, Community Service, Young Achiever, and Lifetime Achievement categories.",
          type: "awards",
          tags: ["awards", "recognition", "gala", "networking"],
          readTime: "3 min read",
          featured: true,
          organizer: "CHMSU Alumni Foundation",
          views: 654,
          shares: 27,
          bookmarks: 51,
          registrationDeadline: "December 15, 2024",
          price: 2000,
          isFree: false,
          campus: "main",
        },
        {
          id: 9,
          title: "Alumni Networking Mixer: Tech Industry Special",
          date: "November 15, 2024",
          time: "6:00 PM - 9:00 PM",
          location: "Tech Hub Bacolod",
          venue: "Innovation Lounge",
          attendees: 150,
          registered: 120,
          capacity: 180,
          description:
            "Networking event specifically for alumni in the technology industry. Connect with fellow tech professionals, share insights, and explore collaboration opportunities in the growing tech scene.",
          type: "networking",
          tags: ["networking", "tech", "industry", "professional"],
          readTime: "2 min read",
          featured: false,
          organizer: "CHMSU Tech Alumni Association",
          views: 234,
          shares: 9,
          bookmarks: 17,
          price: 300,
          isFree: false,
          campus: "downtown",
        },
        {
          id: 10,
          title: "Alumni Arts and Culture Festival 2024",
          date: "December 8, 2024",
          time: "10:00 AM - 8:00 PM",
          location: "CHMSU Cultural Center",
          venue: "Main Theater and Courtyard",
          attendees: 400,
          registered: 320,
          capacity: 500,
          description:
            "Celebrate the arts with fellow alumni. Featuring art exhibitions, live performances, cultural presentations, and hands-on workshops. Showcase your artistic talents or simply enjoy the creative atmosphere.",
          type: "cultural",
          tags: ["arts", "culture", "festival", "creative"],
          readTime: "3 min read",
          featured: false,
          organizer: "CHMSU Arts and Culture Office",
          views: 345,
          shares: 14,
          bookmarks: 28,
          price: 200,
          isFree: false,
          campus: "main",
        },
      ];

      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
      setIsLoading(false);
    };

    loadEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

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

    setFilteredEvents(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedType, events]);

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const eventTypes = [
    {
      id: "all",
      label: "All Events",
      icon: Calendar,
      count: events.length,
    },
    {
      id: "homecoming",
      label: "Homecoming",
      icon: GraduationCap,
      count: events.filter((a) => a.type === "homecoming").length,
    },
    {
      id: "career",
      label: "Career",
      icon: Briefcase,
      count: events.filter((a) => a.type === "career").length,
    },
    {
      id: "webinar",
      label: "Webinars",
      icon: Globe,
      count: events.filter((a) => a.type === "webinar").length,
    },
    {
      id: "workshop",
      label: "Workshops",
      icon: Award,
      count: events.filter((a) => a.type === "workshop").length,
    },
    {
      id: "reunion",
      label: "Reunions",
      icon: UsersIcon,
      count: events.filter((a) => a.type === "reunion").length,
    },
    {
      id: "community",
      label: "Community",
      icon: HeartHandshake,
      count: events.filter((a) => a.type === "community").length,
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "homecoming":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "career":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "webinar":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "workshop":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "reunion":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "community":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "sports":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "awards":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "networking":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "cultural":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "homecoming":
        return GraduationCap;
      case "career":
        return Briefcase;
      case "webinar":
        return Globe;
      case "workshop":
        return Award;
      case "reunion":
        return UsersIcon;
      case "community":
        return HeartHandshake;
      case "sports":
        return Trophy;
      case "awards":
        return Star;
      case "networking":
        return MessageSquare;
      case "cultural":
        return Award;
      default:
        return Calendar;
    }
  };

  const getCampusColor = (campus: string) => {
    switch (campus) {
      case "main":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "downtown":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "medical":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "education":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "online":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Calendar className="h-8 w-8 text-slate-600 animate-pulse" />
          </div>
          <p className="text-slate-600">Loading events...</p>
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
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  CHMSU Events Chronicle
                </h1>
                <p className="text-sm text-slate-600">
                  Official University Events & Activities
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
        {/* Featured Event - Front Page Headline */}
        {filteredEvents.filter((a) => a.featured).length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-0.5 w-12 bg-slate-300"></div>
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Featured Event
              </span>
              <div className="h-0.5 flex-1 bg-slate-300"></div>
            </div>

            {filteredEvents.filter((a) => a.featured)[0] &&
              (() => {
                const headline = filteredEvents.filter((a) => a.featured)[0];
                const TypeIcon = getTypeIcon(headline.type);
                return (
                  <Card className="border border-slate-200 bg-white shadow-lg overflow-hidden">
                    <div className="h-1 bg-slate-900"></div>
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(headline.type)}>
                            <TypeIcon className="h-3 w-3 mr-1.5" />
                            {headline.type.charAt(0).toUpperCase() +
                              headline.type.slice(1)}
                          </Badge>
                          <Badge className={getCampusColor(headline.campus)}>
                            <Building className="h-3 w-3 mr-1.5" />
                            {headline.campus.charAt(0).toUpperCase() +
                              headline.campus.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {headline.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {headline.time}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            <span className="text-slate-700">
                              {headline.venue || headline.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-500" />
                            <span className="text-slate-700">
                              {headline.registered} / {headline.capacity}{" "}
                              registered
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700">
                              {headline.isFree ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  Free Admission
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  ₱{headline.price?.toLocaleString()}
                                </Badge>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {headline.registrationDeadline && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-700">
                                Register by: {headline.registrationDeadline}
                              </span>
                            </div>
                          )}
                          <div className="text-sm text-slate-600">
                            Organizer:{" "}
                            <span className="font-semibold">
                              {headline.organizer}
                            </span>
                          </div>
                        </div>
                      </div>

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
                      </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
                        <Button
                          size="lg"
                          className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
                        >
                          View Event Details
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
                  placeholder="Search events, locations, or organizers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>
            </div>

            {/* Type Filter - Horizontal Scroll on Mobile */}
            <div className="lg:w-auto">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {eventTypes.map((type) => {
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
                Upcoming Events
              </h2>
              <p className="text-slate-600 mt-1">
                Showing {currentEvents.length} of {filteredEvents.length} events
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Filter className="h-4 w-4" />
              <span>Sorted by: Date (Soonest First)</span>
            </div>
          </div>

          {currentEvents.length > 0 ? (
            <div className="space-y-6">
              {currentEvents.map((event, index) => {
                const TypeIcon = getTypeIcon(event.type);
                const isFeatured = event.featured;

                return (
                  <Card
                    key={event.id}
                    className={cn(
                      "border border-slate-200 bg-white hover:shadow-md transition-shadow duration-300",
                      isFeatured && "border-l-4 border-l-slate-900"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(event.type)}>
                            <TypeIcon className="h-3 w-3 mr-1.5" />
                            {event.type.charAt(0).toUpperCase() +
                              event.type.slice(1)}
                          </Badge>
                          <Badge className={getCampusColor(event.campus)}>
                            <Building className="h-3 w-3 mr-1" />
                            {event.campus}
                          </Badge>
                          {isFeatured && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {event.isFree ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Free
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              ₱{event.price?.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {event.time}
                          </span>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-900 leading-snug mb-2 line-clamp-2">
                        {event.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <CardDescription className="text-slate-600 leading-relaxed line-clamp-3 mb-4">
                        {event.description}
                      </CardDescription>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="line-clamp-1">
                            {event.venue || event.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Users className="h-4 w-4 text-slate-500" />
                          <span>
                            {event.registered} / {event.capacity} registered
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span>{event.readTime}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          {event.tags.slice(0, 3).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs border-slate-200 text-slate-700"
                            >
                              #{tag}
                            </Badge>
                          ))}
                          {event.tags.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-slate-200"
                            >
                              +{event.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-600">
                          By:{" "}
                          <span className="font-semibold">
                            {event.organizer}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-slate-100 pt-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4" />
                            {event.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Share2 className="h-4 w-4" />
                            {event.shares}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 border-slate-300 hover:border-slate-400"
                        >
                          View Details
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
              <Calendar className="h-20 w-20 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-700 mb-3">
                No events found
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
                  Show All Events
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
              Event Information
            </CardTitle>
            <CardDescription className="text-slate-600">
              For event inquiries and coordination
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
                  events@chmsu.edu.ph
                </p>
                <p className="text-slate-500 text-xs">For event coordination</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                <div className="p-3 bg-slate-100 rounded-full mb-4">
                  <Phone className="h-6 w-6 text-slate-700" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Phone</h4>
                <p className="text-slate-600 text-sm mb-1">(034) 432-1235</p>
                <p className="text-slate-500 text-xs">
                  Mon-Fri, 8:00 AM - 5:00 PM
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                <div className="p-3 bg-slate-100 rounded-full mb-4">
                  <MapPinIcon className="h-6 w-6 text-slate-700" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Office</h4>
                <p className="text-slate-600 text-sm mb-1">
                  Events and Alumni Relations
                </p>
                <p className="text-slate-500 text-xs">Main Campus Building</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Archive Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-0.5 w-8 bg-slate-300"></div>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Event Calendar
            </span>
            <div className="h-0.5 flex-1 bg-slate-300"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { month: "December", year: 2024, events: 8 },
              { month: "November", year: 2024, events: 12 },
              { month: "October", year: 2024, events: 6 },
              { month: "January", year: 2025, events: 5 },
            ].map((item) => (
              <Card
                key={`${item.month}-${item.year}`}
                className="text-center border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <CardContent className="pt-8 pb-6">
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {item.month}
                  </div>
                  <div className="text-2xl font-semibold text-slate-700 mb-3">
                    {item.year}
                  </div>
                  <p className="text-slate-600 text-sm mb-4">
                    {item.events} events
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <CalendarDays className="h-4 w-4" />
                    View Calendar
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
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900">
                  CHMSU Events Chronicle
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Official events portal of Carlos Hilado Memorial State
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

export default EventsContent;
