"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { FileInput } from "@/components/ui/file-input";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";
import axios from "axios";
import { authHeaders } from "@/lib/session";
import {
  prepareKycDocument,
  readAsDataUrl,
  KycDocumentError,
} from "@/lib/kyc-document";
import { useRetryCountdown, formatRetry } from "@/hooks/useRetryCountdown";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const updateHostFormDocVerificationStatus = async (doc) => {
  try {
    const user = await localStorage.getItem("userId");
    const userId = JSON.parse(user);
    if (userId) {
      const response = await axios.patch(
        `${API_BASE_URL}/kyc/verify-status`,
        {
          userId: userId, // from localStorage
          isVerified: true,
          documentType: doc,
        },
        { headers: authHeaders() }
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
export function DocumentUpload({ updateFormData, formData, goNext }) {
  const [documentInfo, setDocumentInfo] = useState(
    () => {
      const doc = formData?.documentInfo?.documentType;
      return {
        documentType: doc && doc !== "" ? doc : "pan",
        documentNumber: formData?.documentInfo?.documentNumber || null,
        documentFile: formData?.documentInfo?.documentFile || null,
        isVerified: formData?.documentInfo?.isVerified || false,
      };
    }

    // formData?.documentInfo || {
    //   documentType: "pan",
    //   documentNumber: null,
    //   documentFile: null,
    //   isVerified: false,
    // }
  );
  const fileInputRef = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [image, setImage] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  // Photos are resized/converted in the browser before upload (see
  // lib/kyc-document.js); the error stays on screen, not only in a toast.
  const [isPreparing, setIsPreparing] = useState(false);
  const [previewKind, setPreviewKind] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const selectionRef = useRef(0);
  // Disables the button until the server allows the next attempt.
  const { secondsLeft, start: startRetryCountdown } = useRetryCountdown();

  useEffect(() => {
    if (documentInfo.isVerified) {
      setIsLocked(true); // Lock UI once verified
    }
  }, [documentInfo]);

  useEffect(() => {
    const hasChanges =
      JSON.stringify(formData?.documentInfo) !== JSON.stringify(documentInfo);
    if (hasChanges) {
      updateFormData({ documentInfo });
    }
  }, [documentInfo, updateFormData, formData]);

  // const handleDocumentTypeChange = (value) => {
  //   setDocumentInfo((prev) => ({ ...prev, documentType: value }));
  // };
  const clearUploadedFile = () => {
    setImage(null);
    setPreviewKind(null);
    setUploadError("");
    setDocumentInfo((prev) => ({
      ...prev,
      documentFile: null,
    }));
    fileInputRef.current?.clear();
  };
  const handleDocumentTypeChange = (value) => {
    if (isLocked) return;
    selectionRef.current += 1; // drop a file still being prepared for the old type
    setIsPreparing(false);
    setDocumentInfo({
      documentType: value,
      documentNumber: null,
      documentFile: null,
      isVerified: false,
    });
    clearUploadedFile();
  };
  const handleFileChange = async (file) => {
    if (!file) {
      return;
    }
    // A newer pick wins over a slower earlier one still being prepared.
    const selection = ++selectionRef.current;
    setUploadError("");
    setIsPreparing(true);
    try {
      const { file: ready, kind } = await prepareKycDocument(file);
      const dataUrl = await readAsDataUrl(ready);
      if (selection !== selectionRef.current) return;
      const ext = ready.name.split(".").pop();
      const newName = `${documentInfo.documentType}_${Date.now()}.${ext}`;
      const renamedFile = new File([ready], newName, { type: ready.type });
      setDocumentInfo((prev) => ({ ...prev, documentFile: renamedFile }));
      setImage(dataUrl);
      setPreviewKind(kind);
    } catch (error) {
      if (selection !== selectionRef.current) return;
      const message =
        error instanceof KycDocumentError
          ? error.message
          : "We couldn't read this file. Please choose it again.";
      toast.error(message);
      clearUploadedFile();
      setUploadError(message);
    } finally {
      if (selection === selectionRef.current) setIsPreparing(false);
    }
  };

  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("url", image);
  }
  const handleUpload = async (email, image) => {
    if (!image) {
      toast.error("Please upload an image");
      return;
    }
    setIsUploading(true);
    setUploadError("");
    let verified = false;
    try {
      const userId = JSON.parse(localStorage.getItem("userId"));
      const doc = documentInfo.documentType;
      let response;
      try {
        // verify pan, voter and passport on same route
        response = await fetch(`${API_BASE_URL}/pan-kyc/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({
            email: email,
            imageUrl: image.split(",")[1],
            userId: userId,
            doc: doc,
          }),
        });
      } catch {
        throw new KycDocumentError(
          "We couldn't reach the server. Please check your connection and try again."
        );
      }
      // A gateway error page is not JSON; never let that hide the failure.
      const resData = await response.json().catch(() => ({}));
      if (!response.ok) {
        // Every failure after a real attempt says when the next one is
        // allowed; the button counts down instead of inviting a 429.
        startRetryCountdown(resData?.retryAfterSeconds);
        if (response.status === 413) {
          clearUploadedFile();
          throw new KycDocumentError(
            "This file is too large to upload. Please choose a smaller file or a photo."
          );
        }
        const left = resData?.attemptsLeft;
        const hint =
          typeof left === "number" && left > 0 && left <= 2
            ? ` (${left} attempt${left === 1 ? "" : "s"} left today)`
            : "";
        throw new KycDocumentError(
          (resData?.message ||
            resData?.error ||
            "Server error. Please try again.") + hint
        );
      }

      // The backend decides the verdict: "verified", or "needs_review"
      // when our team has to look at the document manually.
      verified = true;
      setNeedsReview(resData?.verdict === "needs_review");
      setIsLocked(true); // nothing to re-submit while the dialog is coming
      updateHostFormDocVerificationStatus(doc);
      setTimeout(() => {
        setDocumentInfo((prev) => ({ ...prev, isVerified: true }));
        setIsUploading(false);
        setShowDialog(true);
      }, 2000);
    } catch (error) {
      console.error("Upload failed:", error);
      const message =
        error instanceof KycDocumentError
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
      setUploadError(message);
    } finally {
      if (!verified) setIsUploading(false);
    }
  };
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("llloa", isUploading);
  }
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("sds", formData);
  }
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bricolage">
          {documentInfo.isVerified
            ? "Document Verification Successful"
            : "Document Upload"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          onValueChange={handleDocumentTypeChange}
          value={documentInfo?.documentType}
          className={`grid grid-cols-3 gap-4 ${
            isLocked ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <Label
            htmlFor="pan"
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
              documentInfo.documentType === "pan"
                ? "border-primary bg-primary/10"
                : "border-gray-200 hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value="pan" id="pan" className="sr-only" />
            <Icons.CreditCard className="h-6 w-6 mb-2" />
            <span className="font-bricolage text-lg font-semibold">PAN</span>
          </Label>
          <Label
            htmlFor="voterId"
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
              documentInfo?.documentType === "voterId"
                ? "border-primary bg-primary/10"
                : "border-gray-200 hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value="voterId" id="voterId" className="sr-only" />
            <Icons.Vote className="h-6 w-6 mb-2" />
            <span className="font-bricolage text-lg font-semibold">
              Voter ID
            </span>
          </Label>
          <Label
            htmlFor="passport"
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
              documentInfo?.documentType === "passport"
                ? "border-primary bg-primary/10"
                : "border-gray-200 hover:border-primary/50"
            }`}
          >
            <RadioGroupItem
              value="passport"
              id="passport"
              className="sr-only"
            />
            <Icons.Passport className="h-6 w-6 mb-2" />
            <span className="font-bricolage text-lg font-semibold">
              Passport
            </span>
          </Label>
        </RadioGroup>
        <div>
          <Label
            htmlFor="document"
            className="font-bricolage text-lg text-gray-700 font-semibold mb-2 block"
          >
            Upload Document
          </Label>
          {/* <FileInput
            id="document"
            accept=".jpg, .jpeg, .png"
            onFileSelect={handleFileChange}
            className="w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
          >
            <div className="text-center">
              <Icons.Upload className="mx-auto h-8 w-8 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-700">
                Drop your file here, or click to browse
              </span>
            </div>
          </FileInput>
          {documentInfo.documentFile && (
            <p className="mt-2 text-sm text-gray-500">
              Selected file: {documentInfo.documentFile.name}
            </p>
          )} */}
          <div className="flex flex-col gap-2">
            <FileInput
              ref={fileInputRef}
              disabled={isLocked}
              id="document"
              accept=".jpg, .jpeg, .png, .pdf"
              onFileSelect={handleFileChange}
              className="w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors relative"
            >
              {isPreparing && !image && (
                <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-gray-600 pointer-events-none">
                  <Icons.Loader className="h-4 w-4 animate-spin" />
                  Preparing file...
                </div>
              )}
              {image && previewKind === "image" && (
                <div className="flex h-full w-full items-center justify-center p-2 pointer-events-none">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
                  <img
                    src={image}
                    alt="Selected document"
                    className="max-h-full max-w-full rounded-md object-contain animate-in fade-in-0 zoom-in-[0.98] duration-200 motion-reduce:animate-none"
                  />
                </div>
              )}
              {image && previewKind === "pdf" && (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-sm text-gray-700 pointer-events-none animate-in fade-in-0 duration-200 motion-reduce:animate-none">
                  <Icons.FileText className="h-8 w-8 text-gray-500" />
                  PDF selected
                </div>
              )}
              {!image && !isPreparing && (
                <div className="text-center pointer-events-none">
                  <Icons.Upload className=" mx-auto h-20 md:h-16 w-8 text-gray-400" />
                  <span className="md:hidden text-sm font-medium text-gray-700">
                    Drop your file
                  </span>
                  <span className="hidden md:block mt-2 block text-sm font-medium text-gray-700">
                    Drop your file here, or click to browse
                  </span>
                </div>
              )}
            </FileInput>

            {documentInfo.documentFile && (
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                📄 Selected: {documentInfo.documentFile.name}
              </div>
            )}
            {!isLocked && (
              <p className="text-xs text-gray-500">
                JPG, PNG or PDF. Photos are resized automatically; PDFs up to
                3 MB. Make sure the whole front side is visible and in focus.
              </p>
            )}
            {uploadError && (
              <p
                role="alert"
                className="text-sm text-red-600 animate-in fade-in-0 duration-200 motion-reduce:animate-none"
              >
                {uploadError}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => handleUpload(formData.hostEmail, image)}
          disabled={
            !documentInfo.documentType ||
            !documentInfo.documentFile ||
            isUploading ||
            isPreparing ||
            isLocked ||
            secondsLeft > 0 ||
            documentInfo.isVerified
          }
          className="w-full"
        >
          {isUploading ? (
            <>
              <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : isPreparing ? (
            <>
              <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />
              Preparing file...
            </>
          ) : secondsLeft > 0 ? (
            `Try again in ${formatRetry(secondsLeft)}`
          ) : (
            "Upload and Verify"
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
            <DialogTitle>
              {needsReview ? "Check completed" : "Verification Successful"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <Icons.CheckCircle
              className={`h-16 w-16 ${needsReview ? "text-amber-500" : "text-green-500"}`}
            />
          </div>
          <p className="text-center text-lg">
            {needsReview
              ? "Your document has been received and needs a manual review by our team. You can continue with the next steps; we will complete your KYC once it is approved."
              : "Your document has been successfully verified."}
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
