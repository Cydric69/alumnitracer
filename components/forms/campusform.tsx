// components/forms/campusform.tsx
"use client";
// Add this import at the top of the file
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CampusFormData } from "@/types/campus";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CampusFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CampusFormData;
  onInputChange: (field: keyof CampusFormData, value: string) => void;
  onSubmit: () => Promise<void>;
  title: string;
  description: string;
  submitText: string;
}

// Helper function to capitalize first letter of each word
const capitalizeWords = (text: string): string => {
  if (!text.trim()) return text;
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper function to convert Roman numerals
const toRomanNumeral = (num: number): string => {
  const romanNumerals = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
    "XIII",
    "XIV",
    "XV",
    "XVI",
    "XVII",
    "XVIII",
  ];
  return romanNumerals[num - 1] || num.toString();
};

// Helper function to extract number from region text
const extractRegionNumber = (text: string): number | null => {
  const match = text.match(/\b([1-9]|1[0-8])\b/);
  return match ? parseInt(match[1]) : null;
};

// Helper function to format region input
const formatRegionInput = (value: string): string => {
  if (!value.trim()) return value;

  const lowerValue = value.toLowerCase();

  // Handle Roman numeral input
  if (lowerValue.startsWith("region")) {
    const rest = value.substring(6).trim();
    const num = extractRegionNumber(rest);
    if (num && num >= 1 && num <= 18) {
      return `Region ${toRomanNumeral(num)}`;
    }
    return `Region ${rest}`;
  }

  // Handle number input
  const num = extractRegionNumber(value);
  if (num && num >= 1 && num <= 18) {
    return `Region ${toRomanNumeral(num)}`;
  }

  // Return capitalized text
  return capitalizeWords(value);
};

