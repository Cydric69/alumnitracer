"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Users,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Building,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Brain,
  Briefcase,
  TrendingUp,
  Cpu,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlumniResponse, getAlumni } from "@/app/actions/alumni";
import {
  AlumniAnalysis,
  generateAlumniAIAnalysis,
} from "@/app/actions/alumniAnalysis";

// Filter options interfaces
interface FilterOption {
  value: string;
  label: string;
}

// Sort configuration
type SortField = "name" | "year" | "campus" | "status" | "department" | "email";
type SortDirection = "asc" | "desc";

export default function AlumniDataPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniResponse | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Data state
  const [alumniData, setAlumniData] = useState<AlumniResponse[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniResponse[]>([]);
  const [currentPageData, setCurrentPageData] = useState<AlumniResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AlumniAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Sort state
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Filter options state
  const [campuses, setCampuses] = useState<FilterOption[]>([
    { value: "all", label: "All Campuses" },
  ]);
  const [departments, setDepartments] = useState<FilterOption[]>([
    { value: "all", label: "All Departments" },
  ]);
  const [graduationYears, setGraduationYears] = useState<FilterOption[]>([
    { value: "all", label: "All Years" },
  ]);

  const employmentStatuses: FilterOption[] = [
    { value: "all", label: "All Status" },
    { value: "Employed", label: "Employed" },
    { value: "Self-Employed", label: "Self-Employed" },
    { value: "Unemployed", label: "Unemployed" },
    { value: "Further Studies", label: "Further Studies" },
    { value: "Never Employed", label: "Never Employed" },
  ];

  // Fetch alumni data
  const fetchAlumniData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getAlumni();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch alumni data");
      }

      const data = result.data || [];
      setAlumniData(data);
      setFilteredAlumni(data);

      // Extract unique campuses & departments
      const uniqueCampuses = new Map<string, string>();
      const uniqueDepartments = new Map<string, string>();

      data.forEach((alum) => {
        if (alum.campus?.id && alum.campus?.name) {
          uniqueCampuses.set(alum.campus.id, alum.campus.name);
        }
        if (alum.department?.id && alum.department?.name) {
          uniqueDepartments.set(alum.department.id, alum.department.name);
        }
      });

      setCampuses([
        { value: "all", label: "All Campuses" },
        ...Array.from(uniqueCampuses.entries()).map(([id, name]) => ({
          value: id,
          label: name,
        })),
      ]);

      setDepartments([
        { value: "all", label: "All Departments" },
        ...Array.from(uniqueDepartments.entries()).map(([id, name]) => ({
          value: id,
          label: name,
        })),
      ]);

      const years = [...new Set(data.map((alum) => alum.yearGraduated))]
        .filter((year) => year && year.trim() !== "")
        .sort((a, b) => b.localeCompare(a))
        .map((year) => ({ value: year, label: year }));

      setGraduationYears([{ value: "all", label: "All Years" }, ...years]);
    } catch (err: any) {
      console.error("Error fetching alumni data:", err);
      setError(err.message || "Failed to load alumni data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate AI Analysis
  const generateAnalysis = useCallback(async () => {
    if (!alumniData.length || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      const analysis = await generateAlumniAIAnalysis(alumniData);
      if (analysis) {
        setAiAnalysis(analysis);
      } else {
        throw new Error("Failed to generate analysis");
      }
    } catch (err: any) {
      console.error("Error generating analysis:", err);
      setAnalysisError(
        err.message || "Failed to generate AI analysis. Please try again.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [alumniData, isAnalyzing]);

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getFullName = (alumni: AlumniResponse): string => {
    return `${alumni.firstName} ${alumni.lastName}`;
  };

  const getDisplayEmail = (alumni: AlumniResponse): string => {
    return alumni.email || "No email";
  };

  const getEmploymentStatusColor = (status: string) => {
    switch (status) {
      case "Employed":
        return "bg-green-50 text-green-700 border-green-200";
      case "Self-Employed":
        return "bg-green-50 text-green-700 border-green-200";
      case "Further Studies":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Unemployed":
        return "bg-red-50 text-red-700 border-red-200";
      case "Never Employed":
        return "bg-gray-50 text-gray-600 border-gray-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getCampusName = (alumni: AlumniResponse): string =>
    alumni.campus?.name || "—";
  const getDepartmentName = (alumni: AlumniResponse): string =>
    alumni.department?.name || "—";
  const getCourseName = (alumni: AlumniResponse): string =>
    alumni.course?.name || "—";

  const clearFilters = () => {
    setSelectedCampus("all");
    setSelectedDepartment("all");
    setSelectedYear("all");
    setSelectedStatus("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCampus !== "all" ||
    selectedDepartment !== "all" ||
    selectedYear !== "all" ||
    selectedStatus !== "all" ||
    searchQuery !== "";

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handleRowClick = (alumni: AlumniResponse, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".dropdown-menu-trigger")) {
      return;
    }
    setSelectedAlumni(alumni);
    setIsDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchAlumniData();
    setCurrentPage(1);
    setAiAnalysis(null);
  };

  const handleExport = () => {
    alert(`Exporting ${filteredAlumni.length} records`);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(filteredAlumni.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Update current page data when filteredAlumni or currentPage changes
  useEffect(() => {
    const data = filteredAlumni.slice(startIndex, endIndex);
    setCurrentPageData(data);
  }, [filteredAlumni, currentPage, startIndex, endIndex]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCampus,
    selectedDepartment,
    selectedYear,
    selectedStatus,
    sortField,
    sortDirection,
  ]);

  // Apply filters and sorting
  useEffect(() => {
    if (!alumniData.length) return;

    let filtered = alumniData.filter((alumni) => {
      const fullName = getFullName(alumni).toLowerCase();
      const matchesSearch =
        !searchQuery ||
        fullName.includes(searchQuery.toLowerCase()) ||
        alumni.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (alumni.studentId &&
          alumni.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        alumni.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCampusName(alumni)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        getDepartmentName(alumni)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        getCourseName(alumni).toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCampus =
        selectedCampus === "all" || alumni.campus?.id === selectedCampus;
      const matchesDepartment =
        selectedDepartment === "all" ||
        alumni.department?.id === selectedDepartment;
      const matchesYear =
        selectedYear === "all" || alumni.yearGraduated === selectedYear;
      const matchesStatus =
        selectedStatus === "all" || alumni.employmentStatus === selectedStatus;

      return (
        matchesSearch &&
        matchesCampus &&
        matchesDepartment &&
        matchesYear &&
        matchesStatus
      );
    });

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "name":
          aValue = getFullName(a).toLowerCase();
          bValue = getFullName(b).toLowerCase();
          break;
        case "year":
          aValue = a.yearGraduated || "";
          bValue = b.yearGraduated || "";
          break;
        case "campus":
          aValue = getCampusName(a).toLowerCase();
          bValue = getCampusName(b).toLowerCase();
          break;
        case "department":
          aValue = getDepartmentName(a).toLowerCase();
          bValue = getDepartmentName(b).toLowerCase();
          break;
        case "status":
          aValue = a.employmentStatus || "";
          bValue = b.employmentStatus || "";
          break;
        case "email":
          aValue = a.email || "";
          bValue = b.email || "";
          break;
        default:
          aValue = getFullName(a).toLowerCase();
          bValue = getFullName(b).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredAlumni(filtered);
  }, [
    alumniData,
    searchQuery,
    selectedCampus,
    selectedDepartment,
    selectedYear,
    selectedStatus,
    sortField,
    sortDirection,
  ]);

  // Auto-generate analysis when data loads
  useEffect(() => {
    if (alumniData.length > 0 && !aiAnalysis) {
      generateAnalysis();
    }
  }, [alumniData.length, aiAnalysis, generateAnalysis]);

  useEffect(() => {
    fetchAlumniData();
  }, [fetchAlumniData]);

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading && alumniData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
        <p className="text-muted-foreground">Loading alumni directory...</p>
      </div>
    );
  }

  if (error && alumniData.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Alumni Directory
        </h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return (
        <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-50" />
      );
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-6 pb-10 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Alumni Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage alumni records
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <Loader2 className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={filteredAlumni.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export all records</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            size="sm"
            className="bg-green-700 hover:bg-green-800 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Alumni
          </Button>
        </div>
      </div>

      {/* AI Analysis Section */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Analysis for Alumni
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={generateAnalysis}
              disabled={isAnalyzing || !alumniData.length}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {aiAnalysis ? "Re-analyze" : "Analyze Data"}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {analysisError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{analysisError}</AlertDescription>
            </Alert>
          ) : isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-muted-foreground">
                AI is analyzing alumni data...
              </p>
              <p className="text-sm text-gray-500">This may take a moment</p>
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-700">{aiAnalysis.summary}</p>
                <div className="flex items-center mt-2 text-xs text-blue-600">
                  <span>
                    Generated: {new Date(aiAnalysis.timestamp).toLocaleString()}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    Source:{" "}
                    {aiAnalysis.source === "ai"
                      ? "AI Analysis"
                      : "Fallback Data"}
                  </span>
                </div>
              </div>

              {/* Career Progression Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Career Progression
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Promoted Alumni
                      </span>
                      <span className="font-semibold">
                        {aiAnalysis.careerProgression.promotedCount} /{" "}
                        {aiAnalysis.careerProgression.totalEmployed}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${aiAnalysis.careerProgression.promotedPercentage}%`,
                        }}
                      />
                    </div>
                    <div className="text-center text-sm font-medium text-green-700">
                      {aiAnalysis.careerProgression.promotedPercentage.toFixed(
                        1,
                      )}
                      % Promotion Rate
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                      Entrepreneurial Success
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Successful Entrepreneurs
                      </span>
                      <span className="font-semibold">
                        {aiAnalysis.careerProgression.successfulEntrepreneurs}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${aiAnalysis.careerProgression.entrepreneurSuccessRate}%`,
                        }}
                      />
                    </div>
                    <div className="text-center text-sm font-medium text-purple-700">
                      {aiAnalysis.careerProgression.entrepreneurSuccessRate.toFixed(
                        1,
                      )}
                      % Success Rate
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recognition Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Brain className="h-4 w-4 text-amber-600" />
                      Awards & Recognition
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Award Recipients
                      </span>
                      <span className="font-semibold">
                        {aiAnalysis.recognitionAnalysis.awardRecipients}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Total Awards
                      </span>
                      <span className="font-semibold">
                        {aiAnalysis.recognitionAnalysis.totalAwards}
                      </span>
                    </div>
                    {aiAnalysis.recognitionAnalysis.topAwardCategories.length >
                      0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-600 mb-1">
                          Top Award Categories:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {aiAnalysis.recognitionAnalysis.topAwardCategories.map(
                            (category, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {category}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-blue-600" />
                      IT Field Contributions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">IT Alumni</span>
                      <span className="font-semibold">
                        {aiAnalysis.recognitionAnalysis.itContributors}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        IT Alumni with Awards
                      </span>
                      <span className="font-semibold">
                        {
                          aiAnalysis.recognitionAnalysis
                            .itContributorsWithAwards
                        }
                      </span>
                    </div>
                    {aiAnalysis.recognitionAnalysis.itContributors > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-600">Award Rate:</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(aiAnalysis.recognitionAnalysis.itContributorsWithAwards / aiAnalysis.recognitionAnalysis.itContributors) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Insights & Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiAnalysis.insights.length > 0 && (
                  <Card className="border border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Key Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiAnalysis.insights.map((insight, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-2 mt-0.5">
                              <span className="text-xs font-medium">
                                {index + 1}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700">
                              {insight}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {aiAnalysis.recommendations.length > 0 && (
                  <Card className="border border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiAnalysis.recommendations.map(
                          (recommendation, index) => (
                            <li key={index} className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-2 mt-0.5">
                                <span className="text-xs font-medium">
                                  {index + 1}
                                </span>
                              </div>
                              <span className="text-sm text-gray-700">
                                {recommendation}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No Analysis Yet
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Click "Analyze Data" to generate AI-powered insights from alumni
                data
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters Card */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search name, email, ID, campus, department..."
                className="pl-10 bg-white border-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Selects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Campus
                </label>
                <Select
                  value={selectedCampus}
                  onValueChange={setSelectedCampus}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {campuses.map((campus) => (
                      <SelectItem key={campus.value} value={campus.value}>
                        {campus.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Department
                </label>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Graduation Year
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {graduationYears.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Employment Status
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Alumni Table */}
      <Card className="border border-gray-200 overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Alumni Records</CardTitle>
              <CardDescription>
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredAlumni.length)} of{" "}
                {filteredAlumni.length} alumni
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-700">
                  <th
                    className="py-3 px-6 cursor-pointer group"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Alumni Name</span>
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-6 cursor-pointer group"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Address</span>
                      <SortIcon field="email" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-6 cursor-pointer group"
                    onClick={() => handleSort("campus")}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>Campus & Department</span>
                      <SortIcon field="campus" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-6 cursor-pointer group"
                    onClick={() => handleSort("year")}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Graduation Year</span>
                      <SortIcon field="year" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-6 cursor-pointer group"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>Employment Status</span>
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentPageData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 px-6 text-center">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium">
                        No alumni found
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {hasActiveFilters
                          ? "Try adjusting your filters or search term"
                          : "No alumni data available yet"}
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-6"
                          onClick={clearFilters}
                        >
                          Clear filters
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((alumni) => (
                    <tr
                      key={alumni.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={(e) => handleRowClick(alumni, e)}
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {getFullName(alumni)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm">
                          {alumni.email ? (
                            <>
                              <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700 truncate max-w-[200px]">
                                {alumni.email}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500 italic">
                              No email
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">
                            {getCampusName(alumni)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getDepartmentName(alumni)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                          <Calendar className="h-3 w-3" />
                          {alumni.yearGraduated}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          className={`px-3 py-1 text-sm font-medium ${getEmploymentStatusColor(
                            alumni.employmentStatus,
                          )}`}
                        >
                          {alumni.employmentStatus}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAlumni(alumni);
                                    setIsDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 dropdown-menu-trigger"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              {alumni.email && (
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Email
                                </DropdownMenuItem>
                              )}
                              {alumni.phoneNumber && (
                                <DropdownMenuItem>
                                  <Phone className="mr-2 h-4 w-4" />
                                  Contact
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <X className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-4">
            {currentPageData.length === 0 ? (
              <div className="text-center py-16 px-6">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No alumni found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? "Try adjusting your filters or search term"
                    : "No alumni data available yet"}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-6"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              currentPageData.map((alumni) => (
                <Card
                  key={alumni.id}
                  className="cursor-pointer transition-colors border border-gray-200 hover:bg-gray-50"
                  onClick={(e) => handleRowClick(alumni, e)}
                >
                  <CardContent className="p-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {getFullName(alumni)}
                          </h4>
                        </div>
                        <Badge
                          className={`px-2 py-0.5 text-xs ${getEmploymentStatusColor(
                            alumni.employmentStatus,
                          )}`}
                        >
                          {alumni.employmentStatus}
                        </Badge>
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">
                            {getDisplayEmail(alumni)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{getCampusName(alumni)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <GraduationCap className="h-3 w-3" />
                          <span>{alumni.yearGraduated}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {filteredAlumni.length > 0 && (
            <div className="border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;

                    let startPage = Math.max(
                      1,
                      currentPage - Math.floor(maxVisiblePages / 2),
                    );
                    let endPage = Math.min(
                      totalPages,
                      startPage + maxVisiblePages - 1,
                    );

                    // Adjust start page if we're near the end
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? "default" : "outline"}
                          size="sm"
                          className={`h-8 w-8 p-0 ${currentPage === i ? "bg-green-700 hover:bg-green-800 text-white" : ""}`}
                          onClick={() => goToPage(i)}
                        >
                          {i}
                        </Button>,
                      );
                    }

                    return pages;
                  })()}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-gray-700">
                {itemsPerPage} per page
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Alumni Details Dialog - FIXED VERSION (No duplicate X button) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 border border-gray-200 font-sans flex flex-col">
          {selectedAlumni && (
            <>
              {/* Dialog Header - Fixed at top (no X button here) */}
              <div className="p-6 border-b flex-shrink-0">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border">
                    <AvatarFallback className="bg-gray-100 text-gray-700 text-xl">
                      {getInitials(
                        selectedAlumni.firstName,
                        selectedAlumni.lastName,
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                      {getFullName(selectedAlumni)}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-1">
                      {getDepartmentName(selectedAlumni)}
                    </DialogDescription>
                  </div>
                </div>
              </div>

              {/* Tabs Container - Takes remaining height and handles scrolling */}
              <Tabs
                defaultValue="overview"
                className="flex-1 flex flex-col min-h-0"
              >
                {/* Tabs Header - Fixed */}
                <div className="border-b border-gray-200 flex-shrink-0">
                  <TabsList className="grid w-full grid-cols-4 h-12 rounded-none bg-transparent p-0">
                    <TabsTrigger
                      value="overview"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-700"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="academic"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-700"
                    >
                      Academic
                    </TabsTrigger>
                    <TabsTrigger
                      value="employment"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-700"
                    >
                      Employment
                    </TabsTrigger>
                    <TabsTrigger
                      value="contact"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-700"
                    >
                      Contact
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                  <TabsContent value="overview" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Info Card */}
                      <Card className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Personal Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                First Name
                              </p>
                              <p className="font-medium">
                                {selectedAlumni.firstName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Last Name
                              </p>
                              <p className="font-medium">
                                {selectedAlumni.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Gender
                              </p>
                              <p className="font-medium">
                                {selectedAlumni.gender || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Civil Status
                              </p>
                              <p className="font-medium">
                                {selectedAlumni.civilStatus || "—"}
                              </p>
                            </div>
                          </div>
                          {selectedAlumni.dateOfBirth && (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Date of Birth
                              </p>
                              <p className="font-medium">
                                {new Date(
                                  selectedAlumni.dateOfBirth,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Status Card */}
                      <Card className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Current Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Employment Status
                              </p>
                              <Badge
                                className={`mt-1 px-3 py-1 ${getEmploymentStatusColor(
                                  selectedAlumni.employmentStatus,
                                )}`}
                              >
                                {selectedAlumni.employmentStatus}
                              </Badge>
                            </div>
                            {selectedAlumni.currentPosition && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Current Position
                                </p>
                                <p className="font-medium">
                                  {selectedAlumni.currentPosition}
                                </p>
                              </div>
                            )}
                            {selectedAlumni.employmentSector && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Sector
                                </p>
                                <p className="font-medium">
                                  {selectedAlumni.employmentSector}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Address Card */}
                    <Card className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          {selectedAlumni.address || "Not provided"}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="academic" className="mt-0">
                    <Card className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Academic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Graduation Year
                              </p>
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm mt-1">
                                <Calendar className="h-3 w-3" />
                                {selectedAlumni.yearGraduated}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Campus
                              </p>
                              <p className="font-medium">
                                {getCampusName(selectedAlumni)}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Department
                              </p>
                              <p className="font-medium">
                                {getDepartmentName(selectedAlumni)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Course
                              </p>
                              <p className="font-medium">
                                {getCourseName(selectedAlumni)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Degree
                              </p>
                              <p className="font-medium">
                                {selectedAlumni.degree || "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="employment" className="mt-0">
                    <Card className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Employment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Current Status
                              </p>
                              <div className="mt-1">
                                <Badge
                                  className={`px-3 py-1 ${getEmploymentStatusColor(
                                    selectedAlumni.employmentStatus,
                                  )}`}
                                >
                                  {selectedAlumni.employmentStatus}
                                </Badge>
                              </div>
                            </div>
                            {selectedAlumni.currentPosition && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Position
                                </p>
                                <p className="font-medium">
                                  {selectedAlumni.currentPosition}
                                </p>
                              </div>
                            )}
                            {selectedAlumni.employmentSector && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Industry/Sector
                                </p>
                                <p className="font-medium">
                                  {selectedAlumni.employmentSector}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-4">
                            {selectedAlumni.locationOfEmployment && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Location
                                </p>
                                <p className="font-medium">
                                  {selectedAlumni.locationOfEmployment}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Years of Experience
                              </p>
                              <p className="font-medium">
                                {selectedAlumni.yearGraduated
                                  ? new Date().getFullYear() -
                                    parseInt(selectedAlumni.yearGraduated)
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="contact" className="mt-0">
                    <Card className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Email Address
                              </p>
                              <p className="font-medium break-all">
                                {selectedAlumni.email || "No email"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Phone Number
                              </p>
                              <p className="font-medium">
                                {selectedAlumni.phoneNumber || "—"}
                              </p>
                            </div>
                          </div>

                          {selectedAlumni.facebookAccount && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Social Media
                                </p>
                                <p className="font-medium mt-1">
                                  {selectedAlumni.facebookAccount}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>

                {/* Dialog Footer - Fixed at bottom */}
                <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                  <div className="text-xs text-gray-500">
                    <p>
                      Member since{" "}
                      {new Date(selectedAlumni.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      Last updated{" "}
                      {new Date(selectedAlumni.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Close
                    </Button>
                    <Button className="bg-green-700 hover:bg-green-800 text-white">
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
