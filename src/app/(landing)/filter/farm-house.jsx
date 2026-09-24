"use client";
import FilterProperties from "@/components/filter-properties";
import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PUBLIC } from "@/lib/query-presets";
import { queryKeys } from "@/lib/query-keys";
import FilterModal from "@/components/ui/modal";
import { formatSearchDate, parseSearchDate } from "@/lib/search/search-url";
import { readSearchMeta } from "@/components/search/search-summary";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function FarmHouse({ locationName }) {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const guests = searchParams.get("adults");
  const location = searchParams.get("location");
  const placeId = searchParams.get("placeId");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  // Calendar days for the API: yyyy-MM-dd links, and legacy
  // toLocaleDateString() links ("24/9/2026") that new Date() cannot read.
  const fromDay = formatSearchDate(parseSearchDate(from)) || undefined;
  const toDay = formatSearchDate(parseSearchDate(to)) || undefined;
  const senior = searchParams.get("senior");
  const child = searchParams.get("children");
  const infants = searchParams.get("infants");
  const property = searchParams.get("propertyType");
  const minPrice = searchParams.get("priceMin");
  const maxPrice = searchParams.get("priceMax");
  const placeType = searchParams.get("placeType");
  const beds = searchParams.get("beds");
  const bedrooms = searchParams.get("bedrooms");
  const bathrooms = searchParams.get("bathrooms");
  const bookingType = searchParams.get("bookingType");
  const checkinType = searchParams.get("checkinType");
  const pets = searchParams.get("pets");
  const amenities = searchParams.get("amenities");
  const { modalFilter, openModal, closeModal, toggleModal } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const LIMIT = 16;
  // The full query string is the cache key, so every filter (not just the
  // five the old effect listed) triggers a fresh search, and coming back to
  // the same search paints from cache.
  const paramsString = searchParams.toString();

  const array = amenities
    ? amenities
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x)
    : [];

  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("arry", array);
  }

  const {
    data: result,
    isPending: loading,
    isPlaceholderData,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.search(paramsString, currentPage),
    queryFn: async () => {
        const response = await axios.get(
          `${API_URL}/properties/search-properties`,
          {
            params: {
              location: locationName ? locationName : location || undefined,
              placeId: locationName ? undefined : placeId || undefined,
              lat: locationName ? undefined : lat || undefined,
              lng: locationName ? undefined : lng || undefined,
              from: fromDay && toDay ? fromDay : undefined,
              to: fromDay && toDay ? toDay : undefined,
              guests: guests,
              propertyType: property,
              minPrice: minPrice,
              maxPrice: maxPrice,
              placeType: placeType,
              beds: beds,
              bedrooms: bedrooms,
              bathrooms: bathrooms,
              checkinType: checkinType,
              bookingType: bookingType,
              pets: pets,
              amenities: array,
              page: currentPage,
              limit: LIMIT,
            },
          },
        );

        if (process.env.NEXT_PUBLIC_ENV === "dev") {
          console.log("Available properties:", response.data.data);
        }
        return {
          data: Array.isArray(response.data?.data) ? response.data.data : [],
          pagination: response.data?.pagination ?? null,
          search: readSearchMeta(response.data?.search),
        };
    },
    ...PUBLIC,
    staleTime: 2 * 60 * 1000,
    // Page changes keep the previous rows on screen (dimmed) instead of a
    // full-height spinner.
    placeholderData: keepPreviousData,
  });
  const data = result?.data ?? [];
  const pagination = result?.pagination ?? null;
  const search = result?.search ?? null;
  useEffect(() => {
    setCurrentPage(1);
  }, [paramsString]);
  const { setAddPropertyType } = useAuth();
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("now", data);
  }
  useEffect(() => {
    if (property) {
      setAddPropertyType(property);
    }
  }, [property, setAddPropertyType]);
  return (
    <div>
      {/* Add a Toaster component here as well for immediate visibility */}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryGreen"></div>
        </div>
      ) : (
        <>
          {modalFilter && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-40"></div>
          )}
          <div
            className={
              isPlaceholderData || isFetching
                ? "px-2 opacity-60 transition-opacity"
                : "px-2 transition-opacity"
            }
          >
            <FilterProperties
              properties={data}
              search={search}
              totalCount={pagination?.totalCount ?? data.length}
              hasDates={!!(fromDay && toDay)}
              isError={isError && !data.length}
              onRetry={() => refetch()}
              from={from}
              to={to}
              guests={guests}
              location={location}
              senior={senior}
              child={child}
              infants={infants}
              property={property}
            />
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2 flex-wrap mb-24">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-2 border rounded disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1,
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded ${
                    currentPage === page
                      ? "bg-primaryGreen text-white"
                      : "bg-white"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === pagination.totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))
                }
                className="px-3 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
          {/* <FilterModal
            isOpen={modalFilter}
            onClose={closeModal}
            propertySelected={property}
            page={true}
          /> Double filter modal one behind the other*/}
        </>
      )}
    </div>
  );
}
