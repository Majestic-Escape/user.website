"use client"

import { useState, useActionState } from "react";
import { updateBankInfo } from "./updateBankInfo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

export function BankAccountForm() {
  const [state, formAction] = useActionState(updateBankInfo, null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ifscDetails, setIfscDetails] = useState(null)
  const [bankName, setBankName] = useState("")
  const [isBankNameReadOnly, setIsBankNameReadOnly] = useState(false)

  const handleSubmit = (formData) => {
    setIsSubmitting(true)
    toast.success("Bank information updated successfully")

    // formAction(formData)
    setIsSubmitting(false)
  }

  const handleIFSCBlur = async (e) => {
    const ifsc = e.target.value
    if (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      try {
        const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`)
        if (response.ok) {
          const data = await response.json()
          setIfscDetails(data)
          setBankName(data.BANK)
          setIsBankNameReadOnly(true)
        } else {
          setIfscDetails(null)
          setBankName("")
          setIsBankNameReadOnly(false)
        }
      } catch (error) {
        setIfscDetails(null)
        setBankName("")
        setIsBankNameReadOnly(false)
      }
    } else {
      setIfscDetails(null)
      setBankName("")
      setIsBankNameReadOnly(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
          Account Number
        </Label>
        <Input
          id="accountNumber"
          name="accountNumber"
          type="text"
          required
          minLength={9}
          maxLength={18}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ifscCode" className="text-sm font-medium text-gray-700">
          IFSC Code
        </Label>
        <Input
          id="ifscCode"
          name="ifscCode"
          required
          pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
          onBlur={handleIFSCBlur}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
        {ifscDetails && (
          <p className="text-sm text-green-600 mt-1">
            IFSC Valid: {ifscDetails.BANK}, {ifscDetails.BRANCH}, {ifscDetails.CITY}
          </p>
        )}
      </div>

      </div>

      <div className="grid grid-cols-2 gap-4">

    
      <div className="space-y-2">
        <Label htmlFor="accountHolderName" className="text-sm font-medium text-gray-700">
          Account Holder Name
        </Label>
        <Input
          id="accountHolderName"
          name="accountHolderName"
          required
          minLength={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">
          Bank Name
        </Label>
        <Input
          id="bankName"
          name="bankName"
          required
          minLength={2}
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          readOnly={isBankNameReadOnly}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${isBankNameReadOnly ? "bg-gray-100" : ""}`}
        />
      </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="confirmOwnership" name="confirmOwnership" required />
        <Label htmlFor="confirmOwnership" className="text-sm text-gray-700">
          I hereby declare that this account belongs to me
        </Label>
      </div>
      <Button
        type="submit"
        className="w-full py-2 px-4 border border-transparent  h-12 rounded-3xl shadow-sm text-sm font-medium text-white bg-primaryGreen hover:bg-brightGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Updating..." : "Update Bank Information"}
      </Button>
      {state?.error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state?.success && (
        <Alert className="mt-4">
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      )}
    </form>
  )
}

