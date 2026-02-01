"use client";

import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface BoardExamStepProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  fieldErrors: Record<string, string>;
  stepErrors: Record<string, string>;
}

export default function BoardExamStep({
  formData,
  handleInputChange,
  fieldErrors,
  stepErrors,
}: BoardExamStepProps) {
  const hasStepError = !!stepErrors.boardExam;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
          Board Exam Information
        </h3>
        <p className="text-lg text-gray-600 mt-2">
          Licensure examination details (Optional)
        </p>
      </div>
      {hasStepError && (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700 text-sm">{stepErrors.boardExam}</p>
          </div>
        </div>
      )}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="boardExamPassed"
            className="text-base font-medium text-gray-700 font-serif"
          >
            Board Exam Passed (Optional)
          </Label>
          <Input
            id="boardExamPassed"
            value={formData.boardExamPassed}
            onChange={(e) =>
              handleInputChange("boardExamPassed", e.target.value)
            }
            className="px-4 py-3 text-lg uppercase font-serif"
            placeholder="E.G., CIVIL ENGINEER (Optional)"
          />
          <p className="text-sm text-gray-500">Leave blank if not applicable</p>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="yearPassedBoardExam"
            className="text-base font-medium text-gray-700 font-serif"
          >
            Year Passed Board Exam (Optional)
          </Label>
          <Input
            id="yearPassedBoardExam"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.yearPassedBoardExam}
            onChange={(e) =>
              handleInputChange("yearPassedBoardExam", e.target.value)
            }
            className="px-4 py-3 text-lg font-serif"
            placeholder="2023 (Optional)"
          />
          {fieldErrors.yearPassedBoardExam && (
            <div className="flex items-start mt-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-sm text-red-600">
                {fieldErrors.yearPassedBoardExam}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Only required if you entered a board exam above
          </p>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="dateEmploymentAfterBoardExam"
            className="text-base font-medium text-gray-700 font-serif"
          >
            How long did it take you to get employed after passing the board
            exam? (Optional)
          </Label>
          <Select
            value={formData.dateEmploymentAfterBoardExam || ""}
            onValueChange={(value) =>
              handleInputChange("dateEmploymentAfterBoardExam", value || "")
            }
          >
            <SelectTrigger className="px-4 py-3 text-lg font-serif">
              <SelectValue placeholder="Select Duration (Optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Within one month">Within one month</SelectItem>
              <SelectItem value="1 to 3 months">1 to 3 months</SelectItem>
              <SelectItem value="3 to 6 months">3 to 6 months</SelectItem>
              <SelectItem value="6 months to 1 year">
                6 months to 1 year
              </SelectItem>
              <SelectItem value="Within 2 years">Within 2 years</SelectItem>
              <SelectItem value="After 2 years">After 2 years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Clear Selection Button */}
        {formData.dateEmploymentAfterBoardExam && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                handleInputChange("dateEmploymentAfterBoardExam", "")
              }
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
