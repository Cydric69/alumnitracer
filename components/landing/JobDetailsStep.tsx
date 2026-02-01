"use client";

import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddressSelects from "./AddressSelects";

interface JobDetailsStepProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  fieldErrors: Record<string, string>;
  stepErrors: Record<string, string>;
  regionList: any[];
  companyProvinceList: any[];
  companyCityList: any[];
  companyBarangayList: any[];
}

export default function JobDetailsStep({
  formData,
  handleInputChange,
  fieldErrors,
  stepErrors,
  regionList,
  companyProvinceList,
  companyCityList,
  companyBarangayList,
}: JobDetailsStepProps) {
  const hasStepError = !!stepErrors.jobDetails;
  const showJobDetails =
    formData.employmentStatus === "Employed" ||
    formData.employmentStatus === "Self-Employed";

  if (!showJobDetails) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
            Job Details
          </h3>
          <p className="text-lg text-gray-600 mt-2">
            Current employment information
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">
            No job details required for your selected employment status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
          Job Details
        </h3>
        <p className="text-lg text-gray-600 mt-2">
          Current employment information
        </p>
      </div>

      {hasStepError && (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700 text-sm">{stepErrors.jobDetails}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="currentPosition"
            className="text-base font-medium text-gray-700 font-serif"
          >
            Current Position
          </Label>
          <Input
            id="currentPosition"
            value={formData.currentPosition}
            onChange={(e) =>
              handleInputChange("currentPosition", e.target.value)
            }
            className="px-4 py-3 text-lg uppercase font-serif"
            placeholder="E.G., SOFTWARE DEVELOPER"
            required
          />
          {fieldErrors.currentPosition && (
            <div className="flex items-start mt-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-sm text-red-600">
                {fieldErrors.currentPosition}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="employer"
            className="text-base font-medium text-gray-700 font-serif"
          >
            Employer/Company Name
          </Label>
          <Input
            id="employer"
            value={formData.employer}
            onChange={(e) => handleInputChange("employer", e.target.value)}
            className="px-4 py-3 text-lg uppercase font-serif"
            placeholder="COMPANY NAME"
            required
          />
          {fieldErrors.employer && (
            <div className="flex items-start mt-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-sm text-red-600">{fieldErrors.employer}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium text-gray-700 font-serif">
            Company Address
          </Label>
          <div className="space-y-4">
            <AddressSelects
              type="company"
              formData={formData}
              handleInputChange={handleInputChange}
              regionList={regionList}
              provinceList={companyProvinceList}
              cityList={companyCityList}
              barangayList={companyBarangayList}
              fieldErrors={fieldErrors}
            />

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Street Address, Building Name, Floor Number
              </Label>
              <Input
                value={formData.companyStreet}
                onChange={(e) =>
                  handleInputChange("companyStreet", e.target.value)
                }
                className="px-4 py-3 text-lg uppercase font-serif"
                placeholder="STREET, BUILDING, FLOOR NUMBER"
                required
              />
              {fieldErrors.companyStreet && (
                <div className="flex items-start mt-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                  <p className="text-sm text-red-600">
                    {fieldErrors.companyStreet}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
