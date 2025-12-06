import {
  validatePersonalInfo,
  validateDocumentUpload,
  // validateGSTVerification,
  validateTermsAndConditions,
} from "./validate";

import { PersonalInfo } from "./step-one";
import { DocumentUpload } from "./step-two";
import { GSTVerification } from "./step-three";
// import SelfieCapture from "./step-four"
import { TermsAndConditions } from "./step-five";

export const steps = [
  {
    title: "Personal Information",
    component: PersonalInfo,
    requiresValidation: true,
    validate: validatePersonalInfo,
  },
  {
    title: "Document Upload",
    component: DocumentUpload,
    requiresValidation: true,
    validate: validateDocumentUpload,
  },
  {
    title: "GST Verification",
    component: GSTVerification,
    // requiresValidation: true,
    // validate: validateGSTVerification,
  },
  // { title: "Selfie Capture", component: SelfieCapture },
  {
    title: "Terms and Conditions",
    component: TermsAndConditions,
    requiresValidation: true,
    validate: validateTermsAndConditions,
  },
];

export const editSteps = [
  {
    title: "Personal Information",
    component: PersonalInfo,
    requiresValidation: true,
    validate: validatePersonalInfo,
  },
  {
    title: "Document Upload",
    component: DocumentUpload,
    requiresValidation: true,
    validate: validateDocumentUpload,
  },
  {
    title: "GST Verification",
    component: GSTVerification,
    // requiresValidation: true,
    // validate: validateGSTVerification,
  },
  // { title: "Selfie Capture", component: SelfieCapture },
  {
    title: "Terms and Conditions",
    component: TermsAndConditions,
    requiresValidation: true,
    validate: validateTermsAndConditions,
  },
];
