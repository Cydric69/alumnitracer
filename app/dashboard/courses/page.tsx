// app/dashboard/courses/page.tsx
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
  MoreVertical,
  Building,
  Users,
  GraduationCap,
  Calendar,
  Edit,
  Trash2,
  ChevronDown,
  X,
  BookOpen,
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
import CourseForm from "@/components/forms/courseform";

// Import server actions
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/app/actions/course.actions";
import { Course, CourseInput } from "@/types/course";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPage() {
  // State management
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseInput>({
    name: "",
    department: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (error: any) {
      toast.error("Failed to load courses: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter courses with useMemo for performance
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;

    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.name.toLowerCase().includes(query) ||
        course.department.name.toLowerCase().includes(query) ||
        course.department.campus.name.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const campuses = new Set(
      courses.map((course) => course.department.campus.id)
    );
    const departments = new Set(courses.map((course) => course.department.id));

    return {
      totalCourses: courses.length,
      totalCampuses: campuses.size,
      totalDepartments: departments.size,
      lastUpdated:
        courses.length > 0
          ? new Date(courses[0].updatedAt).toLocaleDateString()
          : "N/A",
    };
  }, [courses]);

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: "",
      department: "",
    });
    setCurrentCourse(null);
  };

  const handleInputChange = (field: keyof CourseInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddCourse = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setCurrentCourse(course);
    setFormData({
      name: course.name,
      department: course.department.id,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setCurrentCourse(course);
    setIsDeleteDialogOpen(true);
  };

  // Submit handlers
  const handleSubmitAdd = async () => {
    setIsSubmitting(true);
    try {
      const newCourse = await createCourse(formData);
      setCourses((prev) => [newCourse, ...prev]);
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Course added successfully!");
    } catch (error: any) {
      toast.error("Failed to add course: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!currentCourse) return;

    setIsSubmitting(true);
    try {
      const updatedCourse = await updateCourse(currentCourse.id, formData);
      setCourses((prev) =>
        prev.map((course) =>
          course.id === currentCourse.id ? updatedCourse : course
        )
      );
      setIsEditDialogOpen(false);
      resetForm();
      toast.success("Course updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update course: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentCourse) return;

    setIsSubmitting(true);
    try {
      await deleteCourse(currentCourse.id);
      setCourses((prev) =>
        prev.filter((course) => course.id !== currentCourse.id)
      );
      setIsDeleteDialogOpen(false);
      setCurrentCourse(null);
      toast.success("Course deleted successfully!");
    } catch (error: any) {
      toast.error("Failed to delete course: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading skeleton
  if (loading && courses.length === 0) {
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
            Course Management
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage university courses and their department assignments
          </p>
        </div>
        <Button
          onClick={handleAddCourse}
          className="w-full sm:w-auto transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">
              Total Courses
            </CardTitle>
            <div className="rounded-full bg-blue-100 p-2">
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              {stats.totalCourses}
            </div>
            <p className="text-xs text-muted-foreground">All courses</p>
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
              Total Departments
            </CardTitle>
            <div className="rounded-full bg-purple-100 p-2">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              {stats.totalDepartments}
            </div>
            <p className="text-xs text-muted-foreground">Active departments</p>
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
          <CardTitle className="text-lg sm:text-xl">Course Directory</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Browse and manage university courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses by name, department, or campus..."
                className="pl-9 text-sm sm:text-base transition-all focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
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
                      onClick={() => setSearchQuery("")}
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

          {/* Courses Table */}
          {filteredCourses.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8">
              <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-sm font-semibold">
                {courses.length === 0
                  ? "No courses found"
                  : "No matching courses"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {courses.length === 0
                  ? "Get started by creating your first course"
                  : "Try adjusting your search or filters"}
              </p>
              {courses.length === 0 && (
                <Button onClick={handleAddCourse} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Course Name</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold">Campus</TableHead>
                    <TableHead className="w-[120px] text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow
                      key={course.id}
                      className="transition-all hover:bg-muted/50"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{course.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {course.id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {course.department.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {course.department.campus.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 transition-all hover:bg-primary hover:text-primary-foreground md:h-7 md:w-7"
                            onClick={() => handleEditCourse(course)}
                            title="Edit course"
                          >
                            <Edit className="h-4 w-4 md:h-3.5 md:w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 transition-all hover:bg-destructive/10 hover:text-destructive md:h-7 md:w-7"
                            onClick={() => handleDeleteCourse(course)}
                            title="Delete course"
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
          {filteredCourses.length > 0 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">{filteredCourses.length}</span> of{" "}
                <span className="font-medium">{courses.length}</span> courses
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
      <CourseForm
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmitAdd}
        title="Add New Course"
        description="Create a new university course. All fields are required."
        submitText="Create Course"
      />

      <CourseForm
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) resetForm();
        }}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmitEdit}
        title="Edit Course"
        description="Update course information. All fields are required."
        submitText="Update Course"
      />

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="animate-in fade-in-90 zoom-in-95 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Course
            </DialogTitle>
            <DialogDescription className="text-sm">
              This action cannot be undone. This will permanently delete the
              course and remove all associated data.
            </DialogDescription>
          </DialogHeader>

          {currentCourse && (
            <div className="py-4 space-y-4">
              <div className="rounded-lg border p-4 transition-all hover:border-destructive/50">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                    <BookOpen className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold">{currentCourse.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Department: {currentCourse.department.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Campus: {currentCourse.department.campus.name}
                    </p>
                    <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                      <span>
                        Created:{" "}
                        {new Date(currentCourse.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>ID: {currentCourse.id.slice(-8)}</span>
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
                      All course records will be permanently removed from the
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
                  Delete Course
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
