/* eslint-disable @typescript-eslint/no-unused-vars */
export const validatePropertyType = (formData) => {
  return {
    isValid: !!formData.propertyType,
    errorMessage: "Please select a property type.",
  };
};

export const validatePlaceType = (formData) => {
  return {
    isValid: formData.placeType.trim() !== "",
    errorMessage: "Please select a place type.",
  };
};

// export const validateLocationForm = (formData) => {
//   return {
//     isValid:
//       formData.address.latitude &&
//       formData.address.longitude &&
//       formData.address.line1?.trim() !== "" &&
//       formData.address.pincode?.trim() !== "" &&
//       formData.address.district?.trim() !== "" &&
//       formData.address.state?.trim() !== "" &&
//       formData.address.country?.trim() !== "",
//     errorMessage: "Please fill in all address fields.",
//   };
// };

export const validateLocationForm = (formData) => {
  const { address, validRegistrationNo } = formData;
  const re = /^[0-9\b]+$/;
  // Validate essential address fields
  const isAddressValid =
    address.latitude &&
    address.longitude &&
    address.street?.trim() !== "" &&
    address.district?.trim() !== "" &&
    address.city?.trim() !== "" &&
    address.state?.trim() !== "" &&
    address.pincode?.trim() !== "" &&
    address.pincode?.trim().length == 6 &&
    re.test(address.pincode?.trim()) &&
    address.country?.trim() !== "";

  // Check that a registration number is provided in the address
  const isRegistrationNumberProvided =
    address.registrationNumber?.trim() !== "";

  // The form is valid only if all address fields are filled,
  // a registration number is provided, and it has been verified.
  const isValid =
    isAddressValid && isRegistrationNumberProvided && validRegistrationNo;

  let errorMessage = "";
  if (!isRegistrationNumberProvided) {
    errorMessage = "Please provide your property registration number.";
  } else if (!validRegistrationNo) {
    errorMessage = "Please enter and verify your property registration number.";
  } else if (!isAddressValid) {
    errorMessage = "Please fill in all address fields.";
  }

  return { isValid, errorMessage };
};
export const validateTime = (formData) => {
  const { checkinTime, checkoutTime } = formData;
  const re = /^[0-9\b]+$/;
  const isValid =
    checkinTime?.trim() !== "" &&
    re.test(checkinTime?.trim()) &&
    checkinTime?.trim() > 0 &&
    checkinTime?.trim() < 24 &&
    checkoutTime?.trim() !== "" &&
    re.test(checkoutTime?.trim()) &&
    checkoutTime?.trim() > 0 &&
    checkoutTime?.trim() < 24;

  let errorMessage = "";
  if (!isValid) {
    errorMessage = "Please provide number.";
  }

  return { isValid, errorMessage };
};
export const validateDescribeYourPlace = (formData) => {
  const { guests, bedrooms, beds, bathrooms } = formData;

  return {
    isValid:
      // title ||
      // description ||
      guests > 0 || bedrooms > 0 || beds > 0 || bathrooms > 0,
    errorMessage: "Please fill in all fields.",
  };
};

export const validateBathroomSelector = (formData) => {
  const totalBathrooms =
    formData.bathroomTypes.private +
    formData.bathroomTypes.shared +
    formData.bathroomTypes.dedicated;

  return {
    isValid: totalBathrooms > 0, // At least one bathroom must be selected
    errorMessage: "Please select at least one bathroom type.",
  };
};

export const validateOccupancySelector = (formData) => {
  return {
    isValid: Array.isArray(formData.occupancy) && formData.occupancy.length > 0,
    errorMessage:
      "Please select at least one option for 'Who else might be there?'.",
  };
};

export const validateAmenitiesSelector = (formData) => {
  return {
    isValid: Array.isArray(formData.amenities) && formData.amenities.length > 2,
    errorMessage: "Please select at least 3 amenity.",
  };
};

export const validateAddPhotos = (formData) => {
  return {
    isValid: Array.isArray(formData.photos) && formData.photos.length >= 5,
    errorMessage: "Please upload at least 5 photos.",
  };
};

export const validateListingDetails = (formData) => {
  return {
    isValid:
      formData.title.trim().length >= 3 &&
      formData.description.trim().length > 15,
    errorMessage: "",
  };
};
export const validateCancellationSettings = (formData) => {
  // Add specific validation for reservation settings if needed
  return {
    isValid: true,
    errorMessage: "",
  };
};
export const validateReservationSettings = (formData) => {
  // Add specific validation for reservation settings if needed
  return {
    isValid: true,
    errorMessage: "",
  };
};

export const validateSetPricing = (formData) => {
  return {
    isValid: formData.basePrice > 500,
    errorMessage: "Please enter a valid price.",
  };
};

export const validateDiscountSettings = (formData) => {
  // Add specific validation for discount settings if needed
  return {
    isValid: true,
    errorMessage: "",
  };
};

export const validateSafetyDetails = (formData) => {
  const { safetyFeatures } = formData;
  for (const feature in safetyFeatures) {
    if (
      safetyFeatures[feature].checked &&
      !safetyFeatures[feature].description
    ) {
      return {
        isValid: false,
        errorMessage: `Please provide a description for the ${feature} feature.`,
      };
    }
  }
  return { isValid: true };
};

export const validateSetRules = (formData) => {
  return {
    isValid:
      Array.isArray(formData.selectedRules) &&
      formData.selectedRules.length > 0,
    errorMessage: "Please select at least one rule.",
  };
};
