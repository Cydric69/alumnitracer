// app/feedback-test/page.tsx
"use client";

import { useState } from "react";
import FeedbackForm from "@/components/forms/FeedbackForm";
import { Toaster, toast } from "sonner";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText } from "lucide-react";

export default function FeedbackTestPage() {
  const [showForm, setShowForm] = useState(true);

  const handleFormSuccess = () => {
    // Form success handled by toast in FeedbackForm component
  };

  const handleToggleForm = () => {
    setShowForm(!showForm);
    toast.info(`Form ${showForm ? "hidden" : "shown"}`, {
      description: `Feedback form is now ${showForm ? "hidden" : "visible"}`,
    });
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8 font-['Graphik']">
      {" "}
      {/* Added font-['Graphik'] here */}
      <Toaster position="top-right" expand={false} richColors closeButton />
      <div className="max-w-5xl mx-auto">
        {/* Header - Minimal */}
        <div className="text-center mb-10 text-left pl-20">
          <h1 className="text-3xl font-bold tracking-tight text-green-900 mb-2">
            Feedback Form Test
          </h1>
          <p className="text-gray-700">
            Submit your feedback using the form below
          </p>
        </div>

        {/* Main Form Card - Centered and Larger */}
        <div className="max-w-4xl mx-auto bg-transparent">
          <Card className="shadow-none border-none bg-transparent">
            <CardContent className="pt-6">
              {showForm ? (
                <div className="px-1">
                  <FeedbackForm onSuccess={handleFormSuccess} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-6">
                    <svg
                      className="w-20 h-20 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Form is Currently Hidden
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Click the button below to show the feedback form
                  </p>
                  <Button
                    onClick={() => {
                      setShowForm(true);
                      toast.info("Form enabled", {
                        description: "Feedback form is now visible",
                      });
                    }}
                    className="px-8 bg-green-800 hover:bg-green-900 text-white"
                  >
                    Show Feedback Form
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
