"use client";

import React from "react";
import { createListing } from "./actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  propertyType: z.string(),
  bedrooms: z.number().min(1),
  bathrooms: z.number().min(1),
  maxGuests: z.number().min(1),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipcode: z.string(),
  price: z.number().min(0),
  amenities: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
  images: z.array(z.string()).min(1, "At least one image is required"),
  petsAllowed: z.enum(["yes", "no"]),
  checkInTime: z.string(),
  checkOutTime: z.string(),
  houseRules: z.string(),
  cancellationPolicy: z.string(),
  minimumStay: z.number().min(1),
});

export default function AddListingView() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      propertyType: "",
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 1,
      address: "",
      city: "",
      state: "",
      zipcode: "",
      price: 0,
      amenities: [],
      images: [],
      petsAllowed: "no",
      checkInTime: "",
      checkOutTime: "",
      houseRules: "",
      cancellationPolicy: "",
      minimumStay: 1,
    },
  });

  async function onSubmit(data) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, value.toString());
      }
    });

    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsedUserInfo = JSON.parse(userInfo);
      formData.append(
        "userInfo",
        JSON.stringify({ userId: parsedUserInfo.userId })
      );
      // process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
      //   console.log(userInfo, parsedUserInfo, parsedUserInfo.userId);
      // }
    }

    const result = await createListing(formData);
    if (result?.error) {
      console.error(result.error);
      toast.error("Couldn't add the listing. Please try again");

      // Handle error (e.g., show error message to user)
    } else {
      toast.success("Added successfully");
    }
  }

  return (
    <div className="container mx-auto ">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-absoluteDark font-bricolage">
            Add New Listing
          </CardTitle>
          <CardDescription>
            Fill in the details to create a new property listing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="Cozy beachfront villa" {...field} />
                      </FormControl>
                      <FormDescription>
                        Give your property a catchy title.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="cottage">Cottage</SelectItem>
                          <SelectItem value="bungalow">Bungalow</SelectItem>
                          <SelectItem value="farmhouse">Farmhouse</SelectItem>
                          <SelectItem value="treehouse">Treehouse</SelectItem>
                          <SelectItem value="boathouse">Boathouse</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your property..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of your property.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(+e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(+e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Guests*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(+e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Night (₹)*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="checkInTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Time*</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="checkOutTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out Time*</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="minimumStay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Stay (nights)*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="houseRules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>House Rules*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any specific house rules..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Specify any rules or guidelines for guests staying at your
                      property.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cancellationPolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancellation Policy*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a cancellation policy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="flexible">Flexible</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="strict">Strict</SelectItem>
                        <SelectItem value="nonRefundable">
                          Non-refundable
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the cancellation policy for this listing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Images*</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          field.onChange(
                            files.map((file) => URL.createObjectURL(file))
                          );
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload images of your property (at least one is required)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="petsAllowed"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Pets Allowed*</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amenities"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Amenities*</FormLabel>
                      <FormDescription>
                        Select the amenities available at your property.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        "WiFi",
                        "AC",
                        "Kitchen",
                        "TV",
                        "Parking",
                        "Pool",
                        "Beach Access",
                        "Balcony",
                        "Garden",
                        "BBQ",
                        "Gym",
                        "Hot Tub",
                        "Washing Machine",
                        "Dryer",
                        "Fireplace",
                        "Workspace",
                        "Breakfast",
                        "Elevator",
                        "Smoke Alarm",
                        "First Aid Kit",
                        "Fire Extinguisher",
                        "Essentials",
                        "Hair Dryer",
                        "Iron",
                        "Indoor Fireplace",
                        "Hangers",
                        "Coffee Maker",
                        "Dishwasher",
                        "Microwave",
                        "Oven",
                        "Refrigerator",
                      ].map((item) => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="text-white  bg-primaryGreen hover:bg-brightGreen rounded-3xl px-8 py-4"
                type="submit"
              >
                Add Listing
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
