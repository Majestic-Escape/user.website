"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmCancelDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  choice: string;
  // Optional — callers that pass none render exactly as before.
  title?: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  // "danger": the confirm action can't be undone (red, AA contrast).
  tone?: "default" | "danger";
  // While the confirm request is in flight: both buttons are locked, the
  // dialog can't be dismissed, and the confirm button says what's happening.
  pending?: boolean;
  pendingLabel?: string;
}

const ConfirmCancelDialog = ({
  open,
  onClose,
  onConfirm,
  choice,
  title,
  description,
  confirmLabel = "Yes",
  cancelLabel = "No",
  tone = "default",
  pending = false,
  pendingLabel,
}: ConfirmCancelDialogProps) => {
  const danger = tone === "danger";
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !pending) onClose();
      }}
    >
      <DialogContent
        className={danger ? "w-[calc(100%-2rem)] rounded-xl sm:max-w-md" : undefined}
        onEscapeKeyDown={(e) => pending && e.preventDefault()}
        onPointerDownOutside={(e) => pending && e.preventDefault()}
      >
        <DialogHeader>
          {title ? (
            <DialogTitle>{title}</DialogTitle>
          ) : choice == "Unblock" ? (
            <DialogTitle>{choice} the dates</DialogTitle>
          ) : (
            <DialogTitle>{choice} Your Booking</DialogTitle>
          )}
          <DialogDescription asChild={typeof description !== "string" && !!description}>
            {description ?? "Are you sure you want to continue?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className={danger ? "gap-2 sm:gap-0" : undefined}>
          <Button
            onClick={onConfirm}
            disabled={pending}
            aria-busy={pending || undefined}
            className={
              danger
                ? "min-h-[44px] bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:min-h-[36px]"
                : undefined
            }
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                {pendingLabel ?? confirmLabel}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={pending}
            className={danger ? "min-h-[44px] sm:min-h-[36px]" : undefined}
          >
            {cancelLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmCancelDialog;
