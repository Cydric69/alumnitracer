// components/landing/ReviewStep.tsx
"use client";
import { JSX } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewStepProps {
  formData: any;
  dateOfBirth: Date | undefined;
  campuses: any[];
  departments: any[];
  courses: any[];
  formatDateNatural: (date: Date) => string;
  submitting: boolean; // Add this prop
  error: string | JSX.Element | null; // Add this prop
  success: boolean; // Add this prop
  onSubmit?: () => void; // Optional submit handler
}

export default function ReviewStep({
  formData,
  dateOfBirth,
  campuses,
  departments,
  courses,
  formatDateNatural,
  submitting,
  error,
  success,
  onSubmit,
}: ReviewStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
          Review Your Information
        </h3>
        <p className="text-lg text-gray-600 mt-2">
          Please review all information before submitting
        </p>
      </div>

      {/* Show error or success messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="font-medium text-red-700">Error</p>
              <p className="text-red-600 text-sm mt-1">
                {typeof error === "string" ? error : "Please fix the errors"}
              </p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="font-medium text-green-700">Success!</p>
              <p className="text-green-600 text-sm mt-1">
                Submitted successfully! Redirecting...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
          <h4 className="text-xl font-bold text-green-800 mb-4 font-serif">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">First Name</p>
              <p className="font-medium text-lg uppercase">
                {formData.firstName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Name</p>
              <p className="font-medium text-lg uppercase">
                {formData.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium text-lg">{formData.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Civil Status</p>
              <p className="font-medium text-lg">{formData.civilStatus}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium text-lg">
                {dateOfBirth ? formatDateNatural(dateOfBirth) : "Not specified"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
          <h4 className="text-xl font-bold text-green-800 mb-4 font-serif">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-lg">{formData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium text-lg">{formData.phoneNumber}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium text-lg uppercase">
                {formData.currentStreet || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
          <h4 className="text-xl font-bold text-green-800 mb-4 font-serif">
            Academic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Year Graduated</p>
              <p className="font-medium text-lg">{formData.yearGraduated}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Campus</p>
              <p className="font-medium text-lg">
                {campuses.find((c) => c.id === formData.campus)?.campusName ||
                  "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Campus ID</p>
              <p className="font-medium text-lg">
                {campuses.find((c) => c.id === formData.campus)?.campusId ||
                  "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium text-lg">
                {departments.find((d) => d.id === formData.department)?.name ||
                  "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Department ID</p>
              <p className="font-medium text-lg">
                {departments.find((d) => d.id === formData.department)
                  ?.departmentId || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Course</p>
              <p className="font-medium text-lg">
                {courses.find((c) => c.id === formData.course)?.courseName ||
                  "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Course ID</p>
              <p className="font-medium text-lg">
                {courses.find((c) => c.id === formData.course)?.courseId ||
                  "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Degree Earned</p>
              <p className="font-medium text-lg uppercase">{formData.degree}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
          <h4 className="text-xl font-bold text-green-800 mb-4 font-serif">
            Employment Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Employment Status</p>
              <p className="font-medium text-lg">{formData.employmentStatus}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Employment Sector</p>
              <p className="font-medium text-lg">{formData.employmentSector}</p>
            </div>
            {(formData.employmentStatus === "Employed" ||
              formData.employmentStatus === "Self-Employed") && (
              <>
                <div>
                  <p className="text-sm text-gray-500">Current Position</p>
                  <p className="font-medium text-lg uppercase">
                    {formData.currentPosition}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employer</p>
                  <p className="font-medium text-lg uppercase">
                    {formData.employer}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
          <h4 className="text-xl font-bold text-green-800 mb-4 font-serif">
            Preferences
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Willing to Mentor</p>
              <p className="font-medium text-lg">
                {formData.willingToMentor ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Receive Updates</p>
              <p className="font-medium text-lg">
                {formData.receiveUpdates ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-yellow-700 text-sm font-serif">
              By submitting this form, you confirm that all information provided
              is accurate to the best of your knowledge.
            </p>
          </div>
        </div>

        {/* Alternative - Use form submit button */}
        <div className="pt-6 border-t border-gray-300">
          <div className="flex justify-end space-x-4">
            <Button
              type="submit" // This will trigger the form submission
              disabled={submitting || success}
              className="px-8 py-3 text-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Information"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
