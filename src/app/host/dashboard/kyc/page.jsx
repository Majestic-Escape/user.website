"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { steps } from "./steps/steps";
import { StepIndicator } from "./components/step-indicator";
import { redirect, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { kycService } from "../../../../services/kycService";
import { propertyService } from "../../../../services/propertyService";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import confetti from "canvas-confetti";

export default function KYC() {
  const auth = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [id, setId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const [showKYCDialog, setShowKYCDialog] = useState(false);
  const [showCongratulationsDialog, setShowCongratulationsDialog] =
    useState(false);
  const [formCompleted, setFormCompleted] = useState(false);
  const [formData, setFormData] = useState({
    _id: id,
    hostId: null,
    personalInfo: {
      fatherName: "",
      dob: "",
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
      },
    },
    documentInfo: {
      documentType: "pan",
      isVerified: false,
    },
    gstInfo: {
      gstNumber: "",
      panNumber: "",
      isVerified: false,
    },
    acceptedTerms: {
      general: false,
      goa: false,
    },
    status: "pending",
    hostEmail: auth.user && auth.user.email,
  });
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const user = await localStorage.getItem("userId");
        const userId = JSON.parse(user);
        const response = await kycService.getFormDataByUserId(userId);
        const result = await response.data;

        if (result.status == "completed") {
          setFormCompleted(true);
        }
      } catch (error) {
        console.error("Failed to fetch form data. Please try again.");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchFormData();
  }, [id, auth.user?.email]);

  useEffect(() => {
    const checkValidation = async () => {
      const currentStepData = steps[currentStep];

      if (
        currentStepData.requiresValidation &&
        typeof currentStepData.validate === "function"
      ) {
        const { isValid } = currentStepData.validate(formData);
        setIsNextDisabled(!isValid);
      } else {
        setIsNextDisabled(false);
      }
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
          toast.error(errorMessage || "Please check the fields.");
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
      // const dataToSave = {
      //   ...formData,
      //   status:
      //     isExiting || currentStep < steps.length ? "processing" : "pending",
      // };

      const dataToSave = {
        ...formData,
        status: isExiting
          ? "processing"
          : currentStep === steps.length - 1
          ? "pending"
          : "processing",
      };
      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log("dataToSave", id);
      }

      if (id) {
        if (process.env.NEXT_PUBLIC_ENV === "dev") {
          console.log("ID present", id);
        }
      } else {
        if (process.env.NEXT_PUBLIC_ENV === "dev") {
          console.log("ID missing");
        }
      }
      const response = id
        ? await kycService.updateProperty(id, dataToSave)
        : await kycService.createKycHostData(dataToSave);

      if (!id) setId(response._id);
      setFormData(response);

      queryClient.invalidateQueries({
        queryKey: ["KYCStatus", auth.user.email],
      });
    } catch (error) {
      toast.success("Updated your KYC profile");
    } finally {
      setIsLoading(false);
    }
  };
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("new form", formData);
  }
  const handleNext = async () => {
    if (process.env.NEXT_PUBLIC_ENV === "dev") {
      console.log("enterd  next noew");
    }
    if (steps[currentStep].requiresValidation) {
      const isValid = await validateCurrentStep();
      if (!isValid) return;
    }
    if (process.env.NEXT_PUBLIC_ENV === "dev") {
      console.log("reached here");
    }
    await saveData();
    if (process.env.NEXT_PUBLIC_ENV === "dev") {
      console.log("passed save");
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      toast("Submitting your kyc...");
      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log("finally", formData?.hostId);
      }
      await kycService.updateProperty(id, {
        ...formData,
        status: "completed",
      });
      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log("finally", formData?.hostId);
      }
      // await propertyService.updateKyc(formData?.hostId);

      queryClient.invalidateQueries({
        queryKey: ["KYCStatus", auth.user.email],
      });

      toast.success("KYC submitted successfully.");
      setIsPublished(true);
      setTimeout(() => {
        setShowCongratulationsDialog(true);
      }, 2000);

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
    setFormData((prevData) => ({
      ...prevData,
      ...stepData,
      _id: id,
    }));
  };

  useEffect(() => {
    if (!auth) redirect("/login");
  }, [auth]);

  // const handleSaveAndExit = () => {
  //   setIsLoading(true);

  //   router.push("/host/dashboard");
  // };

  const handleSaveAndExit = async () => {
    try {
      setIsLoading(true);
      const isValid = await validateCurrentStep();
      if (!isValid) return;
      await saveData(true);
    } finally {
      setIsLoading(false);
      router.push("/host/dashboard");
    }
  };

  const handleGoToDashboard = () => {
    setShowKYCDialog(false);
    router.push("/host/dashboard");
  };
  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-20 w-20 animate-spin rounded-full border-b-2 border-current"></div>
      </div>
    );
  }
  if (formCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center font-poppins pt-24">
        You have already verified your KYC. &nbsp;{" "}
      </div>
    );
  }
  return (
    <div className="flex flex-col relative min-h-screen">
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
        <div className="max-w-3xl mx-auto">
          <CurrentStepComponent
            updateFormData={updateFormData}
            formData={formData}
            goNext={handleNext}
          />
        </div>
      </main>

      <footer className="bg-white w-screen z-10 bottom-0 fixed right-0 left-0 border-t-4 border-t-gray-200 p-4">
        <div className="container max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Button
            className="py-5 px-6 bg-gray-100 border-absoluteDark border text-absoluteDark font-normal rounded-3xl"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isPublished}
            variant="ghost"
          >
            Back
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              className="bg-primaryGreen rounded-3xl hover:bg-brightGreen py-5 px-6 h-12 text-white"
              disabled={isPublished || isLoading}
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

      <Dialog open={showKYCDialog} onOpenChange={setShowKYCDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>KYC Verification Complete</DialogTitle>
          </DialogHeader>
          <p>
            Your KYC verification process is complete. You can now proceed to
            the dashboard.
          </p>
          <DialogFooter>
            <Button onClick={handleRedirectToDashboard}>Go to Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showCongratulationsDialog}
        // onOpenChange={setShowCongratulationsDialog}
        onOpenChange={(open) => {
          setShowCongratulationsDialog(open);
          if (!open) {
            router.push("/host/dashboard");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Congratulations!</DialogTitle>
          </DialogHeader>
          <p>
            Your KYC has been successfully submitted. What would you like to do
            next?
          </p>
          <DialogFooter className="flex justify-between">
            <Button
              onClick={() => router.push("/host/dashboard/bank-info")}
              variant="outline"
            >
              Add Bank Account Details
            </Button>
            <Button onClick={() => router.push("/host/dashboard")}>
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
