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
import { Input } from "@/components/ui/input";

interface AddressSelectsProps {
  type: "current" | "birth" | "company";
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  regionList: any[];
  provinceList: any[];
  cityList: any[];
  barangayList: any[];
  fieldErrors: Record<string, string>;
}

export default function AddressSelects({
  type,
  formData,
  handleInputChange,
  regionList,
  provinceList,
  cityList,
  barangayList,
  fieldErrors,
}: AddressSelectsProps) {
  const regionField =
    type === "current"
      ? "currentRegion"
      : type === "birth"
        ? "birthRegion"
        : "companyRegion";
  const provinceField =
    type === "current"
      ? "currentProvince"
      : type === "birth"
        ? "birthProvince"
        : "companyProvince";
  const cityField =
    type === "current"
      ? "currentCity"
      : type === "birth"
        ? "birthCity"
        : "companyCity";
  const barangayField =
    type === "current"
      ? "currentBarangay"
      : type === "birth"
        ? "birthBarangay"
        : "companyBarangay";
  const zipCodeField =
    type === "current"
      ? "currentZipCode"
      : type === "birth"
        ? "birthZipCode"
        : "companyZipCode";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Region</Label>
        <Select
          value={formData[regionField] || ""}
          onValueChange={(value) => handleInputChange(regionField, value)}
          required={type === "current" || type === "company"}
        >
          <SelectTrigger className="px-4 py-3 text-lg font-serif">
            <SelectValue placeholder="Select Region" />
          </SelectTrigger>
          <SelectContent>
            {regionList.map((region) => (
              <SelectItem key={region.region_code} value={region.region_code}>
                {region.region_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors[regionField] && (
          <div className="flex items-start mt-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
            <p className="text-sm text-red-600">{fieldErrors[regionField]}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Province</Label>
        <Select
          value={formData[provinceField] || ""}
          onValueChange={(value) => handleInputChange(provinceField, value)}
          disabled={!formData[regionField]}
          required={type === "current" || type === "company"}
        >
          <SelectTrigger className="px-4 py-3 text-lg font-serif">
            <SelectValue placeholder="Select Province" />
          </SelectTrigger>
          <SelectContent>
            {provinceList.map((province) => (
              <SelectItem
                key={province.province_code}
                value={province.province_code}
              >
                {province.province_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors[provinceField] && (
          <div className="flex items-start mt-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
            <p className="text-sm text-red-600">{fieldErrors[provinceField]}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          City/Municipality
        </Label>
        <Select
          value={formData[cityField] || ""}
          onValueChange={(value) => handleInputChange(cityField, value)}
          disabled={!formData[provinceField]}
          required={type === "current" || type === "company"}
        >
          <SelectTrigger className="px-4 py-3 text-lg font-serif">
            <SelectValue placeholder="Select City/Municipality" />
          </SelectTrigger>
          <SelectContent>
            {cityList.map((city) => (
              <SelectItem key={city.city_code} value={city.city_code}>
                {city.city_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors[cityField] && (
          <div className="flex items-start mt-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
            <p className="text-sm text-red-600">{fieldErrors[cityField]}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Barangay</Label>
        <Select
          value={formData[barangayField] || ""}
          onValueChange={(value) => handleInputChange(barangayField, value)}
          disabled={!formData[cityField]}
          required={type === "current" || type === "company"}
        >
          <SelectTrigger className="px-4 py-3 text-lg font-serif">
            <SelectValue placeholder="Select Barangay" />
          </SelectTrigger>
          <SelectContent>
            {barangayList.map((barangay) => (
              <SelectItem key={barangay.brgy_code} value={barangay.brgy_code}>
                {barangay.brgy_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors[barangayField] && (
          <div className="flex items-start mt-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
            <p className="text-sm text-red-600">{fieldErrors[barangayField]}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Zip Code</Label>
        <Input
          type="text"
          value={formData[zipCodeField] || ""}
          onChange={(e) => handleInputChange(zipCodeField, e.target.value)}
          className="px-4 py-3 text-lg font-serif"
          placeholder="Enter Zip Code"
        />
      </div>
    </div>
  );
}
