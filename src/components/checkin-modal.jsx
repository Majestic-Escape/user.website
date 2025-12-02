// components/CheckInModal.js
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "sonner";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export default function CheckInModal({
  isOpen,
  onClose,
  propertyId,
  listing,
  setOpen,
}) {
  const [checkinTime, setCheckinTime] = useState("");
  const [checkoutTime, setCheckoutTime] = useState("");

  const numbersList = Array.from({ length: 11 }, (_, i) => i + 1);
  if (!isOpen) return null;

  // const getData = async () => {
  //   try {
  //     const getLocalData = localStorage.getItem("token");
  //     const data = JSON.parse(getLocalData);

  //     if (data) {
  //       const response = await fetch(
  //         `${API_URL}/properties/get-timings/${propertyId}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             Authorization: `Bearer ${data}`,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );
  //       if (!response.ok) {
  //         return;
  //       }
  //       const result = await response.json();

  //       return result.data;
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  // getData();
  console.log("ajfdjkajdkjda", listing);
  async function saveData() {
    try {
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      if (data) {
        const response = await fetch(`${API_URL}/properties/timings`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkinTime: checkinTime,
            checkoutTime: checkoutTime,
            propertyId: propertyId,
          }),
        });
        if (!response.ok) {
          toast.error("Failed to Submit Timing");
          return;
        }
        toast.success("Successfuly updated timing");
        setOpen(false);
        const result = await response.json();

        return result.data;
      }
    } catch (err) {
      console.error(err);
    }
  }

  console.log("nice", listing);
  const prev = 12;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Check-in & checkout times</h2>
          <button onClick={onClose} className="text-gray-500 text-xl">
            ×
          </button>
        </div>

        {/* Check-in Window */}
        <div className="mb-4">
          <label className="block font-medium text-sm text-gray-700">
            Check-in window
          </label>
          <div className="mt-2 flex gap-2">
            <select
              className="w-full mt-2 border border-gray-300 rounded-md p-2"
              value={listing ? listing?.checkinTime : checkinTime}
              onChange={(e) => {
                setCheckinTime(e.target.value);
              }}
            >
              <option value="">Select time</option>
              <option value="0">12 am</option>
              {numbersList.map((item, index) => (
                <option key={item || index} value={item}>
                  {item} am
                </option>
              ))}
              <option key={12} value="12">
                12 pm
              </option>
              {numbersList.map((item, index) => (
                <option key={item || index} value={Number(item) + 12}>
                  {item} pm
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkout Time */}
        <div className="mb-6">
          <label className="block font-medium text-sm text-gray-700">
            Checkout time
          </label>
          <select
            className="w-full mt-2 border border-gray-300 rounded-md p-2"
            value={listing ? listing?.checkoutTime : checkoutTime}
            onChange={(e) => setCheckoutTime(e.target.value)}
          >
            <option key={"select time"} value="">
              Select time
            </option>
            <option key={0} value="0">
              12 am
            </option>
            {numbersList.map((item, index) => (
              <option key={item || index} value={item}>
                {item} am
              </option>
            ))}
            <option value="12">12 pm</option>
            {numbersList.map((item, index) => (
              <option key={item || index} value={Number(item) + 12}>
                {item} pm
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:underline"
          >
            Cancel
          </button>
          <button
            disabled={!checkinTime || !checkoutTime}
            className={`px-4 py-2 text-sm rounded-md text-white ${
              checkinTime && checkoutTime
                ? "bg-black hover:bg-gray-800"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={saveData}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
