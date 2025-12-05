"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Percent } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export function MembershipPopup({ open, onOpenChange, onClose }) {
  const [hostData, setHostData] = useState([]);
  const fetchHostData = async () => {
    console.log("enter here");
    const getLocalData = await localStorage.getItem("token");
    const data = JSON.parse(getLocalData);
    const userData = await localStorage.getItem("userId");
    const userId = JSON.parse(userData);
    if (data) {
      try {
        const response = await fetch(`${API_URL}/hostData/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data}`,
          },
        });
        // console.log("djfjdf", await response.json());
        if (!response.ok) {
          return;
        }
        const result = await response.json();
        return result.data;
      } catch (err) {
        console.error(err);
      }
    }
  };
  useEffect(() => {
    async function fetchData() {
      const data = await fetchHostData();
      setHostData(data);
    }
    fetchData();
  }, []);
  const handleClose = () => {
    onOpenChange(false);
    onClose();
  };

  console.log(" found h", hostData);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primaryGreen to-brightGreen p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-medium text-center">
              Congratulations! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-center">
            <Badge
              variant="secondary"
              className="mb-2 bg-white text-emerald-700"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Exclusive Offer
            </Badge>
            <h3 className="text-3xl font-semibold mt-2">3 Months Free</h3>
            {/* <p className="text-xl mt-1">Host Membership at  ₹99 </p> */}
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4 text-center">
            <div className="flex items-center pl-8">
              <span className="text-gray-500 text-xl line-through">
                3% commission
              </span>
              <span className="font-semibold text-xl text-brightGreen flex items-center">
                <Percent className="h-4 w-4 mr-1" />
                0% commission
              </span>
            </div>
            <p className="text-base text-gray-600">Only on Majestic Escape</p>
          </div>
          <div className="space-y-4 text-center">
            <p className="text-base text-gray-600">
              {hostData.kyc
                ? "You have now unlocked this offer"
                : "To avail the offer, complete KYC now."}
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              href={"/host/dashboard"}
              className="text-white flex justify-center items-center  text-center w-full  h-10 rounded-3xl bg-primaryGreen hover:brightGreen mt-6"
              onClick={() => onOpenChange(false)}
            >
              Go to Dashboard
            </Link>
            {hostData.kyc ? null : (
              <Link
                href={"/host/dashboard/kyc"}
                className="text-white flex justify-center items-center  text-center w-full  h-10 rounded-3xl bg-primaryGreen hover:brightGreen mt-6"
                onClick={() => onOpenChange(false)}
              >
                Verify KYC
              </Link>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
