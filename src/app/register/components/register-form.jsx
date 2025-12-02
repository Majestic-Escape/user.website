"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://server-me.vercel.app/api/v1";

// Validation schema for the registration form
const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
  dob: z.string().refine((dob) => {
    const age = Math.floor(
      (new Date().getTime() - new Date(dob).getTime()) / 3.15576e10
    );
    return age >= 18;
  }, "You must be 18 or older to use Majestic Escape"),
  email: z.string().email("Invalid email address").toLowerCase(),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"),
});

export default function RegisterPage() {
  const { login } = useAuth();

  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    phoneNumber: "",
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});

  // Validates form data using Zod schema
  const validateStep1 = () => {
    try {
      registerSchema.parse(formData);
      return true;
    } catch (error) {
      // Convert Zod errors into a more user-friendly format
      setErrors(
        error.errors.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.path[0]]: curr.message,
          }),
          {}
        )
      );
      return false;
    }
  };

  // Handles input changes and clears corresponding errors
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;

    // For phone number, only allow digits
    if (field === "phoneNumber" && !/^\d*$/.test(value)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleRequestOtp = async () => {
    if (!validateStep1()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/register/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          fullName: `${formData.firstName} ${formData.lastName}`,
          dob: formData.dob,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("OTP Request Error:", errorData.code);

        switch (errorData.code) {
          case "USER_EXISTS":
            toast.error("Account already exists, please login");
            break;
          case "ACCOUNT_LOCKED":
            toast.error(
              "Your account is locked due to multiple failed attempts"
            );
            break;
          case "INVALID_OTP":
            toast.error("Invalid OTP, please try again");
            break;
          default:
            toast.error("Couldn't send OTP, please try again");
        }
        return;
      }

      const data = await response.json();
      console.log("Data:", data);
      toast.success("OTP sent successfully to your phone");
      setStep(2);
    } catch (error) {
      console.error("Network Error:", error);

      // Handle the case where the network fails and there's no response object
      if (error.response) {
        const errorData = await error.response.json();
        console.error("OTP Request Error:", errorData.code);
        handleOtpError(errorData, error.response.status);
      } else {
        toast.error("Couldn't send OTP, please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handles OTP verification
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a complete 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/register/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
        }),
      });

      if (!response.ok) {
        // Parse error response
        const errorData = await response.json();
        handleOtpError(errorData, response.status);
        return;
      }

      // Parse successful response
      const data = await response.json();
      const { token } = data.token;

      // Store token and show success message
      localStorage.setItem("token", JSON.stringify(token));
      localStorage.setItem("userId", JSON.stringify(data.userId));
      login({ email: formData.email });
      toast.success("Registration successful! Welcome aboard.");
      router.push("/stays");
    } catch (error) {
      console.error("Network error while verifying OTP:", error);
      toast.error("Network error. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpError = (errorData, status) => {
    switch (status) {
      case 400:
        if (errorData.code === "OTP_MISSING") {
          toast.error("OTP is required. Please enter the OTP.");
        } else if (errorData.code === "INVALID_OTP") {
          toast.error(
            `Invalid OTP. ${errorData.otpAttempts.remainingAttempts} attempts remaining.`
          );
        }
        break;

      case 404:
        if (errorData.code === "USER_NOT_FOUND") {
          toast.error("No user found with this email.");
        }
        break;

      case 410:
        if (errorData.code === "OTP_EXPIRED") {
          toast.error("The OTP has expired. Please request a new one.");
        }
        break;

      case 423:
        if (errorData.code === "ACCOUNT_LOCKED") {
          toast.error(
            `Your account is locked. Try again after ${errorData.unlocksAt.remainingMinutes} minutes.`
          );
        }
        break;

      case 423:
        if (errorData.code === "ACCOUNT_LOCKED") {
          toast.error(
            `Your account is locked. Try again after ${errorData.unlocksAt.remainingMinutes} minutes.`
          );
        }
        break;

      case 500:
        toast.error("An unexpected error occurred. Please try again later.");
        break;

      default:
        toast.error("Couldn't verify OTP. Please try again.");
        break;
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      handleRequestOtp();
    } else {
      handleVerifyOtp();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white ">
      <form
        onSubmit={handleSubmit}
        className="p-6 md:p-8 max-w-2xl flex border border-gray-100 flex-col justify-center items-start  mx-auto w-full bg-gray-50 rounded-lg shadow-sm"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bricolage lg:text-2xl font-semibold text-absoluteDark mb-2">
            {step === 1 ? "Create your account" : "Verify your email"}
          </h2>
          {step === 1 && (
            <p className="text-stone text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-absoluteDark underline hover:text-gray-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>

        <div className="space-y-4 w-full">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Legal first name"
                    value={formData.firstName}
                    onChange={handleInputChange("firstName")}
                    className="w-full text-sm h-10 bg-white px-4"
                    disabled={isLoading}
                    aria-label="First name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1" role="alert">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    type="text"
                    placeholder="Legal last name"
                    value={formData.lastName}
                    onChange={handleInputChange("lastName")}
                    className="w-full text-sm h-10 bg-white px-4"
                    disabled={isLoading}
                    aria-label="Last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1" role="alert">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <small className="text-stone text-xs  ">
                Make sure this matches the name on your government ID
              </small>

              <div>
                <Input
                  type="date"
                  placeholder="Date of Birth"
                  value={formData.dob}
                  onChange={handleInputChange("dob")}
                  className="w-full text-sm bg-white h-10 px-4"
                  disabled={isLoading}
                  aria-label="Date of Birth"
                />
                {errors.dob && (
                  <p className="text-red-500 text-sm mt-1" role="alert">
                    {errors.dob}
                  </p>
                )}
                <small className="text-stone text-xs mt-1">
                  You must be 18 or older to use Majestic Escape. Your birthday
                  remains private
                </small>
              </div>

              <div>
                <div className="flex md:gap-x-6 flex-col md:flex md:flex-row ">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      className="w-full text-sm bg-white h-10 px-4"
                      disabled={isLoading}
                      aria-label="Email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center text-sm justify-center bg-white border border-r-0 border-gray-300 rounded-l-md px-3">
                        +91
                      </div>
                      <Input
                        type="tel"
                        placeholder="Phone"
                        value={formData.phoneNumber}
                        onChange={handleInputChange("phoneNumber")}
                        className="w-full bg-white rounded-r text-sm h-10 px-4"
                        disabled={isLoading}
                        maxLength={10}
                        aria-label="Phone number"
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1" role="alert">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
                <small className="text-stone text-xs">
                  We use phone and email to send notifications, updates,
                  confirmations and OTPs.
                </small>
              </div>
              <Button
                type="submit"
                className="w-full py-6 rounded-3xl bg-primaryGreen hover:bg-brightGreen text-white transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting OTP...
                  </>
                ) : (
                  "Request OTP"
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <InputOTP
                value={otp}
                onChange={setOtp}
                maxLength={6}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot className="border-gray-400" index={0} />
                  <InputOTPSlot className="border-gray-400" index={1} />
                  <InputOTPSlot className="border-gray-400" index={2} />
                  <InputOTPSlot className="border-gray-400" index={3} />
                  <InputOTPSlot className="border-gray-400" index={4} />
                  <InputOTPSlot className="border-gray-400" index={5} />
                </InputOTPGroup>
              </InputOTP>

              <Button
                type="submit"
                className="w-full py-6 rounded-3xl bg-primaryGreen hover:bg-brightGreen text-white transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-gray-600">
            <p>
              By signing up, you agree to our{" "}
              <Link
                href="/terms-of-service"
                className="text-absoluteDark underline hover:text-gray-700"
              >
                Terms of Service
              </Link>
              {" and "}
              <Link
                href="/privacy-policy"
                className="text-absoluteDark underline hover:text-gray-700"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}
