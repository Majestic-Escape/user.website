"use client";
import FilterProperties from "@/components/filter-properties";
import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import FilterModal from "@/components/ui/modal";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function FarmHouse() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const guests = searchParams.get("adults");
  const location = searchParams.get("location");
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { modalFilter, openModal, closeModal, toggleModal } = useAuth();

  const array = amenities
    ? amenities
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x)
    : [];

  console.log("arry", array);

  useEffect(() => {
    async function fetchDates() {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/properties/search-properties`,
          {
            params: {
              location: location,
              from: from ? new Date(from).toISOString() : undefined,
              to: to ? new Date(to).toISOString() : undefined,
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
            },
          }
        );

        console.log("Available properties:", response.data.data);
        await setData(response.data.data);
      } catch (err) {
        console.error("Frontend fetch error:", err);
        // Show different error messages based on error type
      } finally {
        setLoading(false);
      }
    }

    fetchDates();
  }, [
    from,
    to,
    guests,
    location,
    property,
    minPrice,
    maxPrice,
    placeType,
    beds,
    bedrooms,
    bathrooms,
    checkinType,
    bookingType,
    pets,
  ]);
  const { setAddPropertyType } = useAuth();
  console.log("now", data);
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
          <FilterProperties
            properties={data}
            from={from}
            to={to}
            guests={guests}
            location={location}
            senior={senior}
            child={child}
            infants={infants}
            property={property}
          />
          <FilterModal
            isOpen={modalFilter}
            onClose={closeModal}
            propertySelected={property}
            page={true}
          />
        </>
      )}
    </div>
  );
}
