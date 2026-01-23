// components/forms/departmentform.tsx
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
import { DepartmentInput } from "@/types/department";
import { Loader2 } from "lucide-react";
import { getCampuses } from "@/app/actions/campus.actions";
import { Campus } from "@/types/campus";

interface DepartmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: DepartmentInput;
  onInputChange: (field: keyof DepartmentInput, value: string) => void;
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

  // Load campuses when form opens
  useEffect(() => {
    if (open) {
      loadCampuses();
    }
  }, [open]);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.name.trim() && formData.campus.trim();
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
            />
            <p className="text-xs text-gray-500">
              Enter the name of the department
            </p>
          </div>

          {/* Campus Selection */}
          <div className="space-y-2">
            <Label htmlFor="campus" className="required">
              Campus *
            </Label>
            <Select
              value={formData.campus}
              onValueChange={(value) => onInputChange("campus", value)}
              disabled={loadingCampuses}
            >
              <SelectTrigger>
                {loadingCampuses ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading campuses...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select a campus" />
                )}
              </SelectTrigger>
              <SelectContent>
                {campuses.map((campus) => (
                  <SelectItem key={campus.id} value={campus.id}>
                    {campus.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Select which campus this department belongs to
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
