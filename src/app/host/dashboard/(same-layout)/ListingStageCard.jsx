"use client";

import React from "react";
import Link from "next/link";
import {
  PlusSquare,
  FileEdit,
  CheckSquare,
  ListChecks,
  RefreshCw, // refresh icon from lucide-react
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { USER } from "@/lib/query-presets";
import { queryKeys } from "@/lib/query-keys";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const stageConfig = {
  noListings: {
    title: "No Listings Present",
    description:
      "Start by adding your first property listing to attract potential guests.",
    ctaText: "Add listing",
    ctaLink: "/host/dashboard/add-listing",
    icon: PlusSquare,
    color: "text-red-300 bg-red-100 border-red-500",
  },
  incompleteListings: {
    title: "Listing In Progress",
    description:
      "Continue setting up your property listing to attract potential guests.",
    ctaText: "Continue setup",
    ctaLink: "/host/dashboard/add-listing",
    icon: FileEdit,
    color: "text-primaryGreen bg-green-100 border-primaryGreen",
  },
  pendingListings: {
    title: "Listings Pending",
    description: "Your listings are under review. Please wait for approval.",
    ctaText: "Add more listing",
    ctaLink: "/host/dashboard/add-listing",
    icon: ListChecks,
    color: "text-primaryGreen bg-green-100 border-primaryGreen",
  },
  activeListings: {
    title: "Listings Active",
    description:
      "Your listings are active. Add more properties to increase your reach.",
    ctaText: "Add new listing",
    ctaLink: "/host/dashboard/add-listing",
    icon: CheckSquare,
    color: "text-primaryGreen bg-green-100 border-primaryGreen",
  },
  mixedListings: {
    title: "Listings Overview",
    description: "Continue adding more to the property listings.",
    ctaText: "Add more listing",
    ctaLink: "/host/dashboard/add-listing",
    icon: ListChecks,
    color: "text-primaryGreen bg-green-100 border-primaryGreen",
  },
};

// Skeleton component to show while data is loading
function SkeletonCard() {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-6 w-32 bg-gray-300 rounded animate-pulse" />
        <div className="h-6 w-6 bg-gray-300 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-8 w-1/2 bg-gray-300 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ListingStageCard() {
  const auth = useAuth();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: queryKeys.listingStatus(auth?.user?.email),
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/prop-listing/status?email=${auth.user.email}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    enabled: !!auth?.user?.email, // Only run the query if the user exists.
    // USER preset: cached for a minute (dashboard → listings → dashboard no
    // longer refetches), revalidated on focus and by add/edit-listing.
    ...USER,
    // Uncomment the line below to poll every 5 seconds, if needed.
    // refetchInterval: 5000,
  });

  // Show the skeleton while loading data.
  if (isLoading) return <SkeletonCard />;

  if (error) {
    console.error("Error fetching listing status:", error);
    return null; // Optionally render an error UI.
  }

  // Map the fetched status to the corresponding configuration.
  const stage = stageConfig[data?.status] || stageConfig.noListings;
  const { title, description, ctaText, ctaLink, icon: Icon, color } = stage;

  return (
    <Card className={` bg-white`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium text-absoluteDark font-bricolage">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Icon className={`h-6 w-6 ${color}`} />
          {/* Refresh button to manually trigger refetch() */}
          <button
            onClick={() => refetch()}
            className="p-1 rounded-full hover:bg-gray-200"
            title="Refresh Listing Status"
          >
            <RefreshCw className="h-4 w-4 text-gray-500" />
          </button>
        </div>
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
