import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const kycService = {
  getAllProperties: async (type = null) => {
    try {
      const params = type ? { type } : {};
      const response = await axios.get(`${API_BASE_URL}/kyc`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch kyc");
    }
  },
  getFormData: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/kyc/form/${id}`);
      // console.log("cap", response.status);
      if (response.status == 200) {
        return response.data;
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch form data"
      );
    }
  },
  getFormDataById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/kyc/form-kyc/${id}`);
      console.log("cap am", response);
      if (response.status == 200) {
        return response.data;
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch form data"
      );
    }
  },

  getFormDataByUserId: async (id) => {
    try {
      console.log("we have just got", id);
      const response = await axios.get(`${API_BASE_URL}/kyc/user/${id}`);

      if (response.status == 200) {
        console.log("rrrc", response);
        return response.data;
      } else {
        return "Form doesnt exits";
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch form data"
      );
    }
  },
  getPropertyById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/kyc/${id}`);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch property"
      );
    }
  },
  createKycHostData: async (propertyData) => {
    try {
      console.log("new prop 1");

      // delete propertyData._id;
      const userId = JSON.parse(localStorage.getItem("userId"));
      console.log("new prop 2", userId);

      // const getLocalData = await localStorage.getItem("token");

      console.log("new prop 3");
      // const data = JSON.parse(userId);
      console.log("new prop", propertyData);

      const response = await fetch(`${API_BASE_URL}/kyc/form`, {
        method: "POST",
        headers: {
          // Authorization: `Bearer ${data}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hostId: userId,
          personalInfo: {
            fatherName: propertyData?.personalInfo?.fatherName,
            dob: propertyData?.personalInfo?.dob,
            address: {
              line1: propertyData.personalInfo.address.line1,
              line2: propertyData.personalInfo.address.line2,
              city: propertyData.personalInfo.address.city,
              state: propertyData.personalInfo.address.state,
              pincode: propertyData.personalInfo.address.pincode,
              country: "India",
            },
          },
          documentInfo: {
            documentType: null,
            isVerified: false,
          },
          gstInfo: {
            gstNumber: "",
            panNumber: "",
            isVerified: false,
          },
          acceptedTerms: {
            general: false,
            goa: false,
          },
          status: "processing",
          hostEmail: propertyData.hostEmail,
        }),
      });
      if (!response.ok) {
        return;
      }
      const result = await response.json();

      return result.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to verify KYC");
    }
  },

  updateProperty: async (id, propertyData) => {
    try {
      console.log("in this how", id);
      const response = await axios.put(
        `${API_BASE_URL}/kyc/update-form/${id}`,
        propertyData
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
        `${API_BASE_URL}/user/kyc/${userEmail}`,
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
      const response = await axios.get(`${API_BASE_URL}/verify-kyc/${id}`, {
        params: { hostEmail },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user kyc"
      );
    }
  },
};
