"use client";

import { useState, useMemo, useEffect } from "react";
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
  Mail,
  Phone,
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
  UserCheck,
  MapPin as MapPinIcon,
  School,
  Target,
  PieChart,
  BarChart3,
  TrendingUp,
  Percent,
  FileText,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Interface representing a complete alumni profile
 * Includes personal, academic, and employment information
 */
interface Alumni {
  id: string;
  fullName: string;
  gender: string;
  email: string;
  civilStatus: string;
  address: string;
  phoneNumber: string;
  facebookAccount: string;
  yearOfGraduation: string;
  campus: string;
  college: string;
  degree: string;
  yearEmployed: string;
  employmentSector: string;
  presentEmploymentStatus: string;
  position: string;
  companyAddress: string;
  locationOfEmployment: string;
  employer: string;
  currentEmployedStatus: string;
}

/**
 * Interface for filter dropdown options
 * Used for campuses, colleges, years, and employment status filters
 */
interface FilterOption {
  value: string;
  label: string;
}

/**
 * Interface for analytics statistics
 * Contains calculated metrics from alumni data
 */
interface AnalyticsStats {
  totalAlumni: number;
  employedAlumni: number;
  selfEmployedAlumni: number;
  uniqueCampuses: number;
  uniqueColleges: number;
  employmentRate: number;
  maleCount: number;
  femaleCount: number;
  averageYearsSinceGraduation: number;
  topEmploymentSector: string;
  topCampus: string;
  employmentByLocation: Record<string, number>;
  graduationYearDistribution: Record<string, number>;
}

// ============================================================================
// MOCK ALUMNI DATA
// ============================================================================

/**
 * Comprehensive mock data representing alumni profiles
 * Each record includes complete personal, academic, and employment information
 */
