import axios from "axios";
import { readStoredToken } from "@/lib/session";

// Bearer header when a session exists (empty otherwise).
const authHeaders = () => {
  const token = readStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// An Error that keeps the backend's code / fields (e.g. 422
// CONTACT_INFO_NOT_ALLOWED with the offending fields) so forms can explain
// what to fix instead of a generic failure.
function serviceError(error, fallback) {
  const data = error?.response?.data;
  const err = new Error(data?.message || fallback);
  if (data?.code) err.code = data.code;
  if (Array.isArray(data?.fields)) err.fields = data.fields;
  if (Array.isArray(data?.kinds)) err.kinds = data.kinds;
  err.status = error?.response?.status;
  return err;
}


export const propertyService = {
  getAllProperties: async (type = null) => {
    try {
      const params = type ? { type } : {};
      const response = await axios.get(`${API_BASE_URL}/properties/static`, {
        params,
      });
      if (process.env.ENV === "dev") {
        if (process.env.NEXT_PUBLIC_ENV === "dev") {
          console.log("ms marv");
        }
      }
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch properties",
      );
    }
  },
  getFrontPageAllStays: async (type) => {
    try {
      const params = type ? { type } : {};
      const response = await axios.get(
        `${API_BASE_URL}/properties/front/dynamic`,
        {
          params,
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch properties",
      );
    }
  },
  getAllStays: async (type) => {
    try {
      const params = type ? { type } : {};
      const response = await axios.get(`${API_BASE_URL}/properties/dynamic`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch properties",
      );
    }
  },

  getPropertyById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/properties/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch property",
      );
    }
  },
  // Listing mutations are host-owned on the server (Batch S); the token was
  // never sent on these calls before. Harmless against the old backend.
  createProperty: async (propertyData) => {
    // console.group("proper", propertyData);
    delete propertyData._id;
    // console.group("next", propertyData);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/properties/create-listing-property/`,
        propertyData,
        { headers: authHeaders() },
      );
      return response.data;
    } catch (error) {
      throw serviceError(error, "Failed to create property");
    }
  },

  updateProperty: async (id, status, submit = false, propertyData) => {
    try {
      // console.group("back", propertyData);
      const response = await axios.put(
        `${API_BASE_URL}/properties/update-listing-property/${id}?submit=${submit}&status=${status}`,
        propertyData,
        { headers: authHeaders() },
      );
      return response.data;
    } catch (error) {
      throw serviceError(error, "Failed to update property");
    }
  },

  updateKyc: async (id) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/properties/update-kyc-property/${id}`,
        undefined,
        { headers: authHeaders() },
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update property",
      );
    }
  },
  getUserPropertyListings: async (userEmail, page = 1, limit = 10) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/properties/user-properties/${userEmail}`,
        {
          params: { page, limit },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user listings",
      );
    }
  },
  getUserListingById: async (hostEmail, id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/prop-listing/${id}`, {
        params: { hostEmail },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user listing",
      );
    }
  },
};
