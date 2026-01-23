"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Target, Eye, Heart, Award, Users, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const MissionVision = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("mission-vision");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const missionPoints = [
    {
      icon: BookOpen,
      text: "Provide quality, affordable, and relevant education",
    },
    {
      icon: Users,
      text: "Develop globally competitive and value-laden professionals",
    },
    {
      icon: Heart,
      text: "Promote research, extension, and sustainable development",
    },
  ];

  const visionPoints = [
    {
      icon: Target,
      text: "A leading GREEN institution in higher and advanced education",
    },
    {
      icon: Award,
      text: "Excellence in instruction, research, and community engagement",
    },
    {
      icon: Users,
      text: "Model of sustainability and transformative education",
    },
  ];

  return (
    <section
      id="mission-vision"
      className="py-20 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container mx-auto px-4">
        <div
          className={cn(
            "text-center mb-16 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            CHMSU: Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              Mission & Vision
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Carlos Hilado Memorial State University is committed to excellence
            in education and holistic development of individuals and
            communities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mission Card */}
          <Card
            className={cn(
              "border-2 border-blue-100 hover:border-blue-300 transition-all duration-500 hover:shadow-xl",
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            )}
          >
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                  <CardDescription>
                    CHMSU is committed to transform individuals and communities
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {missionPoints.map((point, index) => (
                  <li
                    key={index}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-all duration-300",
                      `delay-${index * 100}`
                    )}
                  >
                    <point.icon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{point.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Vision Card */}
          <Card
            className={cn(
              "border-2 border-green-100 hover:border-green-300 transition-all duration-500 hover:shadow-xl",
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            )}
          >
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-600 text-white">
                  <Eye className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                  <CardDescription>
                    A leading institution for transformative education
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {visionPoints.map((point, index) => (
                  <li
                    key={index}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg hover:bg-green-50 transition-all duration-300",
                      `delay-${index * 100}`
                    )}
                  >
                    <point.icon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{point.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div
          className={cn(
            "mt-16 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h3 className="text-2xl font-bold text-center mb-8">Core Values</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Excellence", color: "from-purple-500 to-pink-500" },
              { label: "Integrity", color: "from-green-500 to-teal-500" },
              { label: "Service", color: "from-orange-500 to-red-500" },
              { label: "Innovation", color: "from-blue-500 to-cyan-500" },
            ].map((value, index) => (
              <div
                key={value.label}
                className={cn(
                  "p-6 rounded-xl text-center text-white font-bold text-lg bg-gradient-to-br",
                  value.color,
                  "transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer",
                  `delay-${index * 150}`
                )}
              >
                {value.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
