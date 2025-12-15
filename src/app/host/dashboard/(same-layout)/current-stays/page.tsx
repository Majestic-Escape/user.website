"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Property {
  _id: string;
  title: string;
  propertyType?: string;
  placeType?: string;
  guests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  basePrice?: number;
  status?: string;
}

export default function PropertyTable() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:5005/api/v1/properties");
        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }
        const data = await response.json();

        if (process.env.NEXT_PUBLIC_ENV === "dev") {
          console.log("API Response:", data);
        } // Log the API response for debugging

        let propertiesArray: Property[] = [];

        if (Array.isArray(data)) {
          propertiesArray = data;
        } else if (typeof data === "object" && data !== null) {
          if (Array.isArray(data.properties)) {
            propertiesArray = data.properties;
          } else {
            // If it's an object, try to extract properties
            propertiesArray = Object.values(data).filter(
              (item) =>
                typeof item === "object" && item !== null && "title" in item
            ) as Property[];
          }
        }

        // Ensure each property has at least a title and _id
        propertiesArray = propertiesArray.map((prop, index) => ({
          _id: prop._id || `property-${index}`,
          title: prop.title || "Untitled Property",
          propertyType: prop.propertyType,
          placeType: prop.placeType,
          guests: prop.guests,
          bedrooms: prop.bedrooms,
          beds: prop.beds,
          bathrooms: prop.bathrooms,
          basePrice: prop.basePrice,
          status: prop.status,
        }));

        setProperties(propertiesArray);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError("Error fetching properties. Please try again later.");
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Property Listings</CardTitle>
      </CardHeader>
      <CardContent>
        {properties.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Place</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Bedrooms</TableHead>
                <TableHead>Beds</TableHead>
                <TableHead>Bathrooms</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property._id}>
                  <TableCell className="font-medium">
                    {property.title}
                  </TableCell>
                  <TableCell>{property.propertyType || "N/A"}</TableCell>
                  <TableCell>{property.placeType || "N/A"}</TableCell>
                  <TableCell>{property.guests || "N/A"}</TableCell>
                  <TableCell>{property.bedrooms || "N/A"}</TableCell>
                  <TableCell>{property.beds || "N/A"}</TableCell>
                  <TableCell>{property.bathrooms || "N/A"}</TableCell>
                  <TableCell>
                    {property.basePrice ? `$${property.basePrice}` : "N/A"}
                  </TableCell>
                  <TableCell>{property.status || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Alert>
            <AlertTitle>No Properties</AlertTitle>
            <AlertDescription>
              No properties found. Please try again later.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
