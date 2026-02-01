"use client";

import { AlertCircle, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import AddressSelects from "./AddressSelects";

interface PersonalStepProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  fieldErrors: Record<string, string>;
  stepErrors: Record<string, string>;
  dateOfBirth: Date | undefined;
  setDateOfBirth: (date: Date | undefined) => void;
  regionList: any[];
  birthProvinceList: any[];
  birthCityList: any[];
  birthBarangayList: any[];
}

const formatDateNatural = (date: Date): string => {
  return format(date, "MMMM, dd, yyyy");
};

export default function PersonalStep({
  formData,
  handleInputChange,
  fieldErrors,
  stepErrors,
  dateOfBirth,
  setDateOfBirth,
  regionList,
  birthProvinceList,
  birthCityList,
  birthBarangayList,
}: PersonalStepProps) {
  const hasStepError = !!stepErrors.personal;

  return (
    <div className="space-y-6">
      {" "}
      {/* Reduced from space-y-8 */}
      <div className="text-center">
        <h3 className="text-2xl font-bold font-['Times_New_Roman'] text-green-800">
          {" "}
          {/* Reduced from text-3xl */}
          Personal Information
        </h3>
        <p className="text-gray-600 mt-1">
          {" "}
          {/* Reduced margin and removed text-lg */}
          Tell us about yourself
        </p>
      </div>
      {hasStepError && (
        <div className="bg-red-50 p-3 rounded-lg">
          {" "}
          {/* Reduced padding */}
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
            <p className="text-red-700 text-sm">{stepErrors.personal}</p>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {" "}
        {/* Reduced from space-y-6 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {" "}
          {/* Reduced gap */}
          <div className="space-y-1.5">
            {" "}
            {/* Reduced spacing */}
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700 font-serif" // Reduced text size
            >
              First Name
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="px-3 py-2 text-base uppercase font-serif" // Reduced padding and text size
              placeholder="ENTER FIRST NAME"
              required
            />
            {fieldErrors.firstName && (
              <div className="flex items-start mt-1.5">
                {" "}
                {/* Reduced margin */}
                <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                <p className="text-xs text-red-600">{fieldErrors.firstName}</p>{" "}
                {/* Reduced text size */}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="lastName"
              className="text-sm font-medium text-gray-700 font-serif"
            >
              Last Name
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="px-3 py-2 text-base uppercase font-serif"
              placeholder="ENTER LAST NAME"
              required
            />
            {fieldErrors.lastName && (
              <div className="flex items-start mt-1.5">
                <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                <p className="text-xs text-red-600">{fieldErrors.lastName}</p>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="gender"
              className="text-sm font-medium text-gray-700 font-serif"
            >
              Gender
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleInputChange("gender", value)}
            >
              <SelectTrigger className="px-3 py-2 text-base font-serif">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.gender && (
              <div className="flex items-start mt-1.5">
                <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                <p className="text-xs text-red-600">{fieldErrors.gender}</p>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="civilStatus"
              className="text-sm font-medium text-gray-700 font-serif"
            >
              Civil Status
            </Label>
            <Select
              value={formData.civilStatus}
              onValueChange={(value) => handleInputChange("civilStatus", value)}
            >
              <SelectTrigger className="px-3 py-2 text-base font-serif">
                <SelectValue placeholder="Select Civil Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Married">Married</SelectItem>
                <SelectItem value="Widowed">Widowed</SelectItem>
                <SelectItem value="Separated">Separated</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.civilStatus && (
              <div className="flex items-start mt-1.5">
                <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                <p className="text-xs text-red-600">
                  {fieldErrors.civilStatus}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 font-serif">
              Date of Birth
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full px-3 py-2 border border-gray-300 rounded-lg font-serif text-base justify-start text-left font-normal h-auto",
                    !dateOfBirth && "text-muted-foreground uppercase",
                    "bg-white hover:bg-gray-50",
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {dateOfBirth ? (
                    <span className="uppercase tracking-wide text-sm">
                      {formatDateNatural(dateOfBirth)}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      SELECT DATE OF BIRTH
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={setDateOfBirth}
                  defaultMonth={dateOfBirth}
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                  captionLayout="dropdown"
                  className="font-serif"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 font-serif">
              Place of Birth (Optional)
            </Label>
            <div className="space-y-2">
              {" "}
              {/* Reduced spacing */}
              <AddressSelects
                type="birth"
                formData={formData}
                handleInputChange={handleInputChange}
                regionList={regionList}
                provinceList={birthProvinceList}
                cityList={birthCityList}
                barangayList={birthBarangayList}
                fieldErrors={fieldErrors}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
