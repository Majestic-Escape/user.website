/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Grid, List } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { propertyService } from "@/services/propertyService";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";

// Mock data for properties
const initialProperties = [];

export default function ManagePropertiesPage() {
  const auth = useAuth();
  const [view, setView] = useState("table");
  const [properties, setProperties] = useState(initialProperties);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingProperty, setEditingProperty] = useState(null);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [newProperty, setNewProperty] = useState({
    title: "",
    type: "",
    location: "",
    price: "",
    status: "Active",
    image: "/placeholder.svg?height=100&width=100",
  });

  useEffect(() => {
    let filteredProperties = [...initialProperties];

    // Search
    if (searchTerm) {
      filteredProperties = filteredProperties.filter(
        (property) =>
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter
    if (filterType !== "all") {
      filteredProperties = filteredProperties.filter(
        (property) => property.type === filterType
      );
    }
    if (filterStatus !== "all") {
      filteredProperties = filteredProperties.filter(
        (property) => property.status === filterStatus
      );
    }

    // Sort
    filteredProperties.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setProperties(filteredProperties);
  }, [searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  const handleEdit = (property) => {
    // setEditingProperty(property);
    redirect(`/host/dashboard/edit-listing/${property._id}`);
  };

  const handleDelete = (id) => {
    setProperties(properties.filter((property) => property.id !== id));
  };

  const handleSaveEdit = () => {
    setProperties(
      properties.map((property) =>
        property.id === editingProperty.id ? editingProperty : property
      )
    );
    setEditingProperty(null);
  };

  const handleAddProperty = () => {
    const id = Math.max(...properties.map((p) => p.id)) + 1;
    setProperties([...properties, { ...newProperty, id }]);
    setIsAddingProperty(false);
    setNewProperty({
      title: "",
      type: "",
      location: "",
      price: "",
      status: "Active",
      image: "/placeholder.svg?height=100&width=100",
    });
  };

  useEffect(() => {
    fetchListings();
  }, [page]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getUserPropertyListings(
        auth.user.email,
        page
      );
      if (data.listings.length === 0) {
        setHasMore(false);
      } else {
        setProperties((prevProperties) => [
          ...prevProperties,
          ...data.listings,
        ]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div className=" space-y-6">
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-semibold font-bricolage">
          Manage Listing
        </h1>
        <Link
          className="text-white bg-primaryGreen hover:to-brightGreen py-2 px-4 rounded-3xl"
          href="/host/dashboard/add-listing"
        >
          Add Listing
        </Link>
      </div>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Search properties
          </Label>
          <Input
            id="search"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Villa">Villa</SelectItem>
            <SelectItem value="Apartment">Apartment</SelectItem>
            <SelectItem value="Cottage">Cottage</SelectItem>
            <SelectItem value="House">House</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="location">Location</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "Ascending" : "Descending"}
        </Button>
        <div className="flex items-center space-x-2">
          <Label htmlFor="view-toggle" className="sr-only">
            Toggle view
          </Label>
          <Switch
            id="view-toggle"
            checked={view === "table"}
            onCheckedChange={(checked) => setView(checked ? "table" : "grid")}
          />
          <span>
            {view === "grid" ? (
              <Grid className="h-4 text-brightGreen w-4" />
            ) : (
              <List className="text-brightGreen h-4 w-4" />
            )}
          </span>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardHeader>
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardTitle>{property.title}</CardTitle>
                <CardDescription>
                  {property.type} in {property.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹{property.price}/night</p>
                <p
                  className={`mt-2 ${
                    property.status === "Active"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {property.status}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleEdit(property)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(property.id)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-xl font-medium text-stone py-4"
                >
                  No listings found
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => {
                if (process.env.NEXT_PUBLIC_ENV === "dev") {
                  console.log(property);
                }
                return (
                  <TableRow key={property.id}>
                    <TableCell>
                      <img
                        src={property.photos[0]}
                        alt={property.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>{property.title}</TableCell>
                    <TableCell>{property.propertyType}</TableCell>
                    <TableCell>{property.address.city}</TableCell>
                    <TableCell>₹{property.basePrice}/night</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          property.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {property.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        onClick={() => handleEdit(property)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(property.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      )}
      {hasMore && (
        <Button onClick={loadMore} disabled={loading}>
          Load More
        </Button>
      )}
      <Dialog
        open={editingProperty !== null}
        onOpenChange={() => setEditingProperty(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
          </DialogHeader>
          {editingProperty && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={editingProperty.title}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      title: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={editingProperty.type}
                  onValueChange={(value) =>
                    setEditingProperty({ ...editingProperty, type: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Cottage">Cottage</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={editingProperty.location}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      location: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={editingProperty.price}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      price: parseInt(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editingProperty.status}
                  onValueChange={(value) =>
                    setEditingProperty({ ...editingProperty, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingProperty} onOpenChange={setIsAddingProperty}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-title" className="text-right">
                Title
              </Label>
              <Input
                id="new-title"
                value={newProperty.title}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, title: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-type" className="text-right">
                Type
              </Label>
              <Select
                value={newProperty.type}
                onValueChange={(value) =>
                  setNewProperty({ ...newProperty, type: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Cottage">Cottage</SelectItem>
                  <SelectItem value="House">House</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-location" className="text-right">
                Location
              </Label>
              <Input
                id="new-location"
                value={newProperty.location}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, location: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-price" className="text-right">
                Price
              </Label>
              <Input
                id="new-price"
                type="number"
                value={newProperty.price}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, price: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddProperty}>Add Property</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
