"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { goToLogin } from "@/lib/auth-return";

interface BookingPopupProps {
  isOpen: boolean
  onClose: () => void
}



export function BookingPopup({ isOpen, onClose }: BookingPopupProps) {
  const router = useRouter()

  const handleSignIn = () => {
    goToLogin(router)
    onClose()
  }

  const handleRegister = () => {
    router.push("/register")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Account Required</DialogTitle>
          <DialogDescription>Login to your account or register to book the stay.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={handleSignIn}>
            Sign In
          </Button>
          <Button type="button" onClick={handleRegister}>
            Register
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

