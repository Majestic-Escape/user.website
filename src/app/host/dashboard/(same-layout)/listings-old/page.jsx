/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Grid,
  List,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { propertyService } from "@/services/propertyService";
import { useAuth } from "@/contexts/AuthContext";

export default function ListingsPage() {
  const auth = useAuth();
  const router = useRouter();
  const [properties, setProperties] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [view, setView] = React.useState("table");
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = [
    {
      accessorKey: "photos",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={row.original.photos[0] || "/placeholder.svg"}
          alt={row.original.title}
          className="w-16 h-16 object-cover rounded"
        />
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "propertyType",
      header: "Type",
    },
    {
      accessorKey: "address.city",
      header: "Location",
    },
    {
      accessorKey: "basePrice",
      header: () => <div className="text-right">Price</div>,
      cell: ({ row }) => {
        const price = Number.parseFloat(row.getValue("basePrice"));
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(price);

        return <div className="text-right font-medium">{formatted}/night</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.original.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const property = row.original;

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
                onClick={() => navigator.clipboard.writeText(property._id)}
              >
                Copy property ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(property)}>
                Edit property
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(property._id)}>
                Delete property
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  React.useEffect(() => {
    fetchListings();
  }, []);

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

  const handleEdit = (property) => {
    router.push(`/host/dashboard/edit-listing/${property._id}`);
  };

  const handleDelete = async (id) => {
    // Implement delete logic here

    if (process.env.NEXT_PUBLIC_ENV === "dev") {
      console.log(`Deleting property with id: ${id}`);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const table = useReactTable({
    data: properties,
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

  return (
    <div className="space-y-6">
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

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Filter titles..."
            value={table.getColumn("title")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
          />
        </div>
        <Select
          value={table.getColumn("propertyType")?.getFilterValue() ?? ""}
          onValueChange={(value) =>
            table.getColumn("propertyType")?.setFilterValue(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Types">All Types</SelectItem>
            <SelectItem value="Villa">Villa</SelectItem>
            <SelectItem value="Apartment">Apartment</SelectItem>
            <SelectItem value="Cottage">Cottage</SelectItem>
            <SelectItem value="House">House</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={table.getColumn("status")?.getFilterValue() ?? ""}
          onValueChange={(value) =>
            table.getColumn("status")?.setFilterValue(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Status">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
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
        <div className="flex items-center space-x-2">
          <Switch
            id="view-toggle"
            checked={view === "table"}
            onCheckedChange={(checked) => setView(checked ? "table" : "grid")}
          />
          <Label htmlFor="view-toggle">
            {view === "grid" ? (
              <Grid className="h-4 w-4 text-brightGreen" />
            ) : (
              <List className="h-4 w-4 text-brightGreen" />
            )}
          </Label>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property._id}>
              <CardHeader>
                <img
                  src={property.photos[0] || "/placeholder.svg"}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardTitle>{property.title}</CardTitle>
                <CardDescription>
                  {property.propertyType} in {property.address.city}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  ₹{property.basePrice}/night
                </p>
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
                  onClick={() => handleDelete(property._id)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
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
              {table.getRowModel().rows?.length ? (
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
      )}
      {hasMore && (
        <Button onClick={loadMore} disabled={loading}>
          Load More
        </Button>
      )}
    </div>
  );
}
