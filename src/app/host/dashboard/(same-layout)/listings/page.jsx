"use client";
import { useState } from "react";
import { HostListingsTable } from "./host-listings-table";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import Link from "next/link";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export default function HostListingsPage() {
  const auth = useAuth();
  const userEmail = auth.user.email;
  // const [show, setShow] = useState(false);

  // const checkKycVerification = async () => {
  //   try {
  //     const userId = JSON.parse(localStorage.getItem("userId"));
  //     const getLocalData = await localStorage.getItem("token");
  //     const data = JSON.parse(getLocalData);

  //     if (data) {
  //       const response = await fetch(`${API_URL}/hosts/single/${userId}`, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${data}`,
  //         },
  //       });

  //       if (!response.ok) {
  //         return;
  //       }

  //       const result = await response.json();
  //       console.log("numb", result);
  //       setShow(result.kyc);
  //       return result;
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  // useEffect(() => {
  //   checkKycVerification();
  // }, []);

  return (
    <div className="w-full py-10">
      <h1 className="text-2xl font-bold font-bricolage mb-5">Your Listings</h1>

      <HostListingsTable userEmail={userEmail} />
      {/* ) : (
        <p className="text-base">
          Verify your kyc first to unlock listing.{" "}
          <Link className="underline" href="/host/dashboard/kyc">
            Click here
          </Link>{" "}
          to verify now
        </p>
      )} */}
    </div>
  );
}
