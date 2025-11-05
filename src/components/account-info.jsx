"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const states = [
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

const languages = [
  "English",
  "French",
  "Portuguese",
  "Russian",
  "Hindi",
  "Marathi",
  "Konkani",
  "Kannada",
  "Telugu",
  "Tamil",
  "Malyalam",
  "Punjabi",
  "Mandarin",
  "Romania",
  "German",
  "Zulu",
  "Urdu",
  "Arabic",
  "Thai",
  "Vietnamese",
  "Tagalog",
  "Swedish",
  "Slovian",
  "Sign Language",
  "Serbian",
  "Polish",
  "Persian",
  "Korean",
  "Chinese",
  "Japanese",
];
export default function AccountInfo() {
  const auth = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [searchLanguage, setSearchLanguage] = useState("");
  const [language, setLanguage] = useState("");
  const [searchState, setSearchState] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  // Fetch profile information when the user's email is available
  useEffect(() => {
    if (!auth?.user?.email) return;

    const fetchProfileInfo = async () => {
      try {
        const res = await fetch(`${API_URL}/accounts?email=${auth.user.email}`);
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await res.json();
        console.log("Fetched Data:", data);
        setProfileData(data);
        setAvatarUrl(data.avatarUrl || data.profilePicture);
      } catch (error) {
        console.error("Error fetching profile info:", error);
      }
    };

    fetchProfileInfo();
  }, [auth?.user?.email]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function formatDOB(dobString) {
    const date = new Date(dobString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    // Format options: month as long name, day as numeric, and year as numeric.
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  }

  // Trigger file input click when avatar is clicked
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file upload and convert file to base64 URL
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select a valid JPG or PNG file.");
    }
  };

  // Update phone number in state
  const handleChangePhone = (e) => {
    setProfileData((prev) => ({ ...prev, phone: e.target.value }));
  };
  const handleChangeLanguage = (value) => {
    setProfileData((prev) => ({ ...prev, languages: value }));
    setLanguage(value);
  };
  const handleChangeState = (value) => {
    setProfileData((prev) => ({ ...prev, language: value }));
    setLanguage(value);
  };
  const handleChangeCountry = (value) => {
    setProfileData((prev) => ({ ...prev, language: value }));
    setLanguage(value);
  };

  // Update address fields in state
  const handleChangeAddress = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  // Submit the updated profile data via a PUT request
  const handleSubmit = async () => {
    // Build the form data payload matching the backend route requirements
    const formData = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      dob: profileData.dob, // Date of Birth (non-editable)
      phoneNumber: profileData.phone,
      profilePicture: avatarUrl,
      address: {
        street: profileData.address?.street || "",
        city: profileData.address?.city || "",
        state: profileData.address?.state || "",
        postalCode: profileData.address?.postalCode || "",
        country: profileData.address?.country || "",
      },
      languages: profileData?.languages || [],
      about: profileData?.about || "",
      governmentIdType: profileData.governmentIdType,
    };

    try {
      const res = await fetch(
        `${API_URL}/accounts?email=${profileData.email}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      const updatedData = await res.json();
      toast.success("Profile updated successfully!");
      setProfileData(updatedData); // Update local state with the latest profile data
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile.");
    }
  };
  console.log(
    "abbbout",
    profileData?.about,
    profileData?.email,
    profileData?.languages
  );
  // Render a skeleton view until profileData is loaded
  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardContent className="p-6 animate-pulse space-y-6">
            {/* Skeleton for Profile Image */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-300 rounded w-1/2" />
              </div>
            </div>
            {/* Skeleton for Full Name */}
            <div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2" />
            </div>
            <hr className="border-gray-300" />
            {/* Skeleton for Email */}
            <div>
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-2" />
            </div>
            <hr className="border-gray-300" />
            {/* Skeleton for Date of Birth */}
            <div>
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2" />
            </div>
            <hr className="border-gray-300" />
            {/* Skeleton for Phone */}
            <div>
              <div className="h-10 bg-gray-300 rounded" />
            </div>
            <hr className="border-gray-300" />
            {/* Skeleton for Government ID */}
            <div>
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-300 rounded w-1/4" />
            </div>
            <hr className="border-gray-300" />
            {/* Skeleton for Address */}
            <div className="space-y-2">
              <div className="h-10 bg-gray-300 rounded" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-gray-300 rounded" />
                <div className="h-10 bg-gray-300 rounded" />
              </div>
              <div className="h-10 bg-gray-300 rounded" />
              <div className="h-10 bg-gray-300 rounded" />
            </div>
            {/* Skeleton for Save Button */}
            <div className="pt-4">
              <div className="h-12 bg-gray-300 rounded w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredLanguages = languages?.filter((item) =>
    item?.toLowerCase().includes(searchLanguage.toLowerCase())
  );
  const filteredStates = states?.filter((item) =>
    item?.toLowerCase().includes(searchState.toLowerCase())
  );
  const toggleLanguage = (lang) => {
    setProfileData((prev) => {
      const current = prev.languages || [];
      const updated = current.includes(lang)
        ? current.filter((l) => l !== lang)
        : [...current, lang];
      return { ...prev, languages: updated };
    });
  };
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Profile Image */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Profile Image</h2>
            <div className="flex items-center gap-4">
              <Avatar
                className="w-20 h-20 cursor-pointer"
                onClick={handleAvatarClick}
              >
                <AvatarImage
                  src={avatarUrl || "/placeholder.svg"}
                  alt="Profile"
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png"
                className="hidden"
              />
              <p className="text-sm text-muted-foreground">
                Click on the avatar to upload your own image.
              </p>
            </div>
          </div>

          {/* Full Name (non-editable) */}
          <div>
            <h2 className="text-lg font-semibold mb-1">Full Name</h2>
            <p>
              {profileData.firstName} {profileData.lastName}
            </p>
          </div>
          <hr />
          <div>
            <h2 className="text-lg font-semibold mb-1">Date of Birth</h2>
            <p>{formatDOB(profileData?.dob)}</p>
          </div>
          <hr />

          {/* Email Address (non-editable) */}
          <div>
            <h2 className="text-lg font-semibold mb-1">Email Address</h2>
            <p>{profileData.email}</p>
          </div>
          <hr />

          {/* Date of Birth (non-editable) */}

          {/* Phone Number (editable) */}
          <div>
            <h2 className="text-lg font-semibold mb-1">Phone no.</h2>
            <Input
              placeholder="+91 9876543211"
              value={profileData.phone || ""}
              onChange={handleChangePhone}
            />
          </div>
          <hr />

          {/* Government Registered ID */}
          <div>
            <h2 className="text-lg font-semibold mb-1">
              Government Registered ID
            </h2>
            {profileData.governmentIdType ? (
              <p>{profileData.governmentIdType}</p>
            ) : (
              <>
                <p className="text-red-500 py-1.5 px-2 block rounded bg-red-50 text-sm font-medium border border-red-500 mb-2">
                  You haven't completed your KYC yet.
                </p>
                <Link
                  href="#"
                  className="text-primaryGreen hover:text-brightGreen underline"
                >
                  Complete KYC
                </Link>
              </>
            )}
          </div>
          <hr />

          {/* Detailed Address (editable) */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Detailed Address</h2>
            <div className="space-y-2">
              <Input
                className="h-10"
                placeholder="Street"
                value={profileData.address?.street || ""}
                onChange={(e) => handleChangeAddress("street", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  className="h-10"
                  placeholder="City"
                  value={profileData.address?.city || ""}
                  onChange={(e) => handleChangeAddress("city", e.target.value)}
                />
                {/* <Input
                  className="h-10"
                  placeholder="State"
                  value={profileData.address?.state || ""}
                  onChange={(e) => handleChangeAddress("state", e.target.value)}
                /> */}
                <Select
                  value={profileData.address?.state || undefined}
                  onValueChange={(value) => handleChangeAddress("state", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    avoidCollisions={false}
                    className="max-h-40 overflow-y-auto"
                  >
                    {/* Search input inside dropdown */}
                    <div className="py-2 px-1">
                      <Input
                        placeholder="Search Language..."
                        value={searchState}
                        onChange={(e) => setSearchState(e.target.value)}
                        className="w-full"
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>

                    {filteredStates.length > 0 ? (
                      filteredStates.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem key="not found" value="not found">
                        Not Found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Input
                className="h-10"
                placeholder="Postal Code"
                value={profileData.address?.postalCode || ""}
                onChange={(e) =>
                  handleChangeAddress("postalCode", e.target.value)
                }
              />
              {/* <Input
                className="h-10"
                placeholder="Country"
                value={profileData.address?.country || ""}
                onChange={(e) => handleChangeAddress("country", e.target.value)}
              /> */}
              <Select
                value={profileData.address?.country || undefined}
                onValueChange={(value) => handleChangeAddress("country", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"India"}>India</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <hr />
          <div>
            <h2 className="text-lg font-semibold mb-2">Languages</h2>

            {/* Dropdown Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 flex justify-between items-center bg-white"
              >
                {profileData?.languages?.length > 0
                  ? `${profileData.languages.length} selected`
                  : "Select Languages You Speak"}
                <span className="ml-2">▾</span>
              </button>

              {/* Dropdown Content */}
              <div ref={dropdownRef} className="relative">
                {dropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <Input
                        placeholder="Search Language..."
                        value={searchLanguage}
                        onChange={(e) => setSearchLanguage(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {filteredLanguages.length > 0 ? (
                      filteredLanguages.map((lang) => (
                        <label
                          key={lang}
                          className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={profileData.languages?.includes(lang)}
                            onChange={() => toggleLanguage(lang)}
                            className="mr-2"
                          />
                          {lang}
                        </label>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-gray-500">
                        No results found
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Display Selected Languages */}
            {profileData.languages?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profileData.languages.map((lang) => (
                  <span
                    key={lang}
                    className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>

          <hr />
          <div>
            <h2 className="text-lg font-semibold mb-2">About Me</h2>
            <Textarea
              className="px-4 py-4 border border-gray h-40 w-full "
              type="text"
              value={profileData?.about || ""}
              placeholder="Write something fun....."
              maxLength={500}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, about: e.target.value }))
              }
            />
            <div className="text-sm text-muted-foreground text-right">
              {profileData?.about?.length || 0}/500
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              className="inline-block h-12 px-12 bg-primaryGreen hover:bg-brightGreen text-white"
              onClick={handleSubmit}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
