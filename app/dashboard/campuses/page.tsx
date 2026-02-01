// app/dashboard/campuses/page.tsx
"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { toast } from "sonner";
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
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  Building,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import form component
import CampusForm from "@/components/forms/campusform";

// Import server actions - UPDATED IMPORT
import {
  getCampuses,
  createCampus,
  updateCampus,
  deleteCampus,
  searchCampuses,
} from "@/app/actions/campus"; // Changed from campus.actions
import { CampusFormData } from "@/app/actions/campus"; // Import from the same file

// Update the Campus interface to match the database model
interface Campus {
  id: string;
  name: string;
  description: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Skeleton component at the top level
const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

export default function CampusesPage() {
  // State management
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCampus, setCurrentCampus] = useState<Campus | null>(null);
  const [expandedCampus, setExpandedCampus] = useState<string | null>(null);
  const [formData, setFormData] = useState<CampusFormData>({
    campusName: "", // Updated field name
    description: "",
    location: "", // Updated field name
    createdBy: "", // Added field
    updatedBy: "", // Added field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch campuses on mount
  useEffect(() => {
    fetchCampuses();
  }, []);

  // Helper function to map database campus to frontend Campus interface
  const mapDbCampusToFrontend = (dbCampus: any): Campus => {
    return {
      id: dbCampus._id || dbCampus.id,
      name: dbCampus.campusName,
      description: dbCampus.description || "",
      address: dbCampus.location || "",
      createdAt: dbCampus.createdAt ? new Date(dbCampus.createdAt) : new Date(),
      updatedAt: dbCampus.updatedAt ? new Date(dbCampus.updatedAt) : new Date(),
    };
  };

  // Helper function to map frontend CampusFormData to database CampusFormData
  const mapToDbFormData = (frontendData: {
    name: string;
    description: string;
    address: string;
  }): CampusFormData => {
    return {
      campusName: frontendData.name,
      description: frontendData.description,
      location: frontendData.address,
      createdBy: "user@example.com", // You should get this from session/auth
      updatedBy: "user@example.com", // You should get this from session/auth
    };
  };

  const fetchCampuses = async () => {
    try {
      setLoading(true);
      const result = await getCampuses();

      if (result.success && result.data) {
        // Map database campuses to frontend interface
        const mappedCampuses = result.data.map(mapDbCampusToFrontend);
        setCampuses(mappedCampuses);
      } else {
        toast.error(result.message || "Failed to load campuses");
        setCampuses([]);
      }
    } catch (error: any) {
      toast.error("Failed to load campuses: " + error.message);
      setCampuses([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter campuses with useMemo for performance
  const filteredCampuses = useMemo(() => {
    if (!searchQuery.trim()) return campuses;

    const query = searchQuery.toLowerCase();
    return campuses.filter(
      (campus) =>
        campus.name.toLowerCase().includes(query) ||
        campus.description.toLowerCase().includes(query) ||
        campus.address.toLowerCase().includes(query),
    );
  }, [campuses, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const cities = new Set(
      campuses.map((c) => {
        const parts = c.address.split(", ");
        return parts.length > 1 ? parts[1] : "Unknown";
      }),
    );

    const provinces = new Set(
      campuses.map((c) => {
        const parts = c.address.split(", ");
        return parts.length > 2 ? parts[2] : "Unknown";
      }),
    );

    return {
      totalCampuses: campuses.length,
      totalCities: cities.size,
      totalProvinces: provinces.size,
      lastUpdated:
        campuses.length > 0
          ? new Date(campuses[0].updatedAt).toLocaleDateString()
          : "N/A",
    };
  }, [campuses]);

  // Form handlers
  const resetForm = () => {
    setFormData({
      campusName: "",
      description: "",
      location: "",
      createdBy: "",
      updatedBy: "",
    });
    setCurrentCampus(null);
  };

  const handleInputChange = (field: keyof CampusFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddCampus = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditCampus = (campus: Campus) => {
    setCurrentCampus(campus);
    setFormData({
      campusName: campus.name,
      description: campus.description,
      location: campus.address,
      createdBy: "user@example.com", // Update with actual user
      updatedBy: "user@example.com", // Update with actual user
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteCampus = (campus: Campus) => {
    setCurrentCampus(campus);
    setIsDeleteDialogOpen(true);
  };

  const toggleCampusExpansion = (
    campusId: string,
    event?: React.MouseEvent,
  ) => {
    if (event) {
      event.stopPropagation();
    }
    setExpandedCampus((prev) => (prev === campusId ? null : campusId));
  };

  // Submit handlers - UPDATED TO USE NEW SERVER ACTIONS
  const handleSubmitAdd = async () => {
    setIsSubmitting(true);
    try {
      const result = await createCampus(formData);

      if (result.success && result.data) {
        const newCampus = mapDbCampusToFrontend(result.data);
        setCampuses((prev) => [newCampus, ...prev]);
        setIsAddDialogOpen(false);
        resetForm();
        toast.success("Campus added successfully!");
      } else {
        toast.error(result.message || "Failed to add campus");
      }
    } catch (error: any) {
      toast.error("Failed to add campus: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!currentCampus) return;

    setIsSubmitting(true);
    try {
      const result = await updateCampus(currentCampus.id, formData);

      if (result.success && result.data) {
        const updatedCampus = mapDbCampusToFrontend(result.data);
        setCampuses((prev) =>
          prev.map((campus) =>
            campus.id === currentCampus.id ? updatedCampus : campus,
          ),
        );
        setIsEditDialogOpen(false);
        resetForm();
        toast.success("Campus updated successfully!");
      } else {
        toast.error(result.message || "Failed to update campus");
      }
    } catch (error: any) {
      toast.error("Failed to update campus: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentCampus) return;

    setIsSubmitting(true);
    try {
      const result = await deleteCampus(currentCampus.id);

      if (result.success) {
        setCampuses((prev) =>
          prev.filter((campus) => campus.id !== currentCampus.id),
        );
        setIsDeleteDialogOpen(false);
        setCurrentCampus(null);
        toast.success("Campus deleted successfully!");
      } else {
        toast.error(result.message || "Failed to delete campus");
      }
    } catch (error: any) {
      toast.error("Failed to delete campus: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCampuses();
      return;
    }

    try {
      setLoading(true);
      const result = await searchCampuses(searchQuery);

      if (result.success && result.data) {
        const mappedCampuses = result.data.map(mapDbCampusToFrontend);
        setCampuses(mappedCampuses);
      } else {
        toast.error(result.message || "Search failed");
      }
    } catch (error: any) {
      toast.error("Search failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton (same as before)
  if (loading && campuses.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <Skeleton className="h-8 w-48 sm:h-10 sm:w-64" />
            <Skeleton className="mt-2 h-4 w-32 sm:h-5 sm:w-40" />
          </div>
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-12 sm:h-8 sm:w-16" />
                  <Skeleton className="mt-1 h-3 w-16" />
                </CardContent>
              </Card>
            ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-60" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-4 h-10 w-full" />
            <div className="space-y-3">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Campus Management
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage university campuses and their details
          </p>
        </div>
        <Button
          onClick={handleAddCampus}
          className="w-full sm:w-auto transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Campus
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">
              Total Campuses
            </CardTitle>
            <div className="rounded-full bg-blue-100 p-2">
              <Building className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              {stats.totalCampuses}
            </div>
            <p className="text-xs text-muted-foreground">All campuses</p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">
              Total Locations
            </CardTitle>
            <div className="rounded-full bg-green-100 p-2">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              {stats.totalCities}
            </div>
            <p className="text-xs text-muted-foreground">
              Cities & municipalities
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">
              Total Provinces
            </CardTitle>
            <div className="rounded-full bg-purple-100 p-2">
              <MapPin className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              {stats.totalProvinces}
            </div>
            <p className="text-xs text-muted-foreground">Across Philippines</p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">
              Last Updated
            </CardTitle>
            <div className="rounded-full bg-orange-100 p-2">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              {stats.lastUpdated}
            </div>
            <p className="text-xs text-muted-foreground">Most recent campus</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">Campus Directory</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Browse and manage university campuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search campuses by name, description, or address..."
                className="pl-9 text-sm sm:text-base transition-all focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    fetchCampuses();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {searchQuery && (
                  <div className="flex items-center gap-1">
                    <span>Search results for: "{searchQuery}"</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        fetchCampuses();
                      }}
                      className="h-6 px-2 text-xs transition-all hover:bg-muted"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all hover:border-primary hover:bg-primary/5"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all hover:border-primary hover:bg-primary/5"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Campuses Table */}
          {filteredCampuses.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8">
              <Building className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-sm font-semibold">
                {campuses.length === 0
                  ? "No campuses found"
                  : "No matching campuses"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {campuses.length === 0
                  ? "Get started by creating your first campus"
                  : "Try adjusting your search or filters"}
              </p>
              {campuses.length === 0 && (
                <Button onClick={handleAddCampus} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Campus
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[200px] font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">
                      Description
                    </TableHead>
                    <TableHead className="hidden lg:table-cell font-semibold">
                      Address
                    </TableHead>
                    <TableHead className="w-[180px] text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampuses.map((campus) => (
                    <Fragment key={campus.id}>
                      {/* Main Row */}
                      <TableRow
                        className="group cursor-pointer transition-all hover:bg-muted/50"
                        onClick={() => toggleCampusExpansion(campus.id)}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 transition-colors group-hover:bg-blue-200">
                              <Building className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate font-medium">
                                  {campus.name}
                                </p>
                                {expandedCampus === campus.id && (
                                  <Badge variant="outline" className="text-xs">
                                    Expanded
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="truncate text-xs text-muted-foreground">
                                  {campus.address.split(", ")[1] ||
                                    campus.address.split(", ")[0] ||
                                    "Unknown"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden py-4 md:table-cell">
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {campus.description}
                          </p>
                        </TableCell>
                        <TableCell className="hidden py-4 lg:table-cell">
                          <p className="truncate text-sm text-muted-foreground">
                            {campus.address}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit Button - Always visible */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 transition-all hover:bg-primary hover:text-primary-foreground md:h-7 md:w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCampus(campus);
                              }}
                              title="Edit campus"
                            >
                              <Edit className="h-4 w-4 md:h-3.5 md:w-3.5" />
                            </Button>

                            {/* Expand/Collapse Button - Always visible */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 transition-all hover:bg-muted md:h-7 md:w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCampusExpansion(campus.id);
                              }}
                              title={
                                expandedCampus === campus.id
                                  ? "Collapse details"
                                  : "Expand details"
                              }
                            >
                              {expandedCampus === campus.id ? (
                                <ChevronUp className="h-4 w-4 md:h-3.5 md:w-3.5" />
                              ) : (
                                <ChevronDown className="h-4 w-4 md:h-3.5 md:w-3.5" />
                              )}
                            </Button>

                            {/* Delete Button - Always visible */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 transition-all hover:bg-destructive/10 hover:text-destructive md:h-7 md:w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCampus(campus);
                              }}
                              title="Delete campus"
                            >
                              <Trash2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Details Row */}
                      {expandedCampus === campus.id && (
                        <TableRow key={`${campus.id}-expanded`}>
                          <TableCell colSpan={4} className="bg-muted/30 p-0">
                            <div className="animate-in slide-in-from-top-1 p-6">
                              <div className="space-y-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                        <Building className="h-6 w-6 text-blue-600" />
                                      </div>
                                      <div>
                                        <h4 className="text-lg font-semibold">
                                          {campus.name}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                          Campus Details
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground">
                                      {campus.description}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setExpandedCampus(null)}
                                    className="h-8 w-8 transition-all hover:bg-muted"
                                    title="Collapse details"
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                  <div className="space-y-2 rounded-lg border bg-card p-4">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-muted-foreground" />
                                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Full Address
                                      </p>
                                    </div>
                                    <p className="text-sm font-medium">
                                      {campus.address}
                                    </p>
                                  </div>

                                  <div className="space-y-2 rounded-lg border bg-card p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                      Created Date
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-medium">
                                        {new Date(
                                          campus.createdAt,
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-2 rounded-lg border bg-card p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                      Last Updated
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-medium">
                                        {new Date(
                                          campus.updatedAt,
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-2 rounded-lg border bg-card p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                      Campus ID
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <code className="font-mono text-xs text-muted-foreground">
                                        {campus.id.slice(-8)}
                                      </code>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 border-t pt-6 sm:flex-row sm:justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditCampus(campus)}
                                    className="transition-all hover:border-primary hover:bg-primary/5"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Campus
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteCampus(campus)}
                                    className="transition-all hover:bg-destructive/90"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Campus
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {filteredCampuses.length > 0 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">{filteredCampuses.length}</span>{" "}
                of <span className="font-medium">{campuses.length}</span>{" "}
                campuses
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 transition-all hover:bg-muted"
                  disabled
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 bg-primary text-primary-foreground transition-all hover:bg-primary/90"
                >
                  1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 transition-all hover:bg-muted"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 transition-all hover:bg-muted"
                >
                  3
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 transition-all hover:bg-muted"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialogs */}
      {/* Note: You'll need to update your CampusForm component to handle the new field names */}
      {/* For now, using a basic dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Campus</DialogTitle>
            <DialogDescription>
              Create a new university campus. All fields are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Campus Name</label>
              <Input
                value={formData.campusName}
                onChange={(e) =>
                  handleInputChange("campusName", e.target.value)
                }
                placeholder="Enter campus name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter description"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter location/address"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Campus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog (similar structure) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Campus</DialogTitle>
            <DialogDescription>
              Update campus information. All fields are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Campus Name</label>
              <Input
                value={formData.campusName}
                onChange={(e) =>
                  handleInputChange("campusName", e.target.value)
                }
                placeholder="Enter campus name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter description"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter location/address"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Campus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog (same as before) */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="animate-in fade-in-90 zoom-in-95 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Campus
            </DialogTitle>
            <DialogDescription className="text-sm">
              This action cannot be undone. This will permanently delete the
              campus and remove all associated data.
            </DialogDescription>
          </DialogHeader>

          {currentCampus && (
            <div className="py-4 space-y-4">
              <div className="rounded-lg border p-4 transition-all hover:border-destructive/50">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                    <Building className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold">{currentCampus.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentCampus.address}
                    </p>
                    <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                      <span>
                        Created:{" "}
                        {new Date(currentCampus.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>ID: {currentCampus.id.slice(-8)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-destructive/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20">
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Warning: Permanent Deletion
                    </p>
                    <p className="mt-1 text-xs text-destructive/80">
                      All campus records will be permanently removed from the
                      database and cannot be recovered.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="transition-all hover:bg-muted"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="transition-all hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Campus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
