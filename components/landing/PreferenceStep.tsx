"use client";

import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface PreferencesStepProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  fieldErrors: Record<string, string>;
  stepErrors: Record<string, string>;
}

export default function PreferencesStep({
  formData,
  handleInputChange,
  fieldErrors,
  stepErrors,
}: PreferencesStepProps) {
  const hasStepError = !!stepErrors.preferences;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold font-['Times_New_Roman'] text-green-800">
          Preferences
        </h3>
        <p className="text-lg text-gray-600 mt-2">
          Communication and involvement preferences
        </p>
      </div>

      {hasStepError && (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700 text-sm">{stepErrors.preferences}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between p-6 border-2 border-gray-300 rounded-lg">
          <div>
            <Label className="text-base font-medium text-gray-700 font-serif block mb-2">
              Are you willing to mentor current CHMSU students?
            </Label>
            <p className="text-sm text-gray-500">
              Share your expertise and experience
            </p>
          </div>
          <Switch
            checked={formData.willingToMentor}
            onCheckedChange={(checked) =>
              handleInputChange("willingToMentor", checked)
            }
            className="data-[state=checked]:bg-green-700 scale-125"
          />
        </div>

        <div className="flex items-center justify-between p-6 border-2 border-gray-300 rounded-lg">
          <div>
            <Label className="text-base font-medium text-gray-700 font-serif block mb-2">
              Receive updates and announcements from CHMSU
            </Label>
            <p className="text-sm text-gray-500">
              Stay connected with your alma mater
            </p>
          </div>
          <Switch
            checked={formData.receiveUpdates}
            onCheckedChange={(checked) =>
              handleInputChange("receiveUpdates", checked)
            }
            className="data-[state=checked]:bg-green-700 scale-125"
          />
        </div>

        <div>
          <Label
            htmlFor="suggestions"
            className="text-base font-medium text-gray-700 font-serif block mb-3"
          >
            Suggestions for CHMSU (Optional)
          </Label>
          <Textarea
            id="suggestions"
            value={formData.suggestions}
            onChange={(e) => handleInputChange("suggestions", e.target.value)}
            placeholder="Your suggestions for improvement..."
            className="min-h-[120px] resize-none border-2 border-gray-300 focus-visible:ring-green-600 focus-visible:ring-offset-0 text-lg"
          />
        </div>
      </div>
    </div>
  );
}
