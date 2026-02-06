// components/FeedbackForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createFeedback } from "@/app/actions/feedback.actions";
import { VALUE_OPTIONS, SKILL_OPTIONS } from "@/types/feedback";

// Create validation schema
const feedbackSchema = z.object({
  jobSearchPreparation: z.string().min(1, "Please select a rating"),
  careerPreparation: z.string().min(1, "Please select a rating"),
  otherJobsPreparation: z.string().min(1, "Please select a rating"),
  developedValues: z
    .array(z.string())
    .min(1, "Please select at least one value"),
  developedSkills: z
    .array(z.string())
    .min(1, "Please select at least one skill"),
  likeMost: z.string().min(10, "Please provide at least 10 characters"),
  needImprovement: z.string().min(10, "Please provide at least 10 characters"),
  suggestions: z.string().optional(),
  wouldEnroll: z.string().min(1, "Please select an option"),
  whyReason: z.string().min(10, "Please provide at least 10 characters"),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

type FeedbackFormProps = {
  alumniId?: string;
  initialEmail?: string;
  onSuccess?: () => void;
};

export default function FeedbackForm({
  alumniId,
  initialEmail,
  onSuccess,
}: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      email: initialEmail || "",
      developedValues: [],
      developedSkills: [],
      wouldEnroll: "",
    },
  });

  const developedValues = watch("developedValues") || [];
  const developedSkills = watch("developedSkills") || [];

  const toggleValue = (value: string) => {
    const currentValues = developedValues;
    if (currentValues.includes(value)) {
      setValue(
        "developedValues",
        currentValues.filter((v) => v !== value),
      );
    } else {
      setValue("developedValues", [...currentValues, value]);
    }
  };

  const toggleSkill = (skill: string) => {
    const currentSkills = developedSkills;
    if (currentSkills.includes(skill)) {
      setValue(
        "developedSkills",
        currentSkills.filter((s) => s !== skill),
      );
    } else {
      setValue("developedSkills", [...currentSkills, skill]);
    }
  };

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const feedbackData = {
        alumniId,
        email: data.email || undefined,
        jobSearchPreparation: parseInt(data.jobSearchPreparation),
        careerPreparation: parseInt(data.careerPreparation),
        otherJobsPreparation: parseInt(data.otherJobsPreparation),
        developedValues: data.developedValues,
        developedSkills: data.developedSkills,
        likeMost: data.likeMost,
        needImprovement: data.needImprovement,
        suggestions: data.suggestions,
        wouldEnroll: data.wouldEnroll as "Yes" | "No",
        whyReason: data.whyReason,
      };

      await createFeedback(feedbackData);
      setSuccess(true);
      onSuccess?.();

      // Reset form after successful submission
      setTimeout(() => {
        setSuccess(false);
        // Reset form values
        setValue("jobSearchPreparation", "");
        setValue("careerPreparation", "");
        setValue("otherJobsPreparation", "");
        setValue("developedValues", []);
        setValue("developedSkills", []);
        setValue("likeMost", "");
        setValue("needImprovement", "");
        setValue("suggestions", "");
        setValue("wouldEnroll", "");
        setValue("whyReason", "");
        setValue("email", "");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 font-semibold text-lg mb-2">
          ✓ Thank You for Your Feedback!
        </div>
        <p className="text-green-700">
          Your feedback has been submitted successfully. We appreciate your time
          and valuable input.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Respondent Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Respondent Information</h3>
        <div className="space-y-4">
          {!alumniId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (Optional)
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Likert Scale Questions */}
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-6">
            Please rate your level of agreement with the following statements:
          </h3>

          <div className="space-y-8">
            {/* Question 1 */}
            <div>
              <p className="font-medium text-gray-900 mb-4">
                1. CHMSU has prepared me for job searching (including resume
                writing, handling job interviews, and other job search skills).
              </p>
              <div className="space-y-2">
                {[
                  { value: "1", label: "Strongly Disagree" },
                  { value: "2", label: "Disagree" },
                  { value: "3", label: "Neither agree nor disagree" },
                  { value: "4", label: "Agree" },
                  { value: "5", label: "Strongly Agree" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register("jobSearchPreparation")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.jobSearchPreparation && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.jobSearchPreparation.message}
                </p>
              )}
            </div>

            {/* Question 2 */}
            <div>
              <p className="font-medium text-gray-900 mb-4">
                2. My education in CHMSU has prepared me for my career (work
                related to degree earned).
              </p>
              <div className="space-y-2">
                {[
                  { value: "1", label: "Strongly Disagree" },
                  { value: "2", label: "Disagree" },
                  { value: "3", label: "Neither agree nor disagree" },
                  { value: "4", label: "Agree" },
                  { value: "5", label: "Strongly Agree" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register("careerPreparation")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.careerPreparation && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.careerPreparation.message}
                </p>
              )}
            </div>

            {/* Question 3 */}
            <div>
              <p className="font-medium text-gray-900 mb-4">
                3. My education in CHMSU has prepared me for other jobs (work
                not related to degree earned).
              </p>
              <div className="space-y-2">
                {[
                  { value: "1", label: "Strongly Disagree" },
                  { value: "2", label: "Disagree" },
                  { value: "3", label: "Neither agree nor disagree" },
                  { value: "4", label: "Agree" },
                  { value: "5", label: "Strongly Agree" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register("otherJobsPreparation")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.otherJobsPreparation && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.otherJobsPreparation.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Multiple Selection Questions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-6">
            Please select all that apply:
          </h3>

          <div className="space-y-8">
            {/* Values */}
            <div>
              <p className="font-medium text-gray-900 mb-4">
                4. What VALUES did CHMSU help you develop in your life?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {VALUE_OPTIONS.map((value) => (
                  <label
                    key={value}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      developedValues.includes(value)
                        ? "bg-blue-50 border-blue-300"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={developedValues.includes(value)}
                      onChange={() => toggleValue(value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{value}</span>
                  </label>
                ))}
              </div>
              {errors.developedValues && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.developedValues.message}
                </p>
              )}
            </div>

            {/* Skills */}
            <div>
              <p className="font-medium text-gray-900 mb-4">
                5. What SKILLS did CHMSU help you develop that you found useful
                in your life/work?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SKILL_OPTIONS.map((skill) => (
                  <label
                    key={skill}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      developedSkills.includes(skill)
                        ? "bg-blue-50 border-blue-300"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={developedSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{skill}</span>
                  </label>
                ))}
              </div>
              {errors.developedSkills && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.developedSkills.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Open-ended Questions */}
        <div className="space-y-6">
          {/* Like Most */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <label className="block">
              <span className="text-lg font-semibold text-gray-900 mb-2 block">
                6. What did you LIKE MOST about your Alma Mater?
              </span>
              <textarea
                {...register("likeMost")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please share what you liked most about CHMSU..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Minimum 10 characters required
              </p>
              {errors.likeMost && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.likeMost.message}
                </p>
              )}
            </label>
          </div>

          {/* Needs Improvement */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <label className="block">
              <span className="text-lg font-semibold text-gray-900 mb-2 block">
                7. What did you NOT LIKE MOST about your Alma Mater that needs
                to be IMPROVED?
              </span>
              <textarea
                {...register("needImprovement")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please share areas where CHMSU can improve..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Minimum 10 characters required
              </p>
              {errors.needImprovement && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.needImprovement.message}
                </p>
              )}
            </label>
          </div>

          {/* Suggestions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <label className="block">
              <span className="text-lg font-semibold text-gray-900 mb-2 block">
                8. Any SUGGESTION(S) for CHMSU to be better?
              </span>
              <textarea
                {...register("suggestions")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your suggestions for improvement..."
                required={false}
              />
              <p className="mt-1 text-sm text-gray-500">Optional</p>
              {errors.suggestions && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.suggestions.message}
                </p>
              )}
            </label>
          </div>
        </div>

        {/* Final Questions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-6">Final Questions</h3>

          <div className="space-y-6">
            {/* Would Enroll */}
            <div>
              <p className="font-medium text-gray-900 mb-4">
                9. Would you enroll your child or sibling in CHMSU?
              </p>
              <div className="space-y-2">
                {["Yes", "No"].map((option) => (
                  <label
                    key={option}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={option}
                      {...register("wouldEnroll")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {errors.wouldEnroll && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.wouldEnroll.message}
                </p>
              )}
            </div>

            {/* Why Reason */}
            <div>
              <label className="block">
                <span className="font-medium text-gray-900 mb-2 block">
                  10. Why?
                </span>
                <textarea
                  {...register("whyReason")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please explain your reason..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Minimum 10 characters required
                </p>
                {errors.whyReason && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.whyReason.message}
                  </p>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-md font-medium ${
              isSubmitting
                ? "bg-gree-600 cursor-not-allowed"
                : "bg-green-800 hover:bg-green-700"
            } text-white transition-colors`}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Your feedback is valuable and will help CHMSU improve its programs and
          services. Thank you for taking the time to complete this survey.
        </p>
      </div>
    </form>
  );
}
