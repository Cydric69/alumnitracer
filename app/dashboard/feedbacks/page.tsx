"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Search,
  Filter,
  Download,
  MoreVertical,
  Mail,
  Calendar,
  Star,
  Eye,
  X,
  ThumbsUp,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  FileText,
  Users,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getFeedbacks,
  deleteFeedback,
  getFeedbackStats,
  getFeedbackYears,
} from "../../actions/feedback.actions";
import type { IFeedback, FilterOption } from "@/types/feedback";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeedbacksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedEnrollment, setSelectedEnrollment] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<IFeedback | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Data state
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<IFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    wouldEnrollYes: 0,
    highRatings: 0,
    todaySubmissions: 0,
    avgRating: "0.0",
  });

  // Filter options state
  const [years, setYears] = useState<FilterOption[]>([
    { value: "all", label: "All Years" },
  ]);
  const enrollmentOptions: FilterOption[] = [
    { value: "all", label: "All Responses" },
    { value: "Yes", label: "Would Enroll (Yes)" },
    { value: "No", label: "Would Enroll (No)" },
  ];
  const ratingOptions: FilterOption[] = [
    { value: "all", label: "All Ratings" },
    { value: "high", label: "High (4-5)" },
    { value: "medium", label: "Medium (3)" },
    { value: "low", label: "Low (1-2)" },
  ];

  // Fetch feedback data
  const fetchFeedbackData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch feedback data
      const data = await getFeedbacks();

      if (data && Array.isArray(data)) {
        setFeedbacks(data);
        setFilteredFeedbacks(data);
      } else {
        setFeedbacks([]);
        setFilteredFeedbacks([]);
      }

      // Fetch stats
      const statsData = await getFeedbackStats();
      setStats(statsData);
    } catch (err: any) {
      setError(
        err.message || "Failed to load feedback data. Please try again.",
      );
      setFeedbacks([]);
      setFilteredFeedbacks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const yearOptions = await getFeedbackYears();
      setYears(yearOptions);
    } catch (err: any) {
      setYears([{ value: "all", label: "All Years" }]);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchFeedbackData();
    fetchFilterOptions();
  }, [fetchFeedbackData, fetchFilterOptions]);

  // Filter feedbacks based on selected filters
  useEffect(() => {
    if (!feedbacks.length) {
      setFilteredFeedbacks([]);
      return;
    }

    const filtered = feedbacks.filter((feedback) => {
      const displayName = getDisplayName(feedback).toLowerCase();
      const email = getEmailDisplay(feedback).toLowerCase();
      const likeMost = feedback.likeMost?.toLowerCase() || "";
      const matchesSearch =
        searchQuery === "" ||
        displayName.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase()) ||
        likeMost.includes(searchQuery.toLowerCase());

      const matchesYear =
        selectedYear === "all" ||
        new Date(feedback.createdAt).getFullYear().toString() === selectedYear;

      const matchesEnrollment =
        selectedEnrollment === "all" ||
        feedback.wouldEnroll === selectedEnrollment;

      const avgRating = getAverageRating(feedback);
      const matchesRating =
        selectedRating === "all" ||
        (selectedRating === "high" && avgRating >= 4) ||
        (selectedRating === "medium" && avgRating >= 3 && avgRating < 4) ||
        (selectedRating === "low" && avgRating < 3);

      return matchesSearch && matchesYear && matchesEnrollment && matchesRating;
    });

    setFilteredFeedbacks(filtered);
  }, [
    feedbacks,
    searchQuery,
    selectedYear,
    selectedEnrollment,
    selectedRating,
  ]);

  // Function to get initials from name
  const getInitials = (feedback: IFeedback): string => {
    if (feedback.alumni) {
      return `${feedback.alumni.firstName?.charAt(0) || ""}${feedback.alumni.lastName?.charAt(0) || ""}`.toUpperCase();
    }
    if (feedback.email) {
      return feedback.email.charAt(0).toUpperCase();
    }
    return "A";
  };

  // Function to get display name
  const getDisplayName = (feedback: IFeedback): string => {
    if (feedback.alumni) {
      return `${feedback.alumni.firstName || ""} ${feedback.alumni.lastName || ""}`.trim();
    }
    if (feedback.email) {
      return feedback.email.split("@")[0];
    }
    return "Anonymous";
  };

  // Function to get email display
  const getEmailDisplay = (feedback: IFeedback): string => {
    if (feedback.alumni?.email) {
      return feedback.alumni.email;
    }
    if (feedback.email) {
      return feedback.email;
    }
    return "No email provided";
  };

  // Function to get average rating
  const getAverageRating = (feedback: IFeedback): number => {
    const sum =
      (feedback.jobSearchPreparation || 0) +
      (feedback.careerPreparation || 0) +
      (feedback.otherJobsPreparation || 0);
    return sum / 3;
  };

  // Function to get rating badge color
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "bg-green-100 text-green-800";
    if (rating >= 3) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Function to get rating label
  const getRatingLabel = (rating: number): string => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4) return "Very Good";
    if (rating >= 3.5) return "Good";
    if (rating >= 3) return "Average";
    if (rating >= 2) return "Below Average";
    return "Poor";
  };

  // Function to get enrollment badge
  const getEnrollmentBadge = (wouldEnroll: "Yes" | "No") => {
    if (wouldEnroll === "Yes") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" /> Yes
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
        <XCircle className="h-3 w-3 mr-1" /> No
      </Badge>
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedYear("all");
    setSelectedEnrollment("all");
    setSelectedRating("all");
    setSearchQuery("");
  };

  // Check if any filter is active
  const hasActiveFilters =
    selectedYear !== "all" ||
    selectedEnrollment !== "all" ||
    selectedRating !== "all" ||
    searchQuery !== "";

  // Handle delete feedback
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this feedback?")) {
      try {
        await deleteFeedback(id);
        await fetchFeedbackData();
      } catch (err: any) {
        alert("Failed to delete feedback: " + err.message);
      }
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchFeedbackData();
    fetchFilterOptions();
  };

  // Loading skeleton
  if (isLoading && feedbacks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedbacks</h1>
          <p className="text-gray-500">
            View and manage alumni feedback submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Error state for initial load */}
      {error && feedbacks.length === 0 && (
        <Alert variant="destructive">
          <div className="flex items-center">
            <XCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Feedbacks
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              {stats.todaySubmissions} submitted today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Would Enroll (Yes)
            </CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.wouldEnrollYes.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              {stats.total > 0
                ? `${Math.round((stats.wouldEnrollYes / stats.total) * 100)}% positive response`
                : "No data"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgRating}
              <span className="text-sm text-gray-500">/5</span>
            </div>
            <p className="text-xs text-gray-500">
              {stats.highRatings} high ratings (4+)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedbacks.length > 0 ? (
                <>
                  {Math.round(
                    (feedbacks.filter(
                      (f) =>
                        new Date(f.createdAt).getTime() >
                        Date.now() - 7 * 24 * 60 * 60 * 1000,
                    ).length /
                      feedbacks.length) *
                      100,
                  )}
                  %
                </>
              ) : (
                "0%"
              )}
            </div>
            <p className="text-xs text-gray-500">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Submissions</CardTitle>
          <CardDescription>Browse and filter alumni feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email, or feedback content..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={feedbacks.length === 0}
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Select
                value={selectedYear}
                onValueChange={setSelectedYear}
                disabled={feedbacks.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedEnrollment}
                onValueChange={setSelectedEnrollment}
                disabled={feedbacks.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Enrollment" />
                </SelectTrigger>
                <SelectContent>
                  {enrollmentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedRating}
                onValueChange={setSelectedRating}
                disabled={feedbacks.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  {ratingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters & Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {hasActiveFilters && (
                  <>
                    <span className="text-sm text-gray-600">
                      Active filters:
                    </span>
                    {selectedYear !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Year:{" "}
                        {years.find((y) => y.value === selectedYear)?.label}
                        <button
                          onClick={() => setSelectedYear("all")}
                          className="ml-1 hover:text-red-500"
                          aria-label={`Remove ${selectedYear} filter`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedEnrollment !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {
                          enrollmentOptions.find(
                            (s) => s.value === selectedEnrollment,
                          )?.label
                        }
                        <button
                          onClick={() => setSelectedEnrollment("all")}
                          className="ml-1 hover:text-red-500"
                          aria-label={`Remove ${selectedEnrollment} filter`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedRating !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {
                          ratingOptions.find((r) => r.value === selectedRating)
                            ?.label
                        }
                        <button
                          onClick={() => setSelectedRating("all")}
                          className="ml-1 hover:text-red-500"
                          aria-label={`Remove ${selectedRating} filter`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {searchQuery && (
                      <Badge variant="secondary" className="gap-1">
                        Search: "{searchQuery}"
                        <button
                          onClick={() => setSearchQuery("")}
                          className="ml-1 hover:text-red-500"
                          aria-label="Clear search"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-7 px-2"
                    >
                      Clear all
                    </Button>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={feedbacks.length === 0}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={feedbacks.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Feedback Table */}
          <div className="mt-6 overflow-x-auto">
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {feedbacks.length === 0
                    ? "No feedback data available"
                    : "No feedback found"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {hasActiveFilters && feedbacks.length > 0
                    ? "Try adjusting your filters or search query"
                    : feedbacks.length === 0
                      ? "No feedback submissions have been recorded yet"
                      : "All feedbacks match your filters"}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
                {feedbacks.length === 0 && (
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    className="ml-2"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Respondent</TableHead>
                        <TableHead className="w-[150px]">Ratings</TableHead>
                        <TableHead className="w-[200px]">
                          Values & Skills
                        </TableHead>
                        <TableHead className="w-[300px]">
                          What They Liked Most
                        </TableHead>
                        <TableHead className="w-[100px]">Enrollment</TableHead>
                        <TableHead className="w-[120px]">
                          Date Submitted
                        </TableHead>
                        <TableHead className="text-right w-[80px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedbacks.map((feedback) => {
                        const avgRating = getAverageRating(feedback);
                        return (
                          <TableRow
                            key={feedback.id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-blue-100 text-blue-700">
                                    {getInitials(feedback)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {getDisplayName(feedback)}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Mail className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm text-gray-500 truncate max-w-[150px]">
                                      {getEmailDisplay(feedback)}
                                    </span>
                                  </div>
                                  {feedback.alumni && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs mt-1"
                                    >
                                      Alumni
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge className={getRatingColor(avgRating)}>
                                    {avgRating.toFixed(1)}/5
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {getRatingLabel(avgRating)}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span>
                                      Job Prep: {feedback.jobSearchPreparation}
                                      /5
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span>
                                      Career Prep: {feedback.careerPreparation}
                                      /5
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span>
                                      Other Jobs:{" "}
                                      {feedback.otherJobsPreparation}
                                      /5
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Top Values:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {feedback.developedValues
                                      ?.slice(0, 2)
                                      .map((value, index) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {value}
                                        </Badge>
                                      ))}
                                    {feedback.developedValues?.length > 2 && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        +{feedback.developedValues.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Top Skills:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {feedback.developedSkills
                                      ?.slice(0, 2)
                                      .map((skill, index) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {skill}
                                        </Badge>
                                      ))}
                                    {feedback.developedSkills?.length > 2 && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        +{feedback.developedSkills.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-h-[60px] overflow-hidden">
                                <p className="text-sm line-clamp-3">
                                  {feedback.likeMost || "No comment provided"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getEnrollmentBadge(feedback.wouldEnroll || "No")}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-sm">
                                  {feedback.createdAt
                                    ? new Date(
                                        feedback.createdAt,
                                      ).toLocaleDateString()
                                    : "No date"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {feedback.createdAt
                                    ? new Date(
                                        feedback.createdAt,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Actions for ${getDisplayName(feedback)}`}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFeedback(feedback);
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDelete(feedback.id)}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <p className="text-sm text-gray-500">
                    Showing {filteredFeedbacks.length} of {feedbacks.length}{" "}
                    feedbacks
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="bg-blue-50">
                      1
                    </Button>
                    <Button variant="outline" size="sm">
                      2
                    </Button>
                    <Button variant="outline" size="sm">
                      3
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedFeedback && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                        {getInitials(selectedFeedback)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle>
                        {getDisplayName(selectedFeedback)}
                      </DialogTitle>
                      <DialogDescription>
                        {getEmailDisplay(selectedFeedback)} • Submitted on{" "}
                        {selectedFeedback.createdAt
                          ? new Date(
                              selectedFeedback.createdAt,
                            ).toLocaleDateString()
                          : "Unknown date"}
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getEnrollmentBadge(selectedFeedback.wouldEnroll || "No")}
                    {selectedFeedback.alumni && (
                      <Badge variant="outline">Alumni</Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="ratings" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ratings">Ratings & Feedback</TabsTrigger>
                  <TabsTrigger value="values">Values & Skills</TabsTrigger>
                  <TabsTrigger value="responses">
                    Detailed Responses
                  </TabsTrigger>
                </TabsList>

                {/* Ratings & Feedback Tab */}
                <TabsContent value="ratings" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Overall Ratings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Job Search Preparation
                            </span>
                            <Badge
                              className={getRatingColor(
                                selectedFeedback.jobSearchPreparation,
                              )}
                            >
                              {selectedFeedback.jobSearchPreparation}/5
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(selectedFeedback.jobSearchPreparation / 5) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500">
                            "CHMSU has prepared me for job searching"
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Career Preparation
                            </span>
                            <Badge
                              className={getRatingColor(
                                selectedFeedback.careerPreparation,
                              )}
                            >
                              {selectedFeedback.careerPreparation}/5
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${(selectedFeedback.careerPreparation / 5) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500">
                            "My education prepared me for my career"
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Other Jobs Preparation
                            </span>
                            <Badge
                              className={getRatingColor(
                                selectedFeedback.otherJobsPreparation,
                              )}
                            >
                              {selectedFeedback.otherJobsPreparation}/5
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{
                                width: `${(selectedFeedback.otherJobsPreparation / 5) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500">
                            "My education prepared me for other jobs"
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl font-bold">
                            {getAverageRating(selectedFeedback).toFixed(1)}
                            <span className="text-sm text-gray-500">/5</span>
                          </div>
                          <Badge
                            className={getRatingColor(
                              getAverageRating(selectedFeedback),
                            )}
                          >
                            {getRatingLabel(getAverageRating(selectedFeedback))}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Overall Satisfaction Score
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Values & Skills Tab */}
                <TabsContent value="values" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Values Developed
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedFeedback.developedValues?.map(
                            (value, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                              >
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm">{value}</span>
                              </div>
                            ),
                          ) || (
                            <p className="text-gray-500 text-sm">
                              No values listed
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Skills Developed
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedFeedback.developedSkills?.map(
                            (skill, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm">{skill}</span>
                              </div>
                            ),
                          ) || (
                            <p className="text-gray-500 text-sm">
                              No skills listed
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Detailed Responses Tab */}
                <TabsContent value="responses" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        What I Liked Most
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedFeedback.likeMost || "No comment provided"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedFeedback.needImprovement ||
                            "No comment provided"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedFeedback.suggestions && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {selectedFeedback.suggestions}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Would You Recommend CHMSU?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        {getEnrollmentBadge(
                          selectedFeedback.wouldEnroll || "No",
                        )}
                        <span className="text-sm font-medium">
                          {selectedFeedback.wouldEnroll === "Yes"
                            ? "Yes, I would enroll my child or sibling in CHMSU"
                            : "No, I would not enroll my child or sibling in CHMSU"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Reason:</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {selectedFeedback.whyReason || "No reason provided"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter className="gap-3 pt-4 border-t">
                <div className="text-sm text-gray-500 text-left">
                  <p>
                    Submitted:{" "}
                    {selectedFeedback.createdAt
                      ? new Date(
                          selectedFeedback.createdAt,
                        ).toLocaleDateString()
                      : "Unknown date"}{" "}
                    at{" "}
                    {selectedFeedback.createdAt
                      ? new Date(
                          selectedFeedback.createdAt,
                        ).toLocaleTimeString()
                      : ""}
                  </p>
                  {selectedFeedback.alumni && (
                    <p className="mt-1">
                      Alumni: {selectedFeedback.alumni.firstName}{" "}
                      {selectedFeedback.alumni.lastName}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsDialogOpen(false);
                      handleDelete(selectedFeedback.id);
                    }}
                  >
                    Delete Feedback
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
