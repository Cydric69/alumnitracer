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
  Users,
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  GraduationCap,
  Building,
  Facebook,
  Briefcase,
  Eye,
  X,
  Award,
  BadgeCheck,
  Building2,
  Globe,
  Loader2,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlumniResponse, getAlumni, getFormData } from "@/app/actions/alumni";

// Filter options interfaces
interface FilterOption {
  value: string;
  label: string;
}

// Campus filter option with campus info
interface CampusFilterOption extends FilterOption {
  id?: string;
  campusId?: string;
}

// Department filter option with campus info
interface DepartmentFilterOption extends FilterOption {
  campusId?: string;
}

// Course filter option with department info
interface CourseFilterOption extends FilterOption {
  departmentId?: string;
}

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

  // Data state
  const [alumniData, setAlumniData] = useState<AlumniResponse[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    employed: 0,
    campuses: 0,
    departments: 0,
  });

  // Filter options state
  const [campuses, setCampuses] = useState<CampusFilterOption[]>([
    { value: "all", label: "All Campuses" },
  ]);
  const [departments, setDepartments] = useState<DepartmentFilterOption[]>([
    { value: "all", label: "All Departments" },
  ]);
  const [courses, setCourses] = useState<CourseFilterOption[]>([
    { value: "all", label: "All Courses" },
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

      // Fetch alumni data using the new action
      const result = await getAlumni();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch alumni data");
      }

      const data = result.data || [];
      setAlumniData(data);
      setFilteredAlumni(data);

      // Calculate stats
      const employedCount = data.filter(
        (alum) =>
          alum.employmentStatus === "Employed" ||
          alum.employmentStatus === "Self-Employed",
      ).length;

      // Get unique years from alumni data
      const years = [...new Set(data.map((alum) => alum.yearGraduated))]
        .filter((year) => year && year.trim() !== "")
        .sort((a, b) => b.localeCompare(a)) // Sort descending
        .map((year) => ({
          value: year,
          label: year,
        }));

      setGraduationYears([{ value: "all", label: "All Years" }, ...years]);

      // Get unique campuses and departments
      const uniqueCampuses = new Map<string, string>();
      const uniqueDepartments = new Map<string, string>();

      data.forEach((alum) => {
        if (alum.campus?.name && alum.campus?.id) {
          uniqueCampuses.set(alum.campus.id, alum.campus.name);
        }
        if (alum.department?.name && alum.department?.id) {
          uniqueDepartments.set(alum.department.id, alum.department.name);
        }
      });

      setStats({
        total: data.length,
        employed: employedCount,
        campuses: uniqueCampuses.size,
        departments: uniqueDepartments.size,
      });
    } catch (err: any) {
      console.error("Error fetching alumni data:", err);
      setError(err.message || "Failed to load alumni data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch filter options (campuses, departments, courses)
  const fetchFilterOptions = useCallback(async () => {
    try {
      const result = await getFormData();

      if (!result.success || !result.data) {
        console.error("Failed to fetch form data:", result.message);
        // Set default values if fetch fails
        setCampuses([{ value: "all", label: "All Campuses" }]);
        setDepartments([{ value: "all", label: "All Departments" }]);
        setCourses([{ value: "all", label: "All Courses" }]);
        return;
      }

      const {
        campuses: campusData,
        departments: departmentData,
        courses: courseData,
      } = result.data;

      // Set campuses
      const campusList: CampusFilterOption[] = [
        { value: "all", label: "All Campuses" },
        ...(campusData || []).map((campus: any) => ({
          value: campus.id,
          label: campus.name,
          campusId: campus.campusId,
        })),
      ];
      setCampuses(campusList);

      // Set departments
      const departmentList: DepartmentFilterOption[] = [
        { value: "all", label: "All Departments" },
        ...(departmentData || []).map((dept: any) => ({
          value: dept.id,
          label: dept.name,
          campusId: dept.campusId,
        })),
      ];
      setDepartments(departmentList);

      // Set courses
      const courseList: CourseFilterOption[] = [
        { value: "all", label: "All Courses" },
        ...(courseData || []).map((course: any) => ({
          value: course.id,
          label: course.name,
          departmentId: course.departmentId,
        })),
      ];
      setCourses(courseList);
    } catch (err: any) {
      console.error("Error fetching filter options:", err);
      // Set default values if fetch fails
      setCampuses([{ value: "all", label: "All Campuses" }]);
      setDepartments([{ value: "all", label: "All Departments" }]);
      setCourses([{ value: "all", label: "All Courses" }]);
    }
  }, []);
  // Initial data fetch
  useEffect(() => {
    fetchAlumniData();
    fetchFilterOptions();
  }, [fetchAlumniData, fetchFilterOptions]);

  // Function to get initials from name
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Function to get full name
  const getFullName = (alumni: AlumniResponse): string => {
    return `${alumni.firstName} ${alumni.lastName}`;
  };

  // Function to get alumni ID for display
  const getDisplayId = (alumni: AlumniResponse): string => {
    return alumni.studentId || `AL-${alumni.id.slice(-8)}`;
  };

  // Function to get employment status badge color
  const getEmploymentStatusColor = (status: string) => {
    switch (status) {
      case "Employed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Self-Employed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Further Studies":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Unemployed":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Never Employed":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Safe get campus name
  const getCampusName = (alumni: AlumniResponse): string => {
    return alumni.campus?.name || "Unknown Campus";
  };

  // Safe get department name
  const getDepartmentName = (alumni: AlumniResponse): string => {
    return alumni.department?.name || "Unknown Department";
  };

  // Safe get course name
  const getCourseName = (alumni: AlumniResponse): string => {
    return alumni.course?.name || "Unknown Course";
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCampus("all");
    setSelectedDepartment("all");
    setSelectedYear("all");
    setSelectedStatus("all");
    setSearchQuery("");
  };

  // Check if any filter is active
  const hasActiveFilters =
    selectedCampus !== "all" ||
    selectedDepartment !== "all" ||
    selectedYear !== "all" ||
    selectedStatus !== "all" ||
    searchQuery !== "";

  // Filter alumni based on selected filters
  useEffect(() => {
    if (!alumniData.length) return;

    const filtered = alumniData.filter((alumni) => {
      const fullName = getFullName(alumni).toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        fullName.includes(searchQuery.toLowerCase()) ||
        alumni.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (alumni.studentId &&
          alumni.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        alumni.id.toLowerCase().includes(searchQuery.toLowerCase());

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

    setFilteredAlumni(filtered);
  }, [
    alumniData,
    searchQuery,
    selectedCampus,
    selectedDepartment,
    selectedYear,
    selectedStatus,
  ]);

  // Handle row click to show details
  const handleRowClick = (alumni: AlumniResponse) => {
    setSelectedAlumni(alumni);
    setIsDialogOpen(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchAlumniData();
    fetchFilterOptions();
  };

  // Loading state
  if (isLoading && alumniData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="text-gray-500">Loading alumni data...</p>
      </div>
    );
  }

  // Error state for initial load
  if (error && alumniData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alumni Data</h1>
            <p className="text-gray-500">
              Manage and view comprehensive alumni information
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alumni Data</h1>
          <p className="text-gray-500">
            Manage and view comprehensive alumni information
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <Download className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Alumni
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              {stats.total > 0
                ? `${Math.round((stats.employed / stats.total) * 100)}% employment rate`
                : "No data"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Employed Alumni
            </CardTitle>
            <Briefcase className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.employed.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              {stats.total > 0
                ? `${Math.round((stats.employed / stats.total) * 100)}% employment rate`
                : "No data"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campuses
            </CardTitle>
            <Building className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.campuses}</div>
            <p className="text-xs text-gray-500">With alumni representation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <GraduationCap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
            <p className="text-xs text-gray-500">Different programs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Alumni Directory</CardTitle>
          <CardDescription>
            Browse and filter alumni information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email, student ID, or alumni ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Campus" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.value} value={campus.value}>
                      {campus.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.value} value={department.value}>
                      {department.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Graduation Year" />
                </SelectTrigger>
                <SelectContent>
                  {graduationYears.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Employment Status" />
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

            {/* Active Filters & Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {hasActiveFilters && (
                  <>
                    <span className="text-sm text-gray-600">
                      Active filters:
                    </span>
                    {selectedCampus !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {
                          campuses.find((c) => c.value === selectedCampus)
                            ?.label
                        }
                        <button
                          onClick={() => setSelectedCampus("all")}
                          className="ml-1 hover:text-red-500"
                          aria-label={`Remove ${selectedCampus} filter`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedDepartment !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {
                          departments.find(
                            (d) => d.value === selectedDepartment,
                          )?.label
                        }
                        <button
                          onClick={() => setSelectedDepartment("all")}
                          className="ml-1 hover:text-red-500"
                          aria-label={`Remove ${selectedDepartment} filter`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedYear !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Year:{" "}
                        {
                          graduationYears.find((y) => y.value === selectedYear)
                            ?.label
                        }
                        <button
                          onClick={() => setSelectedYear("all")}
                          className="ml-1 hover:text-red-500"
                          aria-label={`Remove ${selectedYear} filter`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedStatus !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {
                          employmentStatuses.find(
                            (s) => s.value === selectedStatus,
                          )?.label
                        }
                        <button
                          onClick={() => setSelectedStatus("all")}
                          className="ml-1 hover:text-red-500"
                          aria-label={`Remove ${selectedStatus} filter`}
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
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Alumni Table */}
          <div className="mt-6 overflow-x-auto">
            {filteredAlumni.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No alumni found</h3>
                <p className="text-gray-500 mb-4">
                  {hasActiveFilters
                    ? "Try adjusting your filters or search query"
                    : "No alumni data available"}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">
                        Alumni Information
                      </TableHead>
                      <TableHead className="w-[150px]">
                        Contact Details
                      </TableHead>
                      <TableHead className="w-[180px]">
                        Academic Information
                      </TableHead>
                      <TableHead className="w-[120px]">
                        Employment Status
                      </TableHead>
                      <TableHead className="text-right w-[100px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlumni.map((alumni) => (
                      <TableRow
                        key={alumni.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRowClick(alumni)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {getInitials(alumni.firstName, alumni.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {getFullName(alumni)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {alumni.gender}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {alumni.civilStatus}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {getDisplayId(alumni)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-sm truncate">
                                {alumni.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">
                                {alumni.phoneNumber}
                              </span>
                            </div>
                            {alumni.facebookAccount && (
                              <div className="flex items-center gap-2">
                                <Facebook className="h-3 w-3 text-blue-500" />
                                <span className="text-sm truncate">
                                  Facebook
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-3 w-3 text-purple-500" />
                              <span className="text-sm font-medium">
                                {getDepartmentName(alumni)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building className="h-3 w-3 text-green-500" />
                              <span className="text-sm">
                                {getCampusName(alumni)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-blue-500" />
                              <span className="text-sm">
                                Graduated: {alumni.yearGraduated}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {alumni.degree}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Badge
                              className={getEmploymentStatusColor(
                                alumni.employmentStatus,
                              )}
                            >
                              {alumni.employmentStatus}
                            </Badge>
                            <div className="text-sm">
                              <p className="font-medium">
                                {alumni.currentPosition ||
                                  alumni.presentEmploymentStatus}
                              </p>
                              <p className="text-xs text-gray-500">
                                {alumni.employer || "Not specified"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(alumni);
                            }}
                            aria-label={`View details for ${getFullName(alumni)}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <p className="text-sm text-gray-500">
                    Showing {filteredAlumni.length} of {alumniData.length}{" "}
                    alumni
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

      {/* Alumni Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedAlumni && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                        {getInitials(
                          selectedAlumni.firstName,
                          selectedAlumni.lastName,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle>{getFullName(selectedAlumni)}</DialogTitle>
                      <DialogDescription>
                        {getDisplayId(selectedAlumni)} •{" "}
                        {getDepartmentName(selectedAlumni)}
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={getEmploymentStatusColor(
                        selectedAlumni.employmentStatus,
                      )}
                    >
                      {selectedAlumni.employmentStatus}
                    </Badge>
                    <Badge variant="outline">{selectedAlumni.gender}</Badge>
                    <Badge variant="outline">
                      {selectedAlumni.civilStatus}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="personal" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">
                    Personal Information
                  </TabsTrigger>
                  <TabsTrigger value="academic">
                    Academic Background
                  </TabsTrigger>
                  <TabsTrigger value="employment">
                    Employment Details
                  </TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Basic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-gray-500">First Name</p>
                            <p className="font-medium">
                              {selectedAlumni.firstName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Last Name</p>
                            <p className="font-medium">
                              {selectedAlumni.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium">
                              {selectedAlumni.gender}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Civil Status
                            </p>
                            <p className="font-medium">
                              {selectedAlumni.civilStatus}
                            </p>
                          </div>
                        </div>
                        {selectedAlumni.dateOfBirth && (
                          <div>
                            <p className="text-sm text-gray-500">
                              Date of Birth
                            </p>
                            <p className="font-medium">
                              {new Date(
                                selectedAlumni.dateOfBirth,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {selectedAlumni.placeOfBirth && (
                          <div>
                            <p className="text-sm text-gray-500">
                              Place of Birth
                            </p>
                            <p className="font-medium">
                              {selectedAlumni.placeOfBirth}
                            </p>
                          </div>
                        )}
                        <Separator />
                        <div>
                          <p className="text-sm text-gray-500">
                            Complete Address
                          </p>
                          <p className="font-medium">
                            {selectedAlumni.address}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Email Address</p>
                          <p className="font-medium">{selectedAlumni.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-medium">
                            {selectedAlumni.phoneNumber}
                          </p>
                        </div>
                        {selectedAlumni.facebookAccount && (
                          <div>
                            <p className="text-sm text-gray-500">
                              Facebook Account
                            </p>
                            <p className="font-medium text-blue-600">
                              {selectedAlumni.facebookAccount}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Academic Background Tab */}
                <TabsContent value="academic" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Academic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-gray-500">Student ID</p>
                          <p className="font-medium">
                            {selectedAlumni.studentId || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Year of Graduation
                          </p>
                          <p className="font-medium">
                            {selectedAlumni.yearGraduated}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Campus</p>
                          <p className="font-medium">
                            {getCampusName(selectedAlumni)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Department</p>
                          <p className="font-medium">
                            {getDepartmentName(selectedAlumni)}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Course</p>
                          <p className="font-medium">
                            {getCourseName(selectedAlumni)}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Degree</p>
                          <p className="font-medium">{selectedAlumni.degree}</p>
                        </div>
                      </div>

                      <Separator />

                      {selectedAlumni.boardExamPassed && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm text-gray-500">
                              Board Exam Passed
                            </p>
                            <p className="font-medium">
                              {selectedAlumni.boardExamPassed}
                            </p>
                          </div>
                          {selectedAlumni.yearPassedBoardExam && (
                            <div>
                              <p className="text-sm text-gray-500">
                                Year Passed
                              </p>
                              <p className="font-medium">
                                {selectedAlumni.yearPassedBoardExam}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedAlumni.eligibility &&
                        selectedAlumni.eligibility.length > 0 && (
                          <div>
                            <CardTitle className="text-sm font-medium flex items-center gap-2 mb-3">
                              <BadgeCheck className="h-4 w-4" />
                              Eligibility
                            </CardTitle>
                            <div className="flex flex-wrap gap-2">
                              {selectedAlumni.eligibility.map((elig, index) => (
                                <Badge key={index} variant="outline">
                                  {elig}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Employment Details Tab */}
                <TabsContent value="employment" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Employment Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-gray-500">
                              Employment Status
                            </p>
                            <p className="font-medium">
                              {selectedAlumni.employmentStatus}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Employment Sector
                            </p>
                            <p className="font-medium">
                              {selectedAlumni.employmentSector}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-gray-500">
                              Present Employment Status
                            </p>
                            <p className="font-medium">
                              {selectedAlumni.presentEmploymentStatus}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Location of Employment
                            </p>
                            <p className="font-medium">
                              {selectedAlumni.locationOfEmployment}
                            </p>
                          </div>
                        </div>
                        {selectedAlumni.currentPosition && (
                          <div>
                            <p className="text-sm text-gray-500">Position</p>
                            <p className="font-medium">
                              {selectedAlumni.currentPosition}
                            </p>
                          </div>
                        )}
                        {selectedAlumni.employer && (
                          <div>
                            <p className="text-sm text-gray-500">Employer</p>
                            <p className="font-medium">
                              {selectedAlumni.employer}
                            </p>
                          </div>
                        )}
                        {selectedAlumni.dateEmploymentAfterBoardExam && (
                          <div>
                            <p className="text-sm text-gray-500">
                              Employment After Board Exam
                            </p>
                            <p className="font-medium">
                              {selectedAlumni.dateEmploymentAfterBoardExam}
                            </p>
                          </div>
                        )}
                        {selectedAlumni.jobInformationSource && (
                          <div>
                            <p className="text-sm text-gray-500">
                              Job Information Source
                            </p>
                            <p className="font-medium">
                              {selectedAlumni.jobInformationSource}
                            </p>
                          </div>
                        )}
                        {selectedAlumni.firstJobDuration && (
                          <div>
                            <p className="text-sm text-gray-500">
                              First Job Duration
                            </p>
                            <p className="font-medium">
                              {selectedAlumni.firstJobDuration}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {selectedAlumni.companyAddress && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Company Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">
                              Company Address
                            </p>
                            <p className="font-medium">
                              {selectedAlumni.companyAddress}
                            </p>
                          </div>
                          {selectedAlumni.isFirstJobRelatedToDegree !==
                            undefined && (
                            <div>
                              <p className="text-sm text-gray-500">
                                First Job Related to Degree
                              </p>
                              <p className="font-medium">
                                {selectedAlumni.isFirstJobRelatedToDegree
                                  ? "Yes"
                                  : "No"}
                              </p>
                            </div>
                          )}
                          {selectedAlumni.isCurrentJobRelatedToDegree !==
                            undefined && (
                            <div>
                              <p className="text-sm text-gray-500">
                                Current Job Related to Degree
                              </p>
                              <p className="font-medium">
                                {selectedAlumni.isCurrentJobRelatedToDegree
                                  ? "Yes"
                                  : "No"}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {(selectedAlumni.firstJobReasons &&
                    selectedAlumni.firstJobReasons.length > 0) ||
                  (selectedAlumni.currentJobReasons &&
                    selectedAlumni.currentJobReasons.length > 0) ? (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Job Relationship Reasons
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedAlumni.firstJobReasons &&
                          selectedAlumni.firstJobReasons.length > 0 && (
                            <div>
                              <CardTitle className="text-sm font-medium mb-2">
                                First Job Reasons
                              </CardTitle>
                              <ul className="space-y-2">
                                {selectedAlumni.firstJobReasons.map(
                                  (reason, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2"
                                    >
                                      <div className="w-2 h-2 rounded-full bg-gray-300 mt-2"></div>
                                      <span>{reason}</span>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                        {selectedAlumni.currentJobReasons &&
                          selectedAlumni.currentJobReasons.length > 0 && (
                            <div>
                              <CardTitle className="text-sm font-medium mb-2">
                                Current Job Reasons
                              </CardTitle>
                              <ul className="space-y-2">
                                {selectedAlumni.currentJobReasons.map(
                                  (reason, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2"
                                    >
                                      <div className="w-2 h-2 rounded-full bg-gray-300 mt-2"></div>
                                      <span>{reason}</span>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  ) : null}

                  {(selectedAlumni.awardsRecognition &&
                    selectedAlumni.awardsRecognition.length > 0) ||
                  (selectedAlumni.scholarshipsDuringEmployment &&
                    selectedAlumni.scholarshipsDuringEmployment.length > 0) ? (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Awards & Scholarships
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedAlumni.awardsRecognition &&
                          selectedAlumni.awardsRecognition.length > 0 && (
                            <div>
                              <CardTitle className="text-sm font-medium flex items-center gap-2 mb-3">
                                Awards & Recognition
                              </CardTitle>
                              <div className="space-y-2">
                                {selectedAlumni.awardsRecognition.map(
                                  (award, index) => (
                                    <div
                                      key={index}
                                      className="p-3 bg-gray-50 rounded-lg"
                                    >
                                      <p className="font-medium">{award}</p>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        {selectedAlumni.scholarshipsDuringEmployment &&
                          selectedAlumni.scholarshipsDuringEmployment.length >
                            0 && (
                            <div>
                              <CardTitle className="text-sm font-medium flex items-center gap-2 mb-3">
                                Scholarships During Employment
                              </CardTitle>
                              <div className="space-y-2">
                                {selectedAlumni.scholarshipsDuringEmployment.map(
                                  (scholarship, index) => (
                                    <div
                                      key={index}
                                      className="p-3 bg-gray-50 rounded-lg"
                                    >
                                      <p className="font-medium">
                                        {scholarship}
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  ) : null}

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Willing to Mentor
                          </p>
                          <Badge
                            variant={
                              selectedAlumni.willingToMentor
                                ? "default"
                                : "outline"
                            }
                          >
                            {selectedAlumni.willingToMentor ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Receive Updates
                          </p>
                          <Badge
                            variant={
                              selectedAlumni.receiveUpdates
                                ? "default"
                                : "outline"
                            }
                          >
                            {selectedAlumni.receiveUpdates ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                      {selectedAlumni.suggestions && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">Suggestions</p>
                          <p className="font-medium mt-1 p-3 bg-gray-50 rounded-lg">
                            {selectedAlumni.suggestions}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter className="gap-3 pt-4 border-t">
                <div className="text-sm text-gray-500 text-left">
                  <p>
                    Created:{" "}
                    {new Date(selectedAlumni.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    Last Updated:{" "}
                    {new Date(selectedAlumni.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button>Edit Information</Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
