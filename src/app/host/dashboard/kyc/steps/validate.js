export const validatePersonalInfo = (formData) => {
  const { personalInfo } = formData;
  return {
    isValid:
      personalInfo.fatherName.trim() !== "" &&
      personalInfo.dob.trim() !== "" &&
      personalInfo.address.line1.trim() !== "" &&
      personalInfo.address.city.trim() !== "" &&
      personalInfo.address.state.trim() !== "" &&
      personalInfo.address.pincode.trim() !== "",
    errorMessage: "Missing required personal information fields.",
  };
};

export const validateDocumentUpload = (formData) => {
  const { documentInfo } = formData;
  return {
    isValid:
      documentInfo.documentType !== null &&
      // documentInfo.documentNumber.trim() !== "" &&
      // documentInfo.documentFile !== null &&
      documentInfo.isVerified,
    errorMessage: "Please upload and verify a valid document.",
  };
};

// export const validateGSTVerification = (formData) => {
//   const { gstInfo } = formData;

//   return {
//     isValid: gstInfo.isVerified,
//     errorMessage: "Please enter and verify your GST information.",
//   };
// };

export const validateTermsAndConditions = (formData) => {
  const { acceptedTerms } = formData;
  return {
    isValid: acceptedTerms.general && acceptedTerms.goa,
    errorMessage: "Please accept all terms and conditions.",
  };
};
