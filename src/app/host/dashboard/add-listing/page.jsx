/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import confetti from "canvas-confetti";
import { MembershipPopup } from "./membership-popup";

import { steps } from "./steps/steps";
import { StepIndicator } from "./components/step-indicator";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";
import { propertyService } from "@/services/propertyService";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// Import useQueryClient from TanStack Query
import { useQueryClient } from "@tanstack/react-query";

export default function HostOnboarding() {
  const auth = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient(); // Initialize QueryClient

  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [id, setId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showMembershipPopup, setShowMembershipPopup] = useState(false);

  const [formData, setFormData] = useState({
    _id: id,
    propertyType: null,
    placeType: "entire",
    title: "",
    description: "",
    guests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    address: {
      street: "",
      district: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      latitude: null,
      longitude: null,
      registrationNumber: "", // default registration number
    },
    validRegistrationNo: false, // new field for registration number validity
    bathroomTypes: {
      private: 0,
      shared: 0,
      dedicated: 0,
    },
    amenities: [],
    photos: [],
    basePrice: null,
    bookingType: {
      manual: true,
      instantBook: false,
      flashBook: false,
    },
    cancellationType: {
      moderate: true,
      flexible: false,
      strict: false,
    },
    host: null,
    status: "incomplete",
    hostEmail: auth.user && auth.user.email,
    selectedRules: [],
    customRules: [],
    checkinTime: "11",
    checkoutTime: "14",
  });
  // Update the validation logic to include the registration number check for the Location step.
  useEffect(() => {
    const checkValidation = async () => {
      const currentStepData = steps[currentStep];

      let isValid = true;

      // If the current step is the Location Form, ensure that the registration number has been validated.
      // (Assuming the Location Form step has a "name" property set to "LocationForm")
      if (
        currentStepData.name === "LocationForm" &&
        !formData.validRegistrationNo
      ) {
        isValid = false;
      }

      if (
        currentStepData.requiresValidation &&
        typeof currentStepData.validate === "function"
      ) {
        const { isValid: stepIsValid } = currentStepData.validate(formData);
        isValid = isValid && stepIsValid;
      }
      setIsNextDisabled(!isValid);
    };

    checkValidation();
  }, [formData, currentStep]);

  const CurrentStepComponent = steps[currentStep].component;

  const validateCurrentStep = async () => {
    try {
      const currentStepData = steps[currentStep];
      if (
        currentStepData.requiresValidation &&
        typeof currentStepData.validate === "function"
      ) {
        const { isValid, errorMessage } = currentStepData.validate(formData);
        if (!isValid) {
          toast.error(
            errorMessage || "Validation failed. Please check the fields."
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      toast.error("Unexpected error during validation. Please try again.");
      return false;
    }
  };

  const handleRedirectToDashboard = () => {
    router.push("/host/dashboard");
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveData = async (isExiting = false) => {
    setIsLoading(true);
    try {
      const dataToSave = {
        ...formData,
        status:
          isExiting || currentStep < steps.length - 1
            ? "incomplete"
            : "processing",
      };
      console.log("id", id);
      const response = id
        ? await propertyService.updateProperty(id, dataToSave)
        : await propertyService.createProperty(dataToSave);

      if (!id) setId(response._id);
      setFormData(response);

      // Invalidate cached listing status so that any component using it re-fetches new data
      queryClient.invalidateQueries({
        queryKey: ["listingStatus", auth.user.email],
      });
    } catch (error) {
      toast.error("Failed to save progress. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (steps[currentStep].requiresValidation) {
      const isValid = await validateCurrentStep();
      if (!isValid) return;
    }
    await saveData();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSaveAndExit = async () => {
    await saveData(true);
    router.push("/host/dashboard/listings");
  };

  const handleSubmit = async (id) => {
    setIsLoading(true);
    try {
      console.log(id);
      toast("Submitting your listing...");
      await propertyService.updateProperty(id, {
        ...formData,
        status: "processing",
      });

      // Invalidate the cached listing status on final submission.
      queryClient.invalidateQueries({
        queryKey: ["listingStatus", auth.user.email],
      });

      toast.success("Listing submitted successfully.");

      // Show membership popup after 2 seconds
      setTimeout(() => {
        setShowMembershipPopup(true);
      }, 2000);

      // Trigger confetti after popup is shown
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 2100);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (stepData) => {
    console.log("id", id);
    setFormData((prevData) => ({
      ...prevData,
      ...stepData,
      _id: id,
    }));
  };

  useEffect(() => {
    if (!auth) redirect("/login");
    console.log("User not found");
  }, [auth]);

  return (
    <div className="flex flex-col relative h-full">
      <header className="bg-white w-screen z-50 top-0 fixed right-0 left-0 border-b border-b-gray-200 p-4">
        <div className="container max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link
            className="px-6 py-2 border rounded-3xl border-black font-medium text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-absoluteDark"
            href={"/host/dashboard"}
          >
            Back to Dashboard
          </Link>
          <StepIndicator currentStep={currentStep} totalSteps={steps.length} />
          <div className="gap-x-4 flex">
            <Button
              onClick={handleSaveAndExit}
              className="bg-gray-100 hover:bg-gray-200 text-sm text-absoluteDark border-absoluteDark border py-2 px-4 rounded-3xl"
            >
              Save & Exit
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto py-24 px-4">
        <div className="mx-auto">
          <CurrentStepComponent
            updateFormData={updateFormData}
            formData={formData}
          />
        </div>
      </main>
      <footer className="bg-white w-screen z-10 bottom-0 fixed right-0 left-0 border-t-4 border-t-gray-200 p-4">
        <div className="container max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Button
            className="py-5 px-6 bg-gray-100 border-absoluteDark border text-absoluteDark font-normal rounded-3xl"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="ghost"
          >
            Back
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={() => handleSubmit(id)}
              className="bg-primaryGreen rounded-3xl hover:bg-brightGreen py-5 px-6 h-12 text-white"
            >
              Publish
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-primaryGreen rounded-3xl transition-all hover:bg-brightGreen w-48 h-12 px-6 text-white"
              disabled={isLoading || isNextDisabled}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Next"
              )}
            </Button>
          )}
        </div>
      </footer>
      <MembershipPopup
        open={showMembershipPopup}
        onOpenChange={setShowMembershipPopup}
        onClose={handleRedirectToDashboard}
      />
    </div>
  );
}
