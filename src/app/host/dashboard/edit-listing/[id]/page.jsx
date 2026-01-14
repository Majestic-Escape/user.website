/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { use, useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { MembershipPopup } from "../../add-listing/membership-popup";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
import { editSteps } from "../../add-listing/steps/steps";
import { EditStepIndicator } from "../../add-listing/components/step-indicator";
import { toast } from "sonner";
import { propertyService } from "@/services/propertyService";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export default function EditListing({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const auth = useAuth();
  const [showMembershipPopup, setShowMembershipPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [initialStatus, setInitialStatus] = useState(null);
  // const [show, setShow] = useState(false);

  // const checkKycVerification = async () => {
  //   try {
  //     const userId = JSON.parse(localStorage.getItem("userId"));
  //     const getLocalData = await localStorage.getItem("token");
  //     const data = JSON.parse(getLocalData);

  //     if (data) {
  //       const response = await fetch(`${API_URL}/hosts/single/${userId}`, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${data}`,
  //         },
  //       });

  //       if (!response.ok) {
  //         return;
  //       }

  //       const result = await response.json();
  //       process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //   console.log("numb", result);
  // }
  //       setShow(result.kyc);
  //       return result;
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // useEffect(() => {
  //   checkKycVerification();
  // }, []);

  useEffect(() => {
    const fetchListingData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const listing = await propertyService.getUserListingById(
          auth.user?.email,
          id
        );
        const clone = JSON.parse(JSON.stringify(listing));
        setOriginalData(clone);
        setFormData(clone);
        // setOriginalData(listing);
        // setFormData(listing);
        setInitialStatus(listing.status); // Store the initial status
      } catch (error) {
        toast.error("Failed to fetch listing data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListingData();
  }, [id, auth.user?.email]);

  const handleStepClick = async (targetStep) => {
    // Prevent jumping forward without validation
    if (targetStep > currentStep) {
      const isValid = await validateCurrentStep();
      if (!isValid) return;
    }

    await saveData(); // autosave before jump
    setCurrentStep(targetStep);
  };
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("we got the original", originalData);
  }

  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("we got the original2", originalData?.host?.kyc);
  }
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("which is this", formData);
  }
  const checkForSignificantChanges = () => {
    if (!originalData || !formData) return false;
    const significantFields = ["images", "title", "description", "customRules"];
    return significantFields.some(
      (field) =>
        JSON.stringify(formData[field]) !== JSON.stringify(originalData[field])
    );
  };

  const determineNewStatus = (
    isExiting,
    hasSignificantChanges,
    isFinalSubmit = false
  ) => {
    if (isExiting && initialStatus === "incomplete") {
      return "incomplete";
    }
    if (hasSignificantChanges) {
      return "processing";
    }
    if (isFinalSubmit && initialStatus === "incomplete") {
      return "processing";
    }
    if (initialStatus === "active" || initialStatus === "processing") {
      return initialStatus;
    }
    return formData.status;
  };

  const saveData = async (isExiting = false) => {
    try {
      const hasSignificantChanges = checkForSignificantChanges();
      const newStatus = determineNewStatus(isExiting, hasSignificantChanges);

      const dataToSave = {
        ...formData,
        status: newStatus,
      };

      const response = await propertyService.updateProperty(
        id,
        "",
        "",
        dataToSave
      );
      setFormData(response);
      // toast.success("Progress saved successfully");
    } catch (error) {
      toast.error("Failed to save progress. Please try again.");
    }
  };
  const handleRedirectToDashboard = () => {
    router.push("/host/dashboard");
  };
  const handleSubmit = async () => {
    const toastId = toast.loading("Updating your listing...");
    try {
      const hasSignificantChanges = checkForSignificantChanges();
      const newStatus = determineNewStatus(false, hasSignificantChanges, true);
      const submit = true;

      await propertyService.updateProperty(id, initialStatus, submit, {
        ...formData,
        status: newStatus,
      });

      toast.dismiss(toastId);

      let successMessage;
      if (newStatus === "processing") {
        successMessage = "Listing has been updated and is under review.";
      } else if (newStatus === "active") {
        successMessage = "Listing has been updated successfully.";
      } else {
        successMessage = "Listing has been updated.";
      }

      toast.success(successMessage);
      setTimeout(() => {
        setShowMembershipPopup(true);
      }, 2000);
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 2100);
      // router.push("/host/dashboard");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const CurrentStepComponent = editSteps[currentStep].component;

  const validateCurrentStep = async () => {
    try {
      const currentStepData = editSteps[currentStep];
      if (
        currentStepData.requiresValidation &&
        typeof currentStepData.validate === "function"
      ) {
        const { isValid, errorMessage } = currentStepData?.validate(formData);
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

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = async () => {
    if (editSteps[currentStep].requiresValidation) {
      const isValid = await validateCurrentStep();
      if (!isValid) return;
    }
    await saveData();
    if (currentStep < editSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSaveAndExit = async () => {
    await saveData(true);
    router.push("/host/dashboard/listings");
  };

  const updateFormData = (stepData) => {
    setFormData((prevData) => ({
      ...prevData,
      ...stepData,
    }));
  };
  useEffect(() => {
    if (window && !auth.user) redirect("/login");
  }, [auth.user]);

  // if (!show) {
  //   return (
  //     <>
  //       <div className="min-h-screen flex items-center justify-center font-poppins pt-24">
  //         Verify your kyc now to access this page. &nbsp;{" "}
  //         <Link href="/host/dashboard/kyc">
  //           <u>
  //             <b>Click Here</b>
  //           </u>
  //         </Link>
  //         &nbsp; to verify kyc.
  //       </div>
  //     </>
  //   );
  // }
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-20 w-20 animate-spin rounded-full border-b-2 border-current"></div>
      </div>
    );
  }

  if (!formData && !isLoading) {
    return <div>No listing data found.</div>;
  }

  return (
    <div className="flex flex-col relative h-full">
      <header className="bg-white w-screen z-50 top-0 fixed right-0 left-0 border-b border-b-gray-200 p-4">
        <div className="container max-w-7xl mx-auto px-4 flex justify-between items-center">
          <img className="h-7 w-auto" src="/images/logo.png" alt="Logo" />
          <EditStepIndicator
            currentStep={currentStep}
            totalSteps={editSteps.length}
            onStepClick={handleStepClick}
          />
          <div className="gap-x-4 flex">
            <Drawer direction="right">
              <DrawerTrigger className="bg-gray-100 hover:bg-gray-200 text-sm text-absoluteDark border-absoluteDark border py-2 px-4 rounded-3xl">
                Help
              </DrawerTrigger>
              <DrawerContent className="h-full w-screen md:w-[400px] right-0 left-auto rounded-none">
                <DrawerClose className="absolute top-4 left-4 transition-colors rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 m-auto text-absoluteDark"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </DrawerClose>
                <DrawerTitle className="text-center text-absoluteDark font-medium">
                  Get Help
                </DrawerTitle>
                {/* ... (rest of the drawer content) */}
              </DrawerContent>
            </Drawer>
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
          {currentStep === editSteps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              className="bg-primaryGreen rounded-3xl hover:bg-brightGreen py-5 px-6 text-white"
            >
              Update Listing
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-primaryGreen rounded-3xl hover:bg-brightGreen py-5 px-6 text-white"
            >
              Next
            </Button>
          )}
        </div>
      </footer>
      <MembershipPopup
        open={showMembershipPopup}
        onOpenChange={setShowMembershipPopup}
        onClose={handleRedirectToDashboard}
        offer={false}
        reedit={true}
      />
    </div>
  );
}
