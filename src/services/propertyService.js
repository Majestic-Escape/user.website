import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const propertyService = {
  getAllProperties: async (type = null) => {
    try {
      const params = type ? { type } : {};
      const response = await axios.get(`${API_BASE_URL}/properties/static`, {
        params,
      });
      console.log("ms marv");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch properties"
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
        error.response?.data?.message || "Failed to fetch properties"
      );
    }
  },

  getPropertyById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/properties/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch property"
      );
    }
  },
  createProperty: async (propertyData) => {
    console.group("proper", propertyData);
    delete propertyData._id;
    console.group("next", propertyData);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/properties/create-listing-property/`,
        propertyData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create property"
      );
    }
  },

  updateProperty: async (id, propertyData) => {
    try {
      console.group("back", propertyData);
      const response = await axios.put(
        `${API_BASE_URL}/properties/update-listing-property/${id}`,
        propertyData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update property"
      );
    }
  },

  updateKyc: async (id) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/properties/update-kyc-property/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update property"
      );
    }
  },
  getUserPropertyListings: async (userEmail, page = 1, limit = 10) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/properties/user-properties/${userEmail}`,
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user listings"
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
        error.response?.data?.message || "Failed to fetch user listing"
      );
    }
  },
};