export default function CampusForm({
  open,
  onOpenChange,
  formData,
  onInputChange,
  onSubmit,
  title,
  description,
  submitText,
}: CampusFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Individual address fields
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [region, setRegion] = useState("");
  const [zipCode, setZipCode] = useState("");

  const isInitialMount = useRef(true);
  const hasParsedInitialAddress = useRef(false);

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Campus name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Campus name must be at least 3 characters";
    }

    // Description validation (must be at least 10 characters)
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Address component validations
    if (!barangay.trim()) {
      newErrors.barangay = "Barangay is required";
    }
    if (!city.trim()) {
      newErrors.city = "City/Municipality is required";
    }
    if (!province.trim()) {
      newErrors.province = "Province is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Parse existing address when editing - ONLY ONCE when form opens
  useEffect(() => {
    if (open && formData.address && !hasParsedInitialAddress.current) {
      console.log("Parsing initial address:", formData.address);

      // Try to parse the address string
      // Format: "Street, Barangay, City, Province, Region, ZIP Code"
      const parts = formData.address.split(", ");

      if (parts.length >= 5) {
        setStreet(capitalizeWords(parts[0] || ""));
        setBarangay(capitalizeWords(parts[1] || ""));
        setCity(capitalizeWords(parts[2] || ""));
        setProvince(capitalizeWords(parts[3] || ""));
        setRegion(formatRegionInput(parts[4] || ""));
        setZipCode(parts[5] || "");
      } else if (parts.length === 4) {
        // Handle older format: "Barangay, City, Province, ZIP"
        setBarangay(capitalizeWords(parts[0] || ""));
        setCity(capitalizeWords(parts[1] || ""));
        setProvince(capitalizeWords(parts[2] || ""));
        setZipCode(parts[3] || "");
      } else if (parts.length === 3) {
        // Handle: "Barangay, City, Province"
        setBarangay(capitalizeWords(parts[0] || ""));
        setCity(capitalizeWords(parts[1] || ""));
        setProvince(capitalizeWords(parts[2] || ""));
      }

      hasParsedInitialAddress.current = true;
    }

    if (!open) {
      // Reset the flag when form closes
      hasParsedInitialAddress.current = false;
      setErrors({});
      resetAddressFields();
    }
  }, [open, formData.address]);

  // Build the full address from components
  const buildFullAddress = () => {
    const parts = [];

    if (street) parts.push(street);
    if (barangay) parts.push(barangay);
    if (city) parts.push(city);
    if (province) parts.push(province);
    if (region) parts.push(region);
    if (zipCode) parts.push(zipCode);

    return parts.join(", ");
  };

  // Update parent form when address fields change - DEBOUNCED
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      const fullAddress = buildFullAddress();
      if (fullAddress !== formData.address) {
        console.log("Updating parent address:", fullAddress);
        onInputChange("address", fullAddress);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [street, barangay, city, province, region, zipCode]);

  const resetAddressFields = () => {
    setStreet("");
    setBarangay("");
    setCity("");
    setProvince("");
    setRegion("");
    setZipCode("");
  };

  const handleSubmit = async () => {
    // Validate form before submitting
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure final address is updated before submit
      const finalAddress = buildFullAddress();
      if (finalAddress !== formData.address) {
        onInputChange("address", finalAddress);
      }

      // Small delay to ensure state updates
      await new Promise((resolve) => setTimeout(resolve, 50));

      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegionChange = (value: string) => {
    const formatted = formatRegionInput(value);
    setRegion(formatted);
  };

  const handleDescriptionChange = (value: string) => {
    // Capitalize first letter
    const formatted = value.charAt(0).toUpperCase() + value.slice(1);
    onInputChange("description", formatted);

    // Clear error when user starts typing
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: "" }));
    }
  };

  const handleNameChange = (value: string) => {
    const formatted = capitalizeWords(value);
    onInputChange("name", formatted);

    // Clear error when user starts typing
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Campus Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="required">
              Campus Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g., Alijis Campus"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="capitalize"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Each word will be automatically capitalized
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="required">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of the campus (minimum 10 characters)..."
              rows={3}
              value={formData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="first-letter:uppercase min-h-[100px]"
              aria-invalid={!!errors.description}
            />
            <div className="flex justify-between items-center">
              {errors.description ? (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  First letter will be automatically capitalized
                </p>
              )}
              <p
                className={`text-xs ${
                  formData.description.length < 10
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {formData.description.length}/10 characters
              </p>
            </div>
          </div>

          {/* Philippine Address Fields */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Philippine Address *
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Street Address */}
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  placeholder="e.g., Alijis Road, Purok Paradise"
                  value={street}
                  onChange={(e) => setStreet(capitalizeWords(e.target.value))}
                  className="capitalize"
                />
                <p className="text-xs text-gray-500">
                  Street, building, or subdivision (optional)
                </p>
              </div>

              {/* Barangay */}
              <div className="space-y-2">
                <Label htmlFor="barangay" className="required">
                  Barangay *
                </Label>
                <Input
                  id="barangay"
                  placeholder="e.g., Alijis"
                  value={barangay}
                  onChange={(e) => {
                    setBarangay(capitalizeWords(e.target.value));
                    if (errors.barangay) {
                      setErrors((prev) => ({ ...prev, barangay: "" }));
                    }
                  }}
                  className="capitalize"
                  aria-invalid={!!errors.barangay}
                />
                {errors.barangay && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.barangay}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Barangay name (required)
                </p>
              </div>

              {/* City/Municipality */}
              <div className="space-y-2">
                <Label htmlFor="city" className="required">
                  City/Municipality *
                </Label>
                <Input
                  id="city"
                  placeholder="e.g., Bacolod City"
                  value={city}
                  onChange={(e) => {
                    setCity(capitalizeWords(e.target.value));
                    if (errors.city) {
                      setErrors((prev) => ({ ...prev, city: "" }));
                    }
                  }}
                  className="capitalize"
                  aria-invalid={!!errors.city}
                />
                {errors.city && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.city}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  City or municipality name (required)
                </p>
              </div>

              {/* Province */}
              <div className="space-y-2">
                <Label htmlFor="province" className="required">
                  Province *
                </Label>
                <Input
                  id="province"
                  placeholder="e.g., Negros Occidental"
                  value={province}
                  onChange={(e) => {
                    setProvince(capitalizeWords(e.target.value));
                    if (errors.province) {
                      setErrors((prev) => ({ ...prev, province: "" }));
                    }
                  }}
                  className="capitalize"
                  aria-invalid={!!errors.province}
                />
                {errors.province && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.province}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Province name (required)
                </p>
              </div>

              {/* Region */}
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  placeholder="e.g., Region VI or just 6"
                  value={region}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="uppercase"
                />
                <p className="text-xs text-gray-500">
                  Optional - Enter region number (1-18) or name
                  <br />
                  <span className="text-green-600">
                    Examples: "6" → "Region VI", "Region 6" → "Region VI"
                  </span>
                </p>
              </div>

              {/* ZIP Code */}
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) =>
                    setZipCode(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="e.g., 6100"
                  maxLength={4}
                />
                <p className="text-xs text-gray-500">
                  Optional - 4 digit Philippine ZIP code
                </p>
              </div>
            </div>

            {/* Address Preview */}
            {buildFullAddress() && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium">Address Preview:</p>
                </div>
                <p className="text-sm text-gray-600">{buildFullAddress()}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              submitText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