const alumniData: Alumni[] = [
  {
    id: "AL-2024-001",
    fullName: "John Michael Smith",
    gender: "Male",
    email: "john.smith@email.com",
    civilStatus: "Single",
    address: "123 Main St, Makati City, Metro Manila",
    phoneNumber: "+63 912 345 6789",
    facebookAccount: "facebook.com/john.smith",
    yearOfGraduation: "2020",
    campus: "Main Campus",
    college: "College of Computer Studies",
    degree: "Bachelor of Science in Computer Science",
    yearEmployed: "2021",
    employmentSector: "Information Technology",
    presentEmploymentStatus: "Employed",
    position: "Senior Software Engineer",
    companyAddress: "Tech Corp Building, BGC, Taguig City",
    locationOfEmployment: "Metro Manila",
    employer: "Tech Corporation Philippines",
    currentEmployedStatus: "Permanent",
  },
  {
    id: "AL-2024-002",
    fullName: "Maria Garcia Santos",
    gender: "Female",
    email: "maria.garcia@email.com",
    civilStatus: "Married",
    address: "456 Pine St, Quezon City, Metro Manila",
    phoneNumber: "+63 923 456 7890",
    facebookAccount: "facebook.com/maria.garcia",
    yearOfGraduation: "2019",
    campus: "Downtown Campus",
    college: "College of Business Administration",
    degree: "Bachelor of Science in Business Administration",
    yearEmployed: "2019",
    employmentSector: "Finance",
    presentEmploymentStatus: "Employed",
    position: "Marketing Manager",
    companyAddress: "Global Inc Tower, Ortigas Center, Pasig City",
    locationOfEmployment: "Metro Manila",
    employer: "Global Incorporated",
    currentEmployedStatus: "Regular",
  },
  {
    id: "AL-2024-003",
    fullName: "David Chen Lim",
    gender: "Male",
    email: "david.chen@email.com",
    civilStatus: "Single",
    address: "789 Oak St, Mandaluyong City, Metro Manila",
    phoneNumber: "+63 934 567 8901",
    facebookAccount: "facebook.com/david.chen",
    yearOfGraduation: "2021",
    campus: "Main Campus",
    college: "College of Engineering",
    degree: "Bachelor of Science in Mechanical Engineering",
    yearEmployed: "2022",
    employmentSector: "Manufacturing",
    presentEmploymentStatus: "Employed",
    position: "Mechanical Engineer",
    companyAddress: "AutoTech Complex, Laguna Technopark, Biñan",
    locationOfEmployment: "Laguna",
    employer: "AutoTech Philippines",
    currentEmployedStatus: "Contractual",
  },
  {
    id: "AL-2024-004",
    fullName: "Sarah Johnson Reyes",
    gender: "Female",
    email: "sarah.johnson@email.com",
    civilStatus: "Married",
    address: "321 Elm St, Cebu City, Cebu",
    phoneNumber: "+63 945 678 9012",
    facebookAccount: "facebook.com/sarah.johnson",
    yearOfGraduation: "2018",
    campus: "Medical Campus",
    college: "College of Nursing",
    degree: "Bachelor of Science in Nursing",
    yearEmployed: "2018",
    employmentSector: "Healthcare",
    presentEmploymentStatus: "Employed",
    position: "Head Nurse",
    companyAddress: "City Hospital Complex, Cebu City",
    locationOfEmployment: "Cebu",
    employer: "Cebu City General Hospital",
    currentEmployedStatus: "Permanent",
  },
  {
    id: "AL-2024-005",
    fullName: "Michael Brown Tan",
    gender: "Male",
    email: "michael.brown@email.com",
    civilStatus: "Single",
    address: "654 Maple St, Davao City, Davao del Sur",
    phoneNumber: "+63 956 789 0123",
    facebookAccount: "facebook.com/michael.brown",
    yearOfGraduation: "2022",
    campus: "Education Campus",
    college: "College of Education",
    degree: "Bachelor of Elementary Education",
    yearEmployed: "2023",
    employmentSector: "Education",
    presentEmploymentStatus: "Employed",
    position: "Elementary Teacher",
    companyAddress: "High School Building, Davao City",
    locationOfEmployment: "Davao",
    employer: "Davao City High School",
    currentEmployedStatus: "Probationary",
  },
  {
    id: "AL-2024-006",
    fullName: "Jennifer Lee Wong",
    gender: "Female",
    email: "jennifer.lee@email.com",
    civilStatus: "Single",
    address: "987 Cedar St, Iloilo City, Iloilo",
    phoneNumber: "+63 967 890 1234",
    facebookAccount: "facebook.com/jennifer.lee",
    yearOfGraduation: "2020",
    campus: "Main Campus",
    college: "College of Architecture",
    degree: "Bachelor of Science in Architecture",
    yearEmployed: "2021",
    employmentSector: "Construction",
    presentEmploymentStatus: "Self-Employed",
    position: "Architect",
    companyAddress: "Design Studio, Iloilo Business Park",
    locationOfEmployment: "Iloilo",
    employer: "Lee & Partners Architecture Firm",
    currentEmployedStatus: "Self-Employed",
  },
  {
    id: "AL-2024-007",
    fullName: "Robert Wilson Cruz",
    gender: "Male",
    email: "robert.wilson@email.com",
    civilStatus: "Married",
    address: "147 Walnut St, Angeles City, Pampanga",
    phoneNumber: "+63 978 901 2345",
    facebookAccount: "facebook.com/robert.wilson",
    yearOfGraduation: "2017",
    campus: "Main Campus",
    college: "College of Accountancy",
    degree: "Bachelor of Science in Accountancy",
    yearEmployed: "2018",
    employmentSector: "Finance",
    presentEmploymentStatus: "Employed",
    position: "Senior Accountant",
    companyAddress: "Finance Center, Clark Freeport Zone",
    locationOfEmployment: "Pampanga",
    employer: "Global Financial Services",
    currentEmployedStatus: "Regular",
  },
  {
    id: "AL-2024-008",
    fullName: "Lisa Martinez Garcia",
    gender: "Female",
    email: "lisa.martinez@email.com",
    civilStatus: "Single",
    address: "258 Birch St, Bacolod City, Negros Occidental",
    phoneNumber: "+63 989 012 3456",
    facebookAccount: "facebook.com/lisa.martinez",
    yearOfGraduation: "2021",
    campus: "Downtown Campus",
    college: "College of Tourism",
    degree: "Bachelor of Science in Tourism Management",
    yearEmployed: "2022",
    employmentSector: "Hospitality",
    presentEmploymentStatus: "Employed",
    position: "Hotel Manager",
    companyAddress: "Luxury Hotel, Bacolod City Center",
    locationOfEmployment: "Negros Occidental",
    employer: "Grand Bacolod Hotel",
    currentEmployedStatus: "Permanent",
  },
];

