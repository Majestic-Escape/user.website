"use client";

import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: number;
    title: string;
    name?: string;
    photos: string[];
    location: string;
  };
}

export default function ShareDialog({
  isOpen,
  onClose,
  property,
}: ShareDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const getShareUrl = () => {
    return `https://majesticescape.in/property/${property.id}`;
  };

  const handleShare = async (method: string) => {
    const shareUrl = getShareUrl();
    try {
      if (method === "copy") {
        await navigator.clipboard.writeText(shareUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        // Handle other share methods (email, whatsapp, etc.)

        if (process.env.NEXT_PUBLIC_ENV === "dev") {
          console.log(`Sharing via ${method}:`, shareUrl);
        }
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (!mounted) return null;

  const content = (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Image
          width={48}
          height={48}
          src={property?.photos[0]}
          alt={property.title || property.name || ""}
          className="w-12 h-12 rounded-md object-cover"
        />
        <span className="text-sm font-medium">
          {property.title || property.name}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => handleShare("copy")}>
          <Image
            src="/icons/copy-link.svg"
            width={20}
            height={20}
            alt="Copy"
            className="mr-2"
          />
          {copySuccess ? "Copied!" : "Copy Link"}
        </Button>
        <Button variant="outline" onClick={() => handleShare("email")}>
          <Image
            src="/icons/mail.svg"
            width={20}
            height={20}
            alt="Email"
            className="mr-2"
          />
          Email
        </Button>
        <Button variant="outline" onClick={() => handleShare("messages")}>
          <Image
            src="/icons/message.svg"
            width={20}
            height={20}
            alt="Messages"
            className="mr-2"
          />
          Messages
        </Button>
        <Button variant="outline" onClick={() => handleShare("whatsapp")}>
          <Image
            src="/icons/whatsapp.svg"
            width={20}
            height={20}
            alt="WhatsApp"
            className="mr-2"
          />
          WhatsApp
        </Button>
        <Button variant="outline" onClick={() => handleShare("messenger")}>
          <Image
            src="/icons/messenger.svg"
            width={20}
            height={20}
            alt="Messenger"
            className="mr-2"
          />
          Messenger
        </Button>
        <Button variant="outline" onClick={() => handleShare("instagram")}>
          <Image
            src="/icons/instagram.svg"
            width={20}
            height={20}
            alt="Instagram"
            className="mr-2"
          />
          Instagram
        </Button>
        <Button variant="outline" onClick={() => handleShare("twitter")}>
          <Image
            src="/icons/twitter.svg"
            width={20}
            height={20}
            alt="Twitter"
            className="mr-2"
          />
          Twitter
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader className="mb-4">
              <SheetTitle>Share this experience</SheetTitle>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this experience</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    </div>
  );
}
