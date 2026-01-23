"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { TextReveal } from "@/components/text-reveal";
import axios from "axios";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Photo {
  id: string;
  url: string;
}

interface MakeItStandOutProps {
  updateFormData: (data: { photos: string[] }) => void;
  formData: { photos: string[] };
}

export function AddPhotos({ updateFormData, formData }: MakeItStandOutProps) {
  const [photos, setPhotos] = useState<Photo[]>(
    formData?.photos?.map((url: string) => ({
      id: crypto.randomUUID(),
      url,
    })) || [],
  );
  const [draggedPhoto, setDraggedPhoto] = useState<Photo | null>(null);
  const draggedNodeRef = useRef<HTMLDivElement | null>(null);
  const [uploading, setUploading] = useState(false); // Optional: Show loading state

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);

    // Validate new files
    const MAX_FILES = 20;
    const totalFilesAfterUpload = photos.length + filesArray.length;

    if (totalFilesAfterUpload > MAX_FILES) {
      toast.error(
        ` You already have ${photos.length}. You can add only ${MAX_FILES - photos.length} more.`,
      );
      resetFileInput();
      return;
    }
    //You can upload a maximum of ${MAX_FILES} images.
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    const ALLOWED_TYPES = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "application/octet-stream",
    ];

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    filesArray.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        invalidFiles.push(`${file.name} (invalid type)`);
      } else if (file.size > MAX_SIZE) {
        invalidFiles.push(`${file.name} (too large)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(
        ` ${invalidFiles.slice(0, 3).join(", ")}${invalidFiles.length > 3 ? "..." : ""}`,
      );
    }

    if (validFiles.length === 0) {
      resetFileInput();
      return;
    }

    // Process the valid files
    handlePhotoUpload(validFiles);
  };

  const handlePhotoUpload = async (files: File[]) => {
    console.log(`Uploading ${files.length} files`);

    setUploading(true);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      console.log("Making backend call");
      const res = await axios.post(`${API_URL}/uploads/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Fetch data from backend");
      const newPhotos = res.data.urls.map((url: string) => ({
        id: crypto.randomUUID(),
        url,
      }));
      const updatedPhotos = [...photos, ...newPhotos];

      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log("Updated photos:", updatedPhotos);
      }

      console.log("Update the form");
      setPhotos(updatedPhotos);
      updateFormData({ photos: updatedPhotos.map((photo) => photo.url) });

      toast.success(
        `Successfully uploaded ${files.length} image${files.length > 1 ? "s" : ""}`,
      );
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Image upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
      resetFileInput();
    }
  };
  // const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   console.log("Enter photo upload function");
  //   const files = e.target.files;
  //   if (!files || files.length === 0) return;
  //   console.log("check if photo files are present");
  //   const filesArray = Array.from(files);
  //   const MAX_FILES = 20;

  //   const totalFilesAfterUpload = photos.length + filesArray.length;
  //   console.log("Check if image upload is greater than max 20");
  //   if (totalFilesAfterUpload > MAX_FILES) {
  //     toast.error(
  //       `You can upload a maximum of ${MAX_FILES} images. You already have ${photos.length}.`,
  //     );
  //     return;
  //   }

  //   const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  //   const ALLOWED_TYPES = [
  //     "image/jpeg",
  //     "image/png",
  //     "image/webp",
  //     "image/gif",
  //   ];
  //   console.log("Check if any image upload is greater than 5mb");
  //   if (files.length > 0 && Array.from(files).some((f) => f.size > MAX_SIZE)) {
  //     toast.error("One or more selected files exceed 5MB");
  //     return;
  //   }
  //   if (files.length > 20) {
  //     toast.error("Max 20 files can be uploaded");
  //     return;
  //   }
  //   const validFiles: File[] = [];
  //   console.log("Check image file type");
  //   for (const file of Array.from(files)) {
  //     if (!ALLOWED_TYPES.includes(file.type)) {
  //       toast.error(
  //         `Invalid file type: ${file.name}. Only JPG, PNG, WEBP, GIF allowed.`,
  //       );
  //       continue;
  //     }

  //     if (file.size > MAX_SIZE) {
  //       toast.error(`File too large: ${file.name}. Max size is 5MB.`);
  //       continue;
  //     }

  //     validFiles.push(file);
  //   }

  //   if (validFiles.length === 0) return;

  //   setUploading(true);
  //   const formData = new FormData();
  //   console.log("Push images in array");
  //   validFiles.forEach((file) => {
  //     formData.append("images", file);
  //   });

  //   // setUploading(true);
  //   // const formData = new FormData();
  //   // Array.from(files).forEach((file) => {
  //   //   formData.append("images", file); // Match backend field name
  //   // });

  //   try {
  //     console.log("Make backend call");
  //     const res = await axios.post(`${API_URL}/uploads/`, formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  //     console.log("Fetch data from backend");
  //     const newPhotos = res.data.urls.map((url: string) => ({
  //       id: crypto.randomUUID(),
  //       url,
  //     }));
  //     const updatedPhotos = [...photos, ...newPhotos];

  //     if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //       console.log("we are reaching", updatedPhotos);
  //     }
  //     console.log("Update the form");
  //     setPhotos(updatedPhotos);
  //     updateFormData({ photos: updatedPhotos.map((photo) => photo.url) });
  //   } catch (error: any) {
  //     console.error(error);

  //     toast.error(
  //       error?.response?.data?.error ||
  //         error?.message ||
  //         "Image upload failed. Please try again.",
  //     );
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  // const removePhoto = (id: string) => {
  //   const updatedPhotos = photos.filter((photo) => photo.id !== id);
  //   setPhotos(updatedPhotos);
  //   updateFormData({ photos: updatedPhotos.map((photo) => photo.url) });
  // };
  const removePhoto = async (id: string, url: string) => {
    await axios.delete(`${API_URL}/uploads/delete`, {
      data: { url },
    });

    const updatedPhotos = photos.filter((photo) => photo.id !== id);
    setPhotos(updatedPhotos);
    updateFormData({ photos: updatedPhotos.map((photo) => photo.url) });
  };
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    photo: Photo,
  ) => {
    setDraggedPhoto(photo);
    draggedNodeRef.current = e.target as HTMLDivElement;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", photo.id);

    requestAnimationFrame(() => {
      if (draggedNodeRef.current) {
        draggedNodeRef.current.style.opacity = "0.5";
      }
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetPhoto: Photo) => {
      e.preventDefault();
      if (draggedPhoto && draggedPhoto.id !== targetPhoto.id) {
        setPhotos((prevPhotos) => {
          const newPhotos = [...prevPhotos];
          const draggedIndex = newPhotos.findIndex(
            (photo) => photo.id === draggedPhoto.id,
          );
          const targetIndex = newPhotos.findIndex(
            (photo) => photo.id === targetPhoto.id,
          );
          newPhotos.splice(draggedIndex, 1);
          newPhotos.splice(targetIndex, 0, draggedPhoto);
          return newPhotos;
        });
      }
    },
    [draggedPhoto],
  );

  const handleDragEnd = useCallback(() => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current.style.opacity = "1";
    }
    setDraggedPhoto(null);
    updateFormData({ photos: photos.map((photo) => photo.url) });
  }, [photos, updateFormData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show message when Ctrl key is pressed
      if (e.ctrlKey && fileInputRef.current) {
        // toast.info("Hold Ctrl and click to select multiple images");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey) {
        toast.dismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  return (
    <div className=" max-w-4xl mx-auto p-6 md:space-y-8 md:max-w-3xl md:py-4">
      <TextReveal>
        <h3 className="text-xl md:text-2xl font-bricolage text-absoluteDark font-semibold">
          Add photos to make your place stand out
        </h3>
      </TextReveal>
      <TextReveal>
        <div>
          <div className="pt-4 md:pt-0 space-y-4">
            {/* <Input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading} // Disable during upload
            > */}

            <Label
              htmlFor="photos"
              className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primaryGreen"
            >
              <div className="relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:border-primaryGreen">
                <input
                  id="photos"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  multiple
                  onChange={handleFileSelection}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  style={{ zIndex: 10 }}
                  onClick={(e) => {
                    (e.target as HTMLInputElement).value = "";
                  }}
                />

                <span className="pointer-events-none text-center">
                  <p className="mt-2">
                    {uploading ? (
                      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-current"></div>
                    ) : (
                      <div>
                        <div className="text-2xl">📷</div>
                        <div>"Click to upload photos"</div>
                      </div>
                    )}
                  </p>
                </span>
              </div>
            </Label>
            {photos.length < 5 && (
              <p className="text-red-500">Please upload at least 5 photos</p>
            )}
            {photos.length > 1 && (
              <div>
                Drag and move the images to change the order. The first image
                will be set as property profile image.
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, photo)}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, photo)}
                  onDragEnd={handleDragEnd}
                  className="relative transition-transform duration-300 ease-in-out"
                  style={{
                    transform:
                      draggedPhoto && draggedPhoto.id === photo.id
                        ? "scale(1.05)"
                        : "scale(1)",
                  }}
                >
                  <img
                    src={photo.url}
                    alt={`Property photo`}
                    className="w-full h-40 object-cover rounded-lg transition-opacity duration-300 ease-in-out"
                    style={{
                      opacity:
                        draggedPhoto && draggedPhoto.id === photo.id ? 0.5 : 1,
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white bg-opacity-50 hover:bg-opacity-100 transition-opacity duration-300 ease-in-out"
                    onClick={() => removePhoto(photo.id, photo.url)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove photo</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TextReveal>
    </div>
  );
}
