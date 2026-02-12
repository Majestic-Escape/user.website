"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
interface ConfirmCancelDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  //   choice: string;
}

const WarningDialog = ({
  open,
  onClose,
  onConfirm,
  //   choice,
}: ConfirmCancelDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <TriangleAlert />
            <span className="pl-2">Warning</span>
          </DialogTitle>

          <DialogDescription>
            Any changes here will send your property for review and temporary
            unlisting. Are you sure you want to continue?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onConfirm}>Yes</Button>
          <Button variant="outline" onClick={onClose}>
            No
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WarningDialog;
