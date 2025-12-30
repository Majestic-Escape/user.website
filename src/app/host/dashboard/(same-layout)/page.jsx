/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CalendarCheck,
  DollarSign,
  Home,
  Star,
  AlertTriangle,
  MessageSquare,
  PlusCircle,
  FileCheck,
  PlusSquareIcon,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import ListingStageCard from "./ListingStageCard";
import { kycService } from "../../../../services/kycService";
import { useEffect } from "react";
// import { useCheckToken } from "@/services/useCheckToken";
export default function Dashboard() {
  const [exist, setExist] = useState(false);
  const [form, setForm] = useState();
  const [loading, setLoading] = useState(true);

  // const { checkToken } = useCheckToken();

  // useEffect(() => {
  //   const verify = async () => {
  //     await checkToken();
  //   };
  //   verify();
  // }, []);
  useEffect(() => {
    const checkIfKycProcessStarted = async () => {
      try {
        const getUserId = await localStorage.getItem("userId");
        const userId = JSON.parse(getUserId);
        if (userId) {
          const response = await kycService.getFormData(userId);

          if (process.env.NEXT_PUBLIC_ENV === "dev") {
            console.log("doomd", response);
          }
          setExist(true);
          setForm(response.data);
          return result.data;
        }
      } catch (error) {
        console.error("Could not get data");
      } finally {
        setLoading(false);
      }
    };
    checkIfKycProcessStarted();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-20 w-20 animate-spin rounded-full border-b-2 border-current"></div>
      </div>
    );
  }
  return (
    <div className="space-y-4 pb-16 grid grid-cols-1">
      <div
        className={`grid grid-cols-1 gap-4 ${
          exist ? "md:grid-cols-2" : "md:grid-cols-2"
        }`}
      >
        <div className="space-y-4">
          <ListingStageCard />
        </div>

        {exist && form?.status == "processing" ? (
          <>
            {/* <Card className=" bg-white border-green-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-absoluteDark font-bricolage">
                  Adjust Availability
                </CardTitle>
                <Calendar className="h-6 w-6 text-primaryGreen" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone mb-4">
                  Sync in your calendar with us to adjust availability
                </p>
                <Link
                  href={"/host/dashboard/calendar"}
                  className="bg-green-50 border text-sm font-medium py-2 px-4 rounded mt-2  border-primaryGreen hover:text-green-500 text-primaryGreen hover:bg-green-100"
                >
                  Go to Calendar
                </Link>
              </CardContent>
            </Card> */}

            {/* <Card className=" bg-white border-green-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-absoluteDark font-bricolage">
                  Add Bank details
                </CardTitle>
                <Calendar className="h-6 w-6 text-primaryGreen" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone mb-4">
                  Add your bank details to receive payments
                </p>
                <Link
                  href={"/host/dashboard/bank-info"}
                  className="bg-green-50 border text-sm font-medium py-2 px-4 rounded mt-2  border-primaryGreen hover:text-green-500 text-primaryGreen hover:bg-green-100"
                >
                  Setup payments
                </Link>
              </CardContent>
            </Card> */}
            <Card className=" bg-white border-red-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-absoluteDark font-bricolage">
                  Continue with KYC
                </CardTitle>
                <FileCheck className="h-6 w-6 text-red-300" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone mb-4">
                  Complete your KYC to start listing properties.
                </p>
                <Link
                  href={{
                    pathname: `/host/dashboard/kyc-edit/${form._id}`,
                  }}
                  className="bg-red-50 border text-sm font-medium py-2 px-4 rounded mt-2  border-red-500 hover:text-red-500 text-red-500 hover:bg-red-100"
                >
                  Continue with KYC Process
                </Link>
              </CardContent>
            </Card>
          </>
        ) : form?.status == "completed" ? (
          <>
            {/* <Card className=" bg-white border-green-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-absoluteDark font-bricolage">
                  Add Bank details
                </CardTitle>
                <Calendar className="h-6 w-6 text-primaryGreen" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone mb-4">
                  Add your bank details to receive payments
                </p>
                <Link
                  href={"/host/dashboard/bank-info"}
                  className="bg-green-50 border text-sm font-medium py-2 px-4 rounded mt-2  border-primaryGreen hover:text-green-500 text-primaryGreen hover:bg-green-100"
                >
                  Setup payments
                </Link>
              </CardContent>
            </Card> */}
            {/* <Card className=" bg-white border-green-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-absoluteDark font-bricolage">
                  Starting Listing Your Properties
                </CardTitle>
                <Calendar className="h-6 w-6 text-primaryGreen" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone mb-4">
                  Create your first property now.
                </p>
                <Link
                  href={"/host/dashboard/add-listing"}
                  className="bg-green-50 border text-sm font-medium py-2 px-4 rounded mt-2  border-primaryGreen hover:text-green-500 text-primaryGreen hover:bg-green-100"
                >
                  Add Property
                </Link>
              </CardContent>
            </Card> */}
          </>
        ) : (
          <Card className=" bg-white border-red-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-absoluteDark font-bricolage">
                Complete KYC
              </CardTitle>
              <FileCheck className="h-6 w-6 text-red-300" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-stone mb-4">
                Complete your KYC to start listing properties.
              </p>
              <Link
                href={"/host/dashboard/kyc"}
                className="bg-red-50 border text-sm font-medium py-2 px-4 rounded mt-2  border-red-500 hover:text-red-500 text-red-500 hover:bg-red-100"
              >
                Start KYC Process
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">0</div> */}
            <p className="text-xs text-muted-foreground">No bookings yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">₹1,45,231</div> */}
            <p className="text-xs text-muted-foreground">No revenue yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Listings
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"></div>
            <p className="text-xs text-muted-foreground">0 listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"></div>
            <p className="text-xs text-muted-foreground">No properties yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
