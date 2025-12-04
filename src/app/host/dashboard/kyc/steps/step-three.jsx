"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import axios from "axios";
import { toast } from "sonner";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const updateHostFormDocVerificationStatus = async (gstInfo) => {
  try {
    const user = await localStorage.getItem("userId");
    const userId = JSON.parse(user);
    if (userId) {
      const response = await axios.patch(
        `${API_BASE_URL}/kyc/verify-gst-status`,
        {
          userId: userId, // from localStorage
          panNumber: `******${gstInfo.panNumber.slice(-4)}`,
          gstNumber: `******${gstInfo.gstNumber.slice(-4)}`,
          isVerified: true,
        }
      );
      if (response.status == 200) {
        toast.success("Updated Form");
        return;
      }
    }
  } catch (error) {
    console.error(error);
  }
};

export function GSTVerification({ updateFormData, formData, goNext }) {
  const [gstInfo, setGstInfo] = useState(
    formData?.gstInfo || {
      isVerified: false,
    }
  );
  const [showDialog, setShowDialog] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const hasChanges =
      JSON.stringify(formData?.gstInfo) !== JSON.stringify(gstInfo);
    if (hasChanges) {
      updateFormData({ gstInfo });
    }
  }, [gstInfo, updateFormData, formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = value.replace(/\s/g, "");
    setGstInfo((prev) => ({ ...prev, [name]: cleanValue }));
  };

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      if (gstInfo.panNumber == gstInfo.rePanNumber) {
        const getLocalData = await localStorage.getItem("userId");
        const data = JSON.parse(getLocalData);

        if (data) {
          const response = await axios.post(`${API_BASE_URL}/kyc/verify/gst`, {
            userId: data,
            panNumber: gstInfo.rePanNumber,
            gstNumber: gstInfo.gstNumber,
          });
          console.log("gst reached");
          // const resData = response.data;
          // if (
          //   resData?.success === false ||
          //   resData?.http_response_code !== 200
          // ) {
          //   toast.error(resData?.message || "Invalid PAN/GST Number");
          //   return;
          // }
          // if (resData.http_response_code !== 200) {
          //   const msg =
          //     resData?.message ||
          //     resData?.error ||
          //     "Server error. Please try again.";

          //   toast.error(msg);
          //   throw new Error(msg);
          // }
          console.log("gst reached2");
          if (response.status == 200) {
            setTimeout(() => {
              setGstInfo((prev) => ({
                ...prev,
                panNumber: `******${gstInfo.panNumber.slice(-4)}`,
                gstNumber: `******${gstInfo.gstNumber.slice(-4)}`,
                isVerified: true,
              }));
              updateHostFormDocVerificationStatus(gstInfo);
              setIsVerifying(false);
              setShowDialog(true);
            }, 2000);
          }
          console.log("gst reached3");
          console.log("gst reached3");
        }
      } else {
        toast.error("Cross check pan number in both input fields.");
      }
    } catch (error) {
      const backendMsg = error?.response?.data?.message;

      toast.error(backendMsg || "Server error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };
  const handleCopyPaste = (e) => {
    e.preventDefault();
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bricolage">
          GST Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="gstName"
            className="font-bricolage text-lg text-gray-700 font-semibold"
          >
            Business PAN Number
          </Label>
          <Input
            id="gstName"
            name="panNumber"
            value={gstInfo.panNumber}
            onChange={handleChange}
            className="font-bricolage text-lg"
            type="password"
            placeholder="Enter your business pan number"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="gstName"
            className="font-bricolage text-lg text-gray-700 font-semibold"
          >
            Re-Enter PAN Number
          </Label>
          <Input
            id="gstName"
            name="rePanNumber"
            value={gstInfo.rePanNumber}
            onChange={handleChange}
            className="font-bricolage text-lg"
            placeholder="Enter your business pan number"
            // onCopy={handleCopyPaste}
            // onPaste={handleCopyPaste}
            // onCut={handleCopyPaste}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="gstNumber"
            className="font-bricolage text-lg text-gray-700 font-semibold"
          >
            GST Number
          </Label>
          <Input
            id="gstNumber"
            name="gstNumber"
            value={gstInfo.gstNumber}
            onChange={handleChange}
            className="font-bricolage text-lg"
            placeholder="Enter your GST number"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleVerify}
          disabled={
            !gstInfo.panNumber ||
            !gstInfo.rePanNumber ||
            !gstInfo.gstNumber ||
            isVerifying ||
            gstInfo.isVerified
          }
          className="w-full"
        >
          {isVerifying ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Verifying...
            </>
          ) : (
            "Verify GST"
          )}
        </Button>
      </CardFooter>
      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) goNext();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>GST Verification Successful</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <Icons.CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <p className="text-center text-lg">
            Your GST details have been successfully verified.
          </p>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowDialog(false);
                goNext();
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
