"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function BankAccountForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [ifscDetails, setIfscDetails] = useState(null);
  const [bankName, setBankName] = useState("");
  const [isBankNameReadOnly, setIsBankNameReadOnly] = useState(false);
  const [bankDetails, setBankDetails] = useState([]);
  const fetchData = async () => {
    const userId = await localStorage.getItem("userId");
    const parsedUserId = JSON.parse(userId);
    const token = await localStorage.getItem("token");
    const parsedToken = JSON.parse(token);
    if (parsedToken) {
      try {
        const response = await fetch(
          `${API_URL}/hostData/bank/${parsedUserId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${parsedToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (!response.ok) {
          return;
        }
        if (result.data) {
          setAccountNumber(result.data.accountNumber || "");
          setIfscCode(result.data.ifsc || "");
          setAccountHolderName(result.data.name || "");
          setBankName(result.data.bankName || "");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent full page reload
    if (process.env.NEXT_PUBLIC_ENV === "dev") {
      console.log("enterr");
    }
    const formData = new FormData(e.target);
    const accountNumber = formData.get("accountNumber");
    const accountNumberRepeat = formData.get("accountNumberRepeat");

    if (accountNumber !== accountNumberRepeat) {
      toast.error("Account numbers do not match");
      return;
    }

    const payload = {
      accountNumber: accountNumber,
      ifsc: formData.get("ifscCode"),
      accountHolderName: formData.get("accountHolderName"),
      bankName: formData.get("bankName"),
    };
    if (process.env.NEXT_PUBLIC_ENV === "dev") {
      console.log("stage1", payload);
    }
    setIsSubmitting(true);
    try {
      const tokenData = await localStorage.getItem("token");
      const parsedToken = JSON.parse(tokenData);
      const hostId = await localStorage.getItem("userId");
      const parsedhost = JSON.parse(hostId);
      if (!parsedToken || !hostId) {
        toast.error("Authentication required. Please login again.");
        setIsSubmitting(false);
        return;
      }
      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log("stage2", API_URL);
      }
      const response = await fetch(`${API_URL}/hostData/bank/${parsedhost}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${parsedToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log("stage3");
      }
      if (!response.ok) {
        // Handle HTTP errors (4xx, 5xx)
        const errorText = await response.text();
        console.error("❌ HTTP Error:", response.status, errorText);
        let errorMessage = "Something went wrong!";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use the text
          errorMessage = errorText || errorMessage;
        }
        toast.error(`❌ ${errorMessage}`);
        setIsSubmitting(false);
        return;
      }
      // Parse successful response
      const responseData = await response.json();

      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log("🔍 Stage 4 - Success response:", responseData);
      }
      if (responseData.success) {
        toast.success("✅ Bank info saved successfully");
      } else {
        toast.error(
          `❌ ${responseData.message || "Failed to save bank details"}`
        );
      }
    } catch (error) {
      console.error("🚨 Network/JavaScript Error:", error);

      // More specific error messages
      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        toast.error("❌ Network error: Cannot connect to server");
      } else if (error.name === "SyntaxError") {
        toast.error("❌ Invalid response from server");
      } else {
        toast.error("❌ Something went wrong! Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIFSCBlur = async (e) => {
    const ifsc = e.target.value.toUpperCase(); // ensure uppercase
    if (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      try {
        const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
        if (response.ok) {
          const data = await response.json();
          setIfscDetails(data);
          setBankName(data.BANK);
          setIsBankNameReadOnly(true);
        } else {
          setIfscDetails(null);
          setBankName("");
          setIsBankNameReadOnly(false);
        }
      } catch {
        setIfscDetails(null);
        setBankName("");
        setIsBankNameReadOnly(false);
      }
    } else {
      setIfscDetails(null);
      setBankName("");
      setIsBankNameReadOnly(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 ">
      {/* Account Number */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="pb-6 lg:pb-0">
            <Label htmlFor="accountNumber">Account Number</Label>
          </div>
          <div>
            <Input
              id="accountNumber"
              name="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              type="password"
              required
              minLength={9}
              maxLength={18}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountNumberRepeat">Re-enter Account Number</Label>
          <Input
            id="accountNumberRepeat"
            name="accountNumberRepeat"
            type="text"
            required
            minLength={9}
            maxLength={18}
          />
        </div>
      </div>

      {/* IFSC */}
      <div className="space-y-2">
        <Label htmlFor="ifscCode">IFSC Code</Label>
        <Input
          id="ifscCode"
          name="ifscCode"
          value={ifscCode}
          onChange={(e) => setIfscCode(e.target.value)}
          required
          onBlur={handleIFSCBlur}
          pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
        />
        {ifscDetails && (
          <p className="text-sm text-green-600 mt-1">
            IFSC Valid: {ifscDetails.BANK}, {ifscDetails.BRANCH},{" "}
            {ifscDetails.CITY}
          </p>
        )}
      </div>

      {/* Holder and Bank Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountHolderName">Account Holder Name</Label>
          <Input
            id="accountHolderName"
            name="accountHolderName"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="pb-6 md:pb-0">
            <Label htmlFor="bankName">Bank Name</Label>
          </div>
          <Input
            id="bankName"
            name="bankName"
            required
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            readOnly={isBankNameReadOnly}
            className={isBankNameReadOnly ? "bg-gray-100" : ""}
          />
        </div>
      </div>

      {/* Ownership Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox id="confirmOwnership" name="confirmOwnership" required />
        <Label htmlFor="confirmOwnership">
          I hereby declare that this account belongs to me
        </Label>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-12 bg-primaryGreen hover:bg-brightGreen text-white rounded-3xl"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Updating..." : "Submit Bank Information"}
      </Button>
    </form>
  );
}
