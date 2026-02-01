"use client";

import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddressSelects from "./AddressSelects";

interface ContactStepProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  fieldErrors: Record<string, string>;
  stepErrors: Record<string, string>;
  regionList: any[];
  provinceList: any[];
  cityList: any[];
  barangayList: any[];
}

export default function ContactStep({
  formData,
  handleInputChange,
  fieldErrors,
  stepErrors,
  regionList,
  provinceList,
  cityList,
  barangayList,
}: ContactStepProps) {
  const hasStepError = !!stepErrors.contact;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold font-['Times_New_Roman'] text-green-800">
          Contact Information
        </h3>
        <p className="text-gray-600 mt-1">How can we reach you?</p>
      </div>

      {hasStepError && (
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
            <p className="text-red-700 text-sm">{stepErrors.contact}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 font-serif"
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="px-3 py-2 text-base font-serif"
            placeholder="YOUR.EMAIL@EXAMPLE.COM"
            required
          />
          {fieldErrors.email && (
            <div className="flex items-start mt-1.5">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-xs text-red-600">{fieldErrors.email}</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="phoneNumber"
            className="text-sm font-medium text-gray-700 font-serif"
          >
            Phone Number
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            className="px-3 py-2 text-base font-serif"
            placeholder="0912 345 6789"
            required
          />
          {fieldErrors.phoneNumber && (
            <div className="flex items-start mt-1.5">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-xs text-red-600">{fieldErrors.phoneNumber}</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="facebookAccount"
            className="text-sm font-medium text-gray-700 font-serif"
          >
            Facebook Account (Optional)
          </Label>
          <Input
            id="facebookAccount"
            value={formData.facebookAccount}
            onChange={(e) =>
              handleInputChange("facebookAccount", e.target.value)
            }
            className="px-3 py-2 text-base font-serif"
            placeholder="FACEBOOK.COM/USERNAME"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 font-serif">
            Complete Current Address
          </Label>
          <div className="space-y-3">
            <AddressSelects
              type="current"
              formData={formData}
              handleInputChange={handleInputChange}
              regionList={regionList}
              provinceList={provinceList}
              cityList={cityList}
              barangayList={barangayList}
              fieldErrors={fieldErrors}
            />

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">
                Street Address, Building, House Number
              </Label>
              <Input
                value={formData.currentStreet}
                onChange={(e) =>
                  handleInputChange("currentStreet", e.target.value)
                }
                className="px-3 py-2 text-base uppercase font-serif"
                placeholder="STREET, BUILDING, HOUSE NUMBER"
                required
              />
              {fieldErrors.currentStreet && (
                <div className="flex items-start mt-1.5">
                  <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                  <p className="text-xs text-red-600">
                    {fieldErrors.currentStreet}
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
