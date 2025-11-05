"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";

export function TermsAndConditions({ updateFormData }) {
  const [acceptedTerms, setAcceptedTerms] = useState({
    general: false,
    goa: false,
  });

  const handleCheckboxChange = (name) => {
    setAcceptedTerms((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
    updateFormData({
      acceptedTerms: { ...acceptedTerms, [name]: !acceptedTerms[name] },
    });
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Icons.FileText className="w-6 h-6" />
          Terms and Conditions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
            <Checkbox
              id="terms"
              checked={acceptedTerms.general}
              onCheckedChange={() => handleCheckboxChange("general")}
              className="mt-1"
            />
            <div>
              <Label htmlFor="terms" className="text-base font-medium">
                General Terms and Conditions
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                I accept the{" "}
                <Link
                  target="_blank"
                  href="/terms-of-service"
                  className="text-brightGreen hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  target="_blank"
                  href="/cancellation-policy"
                  className="text-brightGreen hover:underline"
                >
                  Cancellation Policy
                </Link>
              </p>
            </div>
          </div>
          {/* <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
            <Checkbox
              id="goa-terms"
              checked={acceptedTerms.goa}
              onCheckedChange={() => handleCheckboxChange("goa")}
              className="mt-1"
            />
            <div>
              <Label htmlFor="goa-terms" className="text-base font-medium">
                Goa Tourism Hosting Policies
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                I accept and comply with{" "}
                <Link target="_blank" href="/rules-for-goa" className="text-brightGreen hover:underline">
                  Goa tourism hosting policies
                </Link>{" "}
                (if hosting in Goa)
              </p>
            </div>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
