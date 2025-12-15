"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle } from "lucide-react";
import Image from "next/image";

const steps = ["Upload Documents", "OCR Processing", "Status Verification"];

export default function KYCVerification() {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [statusResult, setStatusResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) {
      setActiveStep(1); // Show processing state
    }
  }, [loading]);

  const handleImageUpload = (e) => {
    if (process.env.NEXT_PUBLIC_ENV === "dev") {
      console.log("ou", e.target.files?.[0]);
    }
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log("reader", reader);
      }

      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log("readasdata", reader.readAsDataURL(file));
      }
    }
  };

  const handleSubmit = async () => {
    if (!email || !image) {
      setError("Please provide User ID and upload an image");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Convert image to Base64 string
      const base64Image = image.split(",")[1];

      const response = await axios.post(
        "http://localhost:5005/api/v1/pan-kyc/verify",
        {
          // Single API call that handles both OCR and Status Check
          email,
          imageUrl: base64Image,
        }
      );

      // Handle both results from single response
      setOcrResult(response.data.ocrResult);
      setStatusResult(response.data.statusResult);
      setActiveStep(3);
    } catch (err) {
      setError(
        err.response?.data?.error || "An error occurred during KYC verification"
      );
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl bg-white py-32">
      <Card className="w-full max-w-3xl mx-auto ">
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-8">
            {steps.map((label, index) => (
              <div key={label} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= activeStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {index < activeStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-sm mt-2">{label}</span>
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {activeStep === 0 && (
            <div className="space-y-4">
              <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      SVG, PNG, JPG or GIF (MAX. 800x400px)
                    </p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </label>
              </div>

              {image && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <Image
                    src={image || "/placeholder.svg"}
                    alt="PAN Preview"
                    width={300}
                    height={200}
                    className="max-w-[300px] mt-2"
                  />
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={loading || !email || !image}
                className="w-full"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing
                  </>
                ) : (
                  "Start Verification"
                )}
              </Button>
            </div>
          )}

          {activeStep >= 3 && (
            <div className="mt-8 space-y-6">
              <h3 className="text-lg font-semibold">Verification Results</h3>

              {ocrResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>OCR Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Name: {ocrResult.result[0].details.name.value}</p>
                    <p>
                      PAN Number: {ocrResult.result[0].details.pan_no.value}
                    </p>
                    <p>Date: {ocrResult.result[0].details.date.value}</p>
                  </CardContent>
                </Card>
              )}

              {statusResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Status Check Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    Your Kyc verification has been completed successfully!
                    {/* <p>PAN Status: {statusResult.result.status}</p>
                  <p>Name Match: {statusResult.result.name_match ? "Yes" : "No"}</p>
                  <p>Match Score: {statusResult.result.name_match_score}%</p> */}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
