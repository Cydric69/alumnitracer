// components/landing/SuccessDialog.tsx
"use client";

import { CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SuccessDialogProps {
  onReturnHome?: () => void;
  onGoToFeedback?: () => void;
  autoRedirectTime?: number; // Time in seconds before auto-redirect
}

export default function SuccessDialog({
  onReturnHome,
  onGoToFeedback,
  autoRedirectTime = 3,
}: SuccessDialogProps) {
  const router = useRouter();

  const handleReturnHome = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      router.push("/");
    }
  };

  const handleGoToFeedback = () => {
    if (onGoToFeedback) {
      onGoToFeedback();
    } else {
      router.push("/test-feedback");
    }
  };

  return (
    <div className="bg-white border-2 border-green-300 rounded-xl shadow-lg p-8 my-8 text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
        <CheckCircle className="w-16 h-16 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-green-800 mb-4 font-['Times_New_Roman']">
        Registration Successful!
      </h2>
      <p className="text-green-700 text-lg mb-6 max-w-2xl mx-auto">
        Thank you for registering with the CHMSU Alumni Registry. Your
        information has been saved successfully.
      </p>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-8 max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
          <p className="text-green-700 font-medium">
            Redirecting to feedback survey in {autoRedirectTime} seconds...
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={handleReturnHome}
          className="border-green-600 text-green-700 hover:bg-green-50 px-6 py-3 text-base"
        >
          Return to Home
        </Button>
        <Button
          onClick={handleGoToFeedback}
          className="bg-green-700 hover:bg-green-800 px-8 py-3 text-base"
        >
          Go to Feedback Survey
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
