"use client"

import Link from "next/link"
import { useRef, useState, useEffect } from "react"
import { Upload } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QRCode from "react-qr-code"

export default function Component() {
  const [activeTab, setActiveTab] = useState<"upload" | "capture">("capture")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<{ front: File | null; back: File | null }>({
    front: null,
    back: null,
  })
  const [uploadPreviews, setUploadPreviews] = useState<{ front: string | null; back: string | null }>({
    front: null,
    back: null,
  })
  const [qrCodeValue, setQrCodeValue] = useState<string>("")
  //const [cameraActive, setCameraActive] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Start camera stream
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      //setCameraActive(true)
    } catch (err) {
      console.error("Error accessing camera:", err)
      alert("Unable to access the camera. Please ensure you've granted camera permissions or try using a different device.")
    }
  }

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    //setCameraActive(false)
  }

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        const imageData = canvasRef.current.toDataURL('image/jpeg')
        setCapturedImage(imageData)
      }
    }
  }

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null)
  }

  // Handle file upload
  const handleFileUpload = (side: 'front' | 'back') => async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setUploadedFiles(prev => ({ ...prev, [side]: file }))
        const url = URL.createObjectURL(file)
        setUploadPreviews(prev => ({ ...prev, [side]: url }))
      } else {
        alert('Please upload a PDF or image file')
      }
    }
  }


  // Start camera when capture tab is selected
  const handleTabChange = (value: string) => {
    setActiveTab(value as "upload" | "capture")
    if (value === "capture") {
      startCamera()
    } else {
      stopCamera()
    }
  }

  useEffect(() => {
    const uniqueId = Math.random().toString(36).substring(2, 15)
    const url = `${window.location.origin}/mobile-upload/${uniqueId}`
    setQrCodeValue(url)
  }, [])

  useEffect(() => {
    if (activeTab === "capture") {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  return (
    // pt-16 / md:pt-20 clear the fixed site header; the page header and the
    // first content row used to start underneath it at every width.
    <div className="min-h-screen bg-background pt-16 md:pt-20">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <nav className="text-sm text-muted-foreground">
          <Link href="/account" className="hover:text-foreground">
            Account
          </Link>
          <span className="mx-2">›</span>
          <Link href="/account/personal-info" className="hover:text-foreground">
            Personal Info
          </Link>
          <span className="mx-2">›</span>
          <Link href="/account/kyc" className="hover:text-foreground">
            Government ID KYC
          </Link>
          <span className="mx-2">›</span>
          <span className="text-foreground capitalize">{activeTab}</span>
        </nav>
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" alt="Profile" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </header>

      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold">Account</h1>
        </div>
      </div>

      {/* Main Content: sidebar stacks above the content on phones (a w-full
          sidebar beside flex-1 content overflowed the page at 320–430). */}
      <div className="flex flex-col sm:flex-row">
        {/* Sidebar */}
        <aside className={`w-full sm:w-64 p-6 sm:block`}>
          <nav className="space-y-4 font-[18px]">
            <a href="/account-main-personal/" className="block text-sm text-brightGreen hover:text-foreground">
              Personal Info
            </a>
            <a href="/account-security/" className="block text-sm text-muted-foreground hover:text-foreground">
              Login & Security
            </a>
            <a href="/account-payments/" className="block text-sm text-muted-foreground hover:text-foreground">
              Payments
            </a>
            <a href="/account-taxes/" className="block text-sm text-muted-foreground">
              Taxes
            </a>
            <a href="/account-privacy/" className="block text-sm text-muted-foreground hover:text-foreground">
              Privacy & Sharing
            </a>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-6 pb-6">
          <div className="mb-4 items-center justify-center">
            <p className="text-sm text-muted-foreground mb-2 justify-center">
              Scan this QR code to complete the process on your mobile device:
            </p>
            {qrCodeValue && (
              <QRCode
                className="justify-center items-center text-center"
                value={qrCodeValue}
                size={128}
                viewBox={`0 0 500 500`}
              />
            )}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete your verification to access all features
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="capture" onValueChange={handleTabChange}>
                <TabsList className="w-full max-w-[200px] p-0 bg-transparent">
                  <TabsTrigger 
                    value="capture" 
                    className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-brightGreen data-[state=active]:text-brightGreen rounded-none bg-transparent"
                  >
                    Capture
                  </TabsTrigger>
                  <TabsTrigger 
                    value="upload"
                    className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-brightGreen data-[state=active]:text-brightGreen rounded-none bg-transparent"
                  >
                    Upload
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="capture" className="space-y-6">
                  <div className="flex justify-center mt-6">
                    <div className="relative w-[400px] aspect-[4/3] bg-muted rounded-lg border-2 border-gray-300 overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {capturedImage && (
                        <img 
                          src={capturedImage} 
                          alt="Captured ID" 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-sm">Upload front</span>
                  </div>

                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>• Position the front of your ID in the center of the camera frame</p>
                    <p>• Keep your ID steady and ensure all text and edges are visible and ensure there is good lighting</p>
                    <p>• Be sure that you don't cover any important information.</p>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="secondary">Back</Button>
                    {!capturedImage ? (
                      <Button 
                        className="bg-brightGreen hover:bg-primaryGreen/90"
                        onClick={capturePhoto}
                      >
                        Take photo
                      </Button>
                    ) : (
                      <div className="space-x-4">
                        <Button 
                          variant="outline"
                          onClick={retakePhoto}
                        >
                          Retake photo
                        </Button>
                        <Button className="bg-brightGreen hover:bg-primaryGreen/90">
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="upload" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Front Upload */}
                    <div className="flex flex-col items-center">
                      <label className="w-full cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleFileUpload('front')}
                        />
                        {uploadPreviews.front ? (
                          <div className="border-2 rounded-lg p-2 w-full aspect-[4/3] relative">
                            {uploadedFiles.front?.type === 'application/pdf' ? (
                              <iframe
                                src={uploadPreviews.front}
                                className="w-full h-full"
                                title="PDF preview"
                              />
                            ) : (
                              <img
                                src={uploadPreviews.front}
                                alt="Front ID"
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="border-2 border-dashed rounded-lg p-8 w-full flex flex-col items-center justify-center gap-2 hover:border-primary">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm font-medium">Upload</span>
                            <span className="text-xs text-muted-foreground">
                              PDF or image files
                            </span>
                          </div>
                        )}
                      </label>
                      <span className="mt-2 text-sm">Upload front</span>
                    </div>

                    {/* Back Upload */}
                    <div className="flex flex-col items-center">
                      <label className="w-full cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleFileUpload('back')}
                        />
                        {uploadPreviews.back ? (
                          <div className="border-2 rounded-lg p-2 w-full aspect-[4/3] relative">
                            {uploadedFiles.back?.type === 'application/pdf' ? (
                              <iframe
                                src={uploadPreviews.back}
                                className="w-full h-full"
                                title="PDF preview"
                              />
                            ) : (
                              <img
                                src={uploadPreviews.back}
                                alt="Back ID"
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="border-2 border-dashed rounded-lg p-8 w-full flex flex-col items-center justify-center gap-2 hover:border-primary">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm font-medium">Upload</span>
                            <span className="text-xs text-muted-foreground">
                              PDF or image files
                            </span>
                          </div>
                        )}
                      </label>
                      <span className="mt-2 text-sm">Upload back</span>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>• Click &apos;Upload ID&apos; or drag your ID photo into the designated box</p>
                    <p>• Select a clear photo of your government-issued ID from your computer files</p>
                    <p>• Ensure the image shows all edges and text clearly without blur or glare</p>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="secondary">Back</Button>
                    <Button 
                      className="bg-brightGreen hover:bg-primaryGreen/90"
                      disabled={!uploadedFiles.front && !uploadedFiles.back}
                    >
                      Next
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}