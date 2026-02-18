// app/test-feedback/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FeedbackForm from "@/components/forms/FeedbackForm";
import { Toaster } from "sonner";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Home } from "lucide-react";

export default function FeedbackTestPage() {
  const router = useRouter();
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const handleFormSuccess = () => {
    setSubmissionSuccess(true);
    setCountdown(3);
  };

  const handleGoToHome = () => {
    router.push("/");
  };

  // Countdown timer effect
  useEffect(() => {
    if (submissionSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (submissionSuccess && countdown === 0) {
      router.push("/");
    }
  }, [submissionSuccess, countdown, router]);

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" expand={false} richColors closeButton />

      <div className="max-w-5xl mx-auto">
        {/* Header - Left Aligned */}
        <div className="pl-20 mb-5">
          <h1 className="text-5xl text-green-800 font-black tracking-tight text-gray-900 mb-3 font-graphik">
            Alumni Feedback & Survey
          </h1>
          <div className="w-20 h-1 bg-gray-800 mb-4"></div>
          <p className="text-gray-700 text-lg max-w-3xl leading-relaxed font-medium font-graphik">
            Share your valuable insights and experiences to help us improve the
            CHMSU Alumni Registry System and better serve our graduates across
            all campuses. Your feedback is essential in shaping the future of
            our alumni community.
          </p>
        </div>

        {/* Success Dialog - Using Card without shadow and rounded border */}
        {submissionSuccess && (
          <Card className="border border-gray-300 bg-white rounded-none">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 mb-6">
                  <CheckCircle className="w-12 h-12 text-gray-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Thank You for Your Feedback!
                </h2>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
                  Your valuable feedback has been successfully submitted. We
                  truly appreciate you taking the time to share your thoughts
                  and experiences. Your input helps us continuously improve our
                  services for all CHMSU alumni.
                </p>
                <div className="bg-gray-50 p-4 mb-8 max-w-xl mx-auto border border-gray-200">
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-5 w-5 bg-gray-300 animate-pulse rounded-full" />
                    <p className="text-gray-700 font-medium">
                      Returning to homepage in {countdown} second
                      {countdown !== 1 ? "s" : ""}...
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={handleGoToHome}
                    className="bg-green-800 hover:bg-green-900 text-white px-8 py-3 text-base"
                  >
                    <Home className="mr-2 h-5 w-5" />
                    Return to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Form Card - Without shadow and rounded border */}
        {!submissionSuccess && (
          <div className="max-w-4xl mx-auto">
            <Card className="border border-gray-300 bg-white rounded-none">
              <CardContent className="pt-6">
                <>
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Important Information About This Form
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          This feedback form allows you to share your experience
                          with the CHMSU Alumni Registry System. Please be
                          honest and specific in your responses. All feedback is
                          confidential and will be used solely for improvement
                          purposes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-1">
                    <FeedbackForm onSuccess={handleFormSuccess} />
                  </div>
                </>
              </CardContent>
            </Card>

            {/* Additional Information - Using Card without shadow and rounded border */}
            <Card className="mt-8 border border-gray-300 bg-white rounded-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Why Your Feedback Matters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <ul className="text-gray-700 space-y-2 list-disc pl-5">
                      <li>Helps us identify areas for improvement</li>
                      <li>Guides future development of alumni features</li>
                      <li>Ensures the system meets alumni needs</li>
                      <li>Contributes to better user experience</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <ul className="text-gray-700 space-y-2 list-disc pl-5">
                      <li>Provides insights for resource allocation</li>
                      <li>Helps prioritize feature requests</li>
                      <li>Improves communication with alumni</li>
                      <li>Enhances overall satisfaction</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
