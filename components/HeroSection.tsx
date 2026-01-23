"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Bell,
  FileText,
  Users,
  ArrowRight,
  GraduationCap,
  Building,
  Trophy,
  BookOpen,
  Sparkles,
  Heart,
  MessageCircle,
  Globe,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface HeroSectionProps {
  onOpenSurvey?: () => void;
}

const HeroSection = ({ onOpenSurvey }: HeroSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Testimonials from alumni
  const testimonials = [
    {
      text: "The alumni network helped me land my dream job at a tech startup!",
      author: "Sarah Johnson",
      role: "Class of 2018, BS Computer Science",
    },
    {
      text: "Reconnecting with my batchmates through CHMSU events has been wonderful.",
      author: "Michael Chen",
      role: "Class of 2015, Business Administration",
    },
    {
      text: "The mentorship program changed my career trajectory completely.",
      author: "Maria Santos",
      role: "Class of 2020, Nursing",
    },
  ];

  const handleOpenSurvey = () => {
    if (onOpenSurvey) {
      onOpenSurvey();
    } else {
      // Fallback to document click if onOpenSurvey is not provided
      const surveyBtn = document.querySelector("[data-survey-trigger]");
      if (surveyBtn) {
        (surveyBtn as HTMLButtonElement).click();
      }
    }
  };

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-16 md:py-20"
    >
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 animate-pulse">
        <Sparkles className="h-24 w-24 text-slate-200/40" />
      </div>
      <div className="absolute bottom-20 left-10">
        <Heart className="h-16 w-16 text-slate-200/30" />
      </div>
      <div className="absolute top-1/3 left-5 animate-bounce-slow">
        <Globe className="h-12 w-12 text-slate-200/20" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div
            className={cn(
              "space-y-8 transition-all duration-700",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            )}
          >
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-slate-200 shadow-sm mb-6 animate-fade-in">
                <div className="p-2 bg-slate-100 rounded-full">
                  <GraduationCap className="h-5 w-5 text-slate-700" />
                </div>
                <span className="font-semibold text-slate-800">
                  Welcome Home, CHMSU Alumni!
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
                <span className="text-slate-900">Your Journey </span>
                <span className="text-slate-700">Continues </span>
                <span className="text-slate-900">Here</span>
              </h1>

              <div className="max-w-2xl mx-auto">
                <p className="text-xl text-slate-600 leading-relaxed mb-4">
                  Reconnect, grow, and thrive with your CHMSU family. Together,
                  we're building a stronger community.
                </p>
                <div className="flex items-center justify-center gap-4 text-slate-500">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>10,000+ Alumni</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>4 Campuses</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span>50+ Years of Excellence</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              <Card className="border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-blue-50 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-8 w-8 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      Update Your Story
                    </h3>
                    <p className="text-slate-600 mb-6">
                      Help us track your success and connect you with relevant
                      opportunities.
                    </p>
                    <Button
                      className="gap-2 bg-slate-800 hover:bg-slate-900 text-white group-hover:scale-105 transition-transform"
                      onClick={handleOpenSurvey}
                      data-survey-trigger
                    >
                      <FileText className="h-4 w-4" />
                      Fill Survey Form
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-green-50 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-8 w-8 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      Join Events
                    </h3>
                    <p className="text-slate-600 mb-6">
                      Reconnect with classmates and build new connections at our
                      upcoming gatherings.
                    </p>
                    <Link href="/events" className="w-full">
                      <Button className="gap-2 w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 group-hover:scale-105 transition-transform">
                        <Calendar className="h-4 w-4" />
                        View Events Calendar
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-purple-50 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Bell className="h-8 w-8 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      Stay Updated
                    </h3>
                    <p className="text-slate-600 mb-6">
                      Never miss important announcements, news, and
                      opportunities from CHMSU.
                    </p>
                    <Link href="/announcements" className="w-full">
                      <Button className="gap-2 w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 group-hover:scale-105 transition-transform">
                        <Bell className="h-4 w-4" />
                        Read Announcements
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alumni Testimonials */}
            <div className="mt-16">
              <div className="text-center mb-10">
                <Badge className="gap-2 bg-slate-100 text-slate-800 border-slate-200 px-4 py-2 mb-4">
                  <MessageCircle className="h-4 w-4" />
                  Voices from Our Community
                </Badge>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  What Alumni Are Saying
                </h3>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Hear from fellow CHMSU graduates about their experiences and
                  connections
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {testimonials.map((testimonial, index) => (
                  <Card
                    key={index}
                    className={cn(
                      "border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-md",
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-10",
                      `delay-${index * 150}`
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <Heart className="h-6 w-6 text-slate-300 mb-2" />
                        <p className="text-slate-700 italic">
                          "{testimonial.text}"
                        </p>
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <div className="font-semibold text-slate-900">
                          {testimonial.author}
                        </div>
                        <div className="text-sm text-slate-500">
                          {testimonial.role}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="mt-16 pt-12 border-t border-slate-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Quick Navigation
                </h3>
                <p className="text-slate-600">
                  Everything you need, right at your fingertips
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  {
                    icon: Users,
                    label: "Alumni Directory",
                    href: "/alumni",
                    color: "bg-blue-50",
                  },
                  {
                    icon: BookOpen,
                    label: "Programs",
                    href: "/courses",
                    color: "bg-green-50",
                  },
                  {
                    icon: Trophy,
                    label: "Achievements",
                    href: "/achievements",
                    color: "bg-amber-50",
                  },
                  {
                    icon: Building,
                    label: "Campuses",
                    href: "/campuses",
                    color: "bg-purple-50",
                  },
                ].map((item, index) => (
                  <Link key={index} href={item.href}>
                    <Card className="border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-center cursor-pointer group h-full">
                      <CardContent className="p-6">
                        <div
                          className={`p-3 ${item.color} rounded-lg inline-flex mb-4 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <item.icon className="h-6 w-6 text-slate-700" />
                        </div>
                        <h4 className="font-semibold text-slate-900">
                          {item.label}
                        </h4>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-16 text-center">
              <Card className="border border-slate-200 bg-gradient-to-r from-slate-50 to-white max-w-2xl mx-auto">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center">
                    <GraduationCap className="h-12 w-12 text-slate-700 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      Ready to Reconnect?
                    </h3>
                    <p className="text-slate-600 mb-6 max-w-md">
                      Join thousands of CHMSU alumni who are already building
                      their network and creating opportunities.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        size="lg"
                        className="gap-3 bg-slate-800 hover:bg-slate-900 text-white"
                        onClick={handleOpenSurvey}
                        data-survey-trigger
                      >
                        <FileText className="h-5 w-5" />
                        Update My Information
                      </Button>
                      <Link href="/announcements">
                        <Button
                          size="lg"
                          variant="outline"
                          className="gap-3 border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          <Bell className="h-5 w-5" />
                          See Latest News
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animation styles */}
      <style jsx global>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
