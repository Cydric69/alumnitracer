// components/forms/departmentform.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import { Loader2, Building, Check, X } from "lucide-react";
import { DepartmentFormData } from "@/app/actions/department";
import { getCampuses } from "@/app/actions/campus";
import { Badge } from "@/components/ui/badge";

// Interface for Campus from database
interface Campus {
  id: string; // MongoDB _id
  campusId: string; // Custom campus ID like "002"
  campusName: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DepartmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: DepartmentFormData;
  onInputChange: (field: keyof DepartmentFormData, value: string) => void;
  onSubmit: () => Promise<void>;
  title: string;
  description: string;
  submitText: string;
}

export default function DepartmentForm({
  open,
  onOpenChange,
  formData,
  onInputChange,
  onSubmit,
  title,
  description,
  submitText,
}: DepartmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loadingCampuses, setLoadingCampuses] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load campuses when form opens
  useEffect(() => {
    if (open) {
      loadCampuses();
      setSearchTerm("");
      setSelectedCampus(null);
    }
  }, [open]);

  // Set selected campus from formData when campuses are loaded
  useEffect(() => {
    if (formData.campusId && campuses.length > 0) {
      // Find campus by custom campusId (like "002"), not MongoDB _id
      const campus = campuses.find((c) => c.campusId === formData.campusId);
      if (campus) {
        setSelectedCampus(campus);
        setSearchTerm(campus.campusName);
      }
    }
  }, [formData.campusId, campuses]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadCampuses = async () => {
    try {
      setLoadingCampuses(true);
      const result = await getCampuses();

      if (result.success && result.data) {
        setCampuses(result.data);
      } else {
        toast.error(result.message || "Failed to load campuses");
        setCampuses([]);
      }
    } catch (error: any) {
      toast.error("Failed to load campuses: " + error.message);
      setCampuses([]);
    } finally {
      setLoadingCampuses(false);
    }
  };

  // Filter campuses based on search term
  const filteredCampuses = useMemo(() => {
    if (!searchTerm.trim()) return campuses;

    const term = searchTerm.toLowerCase();
    return campuses
      .filter(
        (campus) =>
          campus.campusName.toLowerCase().includes(term) ||
          campus.campusId.toLowerCase().includes(term) ||
          (campus.location && campus.location.toLowerCase().includes(term)),
      )
      .slice(0, 5); // Limit to 5 results
  }, [campuses, searchTerm]);

  // Handle campus selection
  const handleCampusSelect = (campus: Campus) => {
    setSelectedCampus(campus);
    // Pass the custom campusId (like "002"), not the MongoDB _id
    onInputChange("campusId", campus.campusId);
    onInputChange("campusName", campus.campusName);
    setSearchTerm(campus.campusName);
    setShowResults(false);

    // Focus back on input for better UX
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  // Clear selected campus
  const handleClearCampus = () => {
    setSelectedCampus(null);
    onInputChange("campusId", "");
    onInputChange("campusName", "");
    setSearchTerm("");
    setShowResults(true);
    searchInputRef.current?.focus();
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    // If we clear the search and have a selected campus, clear it
    if (!value.trim() && selectedCampus) {
      handleClearCampus();
    } else {
      setShowResults(true);
    }
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchTerm && !selectedCampus) {
      setShowResults(true);
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
    return (
      formData.name.trim() &&
      formData.campusId.trim() &&
      formData.campusName.trim()
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Department Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="required">
              Department Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g., Information Technology Department"
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              className="capitalize"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Enter the official name of the department
            </p>
          </div>

          {/* Campus Search Input */}
          <div className="space-y-2">
            <Label htmlFor="campus-search" className="required">
              Campus *
            </Label>
            <div className="relative">
              <div className="relative">
                <Input
                  ref={searchInputRef}
                  id="campus-search"
                  placeholder="Search for a campus by name or ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={handleSearchFocus}
                  className="pr-10"
                  autoComplete="off"
                  disabled={loadingCampuses}
                />
                {loadingCampuses && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {selectedCampus && !loadingCampuses && (
                  <button
                    type="button"
                    onClick={handleClearCampus}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-destructive"
                    title="Clear selection"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && filteredCampuses.length > 0 && (
                <div
                  ref={resultsRef}
                  className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95"
                >
                  <div className="max-h-60 overflow-y-auto p-1">
                    {filteredCampuses.map((campus) => (
                      <button
                        key={campus.id}
                        type="button"
                        onClick={() => handleCampusSelect(campus)}
                        className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex flex-col items-start text-left">
                          <span className="font-medium">
                            {campus.campusName}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              ID: {campus.campusId}
                            </Badge>
                            {campus.location && (
                              <span className="truncate max-w-[200px]">
                                {campus.location}
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedCampus?.campusId === campus.campusId && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showResults && searchTerm && filteredCampuses.length === 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground shadow-lg">
                  No campuses found matching "{searchTerm}"
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Start typing to search for a campus. Select from the results.
            </p>
          </div>

          {/* Selected Campus Information */}
          {selectedCampus && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Selected Campus</Label>
                </div>
                <Badge variant="secondary" className="text-xs">
                  ID: {selectedCampus.campusId}
                </Badge>
              </div>
              <div className="pl-6 space-y-1">
                <p className="text-sm font-medium">
                  {selectedCampus.campusName}
                </p>
                {selectedCampus.location && (
                  <p className="text-xs text-muted-foreground">
                    {selectedCampus.location}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCampus}
                    className="h-6 text-xs"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Change Selection
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Help Text */}
          {!selectedCampus && (
            <div className="rounded-lg bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Search for a campus by name or ID. The
                campus will be automatically selected when you choose from the
                dropdown.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCampus(null);
              setSearchTerm("");
              setShowResults(false);
              onOpenChange(false);
            }}
            disabled={isSubmitting}
            className="transition-all hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid()}
            className="transition-all hover:scale-[1.02] active:scale-[0.98]"
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
