"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TextReveal } from "@/components/text-reveal";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function LocationForm({ updateFormData, formData }) {
  const [address, setAddress] = useState(
    formData?.address || {
      street: "",
      district: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      latitude: "",
      longitude: "",
      registrationNumber: "",
    }
  );

  const [registrationNumberError, setRegistrationNumberError] = useState("");
  const [registrationNumberLoading, setRegistrationNumberLoading] =
    useState(false);
  // New state for valid registration number (false by default, or from formData)
  const [validRegistrationNo, setValidRegistrationNo] = useState(
    formData?.validRegistrationNo || false
  );
  useEffect(() => {
    setAddress((prev) => ({
      ...prev,
      registrationNumber: "",
    }));
  }, [address.state]);
  const [locationStatus, setLocationStatus] = useState({
    loading: false,
    error: null,
    showApproxLocation: false,
    permissionState: null,
  });
  const [mapCenter, setMapCenter] = useState({ lat: 15.2993, lng: 74.124 }); // Centered on Goa
  const [searchValue, setSearchValue] = useState("");
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const googleMapsRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setLocationStatus((prev) => ({
        ...prev,
        error:
          "Google Maps API key is not configured. Please check your environment variables.",
      }));
      return;
    }
    checkPermissionStatus();
    loadGoogleMapsScript();
  }, []);

  const loadGoogleMapsScript = () => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    script.onerror = () => {
      setLocationStatus((prev) => ({
        ...prev,
        error:
          "Failed to load Google Maps. Please check your internet connection and try again.",
      }));
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    googleMapsRef.current = window.google.maps;
    mapInstanceRef.current = new googleMapsRef.current.Map(mapRef.current, {
      center: mapCenter,
      zoom: 12,
    });

    markerRef.current = new googleMapsRef.current.Marker({
      map: mapInstanceRef.current,
      position: mapCenter,
      draggable: true,
    });

    googleMapsRef.current.event.addListener(
      markerRef.current,
      "dragend",
      handleMarkerDragEnd
    );

    autocompleteRef.current = new googleMapsRef.current.places.Autocomplete(
      document.getElementById("address-input"),
      {
        componentRestrictions: { country: "IN" },
        bounds: new googleMapsRef.current.LatLngBounds(
          new googleMapsRef.current.LatLng(14.8, 73.6), // SW corner of Goa
          new googleMapsRef.current.LatLng(15.8, 74.3) // NE corner of Goa
        ),
        strictBounds: true,
      }
    );

    autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
  };

  const handleMarkerDragEnd = () => {
    const position = markerRef.current.getPosition();
    const lat = position.lat();
    const lng = position.lng();

    setMapCenter({ lat, lng });
    updateAddressFromCoordinates(lat, lng);
  };

  const updateAddressFromCoordinates = (lat, lng) => {
    const geocoder = new googleMapsRef.current.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const place = results[0];
        updateAddressFromPlace(place);
      }
    });
  };

  const updateAddressFromPlace = (place) => {
    const newAddress = {
      street: "",
      district: "",
      city: "",
      state: "",
      pincode: "",
      country: "India - IN",
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      // Preserve the registration number if it was already entered
      registrationNumber: address.registrationNumber,
    };

    place.address_components.forEach((component) => {
      if (component.types.includes("route"))
        newAddress.street = component.long_name;
      if (component.types.includes("sublocality_level_1"))
        newAddress.district = component.long_name;
      if (component.types.includes("locality"))
        newAddress.city = component.long_name;
      if (component.types.includes("administrative_area_level_1"))
        newAddress.state = component.long_name;
      if (component.types.includes("postal_code"))
        newAddress.pincode = component.long_name;
    });

    setAddress(newAddress);
    updateFormData({ address: newAddress });
    setSearchValue(place.formatted_address);
  };

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place.geometry) return;

    setMapCenter({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
    updateMap(place.geometry.location.lat(), place.geometry.location.lng());
    updateAddressFromPlace(place);
  };

  const updateMap = (lat, lng) => {
    if (mapInstanceRef.current && markerRef.current && googleMapsRef.current) {
      mapInstanceRef.current.setCenter({ lat, lng });
      mapInstanceRef.current.setZoom(15);
      markerRef.current.setPosition({ lat, lng });
    }
  };

  const checkPermissionStatus = async () => {
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        setLocationStatus((prev) => ({
          ...prev,
          permissionState: permission.state,
        }));
      } catch (error) {
        console.error("Error checking geolocation permission:", error);
        setLocationStatus((prev) => ({
          ...prev,
          error: "Error checking location permission",
        }));
      }
    }
  };

  const getCurrentLocation = async () => {
    if (locationStatus.permissionState === "denied") {
      setLocationStatus((prev) => ({
        ...prev,
        error: "Location access denied",
      }));
      return;
    }

    setLocationStatus((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      setMapCenter({ lat: latitude, lng: longitude });
      updateMap(latitude, longitude);
      updateAddressFromCoordinates(latitude, longitude);

      setLocationStatus((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.log(error);
      setLocationStatus((prev) => ({
        ...prev,
        loading: false,
        error: "Error getting current location",
      }));
    }
  };

  // Function to check registration number with the backend
  const checkRegistrationNumber = async (number) => {
    setRegistrationNumberLoading(true);
    try {
      // Assuming a GET request with a query parameter
      if (address.state == "Goa") {
        const response = await fetch(
          `${API_BASE_URL}/property-registration-no/${number}`
        );

        console.log(response);

        if (!response.ok) {
          const data = await response.json();
          console.log(data);
          setRegistrationNumberError(data?.message);
          setValidRegistrationNo(false);
          updateFormData({ validRegistrationNo: false });
        } else {
          const data = await response.json();
          if (!data.exists) {
            setRegistrationNumberError(data?.message);
            setValidRegistrationNo(false);
            updateFormData({ validRegistrationNo: false });
          } else {
            setRegistrationNumberError("");
            setValidRegistrationNo(true);
            updateFormData({ validRegistrationNo: true });
          }
        }
      } else {
        setRegistrationNumberError("");
        setValidRegistrationNo(true);
        updateFormData({ validRegistrationNo: true });
      }
    } catch (error) {
      console.error("Error checking registration number:", error);
      setRegistrationNumberError("Error verifying registration number");
      setValidRegistrationNo(false);
      updateFormData({ validRegistrationNo: false });
    } finally {
      setRegistrationNumberLoading(false);
    }
  };

  // This function manages registration number input:
  // 1. It automatically ensures that the value always starts with "HOT"
  // 2. It limits the input to 10 characters.
  // 3. When 10 characters are reached, it validates the format using the regex and checks with the backend.
  const handleRegistrationInputChange = (e) => {
    let value = e.target.value.toUpperCase();

    // Ensure the fixed prefix "HOT" remains at the start.

    // Limit total length to 10 characters.
    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    const newAddress = { ...address, registrationNumber: value };
    setAddress(newAddress);
    // Reset validRegistrationNo to false on change until verified again.
    setValidRegistrationNo(false);
    updateFormData({ address: newAddress, validRegistrationNo: false });

    // Regex for validation: total 10 characters, starting with HOT and ending with at least one digit.
    const regEx = /^(?=.{10}$)(?:[A-Z0-9]*)(\d+)$/;
    //  const regEx = /^(?=.{10}$)HOT(?:[A-Z0-9]*)(\d+)$/;
    if (value.length === 10) {
      if (!regEx.test(value)) {
        setRegistrationNumberError("Invalid registration number format");
      } else {
        // Valid format: clear error then check existence on the backend.
        setRegistrationNumberError("");
        checkRegistrationNumber(value);
      }
    } else {
      // Clear error if the input is incomplete.
      setRegistrationNumberError("");
    }
  };

  // Retain manual input changes for other address fields.
  const handleManualInputChange = (key, value) => {
    const newAddress = { ...address, [key]: value };
    setAddress(newAddress);
    updateFormData({ address: newAddress });
  };
  const INDIA_STATES_AND_UT = [
    // 28 States
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    // 8 Union Territories
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];
  console.log("sjadjaaa", address, formData);
  return (
    <div className="max-w-4xl mx-auto p-6">
      <TextReveal>
        <div className="mb-8">
          <h2 className="text-2xl font-bricolage font-semibold mb-2">
            Where's your place located?
          </h2>
          <p className="text-gray-600">
            Your address is only shared with guests after they've made a
            reservation.
          </p>
        </div>
      </TextReveal>

      {locationStatus.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{locationStatus.error}</AlertDescription>
        </Alert>
      )}

      {locationStatus.showApproxLocation && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center">
            <div className="bg-rose-100 p-3 rounded-full">
              <MapPin className="text-rose-500" />
            </div>
            <p className="ml-3">We'll share your approximate location.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-x-8 justify-between items-start md:flex-row gap-y-4">
        <div className="md:w-1/2">
          <TextReveal>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  id="address-input"
                  type="text"
                  placeholder="Enter your address in Goa"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full h-12 p-4 border rounded-t-lg"
                />
                <Button
                  onClick={getCurrentLocation}
                  disabled={locationStatus.loading}
                  className="w-full mt-2 p-4 h-12 flex items-center justify-center gap-2 text-absoluteDark bg-gray-100 border border-gray-400 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  {locationStatus.loading ? (
                    <Loader2 className="text-absoluteDark animate-spin" />
                  ) : (
                    <>
                      <Navigation className="text-absoluteDark inline-block" />
                      <span className="text-absoluteDark">
                        {locationStatus.permissionState === "prompt"
                          ? "Allow location access"
                          : "Use my current location"}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TextReveal>
          <div className="mt-6">
            <div
              ref={mapRef}
              className="h-[400px] rounded-lg overflow-hidden z-10"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            You can drag the pin to adjust the location
          </p>
        </div>
        <div className="md:w-1/2 space-y-4 mt-6 md:mt-0">
          <Label className="text-lg font-semibold">
            Property Registration Number
          </Label>
          <div className="relative">
            <Input
              value={address.registrationNumber}
              onChange={handleRegistrationInputChange}
              placeholder="Enter your registration number"
              className="w-full p-4 border rounded-lg"
            />
            {registrationNumberLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 animate-spin" />
            )}
          </div>
          {registrationNumberError && (
            <p className="text-red-500 text-sm">{registrationNumberError}</p>
          )}
          <p className="text-sm text-gray-600">
            Don't have a registration no.?{" "}
            <Link
              className="text-primaryGreen underline text-base"
              target="_blank"
              href="https://goaonline.gov.in/Appln/Uil/DeptServices?__DocId=TOU&__ServiceId=TOU03"
            >
              Register here
            </Link>
          </p>

          <hr />
          <h3 className="text-lg font-semibold">
            Confirm or edit your address details
          </h3>
          <Select
            value={address?.country || undefined}
            onValueChange={(value) => handleManualInputChange("country", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="India - IN">India - IN</SelectItem>
            </SelectContent>
          </Select>

          {[
            { key: "street", placeholder: "Street, area..." },
            { key: "district", placeholder: "District / locality" },
            { key: "city", placeholder: "City / town" },
            // { key: "state", placeholder: "State/union territory" },
            { key: "pincode", placeholder: "PIN code should be 6 digits" },
          ].map(({ key, placeholder }) =>
            key == "pincode" ? (
              <>
                <Input
                  key={key}
                  value={address[key] || ""}
                  onChange={(e) => handleManualInputChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full p-4 border rounded-lg"
                  maxLength={6}
                  minLength={6}
                />
                <div className="text-left text-sm  text-muted-foreground"></div>
                <Select
                  value={address.state || undefined}
                  onValueChange={(value) =>
                    handleManualInputChange("state", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIA_STATES_AND_UT.map((name) => (
                      <SelectItem value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <Input
                key={key}
                value={address[key] || ""}
                onChange={(e) => handleManualInputChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full p-4 border rounded-lg"
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
