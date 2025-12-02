"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TextReveal } from "@/components/text-reveal";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function SafetyDetails({ updateFormData, formData }) {
  const [safetyFeatures, setSafetyFeatures] = useState({
    exteriorCamera: { checked: false, description: "" },
    noiseMonitor: { checked: false, description: "" },
    weapons: { checked: false, description: "" },
  });

  const [activeDialog, setActiveDialog] = useState(null);
  const [tempDescription, setTempDescription] = useState("");

  useEffect(() => {
    // Initialize safetyFeatures based on formData
    if (formData.safetyFeatures) {
      setSafetyFeatures(formData.safetyFeatures);
    }
  }, [formData.safetyFeatures]);

  const handleCheckboxChange = (feature, checked) => {
    if (checked) {
      setActiveDialog(feature);
      setTempDescription(safetyFeatures[feature].description);
    } else {
      const updatedFeatures = {
        ...safetyFeatures,
        [feature]: { checked: false, description: "" },
      };
      setSafetyFeatures(updatedFeatures);
      updateFormData({ safetyFeatures: updatedFeatures });
    }
  };

  // const handleDialogClose = () => {
  //   if (activeDialog && !safetyFeatures[activeDialog].description) {
  //     const updatedFeatures = {
  //       ...safetyFeatures,
  //       [activeDialog]: { checked: false, description: "" },
  //     };
  //     setSafetyFeatures(updatedFeatures);
  //     updateFormData({ safetyFeatures: updatedFeatures });
  //   }
  //   setActiveDialog(null);
  // };

  const handleDialogClose = () => {
    if (activeDialog) {
      if (tempDescription.trim().length < 10) {
        toast.error("Please add at least 10 characters.");
        return; // ❗ prevent closing
      }

      const updatedFeatures = {
        ...safetyFeatures,
        [activeDialog]: { checked: true, description: tempDescription },
      };
      setSafetyFeatures(updatedFeatures);
      updateFormData({ safetyFeatures: updatedFeatures });
    }
    setActiveDialog(null);
  };
  // const handleContinue = () => {
  //   if (activeDialog) {
  //     const updatedFeatures = {
  //       ...safetyFeatures,
  //       [activeDialog]: { checked: true, description: tempDescription },
  //     };
  //     setSafetyFeatures(updatedFeatures);
  //     updateFormData({ safetyFeatures: updatedFeatures });
  //     setActiveDialog(null);
  //   }
  // };

  const handleContinue = () => {
    if (tempDescription.trim().length < 10) {
      toast.error("Please add at least 10 characters.");
      return;
    }

    if (activeDialog) {
      const updatedFeatures = {
        ...safetyFeatures,
        [activeDialog]: { checked: true, description: tempDescription },
      };
      setSafetyFeatures(updatedFeatures);
      updateFormData({ safetyFeatures: updatedFeatures });
      setActiveDialog(null);
    }
  };

  const dialogContent = {
    exteriorCamera: {
      title: "Tell guests about your exterior security cameras",
      description:
        "Describe the area that each camera monitors, such as the back garden or pool.",
    },
    noiseMonitor: {
      title: "Tell guests about your noise monitoring system",
      description:
        "Describe where the noise monitors are located and how they're used.",
    },
    weapons: {
      title: "Tell guests about weapons on the property",
      description: "Describe what weapons are present and how they're secured.",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-3xl py-12">
        <div className="">
          <TextReveal>
            <h3 className="text-xl md:text-2xl mb-8 font-bricolage text-absoluteDark font-semibold">
              Share safety details
            </h3>
          </TextReveal>
          <TextReveal>
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-sm text-stone">
                  Does your place have any of these?
                </h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>These details help guests make informed decisions</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="camera"
                    checked={safetyFeatures.exteriorCamera.checked}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("exteriorCamera", checked)
                    }
                  />
                  <label
                    htmlFor="camera"
                    className="text-sm text-stone leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Exterior security camera present
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noise"
                    checked={safetyFeatures.noiseMonitor.checked}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("noiseMonitor", checked)
                    }
                  />
                  <label
                    htmlFor="noise"
                    className="text-sm text-stone leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Noise decibel monitor present
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weapons"
                    checked={safetyFeatures.weapons.checked}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("weapons", checked)
                    }
                  />
                  <label
                    htmlFor="weapons"
                    className="text-sm text-stone leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Weapon(s) on the property
                  </label>
                </div>
              </div>
            </div>
          </TextReveal>
          <TextReveal>
            <div className="space-y-4 mt-8 rounded-lg bg-muted/50 p-6">
              <h3 className="font-medium">Important things to know</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Security cameras that monitor indoor spaces are not allowed
                  even if they're turned off. All exterior security cameras must
                  be disclosed.
                </p>
                <p>
                  Be sure to comply with your{" "}
                  <Link href="#" className="underline hover:text-foreground">
                    local laws
                  </Link>{" "}
                  and review
                  <Link href="#" className="underline hover:text-foreground">
                    anti-discrimination policy
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="underline hover:text-foreground">
                    guest and Host fees
                  </Link>
                  .
                </p>
              </div>
            </div>
          </TextReveal>
        </div>

        <Dialog
          open={activeDialog !== null}
          onOpenChange={() => handleDialogClose()}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>
                  {activeDialog && dialogContent[activeDialog].title}
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                {activeDialog && dialogContent[activeDialog].description}
              </p>
              <div className="relative">
                <Textarea
                  value={tempDescription}
                  onChange={(e) =>
                    setTempDescription(e.target.value.slice(0, 300))
                  }
                  className="min-h-[100px] resize-none"
                  placeholder="Type your description here..."
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                  {tempDescription.length} / 300 characters
                  {/* {300 - tempDescription.length} characters available */}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleContinue}>Continue</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