// ============================================================================
// MAIN COMPONENT: ALUMNI DATA PAGE
// ============================================================================

export default function AlumniDataPage() {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  // Search query for filtering by name, email, or ID
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter states for dropdown selections
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [selectedCollege, setSelectedCollege] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Alumni details modal state
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // ==========================================================================
  // FILTER OPTIONS CONFIGURATION
  // ==========================================================================

  /**
   * Campus filter options derived from unique campus values in data
   */
  const campuses: FilterOption[] = useMemo(() => {
    const uniqueCampuses = Array.from(
      new Set(alumniData.map((alumni) => alumni.campus))
    );
    return [
      { value: "all", label: "All Campuses" },
      ...uniqueCampuses.map((campus) => ({ value: campus, label: campus })),
    ];
  }, []);

  /**
   * College filter options derived from unique college values in data
   */
  const colleges: FilterOption[] = useMemo(() => {
    const uniqueColleges = Array.from(
      new Set(alumniData.map((alumni) => alumni.college))
    );
    return [
      { value: "all", label: "All Colleges" },
      ...uniqueColleges.map((college) => ({ value: college, label: college })),
    ];
  }, []);

  /**
   * Graduation year filter options derived from unique years in data
   */
  const graduationYears: FilterOption[] = useMemo(() => {
    const uniqueYears = Array.from(
      new Set(alumniData.map((alumni) => alumni.yearOfGraduation))
    ).sort((a, b) => parseInt(b) - parseInt(a)); // Sort descending
    return [
      { value: "all", label: "All Years" },
      ...uniqueYears.map((year) => ({ value: year, label: year })),
    ];
  }, []);

  /**
   * Employment status filter options derived from unique statuses in data
   */
  const employmentStatuses: FilterOption[] = useMemo(() => {
    const uniqueStatuses = Array.from(
      new Set(alumniData.map((alumni) => alumni.presentEmploymentStatus))
    );
    return [
      { value: "all", label: "All Status" },
      ...uniqueStatuses.map((status) => ({ value: status, label: status })),
    ];
  }, []);

  // ==========================================================================
  // ANALYTICS CALCULATIONS
  // ==========================================================================

  /**
   * Comprehensive analytics derived from alumni data
   * Calculates various statistics and metrics
   */
  const analyticsStats: AnalyticsStats = useMemo(() => {
    const currentYear = new Date().getFullYear();

    // Calculate basic counts
    const totalAlumni = alumniData.length;
    const employedAlumni = alumniData.filter(
      (alumni) => alumni.presentEmploymentStatus === "Employed"
    ).length;
    const selfEmployedAlumni = alumniData.filter(
      (alumni) => alumni.presentEmploymentStatus === "Self-Employed"
    ).length;

    // Calculate gender distribution
    const maleCount = alumniData.filter(
      (alumni) => alumni.gender === "Male"
    ).length;
    const femaleCount = alumniData.filter(
      (alumni) => alumni.gender === "Female"
    ).length;

    // Calculate unique counts
    const uniqueCampuses = new Set(alumniData.map((alumni) => alumni.campus))
      .size;
    const uniqueColleges = new Set(alumniData.map((alumni) => alumni.college))
      .size;

    // Calculate employment rate (employed + self-employed / total)
    const employmentRate =
      totalAlumni > 0
        ? Math.round(
            ((employedAlumni + selfEmployedAlumni) / totalAlumni) * 100
          )
        : 0;

    // Calculate average years since graduation
    const totalYearsSinceGraduation = alumniData.reduce((sum, alumni) => {
      return sum + (currentYear - parseInt(alumni.yearOfGraduation));
    }, 0);
    const averageYearsSinceGraduation =
      totalAlumni > 0
        ? Math.round((totalYearsSinceGraduation / totalAlumni) * 10) / 10
        : 0;

    // Find top employment sector
    const sectorCounts = alumniData.reduce((acc, alumni) => {
      acc[alumni.employmentSector] = (acc[alumni.employmentSector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEmploymentSector =
      Object.entries(sectorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Find top campus by alumni count
    const campusCounts = alumniData.reduce((acc, alumni) => {
      acc[alumni.campus] = (acc[alumni.campus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCampus =
      Object.entries(campusCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Calculate employment by location distribution
    const employmentByLocation = alumniData.reduce((acc, alumni) => {
      acc[alumni.locationOfEmployment] =
        (acc[alumni.locationOfEmployment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate graduation year distribution
    const graduationYearDistribution = alumniData.reduce((acc, alumni) => {
      acc[alumni.yearOfGraduation] = (acc[alumni.yearOfGraduation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAlumni,
      employedAlumni,
      selfEmployedAlumni,
      uniqueCampuses,
      uniqueColleges,
      employmentRate,
      maleCount,
      femaleCount,
      averageYearsSinceGraduation,
      topEmploymentSector,
      topCampus,
      employmentByLocation,
      graduationYearDistribution,
    };
  }, []);

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  /**
   * Extracts initials from full name for avatar display
   * @param name - Full name of the alumni
   * @returns Two-letter initials in uppercase
   */
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word: string) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Clears all active filters and search query
   * Resets all filter states to their default values
   */
  const clearFilters = () => {
    setSelectedCampus("all");
    setSelectedCollege("all");
    setSelectedYear("all");
    setSelectedStatus("all");
    setSearchQuery("");
  };

  /**
   * Checks if any filter is currently active
   * Used to conditionally show filter badges and clear button
   */
  const hasActiveFilters = useMemo(() => {
    return (
      selectedCampus !== "all" ||
      selectedCollege !== "all" ||
      selectedYear !== "all" ||
      selectedStatus !== "all" ||
      searchQuery !== ""
    );
  }, [
    selectedCampus,
    selectedCollege,
    selectedYear,
    selectedStatus,
    searchQuery,
  ]);

  // ==========================================================================
  // DATA FILTERING LOGIC
  // ==========================================================================

  /**
   * Filters alumni based on active search query and selected filters
   * Applies all filters cumulatively
   */
  const filteredAlumni = useMemo(() => {
    return alumniData.filter((alumni) => {
      // Search filter: matches name, email, or ID
      const matchesSearch =
        searchQuery === "" ||
        alumni.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alumni.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alumni.id.toLowerCase().includes(searchQuery.toLowerCase());

      // Campus filter
      const matchesCampus =
        selectedCampus === "all" || alumni.campus === selectedCampus;

      // College filter
      const matchesCollege =
        selectedCollege === "all" || alumni.college === selectedCollege;

      // Graduation year filter
      const matchesYear =
        selectedYear === "all" || alumni.yearOfGraduation === selectedYear;

      // Employment status filter
      const matchesStatus =
        selectedStatus === "all" ||
        alumni.presentEmploymentStatus === selectedStatus;

      // Return alumni that match ALL active filters
      return (
        matchesSearch &&
        matchesCampus &&
        matchesCollege &&
        matchesYear &&
        matchesStatus
      );
    });
  }, [
    searchQuery,
    selectedCampus,
    selectedCollege,
    selectedYear,
    selectedStatus,
  ]);

  /**
   * Opens alumni details dialog with selected alumni information
   * @param alumni - The alumni object to display in the details view
   */
  const handleRowClick = (alumni: Alumni) => {
    setSelectedAlumni(alumni);
    setIsDialogOpen(true);
  };

  // ==========================================================================
  // RENDER COMPONENT
  // ==========================================================================

  return (
    <div className="space-y-6">
      {/* ======================================================================
          PAGE HEADER SECTION
          Contains page title, description, and action buttons
      ====================================================================== */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Alumni Data Management
          </h1>
          <p className="text-gray-500">
            Comprehensive dashboard for managing and analyzing alumni
            information, employment statistics, and academic records
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data (CSV)
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Alumni
          </Button>
        </div>
      </div>

      {/* ======================================================================
          ANALYTICS DASHBOARD SECTION
          Shows key metrics and statistics calculated from alumni data
      ====================================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Alumni Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsStats.totalAlumni}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {analyticsStats.maleCount} Male • {analyticsStats.femaleCount}{" "}
                Female
              </p>
              <TrendingUp className="h-3 w-3 text-green-500" />
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Male</span>
                <span>
                  {Math.round(
                    (analyticsStats.maleCount / analyticsStats.totalAlumni) *
                      100
                  )}
                  %
                </span>
              </div>
              <Progress
                value={
                  (analyticsStats.maleCount / analyticsStats.totalAlumni) * 100
                }
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Employment Statistics Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Employment Rate
            </CardTitle>
            <Briefcase className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsStats.employmentRate}%
            </div>
            <p className="text-xs text-gray-500">
              {analyticsStats.employedAlumni} Employed •{" "}
              {analyticsStats.selfEmployedAlumni} Self-Employed
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Top Sector:</span>
                <span className="font-medium">
                  {analyticsStats.topEmploymentSector}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Avg. Experience:</span>
                <span className="font-medium">
                  {analyticsStats.averageYearsSinceGraduation} years
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campus Distribution Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Campus Distribution
            </CardTitle>
            <Building className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsStats.uniqueCampuses} Campuses
            </div>
            <p className="text-xs text-gray-500">
              {analyticsStats.uniqueColleges} Colleges Represented
            </p>
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs">
                <Target className="h-3 w-3 text-purple-500" />
                <span>Most Active: </span>
                <span className="font-medium">{analyticsStats.topCampus}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Main Campus:</span>
                  <span>
                    {
                      alumniData.filter((a) => a.campus === "Main Campus")
                        .length
                    }{" "}
                    alumni
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Downtown Campus:</span>
                  <span>
                    {
                      alumniData.filter((a) => a.campus === "Downtown Campus")
                        .length
                    }{" "}
                    alumni
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Programs Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Academic Programs
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsStats.uniqueColleges}
            </div>
            <p className="text-xs text-gray-500">
              Unique colleges with alumni representation
            </p>
            <div className="mt-2 space-y-1">
              {Object.entries(
                alumniData.reduce((acc, alumni) => {
                  acc[alumni.college] = (acc[alumni.college] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([college, count]) => (
                  <div key={college} className="flex justify-between text-xs">
                    <span className="truncate mr-2">
                      {college.split(" ")[2] || college}
                    </span>
                    <span className="font-medium">{count} alumni</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Location Distribution Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-blue-500" />
              Employment Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analyticsStats.employmentByLocation)
                .sort((a, b) => b[1] - a[1])
                .map(([location, count]) => (
                  <div
                    key={location}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm">{location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}</span>
                      <span className="text-xs text-gray-500">
                        (
                        {Math.round((count / analyticsStats.totalAlumni) * 100)}
                        %)
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Graduation Year Distribution Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              Graduation Years
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analyticsStats.graduationYearDistribution)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([year, count]) => (
                  <div key={year} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{year}</span>
                      <span>{count} alumni</span>
                    </div>
                    <Progress
                      value={(count / analyticsStats.totalAlumni) * 100}
                      className="h-1"
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Employment Status Breakdown Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-purple-500" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                alumniData.reduce((acc, alumni) => {
                  acc[alumni.presentEmploymentStatus] =
                    (acc[alumni.presentEmploymentStatus] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        status === "Employed"
                          ? "bg-green-500"
                          : status === "Self-Employed"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <span className="text-sm">{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round((count / analyticsStats.totalAlumni) * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================================
          FILTER AND SEARCH SECTION
          Contains search bar, filter dropdowns, and active filter badges
      ====================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle>Alumni Directory & Filtering</CardTitle>
          <CardDescription>
            Search and filter alumni by various criteria. Use the search bar for
            names, emails, or alumni IDs, and use dropdowns for specific
            filtering.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email, or alumni ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Controls Grid */}
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
                value={selectedCollege}
                onValueChange={setSelectedCollege}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select College" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.value} value={college.value}>
                      {college.label}
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

            {/* Active Filters Display & Action Buttons */}
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
                    {selectedCollege !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {
                          colleges.find((c) => c.value === selectedCollege)
                            ?.label
                        }
                        <button
                          onClick={() => setSelectedCollege("all")}
                          className="ml-1 hover:text-red-500"
                          aria-label={`Remove ${selectedCollege} filter`}
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
                            (s) => s.value === selectedStatus
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
                      Clear all filters
                    </Button>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Filtered
                </Button>
              </div>
            </div>
          </div>

          {/* ==================================================================
              ALUMNI DATA TABLE
              Displays filtered alumni in a detailed table format
          ================================================================== */}
          <div className="mt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    Alumni Information
                  </TableHead>
                  <TableHead className="w-[150px]">Contact Details</TableHead>
                  <TableHead className="w-[180px]">
                    Academic Information
                  </TableHead>
                  <TableHead className="w-[120px]">Employment Status</TableHead>
                  <TableHead className="text-right w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlumni.length > 0 ? (
                  filteredAlumni.map((alumni) => (
                    <TableRow
                      key={alumni.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleRowClick(alumni)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold">
                              {getInitials(alumni.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{alumni.fullName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {alumni.gender}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {alumni.civilStatus}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {alumni.id}
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
                          <div className="flex items-center gap-2">
                            <Facebook className="h-3 w-3 text-blue-500" />
                            <span className="text-sm truncate text-blue-600 hover:underline">
                              View Profile
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-3 w-3 text-purple-500" />
                            <span className="text-sm font-medium truncate">
                              {alumni.college.split(" ")[2] || alumni.college}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-3 w-3 text-green-500" />
                            <span className="text-sm">{alumni.campus}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-blue-500" />
                            <span className="text-sm">
                              Graduated: {alumni.yearOfGraduation}
                            </span>
                          </div>
                          <p
                            className="text-xs text-gray-500 truncate"
                            title={alumni.degree}
                          >
                            {alumni.degree}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge
                            className={
                              alumni.presentEmploymentStatus === "Employed"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : alumni.presentEmploymentStatus ===
                                  "Self-Employed"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }
                          >
                            {alumni.presentEmploymentStatus}
                          </Badge>
                          <div className="text-sm">
                            <p className="font-medium truncate">
                              {alumni.position}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {alumni.employer}
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
                          aria-label={`View detailed profile for ${alumni.fullName}`}
                          title="View full profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500">
                          No alumni found matching your filters
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                          className="mt-2"
                        >
                          Clear all filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* ==================================================================
              PAGINATION CONTROLS
              Shows current results and navigation buttons
          ================================================================== */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-sm text-gray-500">
              <p>
                Showing{" "}
                <span className="font-medium">{filteredAlumni.length}</span> of{" "}
                <span className="font-medium">{alumniData.length}</span> alumni
                {hasActiveFilters && " (filtered)"}
              </p>
              {hasActiveFilters && (
                <p className="text-xs mt-1">
                  Clear filters to view all alumni records
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-50 border-blue-200"
              >
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
        </CardContent>
      </Card>

      {/* ======================================================================
          ALUMNI DETAILS DIALOG (MODAL)
          Shows comprehensive profile when an alumni is selected
      ====================================================================== */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedAlumni && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-bold">
                        {getInitials(selectedAlumni.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl">
                        {selectedAlumni.fullName}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedAlumni.id} • {selectedAlumni.college}
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        selectedAlumni.presentEmploymentStatus === "Employed"
                          ? "bg-green-100 text-green-800"
                          : selectedAlumni.presentEmploymentStatus ===
                            "Self-Employed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {selectedAlumni.presentEmploymentStatus}
                    </Badge>
                    <Badge variant="outline">{selectedAlumni.gender}</Badge>
                    <Badge variant="outline">
                      {selectedAlumni.civilStatus}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              {/* Tab Navigation for Different Info Sections */}
              <Tabs defaultValue="personal" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">
                    <User className="mr-2 h-4 w-4" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="academic">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Academic
                  </TabsTrigger>
                  <TabsTrigger value="employment">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Employment
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
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">
                              {selectedAlumni.fullName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium">
                              {selectedAlumni.gender}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Civil Status</p>
                          <p className="font-medium">
                            {selectedAlumni.civilStatus}
                          </p>
                        </div>
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
                        <div>
                          <p className="text-sm text-gray-500">
                            Facebook Account
                          </p>
                          <a
                            href={`https://${selectedAlumni.facebookAccount}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {selectedAlumni.facebookAccount}
                          </a>
                        </div>
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
                          <p className="text-sm text-gray-500">
                            Year of Graduation
                          </p>
                          <p className="font-medium">
                            {selectedAlumni.yearOfGraduation}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Campus</p>
                          <p className="font-medium">{selectedAlumni.campus}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">College</p>
                          <p className="font-medium">
                            {selectedAlumni.college}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Degree/Course</p>
                          <p className="font-medium">{selectedAlumni.degree}</p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <CardTitle className="text-sm font-medium flex items-center gap-2 mb-3">
                          <Award className="h-4 w-4" />
                          Academic Achievements
                        </CardTitle>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div>
                              <p className="font-medium">
                                Academic Excellence Scholarship
                              </p>
                              <p className="text-sm text-gray-500">
                                Full Scholarship Award
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-white">
                              {selectedAlumni.yearOfGraduation - 2}-
                              {selectedAlumni.yearOfGraduation}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div>
                              <p className="font-medium">Dean's Lister</p>
                              <p className="text-sm text-gray-500">
                                Multiple Semesters
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-white">
                              Outstanding
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <CardTitle className="text-sm font-medium flex items-center gap-2 mb-3">
                          <BadgeCheck className="h-4 w-4" />
                          Professional Eligibility
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-green-50">
                            Board Eligible
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50">
                            Civil Service Eligible
                          </Badge>
                          <Badge variant="outline" className="bg-purple-50">
                            Professional License
                          </Badge>
                        </div>
                      </div>
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
                          Current Employment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-gray-500">
                              Year Employed
                            </p>
                            <p className="font-medium">
                              {selectedAlumni.yearEmployed}
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
                            Current Employment Type
                          </p>
                          <p className="font-medium">
                            {selectedAlumni.currentEmployedStatus}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Position/Title
                          </p>
                          <p className="font-medium">
                            {selectedAlumni.position}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Employer/Company
                          </p>
                          <p className="font-medium">
                            {selectedAlumni.employer}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

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
                        <div>
                          <p className="text-sm text-gray-500">
                            Location of Employment
                          </p>
                          <p className="font-medium">
                            {selectedAlumni.locationOfEmployment}
                          </p>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-sm text-gray-500">
                            Date of First Employment
                          </p>
                          <p className="font-medium">
                            June 15, {selectedAlumni.yearEmployed}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Duration in First Job
                          </p>
                          <p className="font-medium">2 years and 3 months</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Job Related to Degree?
                          </p>
                          <p className="font-medium text-green-600">Yes</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Career Development
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-gray-500">
                            Job Information Source
                          </p>
                          <p className="font-medium">University Career Fair</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Employment Start After Graduation
                          </p>
                          <p className="font-medium">
                            {parseInt(selectedAlumni.yearEmployed) -
                              parseInt(selectedAlumni.yearOfGraduation) <=
                            1
                              ? "Immediate (within 1 year)"
                              : "Within 2 years"}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <CardTitle className="text-sm font-medium flex items-center gap-2 mb-3">
                          <Award className="h-4 w-4" />
                          Professional Achievements
                        </CardTitle>
                        <div className="space-y-2">
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="font-medium">
                              Employee of the Year{" "}
                              {parseInt(selectedAlumni.yearEmployed) + 1}
                            </p>
                            <p className="text-sm text-gray-500">
                              Outstanding performance and contributions to
                              company growth
                            </p>
                          </div>
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="font-medium">
                              Top Performer Award{" "}
                              {parseInt(selectedAlumni.yearEmployed) + 2}
                            </p>
                            <p className="text-sm text-gray-500">
                              Exceeded all quarterly targets and KPIs
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Dialog Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close Profile
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="mr-2 h-4 w-4" />
                  Export Profile
                </Button>
                <Button>Edit Information</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
