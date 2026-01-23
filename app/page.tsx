"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import SurveyModal from "@/components/SurveyModal";

export default function Home() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          // Already logged in, redirect to dashboard
          router.replace("/dashboard");
          return;
        }
      } catch (error) {
        // Not authenticated, stay on landing page
        console.log("User not authenticated");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleOpenSurvey = () => {
    setIsSurveyModalOpen(true);
  };

  const handleCloseSurvey = () => {
    setIsSurveyModalOpen(false);
  };

  const handleSurveySuccess = () => {
    console.log("Survey submitted successfully!");
    // You can add a toast notification here
    // toast.success('Survey submitted successfully!');

    // Optional: Redirect to dashboard after successful submission
    // router.push('/dashboard');
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main>
        <HeroSection onOpenSurvey={handleOpenSurvey} />
      </main>
      <Footer />

      {/* Survey Modal */}
      <SurveyModal
        isOpen={isSurveyModalOpen}
        onClose={handleCloseSurvey}
        onSuccess={handleSurveySuccess}
      />

      {/* Hidden fallback trigger (optional) */}
      <button
        data-survey-trigger
        onClick={handleOpenSurvey}
        className="hidden"
        aria-hidden="true"
      >
        Open Survey
      </button>
    </>
  );
}
