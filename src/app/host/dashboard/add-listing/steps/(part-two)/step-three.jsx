/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { TextReveal } from "@/components/text-reveal";
import WarningDialog from "@/components/warning-modal";
import { useAuth } from "@/contexts/AuthContext";

export function ListingDetails({ updateFormData, formData }) {
  const [title, setTitle] = useState(formData?.title || "");
  const [titleEditConfirmed, setTitleEditConfirmed] = useState(false);
  const [descriptionEditConfirmed, setDescriptionEditConfirmed] =
    useState(false);
  const { propertyIsActive } = useAuth();
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [change, setChange] = useState(false);
  const [pendingField, setPendingField] = useState(null);
  const [hasConfirmedEdit, setHasConfirmedEdit] = useState(false);
  const [pendingValue, setPendingValue] = useState("");
  const [description, setDescription] = useState(formData?.description || "");
  const maxTitleLength = 72;
  const maxDescriptionLength = 500;
  useEffect(() => {
    updateFormData({ title, description });
  }, [title, description]);

  const handleCancelUpload = () => {
    setWarningDialogOpen(false);
    setPendingField(null);
    setPendingValue("");
  };

  const handleConfirmUpload = () => {
    setWarningDialogOpen(false);
    setHasConfirmedEdit(true);

    if (pendingField === "title") {
      setTitle(pendingValue);
      setTitleEditConfirmed(true);
    } else if (pendingField === "description") {
      setDescription(pendingValue);
      setDescriptionEditConfirmed(true);
    }

    setPendingField(null);
    setPendingValue("");
  };
  const handleTitleChange = (e) => {
    const newValue = e.target.value;

    if (propertyIsActive && !titleEditConfirmed) {
      // Store the pending change and show warning

      setPendingField("title");
      setPendingValue(newValue);
      setWarningDialogOpen(true);
    } else {
      // User has confirmed or property is not active
      setTitle(newValue);
    }
  };

  const handleDescriptionChange = (e) => {
    const newValue = e.target.value;

    if (propertyIsActive && !descriptionEditConfirmed) {
      // Store the pending change and show warning
      setPendingField("description");
      setPendingValue(newValue);
      setWarningDialogOpen(true);
    } else {
      // User has confirmed or property is not active
      setDescription(newValue);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="space-y-8 mb-12">
        <TextReveal>
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-bricolage text-absoluteDark font-semibold">
              Create your title and description
            </h3>

            <p className="text-muted-foreground">
              Share what makes your place special.
            </p>
          </div>
        </TextReveal>
        {
          <WarningDialog
            open={warningDialogOpen}
            onClose={handleCancelUpload}
            onConfirm={handleConfirmUpload}
          />
        }
        <TextReveal>
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Create your title
                </Label>
                <p className="text-sm text-muted-foreground">
                  Catch guests' attention with a listing title that highlights
                  what makes your place special.
                </p>
              </div>
              <div className="space-y-2">
                <Input
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  maxLength={maxTitleLength}
                  className="text-sm h-12 md:text-base"
                  placeholder="Enter your listing title"
                />
                <div className="text-sm text-muted-foreground text-right">
                  (min. 3 characters) {title.length}/{maxTitleLength}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-base font-semibold"
                >
                  Create your description
                </Label>
                <p className="text-sm text-muted-foreground">
                  Share what makes your place unique and why guests will love
                  staying there.
                </p>
              </div>
              <div className="space-y-2">
                <Textarea
                  id="description"
                  value={description}
                  onChange={handleDescriptionChange}
                  maxLength={maxDescriptionLength}
                  rows={4}
                  className="resize-none p-4 text-sm md:text-base"
                  placeholder="Tell guests what makes your place special"
                />
                <div className="text-sm text-muted-foreground text-right">
                  (min. 16 characters) {description.length}/
                  {maxDescriptionLength}
                </div>
              </div>
            </div>
          </Card>
        </TextReveal>
        <div className="text-sm text-muted-foreground">
          Your listing description will be shown on your public listing page.
        </div>
      </div>
    </div>
  );
}
