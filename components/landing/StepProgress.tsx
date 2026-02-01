"use client";

import { motion } from "framer-motion";

interface Step {
  id: string;
  label: string;
  description: string;
}

interface StepProgressProps {
  currentStep: string;
  steps: Step[];
  stepErrors: Record<string, string>;
}

export default function StepProgress({
  currentStep,
  steps,
  stepErrors,
}: StepProgressProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="mt-6">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-green-800"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="flex justify-between mt-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`text-sm font-medium flex flex-col items-center ${
              currentStep === step.id
                ? "text-green-800 font-bold"
                : stepErrors[step.id]
                  ? "text-red-600"
                  : "text-gray-500"
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full mb-2 ${
                currentStep === step.id
                  ? "bg-green-800"
                  : stepErrors[step.id]
                    ? "bg-red-600"
                    : "bg-gray-300"
              }`}
            ></div>
            <span className="text-center text-xs md:text-sm">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
