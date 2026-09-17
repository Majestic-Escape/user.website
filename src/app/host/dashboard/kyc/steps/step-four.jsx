/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Step3SelfieCapture({ updateFormData, formData }) {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCameraOn(true);
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(err.message);
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      streamRef.current = null;
      setIsCameraOn(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageDataUrl);
      updateFormData({ selfie: imageDataUrl });
      stopCamera();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Capture Selfie</h2>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Camera Access Error</AlertTitle>
          <AlertDescription>
            {error}. Please ensure you've granted camera permissions and are
            using a secure connection (HTTPS).
          </AlertDescription>
        </Alert>
      )}
      {!capturedImage ? (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={isCameraOn ? "block" : "hidden"}
          />
          {isCameraOn && (
            <button
              onClick={stopCamera}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
            >
              <X size={24} />
            </button>
          )}
          {!isCameraOn && <Button onClick={startCamera}>Start Camera</Button>}
          {isCameraOn && <Button onClick={captureImage}>Capture Selfie</Button>}
        </div>
      ) : (
        <div>
          <img
            src={capturedImage || "/placeholder.svg"}
            alt="Captured selfie"
            className="max-w-full h-auto"
          />
          <Button
            onClick={() => {
              setCapturedImage(null);
              startCamera();
            }}
          >
            Retake Selfie
          </Button>
        </div>
      )}
    </div>
  );
}
