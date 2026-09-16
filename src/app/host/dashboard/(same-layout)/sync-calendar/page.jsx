"use client";
import { useState } from "react";
import axios from "axios";
import { readStoredToken } from "@/lib/session";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export default function AddCalendarForm() {
  const propertyId = "687e34b0d2bf3b6dfff1b109";
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState("import"); // or 'export'
  const [msg, setMsg] = useState("");

  async function submit(e) {
    const userId = await localStorage.get;
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/calendarSync/saveCalendar`,
        { propertyId, userId, url, kind },
        { headers: { Authorization: `Bearer ${readStoredToken()}` } },
      );
      setMsg("Saved! " + JSON.stringify(res.data.calendar));
    } catch (err) {
      setMsg("Error: " + (err.response?.data?.message || err.message));
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="space-y-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Airbnb iCal URL"
          className="border p-2 w-full"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="border p-2"
        >
          <option value="import">Import (Airbnb - My App)</option>
          <option value="export">Export (My App - Airbnb)</option>
        </select>
        <button className="bg-green-600 text-white px-4 py-2">Save</button>
        <div>{msg}</div>
      </form>
    </div>
  );
}
