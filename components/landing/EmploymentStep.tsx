"use client";

import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmploymentStepProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  fieldErrors: Record<string, string>;
  stepErrors: Record<string, string>;
}

export default function EmploymentStep({
  formData,
  handleInputChange,
  fieldErrors,
  stepErrors,
}: EmploymentStepProps) {
  const hasStepError = !!stepErrors.employment;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold font-['Times_New_Roman'] text-green-800">
          Employment Information
        </h3>
        <p className="text-gray-600 mt-1">Current employment status</p>
      </div>

      {hasStepError && (
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
            <p className="text-red-700 text-sm">{stepErrors.employment}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="employmentStatus"
            className="text-sm font-medium text-gray-700 font-serif"
          >
            Employment Status
          </Label>
          <Select
            value={formData.employmentStatus}
            onValueChange={(value) =>
              handleInputChange("employmentStatus", value)
            }
          >
            <SelectTrigger className="px-3 py-2 text-base font-serif">
              <SelectValue placeholder="Select Employment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Employed">Employed</SelectItem>
              <SelectItem value="Self-Employed">Self-Employed</SelectItem>
              <SelectItem value="Unemployed">Unemployed</SelectItem>
              <SelectItem value="Never Employed">Never Employed</SelectItem>
              <SelectItem value="Further Studies">Further Studies</SelectItem>
            </SelectContent>
          </Select>
          {fieldErrors.employmentStatus && (
            <div className="flex items-start mt-1.5">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-xs text-red-600">
                {fieldErrors.employmentStatus}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="employmentSector"
            className="text-sm font-medium text-gray-700 font-serif"
          >
            Employment Sector
          </Label>
          <Select
            value={formData.employmentSector}
            onValueChange={(value) =>
              handleInputChange("employmentSector", value)
            }
          >
            <SelectTrigger className="px-3 py-2 text-base font-serif">
              <SelectValue placeholder="Select Employment Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Government">Government</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Entrepreneurial">Entrepreneurial</SelectItem>
              <SelectItem value="Freelance">Freelance</SelectItem>
              <SelectItem value="N/A">N/A</SelectItem>
            </SelectContent>
          </Select>
          {fieldErrors.employmentSector && (
            <div className="flex items-start mt-1.5">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-xs text-red-600">
                {fieldErrors.employmentSector}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="presentEmploymentStatus"
            className="text-sm font-medium text-gray-700 font-serif"
          >
            Present Employment Status
          </Label>
          <Select
            value={formData.presentEmploymentStatus}
            onValueChange={(value) =>
              handleInputChange("presentEmploymentStatus", value)
            }
          >
            <SelectTrigger className="px-3 py-2 text-base font-serif">
              <SelectValue placeholder="Select Present Employment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Regular">Regular</SelectItem>
              <SelectItem value="Probationary">Probationary</SelectItem>
              <SelectItem value="Casual">Casual</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
              <SelectItem value="N/A">N/A</SelectItem>
            </SelectContent>
          </Select>
          {fieldErrors.presentEmploymentStatus && (
            <div className="flex items-start mt-1.5">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-xs text-red-600">
                {fieldErrors.presentEmploymentStatus}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="locationOfEmployment"
            className="text-sm font-medium text-gray-700 font-serif"
          >
            Location of Employment
          </Label>
          <Select
            value={formData.locationOfEmployment}
            onValueChange={(value) =>
              handleInputChange("locationOfEmployment", value)
            }
          >
            <SelectTrigger className="px-3 py-2 text-base font-serif">
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Local">Local</SelectItem>
              <SelectItem value="Abroad">Abroad</SelectItem>
              <SelectItem value="N/A">N/A</SelectItem>
            </SelectContent>
          </Select>
          {fieldErrors.locationOfEmployment && (
            <div className="flex items-start mt-1.5">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-xs text-red-600">
                {fieldErrors.locationOfEmployment}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
