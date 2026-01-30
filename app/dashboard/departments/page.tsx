// app/dashboard/departments/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
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
  Building,
  Users,
  Calendar,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import form component
import DepartmentForm from "@/components/forms/departmentform";

// Import server actions
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  searchDepartments,
  DepartmentFormData,
} from "@/app/actions/department";

// Update the Department interface to match the database model
interface Department {
  id: string;
  name: string;
  campusId: string;
  campusName: string;
  departmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Skeleton component
const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

export default function DepartmentsPage() {
  // State management
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(
    null,
  );
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: "",
    campusId: "",
    campusName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Helper function to map database department to frontend Department interface
  const mapDbDepartmentToFrontend = (dbDepartment: any): Department => {
    return {
      id: dbDepartment._id || dbDepartment.id,
      name: dbDepartment.name,
      campusId: dbDepartment.campusId,
      campusName: dbDepartment.campusName,
      departmentId: dbDepartment.departmentId,
      createdAt: dbDepartment.timestamp || dbDepartment.createdAt || new Date(),
      updatedAt: dbDepartment.updatedAt || new Date(),
    };
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const result = await getDepartments();

      if (result.success && result.data) {
        // Map database departments to frontend interface
        const mappedDepartments = result.data.map(mapDbDepartmentToFrontend);
        setDepartments(mappedDepartments);
      } else {
        toast.error(result.message || "Failed to load departments");
        setDepartments([]);
      }
    } catch (error: any) {
      toast.error("Failed to load departments: " + error.message);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter departments with useMemo for performance
  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;

    const query = searchQuery.toLowerCase();
    return departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(query) ||
        dept.campusName.toLowerCase().includes(query) ||
        dept.departmentId?.toLowerCase().includes(query),
    );
  }, [departments, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const campuses = new Set(departments.map((dept) => dept.campusId));

    return {
      totalDepartments: departments.length,
      totalCampuses: campuses.size,
      lastUpdated:
        departments.length > 0
          ? new Date(departments[0].updatedAt).toLocaleDateString()
          : "N/A",
    };
  }, [departments]);

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: "",
      campusId: "",
      campusName: "",
    });
    setCurrentDepartment(null);
  };

  const handleInputChange = (
    field: keyof DepartmentFormData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddDepartment = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setCurrentDepartment(department);
    setFormData({
      name: department.name,
      campusId: department.campusId,
      campusName: department.campusName,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setCurrentDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchDepartments();
      return;
    }

    try {
      setLoading(true);
      const result = await searchDepartments(searchQuery);

      if (result.success && result.data) {
        const mappedDepartments = result.data.map(mapDbDepartmentToFrontend);
        setDepartments(mappedDepartments);
      } else {
        toast.error(result.message || "Search failed");
      }
    } catch (error: any) {
      toast.error("Search failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit handlers
  const handleSubmitAdd = async () => {
    setIsSubmitting(true);
    try {
      const result = await createDepartment(formData);

      if (result.success && result.data) {
        const newDepartment = mapDbDepartmentToFrontend(result.data);
        setDepartments((prev) => [newDepartment, ...prev]);
        setIsAddDialogOpen(false);
        resetForm();
        toast.success("Department added successfully!");
      } else {
        toast.error(result.message || "Failed to add department");
      }
    } catch (error: any) {
      toast.error("Failed to add department: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!currentDepartment) return;

    setIsSubmitting(true);
    try {
      const result = await updateDepartment(currentDepartment.id, formData);

      if (result.success && result.data) {
        const updatedDepartment = mapDbDepartmentToFrontend(result.data);
        setDepartments((prev) =>
          prev.map((dept) =>
            dept.id === currentDepartment.id ? updatedDepartment : dept,
          ),
        );
        setIsEditDialogOpen(false);
        resetForm();
        toast.success("Department updated successfully!");
      } else {
        toast.error(result.message || "Failed to update department");
      }
    } catch (error: any) {
      toast.error("Failed to update department: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentDepartment) return;

    setIsSubmitting(true);
    try {
      const result = await deleteDepartment(currentDepartment.id);

      if (result.success) {
        setDepartments((prev) =>
          prev.filter((dept) => dept.id !== currentDepartment.id),
        );
        setIsDeleteDialogOpen(false);
        setCurrentDepartment(null);
        toast.success("Department deleted successfully!");
      } else {
        toast.error(result.message || "Failed to delete department");
      }
    } catch (error: any) {
      toast.error("Failed to delete department: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading skeleton
  if (loading && departments.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <Skeleton className="h-8 w-48 sm:h-10 sm:w-64" />
            <Skeleton className="mt-2 h-4 w-32 sm:h-5 sm:w-40" />
          </div>
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array(3)
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
            Department Management
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage university departments and their campus assignments
          </p>
        </div>
        <Button
          onClick={handleAddDepartment}
          className="w-full sm:w-auto transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Department
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">
              Total Departments
            </CardTitle>
            <div className="rounded-full bg-blue-100 p-2">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              {stats.totalDepartments}
            </div>
            <p className="text-xs text-muted-foreground">All departments</p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">
              Total Campuses
            </CardTitle>
            <div className="rounded-full bg-green-100 p-2">
              <Building className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              {stats.totalCampuses}
            </div>
            <p className="text-xs text-muted-foreground">Active campuses</p>
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
            <p className="text-xs text-muted-foreground">Most recent update</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">
            Department Directory
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Browse and manage university departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search departments by name, campus, or ID..."
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
                    fetchDepartments();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

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
                        fetchDepartments();
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

          {/* Departments Table */}
          {filteredDepartments.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-sm font-semibold">
                {departments.length === 0
                  ? "No departments found"
                  : "No matching departments"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {departments.length === 0
                  ? "Get started by creating your first department"
                  : "Try adjusting your search or filters"}
              </p>
              {departments.length === 0 && (
                <Button onClick={handleAddDepartment} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Department
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">
                      Department Name
                    </TableHead>
                    <TableHead className="font-semibold">Campus</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="w-[120px] text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.map((department) => (
                    <TableRow
                      key={department.id}
                      className="transition-all hover:bg-muted/50"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{department.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ID:{" "}
                              {department.departmentId ||
                                department.id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {department.campusName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(
                              department.createdAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 transition-all hover:bg-primary hover:text-primary-foreground md:h-7 md:w-7"
                            onClick={() => handleEditDepartment(department)}
                            title="Edit department"
                          >
                            <Edit className="h-4 w-4 md:h-3.5 md:w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 transition-all hover:bg-destructive/10 hover:text-destructive md:h-7 md:w-7"
                            onClick={() => handleDeleteDepartment(department)}
                            title="Delete department"
                          >
                            <Trash2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {filteredDepartments.length > 0 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {filteredDepartments.length}
                </span>{" "}
                of <span className="font-medium">{departments.length}</span>{" "}
                departments
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

      {/* Department Form Dialogs */}
      <DepartmentForm
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmitAdd}
        title="Add New Department"
        description="Create a new university department. All fields are required."
        submitText="Create Department"
      />

      <DepartmentForm
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) resetForm();
        }}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmitEdit}
        title="Edit Department"
        description="Update department information. All fields are required."
        submitText="Update Department"
      />

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="animate-in fade-in-90 zoom-in-95 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Department
            </DialogTitle>
            <DialogDescription className="text-sm">
              This action cannot be undone. This will permanently delete the
              department and remove all associated data.
            </DialogDescription>
          </DialogHeader>

          {currentDepartment && (
            <div className="py-4 space-y-4">
              <div className="rounded-lg border p-4 transition-all hover:border-destructive/50">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                    <Users className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold">{currentDepartment.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Campus: {currentDepartment.campusName}
                    </p>
                    <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                      <span>
                        Created:{" "}
                        {new Date(
                          currentDepartment.createdAt,
                        ).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>
                        ID:{" "}
                        {currentDepartment.departmentId ||
                          currentDepartment.id.slice(-8)}
                      </span>
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
                      All department records will be permanently removed from
                      the database and cannot be recovered.
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
                  Delete Department
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
