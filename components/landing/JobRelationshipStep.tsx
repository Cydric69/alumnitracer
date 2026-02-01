"use client";

import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

interface JobRelationshipStepProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleJobReasonToggle: (reason: string, isCurrentJob: boolean) => void;
  fieldErrors: Record<string, string>;
  stepErrors: Record<string, string>;
  jobReasonsOptions: any[];
}

export default function JobRelationshipStep({
  formData,
  handleInputChange,
  handleJobReasonToggle,
  fieldErrors,
  stepErrors,
  jobReasonsOptions,
}: JobRelationshipStepProps) {
  const hasStepError = !!stepErrors.jobRelationship;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
          Job Relationship Questions
        </h3>
        <p className="text-lg text-gray-600 mt-2">
          Career alignment with your degree (Optional)
        </p>
      </div>

      {hasStepError && (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700 text-sm">{stepErrors.jobRelationship}</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="block text-base font-medium text-gray-700 font-serif">
              Was your first job related to your degree? (Optional)
            </Label>
            {formData.isFirstJobRelatedToDegree !== undefined && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleInputChange("isFirstJobRelatedToDegree", undefined)
                }
                className="text-red-600 hover:text-red-800 hover:bg-red-50 text-sm"
              >
                Clear
              </Button>
            )}
          </div>
          <RadioGroup
            value={
              formData.isFirstJobRelatedToDegree === undefined
                ? ""
                : formData.isFirstJobRelatedToDegree.toString()
            }
            onValueChange={(value) => {
              if (value === "") {
                handleInputChange("isFirstJobRelatedToDegree", undefined);
              } else {
                handleInputChange(
                  "isFirstJobRelatedToDegree",
                  value === "true",
                );
              }
            }}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="true" id="firstJobYes" />
              <Label htmlFor="firstJobYes" className="cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="false" id="firstJobNo" />
              <Label htmlFor="firstJobNo" className="cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
        </div>

        {formData.isFirstJobRelatedToDegree !== undefined && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="block text-base font-medium text-gray-700 font-serif">
                  Why did you choose your first job? (Optional)
                </Label>
                {formData.firstJobReasons.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInputChange("firstJobReasons", [])}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 text-sm"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {jobReasonsOptions.map((reason) => (
                  <div
                    key={reason.id}
                    className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`first-${reason.id}`}
                      checked={formData.firstJobReasons.includes(reason.value)}
                      onCheckedChange={() =>
                        handleJobReasonToggle(reason.value, false)
                      }
                    />
                    <Label
                      htmlFor={`first-${reason.id}`}
                      className="cursor-pointer"
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="block text-base font-medium text-gray-700 font-serif">
              Is your current job related to your degree? (Optional)
            </Label>
            {formData.isCurrentJobRelatedToDegree !== undefined && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleInputChange("isCurrentJobRelatedToDegree", undefined)
                }
                className="text-red-600 hover:text-red-800 hover:bg-red-50 text-sm"
              >
                Clear
              </Button>
            )}
          </div>
          <RadioGroup
            value={
              formData.isCurrentJobRelatedToDegree === undefined
                ? ""
                : formData.isCurrentJobRelatedToDegree.toString()
            }
            onValueChange={(value) => {
              if (value === "") {
                handleInputChange("isCurrentJobRelatedToDegree", undefined);
              } else {
                handleInputChange(
                  "isCurrentJobRelatedToDegree",
                  value === "true",
                );
              }
            }}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="true" id="currentJobYes" />
              <Label htmlFor="currentJobYes" className="cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="false" id="currentJobNo" />
              <Label htmlFor="currentJobNo" className="cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
        </div>

        {formData.isCurrentJobRelatedToDegree !== undefined && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="block text-base font-medium text-gray-700 font-serif">
                Why did you choose your current job? (Optional)
              </Label>
              {formData.currentJobReasons.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleInputChange("currentJobReasons", [])}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 text-sm"
                >
                  Clear All
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {jobReasonsOptions.map((reason) => (
                <div
                  key={reason.id}
                  className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    id={`current-${reason.id}`}
                    checked={formData.currentJobReasons.includes(reason.value)}
                    onCheckedChange={() =>
                      handleJobReasonToggle(reason.value, true)
                    }
                  />
                  <Label
                    htmlFor={`current-${reason.id}`}
                    className="cursor-pointer"
                  >
                    {reason.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
