// components/landing/AcademicStep.tsx (updated)
"use client";
import React from "react";
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
import { Campus, Department, Course } from "@/types/academic";

interface AcademicStepProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  fieldErrors: Record<string, string>;
  stepErrors: Record<string, string>;
  campuses: Campus[];
  departments: Department[];
  courses: Course[];
  loading: boolean;
}

export default function AcademicStep({
  formData,
  handleInputChange,
  fieldErrors,
  stepErrors,
  campuses,
  departments,
  courses,
  loading,
}: AcademicStepProps) {
  const hasStepError = !!stepErrors.academic;

  const selectedCampus = campuses.find((c) => c.id === formData.campus);
  const selectedDepartment = departments.find(
    (d) => d.id === formData.department,
  );
  const selectedCourse = courses.find((c) => c.id === formData.course);

  // When course is selected, auto-fill the degree
  React.useEffect(() => {
    if (selectedCourse && selectedCourse.degree && !formData.degree) {
      handleInputChange("degree", selectedCourse.degree);
    }
  }, [selectedCourse, formData.degree, handleInputChange]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold font-['Times_New_Roman'] text-green-800">
          Academic Information
        </h3>
        <p className="text-gray-600 mt-1">Your CHMSU journey</p>
      </div>

      {hasStepError && (
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
            <p className="text-red-700 text-sm">{stepErrors.academic}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="studentId"
              className="text-sm font-medium text-gray-700 font-serif"
            >
              Student ID (Optional)
            </Label>
            <Input
              id="studentId"
              value={formData.studentId}
              onChange={(e) => handleInputChange("studentId", e.target.value)}
              className="px-3 py-2 text-base font-serif"
              placeholder="2019-12345"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="yearGraduated"
              className="text-sm font-medium text-gray-700 font-serif"
            >
              Year Graduated
            </Label>
            <Input
              id="yearGraduated"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.yearGraduated}
              onChange={(e) =>
                handleInputChange("yearGraduated", e.target.value)
              }
              className="px-3 py-2 text-base font-serif"
              placeholder="2023"
              required
            />
            {fieldErrors.yearGraduated && (
              <div className="flex items-start mt-1.5">
                <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                <p className="text-xs text-red-600">
                  {fieldErrors.yearGraduated}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="campus"
            className="text-sm font-medium text-gray-700 font-serif"
          >
            Campus
          </Label>
          <Select
            value={formData.campus}
            onValueChange={(value) => {
              handleInputChange("campus", value);
              // Reset dependent fields
              handleInputChange("department", "");
              handleInputChange("course", "");
              handleInputChange("degree", "");
            }}
            disabled={loading}
          >
            <SelectTrigger className="px-3 py-2 text-base font-serif">
              <SelectValue placeholder="Select Campus" />
            </SelectTrigger>
            <SelectContent>
              {campuses.map((campus) => (
                <SelectItem key={campus.id} value={campus.id}>
                  {campus.campusName} ({campus.campusId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.campus && (
            <div className="flex items-start mt-1.5">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-xs text-red-600">{fieldErrors.campus}</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="department"
            className="text-sm font-medium text-gray-700 font-serif"
          >
            Department
          </Label>
          <Select
            value={formData.department}
            onValueChange={(value) => {
              handleInputChange("department", value);
              // Reset dependent fields
              handleInputChange("course", "");
              handleInputChange("degree", "");
            }}
            disabled={!formData.campus || departments.length === 0}
          >
            <SelectTrigger className="px-3 py-2 text-base font-serif">
              <SelectValue
                placeholder={
                  !formData.campus
                    ? "Please select a campus first"
                    : departments.length === 0
                      ? "No departments found"
                      : "Select Department"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name} ({dept.departmentId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.department && (
            <div className="flex items-start mt-1.5">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-xs text-red-600">{fieldErrors.department}</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="course"
            className="text-sm font-medium text-gray-700 font-serif"
          >
            Course
          </Label>
          <Select
            value={formData.course}
            onValueChange={(value) => handleInputChange("course", value)}
            disabled={!formData.department || courses.length === 0}
          >
            <SelectTrigger className="px-3 py-2 text-base font-serif">
              <SelectValue
                placeholder={
                  !formData.department
                    ? "Please select a department first"
                    : courses.length === 0
                      ? "No courses found"
                      : "Select Course"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.courseName} ({course.courseId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.course && (
            <div className="flex items-start mt-1.5">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-xs text-red-600">{fieldErrors.course}</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="degree"
            className="text-sm font-medium text-gray-700 font-serif"
          >
            Degree Earned
          </Label>
          <Input
            id="degree"
            value={formData.degree}
            onChange={(e) => handleInputChange("degree", e.target.value)}
            className="px-3 py-2 text-base uppercase font-serif"
            placeholder="BACHELOR OF SCIENCE IN COMPUTER SCIENCE"
            required
            readOnly={!!selectedCourse} // Make read-only if course is selected
          />
          {fieldErrors.degree && (
            <div className="flex items-start mt-1.5">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-xs text-red-600">{fieldErrors.degree}</p>
            </div>
          )}
          {selectedCourse && (
            <p className="text-xs text-gray-500 mt-1">
              Degree auto-filled based on selected course
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
