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
import { Button } from "@/components/ui/button";

interface JobSearchStepProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  fieldErrors: Record<string, string>;
  stepErrors: Record<string, string>;
}

export default function JobSearchStep({
  formData,
  handleInputChange,
  fieldErrors,
  stepErrors,
}: JobSearchStepProps) {
  const hasStepError = !!stepErrors.jobSearch;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
          Job Search Information
        </h3>
        <p className="text-lg text-gray-600 mt-2">
          Finding employment after graduation (Optional)
        </p>
      </div>

      {hasStepError && (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700 text-sm">{stepErrors.jobSearch}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="jobInformationSource"
              className="text-base font-medium text-gray-700 font-serif"
            >
              Where did you find information about your first job? (Optional)
            </Label>
            {formData.jobInformationSource && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleInputChange("jobInformationSource", "")}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 text-sm"
              >
                Clear
              </Button>
            )}
          </div>
          <Select
            value={formData.jobInformationSource || undefined}
            onValueChange={(value) =>
              handleInputChange("jobInformationSource", value)
            }
          >
            <SelectTrigger className="px-4 py-3 text-lg font-serif">
              <SelectValue placeholder="Select Source (Optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CHMSU Career Fair">
                CHMSU Career Fair
              </SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Other Job Fairs">Other Job Fairs</SelectItem>
              <SelectItem value="None">None</SelectItem>
              {/* Remove empty option */}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="firstJobDuration"
              className="text-base font-medium text-gray-700 font-serif"
            >
              How long did it take you to get your first job after graduation?
              (Optional)
            </Label>
            {formData.firstJobDuration && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleInputChange("firstJobDuration", "")}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 text-sm"
              >
                Clear
              </Button>
            )}
          </div>
          <Select
            value={formData.firstJobDuration || undefined}
            onValueChange={(value) =>
              handleInputChange("firstJobDuration", value)
            }
          >
            <SelectTrigger className="px-4 py-3 text-lg font-serif">
              <SelectValue placeholder="Select Duration (Optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3 to 6 months">3 to 6 months</SelectItem>
              <SelectItem value="6 months to 1 year">
                6 months to 1 year
              </SelectItem>
              <SelectItem value="1 to 2 years">1 to 2 years</SelectItem>
              <SelectItem value="2 years & above">2 years & above</SelectItem>
              <SelectItem value="Currently Working">
                Currently Working
              </SelectItem>
              {/* Remove empty option */}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
