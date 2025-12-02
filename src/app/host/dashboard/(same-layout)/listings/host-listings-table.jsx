"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import CheckInModal from "@/components/checkin-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCarouselPopup } from "./image-carousel-popup";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://server-me.vercel.app/api/v1";

const StatusPill = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "incomplete":
        return "bg-orange-100 text-orange-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
        status
      )}`}
    >
      {status === "processing"
        ? "Sent for approval"
        : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const getUserPropertyListings = async (userEmail, page = 1, limit = 10) => {
  try {
    const getLocalData = await localStorage.getItem("token");
    const data = JSON.parse(getLocalData);

    const response = await axios.get(
      `${API_BASE_URL}/properties/user-properties/${userEmail}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data}`,
        },
        params: { page, limit },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch user listings"
    );
  }
};

const SkeletonRow = ({ columns }) => (
  <TableRow>
    {columns.map((column, index) => (
      <TableCell key={index}>
        <Skeleton className="h-4 w-full" />
      </TableCell>
    ))}
  </TableRow>
);

export function HostListingsTable({ userEmail }) {
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [delistDialogOpen, setDelistDialogOpen] = useState(false);
  const [listingToDelist, setListingToDelist] = useState(null);
  const [relistDialogOpen, setRelistDialogOpen] = useState(false);
  const [listingToRelist, setListingToRelist] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imagePopupOpen, setImagePopupOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedPropertyName, setSelectedPropertyName] = useState("");
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  console.log("gogog", userEmail);
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUserPropertyListings(userEmail, page);
      setData(response?.listings);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  }, [userEmail, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings, userEmail]);

  const handleImageClick = useCallback((images, propertyName) => {
    setSelectedImages(images);
    setSelectedPropertyName(propertyName);
    setImagePopupOpen(true);
  }, []);
  const handleRelistClick = useCallback((listing) => {
    setListingToRelist(listing);
    setRelistDialogOpen(true);
    fetchListings();
  }, []);
  const handleDelistClick = useCallback((listing) => {
    setListingToDelist(listing);
    setDelistDialogOpen(true);
    fetchListings();
  }, []);

  const handleConfirmDelist = useCallback(async () => {
    if (listingToDelist) {
      try {
        const getLocalData = await localStorage.getItem("token");
        const data = JSON.parse(getLocalData);

        const response = await fetch(
          `${API_BASE_URL}/properties/host/delist/${
            listingToDelist._id
          }?hostSide=${true}`,
          {
            headers: {
              Authorization: `Bearer ${data}`,
              "Content-Type": "application/json",
            },
            method: "PATCH",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delist the listing");
        }

        // setData((prevData) =>
        //   prevData.filter((item) => item._id !== listingToDelete._id)
        // );
        setDelistDialogOpen(false);
        setListingToDelist(null);
        fetchListings();
        toast.success("Listing delisted successfully");
      } catch (error) {
        console.error("Failed to delist listing:", error);
        toast.error("Failed to delist listing");
        // You might want to show an error message to the user here
      }
    }
  }, [listingToDelist]);

  const handleConfirmRelist = useCallback(async () => {
    if (listingToRelist) {
      try {
        const getLocalData = await localStorage.getItem("token");
        const data = JSON.parse(getLocalData);

        const response = await fetch(
          `${API_BASE_URL}/properties/host/reactivate/${listingToRelist._id}`,
          {
            headers: {
              Authorization: `Bearer ${data}`,
              "Content-Type": "application/json",
            },
            method: "PATCH",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delist the listing");
        }

        // setData((prevData) =>
        //   prevData.filter((item) => item._id !== listingToDelete._id)
        // );
        setRelistDialogOpen(false);
        setListingToRelist(null);
        fetchListings();
        toast.success("Listing delisted successfully");
      } catch (error) {
        console.error("Failed to delist listing:", error);
        toast.error("Failed to delist listing");
        // You might want to show an error message to the user here
      }
    }
  }, [listingToRelist]);
  console.log("all the ", selectedListing);
  const columns = React.useMemo(
    () => [
      {
        accessorKey: "photos",
        header: "Thumbnail",
        cell: ({ row }) => {
          const photos = row.getValue("photos");
          return photos && photos.length > 0 ? (
            <Image
              src={photos[0] || "/placeholder.svg"}
              alt="Property thumbnail"
              width={50}
              height={50}
              className="rounded-md cursor-pointer"
              onClick={() => handleImageClick(photos, row.getValue("title"))}
            />
          ) : (
            <div className="w-[50px] h-[50px] bg-gray-200 rounded-md"></div>
          );
        },
      },
      {
        accessorKey: "title",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Title
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const title = row.getValue("title") || "";
          const truncated =
            title.length > 30 ? title.substring(0, 30) + "…" : title;

          return (
            <span
              title={title}
              className="block max-w-[250px] truncate cursor-pointer"
            >
              {truncated}
            </span>
          );
        },
      },
      {
        accessorKey: "propertyType",
        header: "Property Type",
      },
      {
        accessorKey: "placeType",
        header: "Place Type",
      },
      {
        accessorKey: "guests",
        header: "Guests",
      },
      {
        accessorKey: "bedrooms",
        header: "Bedrooms",
      },
      {
        accessorKey: "beds",
        header: "Beds",
      },
      {
        accessorKey: "bathrooms",
        header: "Bathrooms",
      },
      {
        accessorKey: "basePrice",
        header: () => <div className="text-right">Base Price</div>,
        cell: ({ row }) => {
          const price = Number.parseFloat(row.getValue("basePrice"));
          const formatted = new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(price);

          return <div className="text-right font-medium">{formatted}</div>;
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <StatusPill status={row.getValue("status")} />,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
          <div className="text-center">
            {new Date(row.getValue("createdAt")).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const listing = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(listing._id)}
                >
                  Copy listing ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/host/dashboard/edit-listing/${listing._id}`)
                  }
                >
                  Edit listing
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setSelectedListing(listing);
                    setModalOpen(true);
                  }}
                >
                  Add Time
                </DropdownMenuItem>
                {listing.status == "active" ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        router.push(
                          `/host/dashboard/calendar?propertyId=${listing._id}`
                        );
                      }}
                    >
                      Calendar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelistClick(listing)}
                    >
                      Delist listing
                    </DropdownMenuItem>
                  </>
                ) : listing.status == "inactive" ? (
                  <DropdownMenuItem onClick={() => handleRelistClick(listing)}>
                    Reactivate
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleImageClick, handleDelistClick]
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  return (
    <div className="space-y-4 grid grid-cols-1">
      <div className="w-full ">
        <Dialog open={relistDialogOpen} onOpenChange={setRelistDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Reactivation</DialogTitle>
              <DialogDescription>
                Are you sure you want to reactivate the listing &quot;
                {listingToRelist?.title}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRelistDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                onClick={handleConfirmRelist}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={delistDialogOpen} onOpenChange={setDelistDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delisting</DialogTitle>
              <DialogDescription>
                Are you sure you want to delist the listing "
                {listingToDelist?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDelistDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelist}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <ImageCarouselPopup
          isOpen={imagePopupOpen}
          onClose={() => setImagePopupOpen(false)}
          images={selectedImages}
          propertyName={selectedPropertyName}
        />
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter listings..."
            value={table.getColumn("title")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Select
            value={table.getColumn("status")?.getFilterValue() ?? ""}
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value)
            }
          >
            <SelectTrigger className="w-[180px] ml-2">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="processing">Sent for approval</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="w-full overflow-x-auto">
          <div className="rounded-md border">
            <CheckInModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              propertyId={selectedListing?._id}
              listing={selectedListing}
              setOpen={setModalOpen}
            />
            <Table className="w-full table-auto">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <SkeletonRow key={index} columns={columns} />
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(page - 1, 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={data.length < 10 || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
