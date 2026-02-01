"use client";

import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AwardsStepProps {
  formData: any;
  handleArrayChange: (
    field: "awardsRecognition" | "scholarshipsDuringEmployment" | "eligibility",
    index: number,
    value: string,
  ) => void;
  addArrayField: (
    field: "awardsRecognition" | "scholarshipsDuringEmployment" | "eligibility",
  ) => void;
  removeArrayField: (
    field: "awardsRecognition" | "scholarshipsDuringEmployment" | "eligibility",
    index: number,
  ) => void;
  fieldErrors: Record<string, string>;
  stepErrors: Record<string, string>;
}

export default function AwardsStep({
  formData,
  handleArrayChange,
  addArrayField,
  removeArrayField,
  fieldErrors,
  stepErrors,
}: AwardsStepProps) {
  const hasStepError = !!stepErrors.awards;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
          Awards & Scholarships
        </h3>
        <p className="text-lg text-gray-600 mt-2">
          Your achievements and recognitions (All Optional)
        </p>
      </div>

      {hasStepError && (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700 text-sm">{stepErrors.awards}</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Awards and Recognition */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="block text-base font-medium text-gray-700 font-serif">
              Awards and Recognition Received (Optional)
            </Label>
            <Button
              type="button"
              variant="ghost"
              onClick={() => addArrayField("awardsRecognition")}
              className="flex items-center space-x-2 text-green-700 hover:text-green-800"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Add Award</span>
            </Button>
          </div>
          <div className="space-y-4">
            {formData.awardsRecognition.map((award: string, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <Input
                  value={award}
                  onChange={(e) =>
                    handleArrayChange(
                      "awardsRecognition",
                      index,
                      e.target.value,
                    )
                  }
                  className="flex-1 px-4 py-3 text-lg uppercase font-serif"
                  placeholder="AWARD NAME (Optional)"
                />
                {formData.awardsRecognition.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayField("awardsRecognition", index)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Leave blank or remove all entries if none
          </p>
        </div>

        {/* Scholarships */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="block text-base font-medium text-gray-700 font-serif">
              Scholarships During Employment (Optional)
            </Label>
            <Button
              type="button"
              variant="ghost"
              onClick={() => addArrayField("scholarshipsDuringEmployment")}
              className="flex items-center space-x-2 text-green-700 hover:text-green-800"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Add Scholarship</span>
            </Button>
          </div>
          <div className="space-y-4">
            {formData.scholarshipsDuringEmployment.map(
              (scholarship: string, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    value={scholarship}
                    onChange={(e) =>
                      handleArrayChange(
                        "scholarshipsDuringEmployment",
                        index,
                        e.target.value,
                      )
                    }
                    className="flex-1 px-4 py-3 text-lg uppercase font-serif"
                    placeholder="SCHOLARSHIP NAME (Optional)"
                  />
                  {formData.scholarshipsDuringEmployment.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        removeArrayField("scholarshipsDuringEmployment", index)
                      }
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ),
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Leave blank or remove all entries if none
          </p>
        </div>

        {/* Eligibility */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="block text-base font-medium text-gray-700 font-serif">
              Eligibility (e.g., CSC, RA 1080) (Optional)
            </Label>
            <Button
              type="button"
              variant="ghost"
              onClick={() => addArrayField("eligibility")}
              className="flex items-center space-x-2 text-green-700 hover:text-green-800"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Add Eligibility</span>
            </Button>
          </div>
          <div className="space-y-4">
            {formData.eligibility.map((eligibility: string, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <Input
                  value={eligibility}
                  onChange={(e) =>
                    handleArrayChange("eligibility", index, e.target.value)
                  }
                  className="flex-1 px-4 py-3 text-lg uppercase font-serif"
                  placeholder="ELIGIBILITY (Optional)"
                />
                {formData.eligibility.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayField("eligibility", index)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Leave blank or remove all entries if none
          </p>
        </div>
      </div>
    </div>
  );
}
