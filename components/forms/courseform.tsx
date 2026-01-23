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
import { CourseInput } from "@/types/course";
import { Loader2, Building } from "lucide-react";
import { getDepartmentsForSelection } from "@/app/actions/course.actions";
import { getCampuses } from "@/app/actions/campus.actions";
import { Campus } from "@/types/campus";

interface DepartmentForSelection {
  id: string;
  name: string;
  campus: {
    id: string;
    name: string;
  };
}

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CourseInput;
  onInputChange: (field: keyof CourseInput, value: string) => void;
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
  const [campuses, setCampuses] = useState<Campus[]>([]);
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
    }
  }, [open]);

  // Filter departments based on selected campus
  useEffect(() => {
    if (selectedCampusId && selectedCampusId !== "all") {
      const filtered = departments.filter(
        (dept) => dept.campus.id === selectedCampusId
      );
      setFilteredDepartments(filtered);

      // If current department is not in filtered list, clear it
      if (
        formData.department &&
        !filtered.some((dept) => dept.id === formData.department)
      ) {
        onInputChange("department", "");
        setSelectedDepartment(null);
      }
    } else {
      setFilteredDepartments(departments);
    }
  }, [selectedCampusId, departments, formData.department]);

  // Update selected department when formData.department changes
  useEffect(() => {
    if (formData.department && departments.length > 0) {
      const dept = departments.find((d) => d.id === formData.department);
      if (dept) {
        setSelectedDepartment(dept);
        // Auto-select the campus of the selected department
        if (selectedCampusId === "all") {
          setSelectedCampusId(dept.campus.id);
        }
      }
    } else {
      setSelectedDepartment(null);
    }
  }, [formData.department, departments]);

  const loadCampuses = async () => {
    try {
      setLoadingCampuses(true);
      const data = await getCampuses();
      setCampuses(data);
    } catch (error: any) {
      toast.error("Failed to load campuses: " + error.message);
    } finally {
      setLoadingCampuses(false);
    }
  };

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const data = await getDepartmentsForSelection();
      setDepartments(data);
      setFilteredDepartments(data);
    } catch (error: any) {
      toast.error("Failed to load departments: " + error.message);
    } finally {
      setLoadingDepartments(false);
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
    return formData.name.trim() && formData.department.trim();
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
            <Label htmlFor="name" className="required">
              Course Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g., Bachelor of Science in Information Technology"
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
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
                  <SelectItem key={campus.id} value={campus.id}>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>{campus.name}</span>
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
              value={formData.department}
              onValueChange={(value) => onInputChange("department", value)}
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
                    <SelectItem key={dept.id} value={dept.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{dept.name}</span>
                        <span className="text-xs text-gray-500">
                          Campus: {dept.campus.name}
                        </span>
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
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Selected Department:</span>
                      <span>{selectedDepartment.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Building className="h-4 w-4" />
                      <span>Campus: {selectedDepartment.campus.name}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onInputChange("department", "");
                      setSelectedDepartment(null);
                    }}
                    className="h-7 px-2 text-xs"
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
