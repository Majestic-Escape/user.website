import {
  validatePropertyType,
  validatePlaceType,
  validateLocationForm,
  validateDescribeYourPlace,
  validateBathroomSelector,
  validateOccupancySelector,
  validateAmenitiesSelector,
  validateAddPhotos,
  validateListingDetails,
  validateReservationSettings,
  validateSetPricing,
  validateDiscountSettings,
  validateSafetyDetails,
  validateSetRules,
  validateCancellationSettings,
} from "./validate";
import { StepOneIntro } from "./(part-one)/intro";
import { PropertyType } from "./(part-one)/step-one";
import { PlaceTypeSelector } from "./(part-one)/step-two";
import { LocationForm } from "./(part-one)/step-three";
import { DescribeYourPlace } from "./(part-one)/step-four";
import { BathroomSelector } from "./(part-one)/step-five";
import { OccupancySelector } from "./(part-one)/step-six";

import { StepTwoIntro } from "./(part-two)/intro";
import { AmenitiesSelector } from "./(part-two)/step-one";
import { AddPhotos } from "./(part-two)/step-two";
import { ListingDetails } from "./(part-two)/step-three";
import { CancellationSettings } from "./(part-two)/step-four";
import Onboarding from "./Onboarding";

import { StepThreeIntro } from "./(part-three)/intro";
import { ReservationSettings } from "./(part-three)/step-one";
import { SetPricing } from "./(part-three)/step-two";
import { DiscountSettings } from "./(part-three)/step-three";
import { SafetyDetails } from "./(part-three)/step-four";
import { SetRules } from "./(part-three)/step-five";

export const steps = [
  {
    title: "Onboarding",
    component: Onboarding,
    requiresValidation: false,
  },
  {
    title: "Step 1 Intro",
    component: StepOneIntro,
    requiresValidation: false,
  },
  {
    title: "Step 1",
    component: PropertyType,
    requiresValidation: true,
    validate: validatePropertyType,
  },
  {
    title: "Step 2",
    component: PlaceTypeSelector,
    requiresValidation: true,
    validate: validatePlaceType,
  },
  {
    title: "Step 3",
    component: LocationForm,
    requiresValidation: true,
    validate: validateLocationForm,
  },
  {
    title: "Step 4",
    component: DescribeYourPlace,
    requiresValidation: true,
    validate: validateDescribeYourPlace,
  },
  {
    title: "Step 5",
    component: BathroomSelector,
    requiresValidation: true,
    validate: validateBathroomSelector,
  },
  {
    title: "Step 6",
    component: OccupancySelector,
    requiresValidation: true,
    validate: validateOccupancySelector,
  },

  {
    title: "Step 2 Intro",
    component: StepTwoIntro,
    requiresValidation: false,
  },
  {
    title: "Step 1",
    component: AmenitiesSelector,
    requiresValidation: true,
    validate: validateAmenitiesSelector,
  },
  {
    title: "Step 2",
    component: AddPhotos,
    requiresValidation: true,
    validate: validateAddPhotos,
  },
  {
    title: "Step 2",
    component: ListingDetails,
    requiresValidation: true,
    validate: validateListingDetails,
  },
  {
    title: "Step 3",
    component: CancellationSettings,
    requiresValidation: true,
    validate: validateCancellationSettings,
  },
  {
    title: "Step 3 Intro",
    component: StepThreeIntro,
    requiresValidation: false,
  },

  {
    title: "Step 1",
    component: ReservationSettings,
    requiresValidation: true,
    validate: validateReservationSettings,
  },
  {
    title: "Step 2",
    component: SetPricing,
    requiresValidation: true,
    validate: validateSetPricing,
  },
  // {
  //   title: "Step 3",
  //   component: DiscountSettings,
  //   requiresValidation: true,
  //   validate: validateDiscountSettings,
  // },
  {
    title: "Step 4",
    component: SafetyDetails,
    requiresValidation: true,
    validate: validateSafetyDetails,
  },
  {
    title: "Step 5",
    component: SetRules,
    requiresValidation: true,
    validate: validateSetRules,
  },
];
export const editSteps = [
  // {
  //   title: "Onboarding",
  //   component: Onboarding,
  //   requiresValidation: false,
  // },
  // {
  //   title: "Step 1 Intro",
  //   component: StepOneIntro,
  //   requiresValidation: false,
  // },
  {
    title: "Step 1",
    component: PropertyType,
    requiresValidation: true,
    validate: validatePropertyType,
  },
  {
    title: "Step 2",
    component: PlaceTypeSelector,
    requiresValidation: true,
    validate: validatePlaceType,
  },
  {
    title: "Step 3",
    component: LocationForm,
    requiresValidation: true,
    validate: validateLocationForm,
  },
  {
    title: "Step 4",
    component: DescribeYourPlace,
    requiresValidation: true,
    validate: validateDescribeYourPlace,
  },
  {
    title: "Step 5",
    component: BathroomSelector,
    requiresValidation: true,
    validate: validateBathroomSelector,
  },
  {
    title: "Step 6",
    component: OccupancySelector,
    requiresValidation: true,
    validate: validateOccupancySelector,
  },
  // {
  //   title: "Step 2 Intro",
  //   component: StepTwoIntro,
  //   requiresValidation: false,
  // },
  {
    title: "Step 1",
    component: AmenitiesSelector,
    requiresValidation: true,
    validate: validateAmenitiesSelector,
  },
  {
    title: "Step 2",
    component: AddPhotos,
    requiresValidation: true,
    validate: validateAddPhotos,
  },
  {
    title: "Step 3",
    component: ListingDetails,
    requiresValidation: true,
    validate: validateListingDetails,
  },
  {
    title: "Step 4",
    component: CancellationSettings,
    requiresValidation: true,
    validate: validateCancellationSettings,
  },
  // {
  //   title: "Step 3 Intro",
  //   component: StepThreeIntro,
  //   requiresValidation: false,
  // },
  {
    title: "Step 1",
    component: ReservationSettings,
    requiresValidation: true,
    validate: validateReservationSettings,
  },
  {
    title: "Step 2",
    component: SetPricing,
    requiresValidation: true,
    validate: validateSetPricing,
  },
  // {
  //   title: "Step 3",
  //   component: DiscountSettings,
  //   requiresValidation: true,
  //   validate: validateDiscountSettings,
  // },
  {
    title: "Step 4",
    component: SafetyDetails,
    requiresValidation: true,
    validate: validateSafetyDetails,
  },
  {
    title: "Step 5",
    component: SetRules,
    requiresValidation: true,
    validate: validateSetRules,
  },
];
