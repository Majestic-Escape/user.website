"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlusSquare, FileEdit, CheckSquare, ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const stageConfig = {
  noListings: {
    title: "No Listings Present",
    description:
      "Start by adding your first property listing to attract potential guests.",
    ctaText: "Add listing",
    ctaLink: "/host/dashboard/add-listing",
    icon: PlusSquare,
    color: "text-red-300 border-red-500",
  },
  incompleteListings: {
    title: "Listing In Progress",
    description:
      "Continue setting up your property listing to attract potential guests.",
    ctaText: "Resume listing",
    ctaLink: "/host/dashboard/resume-listing",
    icon: FileEdit,
    color: "text-green-300 border-green-500",
  },
  pendingListings: {
    title: "Listings Pending",
    description: "Your listings are under review. Please wait for approval.",
    ctaText: "View listings",
    ctaLink: "/host/dashboard/listings",
    icon: ListChecks,
    color: "text-green-300 border-green-500",
  },
  activeListings: {
    title: "Listings Active",
    description:
      "Your listings are live. Add more properties to increase your reach.",
    ctaText: "Add new listing",
    ctaLink: "/host/dashboard/add-listing",
    icon: CheckSquare,
    color: "text-green-300 border-green-500",
  },
  mixedListings: {
    title: "Listings Overview",
    description: "You have a mix of active, pending, and incomplete listings.",
    ctaText: "Add listings",
    ctaLink: "/host/dashboard/listings",
    icon: ListChecks,
    color: "text-green-300 border-green-500",
  },
};

export default function ListingStageCard() {
  const [stage, setStage] = useState(null);
  const auth = useAuth();

  useEffect(() => {
    async function fetchListingStatus() {
      try {
        const response = await fetch(
          `${API_URL}/prop-listing/status?email=${auth.user.email}`
        );
        const data = await response.json();
        if (process.env.NEXT_PUBLIC_ENV === "dev") {
          console.log(data, "Data");
        }
        switch (data.status) {
          case "noListings":
            setStage(stageConfig.noListings);
            break;
          case "incompleteListings":
            setStage(stageConfig.incompleteListings);
            break;
          case "pendingListings":
            setStage(stageConfig.pendingListings);
            break;
          case "activeListings":
            setStage(stageConfig.activeListings);
            break;
          case "mixedListings":
            setStage(stageConfig.mixedListings);
            break;
          default:
            setStage(stageConfig.noListings);
        }
      } catch (error) {
        console.error("Error fetching listing status:", error);
        setStage(stageConfig.noListings);
      }
    }

    fetchListingStatus();
  }, []);

  if (!stage) return null;

  const { title, description, ctaText, ctaLink, icon: Icon, color } = stage;

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium text-absoluteDark font-bricolage">
          {title}
        </CardTitle>
        <Icon className={`h-6 w-6 ${color}`} />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-stone mb-4">{description}</p>
        <Link
          href={ctaLink}
          className={`bg-gray-50 border text-sm font-medium py-2 px-4 rounded mt-2 ${color} hover:bg-gray-100`}
        >
          {ctaText}
        </Link>
      </CardContent>
    </Card>
  );
}
