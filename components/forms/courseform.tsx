// components/forms/courseform.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Building } from "lucide-react";
import { getCampuses } from "@/app/actions/campus";
import { getDepartmentsWithFullCampusDetails } from "@/app/actions/department";
import { CourseFormData } from "@/app/actions/course";

interface DepartmentForSelection {
  id: string;
  departmentId: string;
  name: string;
  campusId: string;
  campusName: string;
  campusLocation?: string;
}

interface CampusForSelection {
  id: string;
  campusId: string;
  campusName: string;
  location?: string;
}

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CourseFormData;
  onInputChange: (field: keyof CourseFormData, value: string) => void;
  onSubmit: () => Promise<void>;
  title: string;
  description: string;
  submitText: string;
}

export default function CourseForm({
  open,
  onOpenChange,
  formData,
  onInputChange,
  onSubmit,
  title,
  description,
  submitText,
}: CourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<DepartmentForSelection[]>([]);
  const [campuses, setCampuses] = useState<CampusForSelection[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCampuses, setLoadingCampuses] = useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState<
    DepartmentForSelection[]
  >([]);
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentForSelection | null>(null);
  const [selectedCampusId, setSelectedCampusId] = useState<string>("all");

  // Load campuses and departments when form opens
  useEffect(() => {
    if (open) {
      loadCampuses();
      loadDepartments();
    } else {
      // Reset filters when form closes
      setSelectedCampusId("all");
      setSelectedDepartment(null);
    }
  }, [open]);

  // Filter departments based on selected campus
  useEffect(() => {
    if (selectedCampusId && selectedCampusId !== "all") {
      const filtered = departments.filter(
        (dept) => dept.campusId === selectedCampusId,
      );
      setFilteredDepartments(filtered);

      // If current department is not in filtered list, clear it
      if (
        formData.departmentId &&
        !filtered.some((dept) => dept.departmentId === formData.departmentId)
      ) {
        handleClearDepartment();
      }
    } else {
      setFilteredDepartments(departments);
    }
  }, [selectedCampusId, departments]);

  // Update selected department when formData.departmentId changes
  useEffect(() => {
    if (formData.departmentId && departments.length > 0) {
      const dept = departments.find(
        (d) => d.departmentId === formData.departmentId,
      );
      if (dept) {
        setSelectedDepartment(dept);
        // Auto-select the campus of the selected department
        if (selectedCampusId === "all") {
          setSelectedCampusId(dept.campusId);
        }
      }
    } else {
      setSelectedDepartment(null);
    }
  }, [formData.departmentId, departments, selectedCampusId]);

  const loadCampuses = async () => {
    try {
      setLoadingCampuses(true);
      const result = await getCampuses();

      if (result.success && result.data) {
        const campusData = result.data.map((campus: any) => ({
          id: campus.id || campus._id,
          campusId: campus.campusId,
          campusName: campus.campusName,
          location: campus.location,
        }));
        setCampuses(campusData);
      } else {
        toast.error(result.message || "Failed to load campuses");
      }
    } catch (error: any) {
      toast.error("Failed to load campuses: " + error.message);
    } finally {
      setLoadingCampuses(false);
    }
  };

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const result = await getDepartmentsWithFullCampusDetails();

      if (result.success && result.data) {
        const departmentData = result.data.map((dept: any) => ({
          id: dept.id || dept._id,
          departmentId: dept.departmentId,
          name: dept.name,
          campusId: dept.campusId,
          campusName: dept.campusName,
          campusLocation: dept.campusLocation,
        }));
        setDepartments(departmentData);
        setFilteredDepartments(departmentData);
      } else {
        toast.error(result.message || "Failed to load departments");
      }
    } catch (error: any) {
      toast.error("Failed to load departments: " + error.message);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleClearDepartment = () => {
    onInputChange("departmentId", "");
    onInputChange("departmentName", "");
    onInputChange("campusId", "");
    onInputChange("campusName", "");
    setSelectedDepartment(null);
  };

  const handleDepartmentChange = (departmentId: string) => {
    const selectedDept = departments.find(
      (dept) => dept.departmentId === departmentId,
    );
    if (selectedDept) {
      onInputChange("departmentId", departmentId);
      onInputChange("departmentName", selectedDept.name);
      onInputChange("campusId", selectedDept.campusId);
      onInputChange("campusName", selectedDept.campusName);
      setSelectedDepartment(selectedDept);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    // Safely check if required fields exist and have non-empty values
    return (
      formData?.courseName?.trim() &&
      formData?.departmentId?.trim() &&
      formData?.departmentName?.trim() &&
      formData?.campusId?.trim() &&
      formData?.campusName?.trim()
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Course Name */}
          <div className="space-y-2">
            <Label htmlFor="courseName" className="required">
              Course Name *
            </Label>
            <Input
              id="courseName"
              placeholder="e.g., Bachelor of Science in Information Technology"
              value={formData?.courseName || ""}
              onChange={(e) => onInputChange("courseName", e.target.value)}
              className="capitalize"
            />
            <p className="text-xs text-gray-500">
              Enter the full name of the course
            </p>
          </div>

          {/* Campus Filter */}
          <div className="space-y-2">
            <Label htmlFor="campus-filter">Filter by Campus (Optional)</Label>
            <Select
              value={selectedCampusId}
              onValueChange={setSelectedCampusId}
              disabled={loadingCampuses}
            >
              <SelectTrigger>
                {loadingCampuses ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading campuses...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Filter by campus (optional)" />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campuses</SelectItem>
                {campuses.map((campus) => (
                  <SelectItem key={campus.id} value={campus.campusId}>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{campus.campusName}</span>
                        {campus.location && (
                          <span className="text-xs text-gray-500">
                            {campus.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Select a campus to filter departments
            </p>
          </div>

          {/* Department Selection */}
          <div className="space-y-2">
            <Label htmlFor="department" className="required">
              Department *
            </Label>
            <Select
              value={formData?.departmentId || ""}
              onValueChange={handleDepartmentChange}
              disabled={
                loadingDepartments ||
                (selectedCampusId !== "all" && filteredDepartments.length === 0)
              }
            >
              <SelectTrigger>
                {loadingDepartments ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading departments...</span>
                  </div>
                ) : selectedCampusId !== "all" &&
                  filteredDepartments.length === 0 ? (
                  <div className="text-gray-500">
                    No departments found in selected campus
                  </div>
                ) : (
                  <SelectValue placeholder="Select a department" />
                )}
              </SelectTrigger>
              <SelectContent>
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.departmentId}>
                      <div className="flex flex-col">
                        <span className="font-medium">{dept.name}</span>
                        <div className="flex flex-col text-xs text-gray-500">
                          <span>Campus: {dept.campusName}</span>
                          {dept.campusLocation && (
                            <span>Location: {dept.campusLocation}</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-3 text-sm text-gray-500">
                    No departments available
                  </div>
                )}
              </SelectContent>
            </Select>

            {/* Show selected department info */}
            {selectedDepartment && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Selected Department:</span>
                      <span>{selectedDepartment.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Building className="h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span>Campus: {selectedDepartment.campusName}</span>
                        {selectedDepartment.campusLocation && (
                          <span className="text-xs">
                            Location: {selectedDepartment.campusLocation}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearDepartment}
                    className="h-7 px-2 text-xs flex-shrink-0"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Department count */}
            {departments.length > 0 && (
              <p className="text-xs text-gray-500">
                {selectedCampusId !== "all"
                  ? `Showing ${filteredDepartments.length} department(s) in selected campus`
                  : `Showing ${filteredDepartments.length} department(s) across all campuses`}
              </p>
            )}

            {/* Warning if no departments */}
            {!loadingDepartments && filteredDepartments.length === 0 && (
              <div className="mt-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-700">
                  {selectedCampusId !== "all"
                    ? "No departments found in the selected campus. Please select a different campus or create departments first."
                    : "No departments found. Please create departments first."}
                </p>
              </div>
            )}
          </div>

          {/* Course Availability */}
          <div className="space-y-2">
            <Label htmlFor="courseAvailability">Course Status</Label>
            <Select
              value={formData?.courseAvailability || "Active"}
              onValueChange={(value) =>
                onInputChange(
                  "courseAvailability",
                  value as "Active" | "Inactive" | "Archived",
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Set the availability status of this course
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              submitText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
