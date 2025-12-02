"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, ThumbsUp, MessageSquare, TrendingUp, Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDays, addMonths, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const reviews = [];
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ReviewsPage() {
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [reviewData, setReviewData] = useState();
  const [search, setSearch] = useState("");
  const [properties, setProperties] = useState();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [date, setDate] = useState({
    from: addMonths(new Date(), -1),
    to: new Date(),
  });
  const [hostEmail, setHostEmail] = useState("");
  console.log("what now", selectedRating);
  const fetchData = async () => {
    try {
      const getUserId = await localStorage.getItem("userId");
      const userId = JSON.parse(getUserId);
      const from = date.from ? new Date(date.from).toLocaleDateString() : "";

      const to = date.to ? new Date(date.to).toLocaleDateString() : "";
      console.log(from, to);
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      if (data) {
        const response = await fetch(
          `${API_URL}/hostData/review/${userId}?stars=${selectedRating}&search=${search}&property=${selectedProperty}&checkin=${from}&checkout=${to}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data}`,
            },
          }
        );
        if (!response.ok) {
          toast.error("Error in fetching data");
        }
        const result = await response.json();
        console.log("what now", result);
        const final = await result;
        setReviewData(result);

        return result.data;
      }
    } catch (err) {
      console.error(err);
    }
  };
  console.log("bla", reviewData);
  const fetchProperties = async () => {
    try {
      const getUserId = await localStorage.getItem("userId");
      const userId = JSON.parse(getUserId);
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      if (data) {
        const response = await fetch(`${API_URL}/properties/active/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data}`,
          },
        });
        if (!response.ok) {
          toast.error("Error in fetching data");
        }
        const result = await response.json();
        setProperties(result.data);

        return result.data;
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchData();
  }, [selectedRating, selectedProperty, search, date]);
  useEffect(() => {
    fetchProperties();
  }, []);
  // const {
  //   data: reviewData,
  //   isLoading: isReviewLoading, // Renamed for clarity
  //   error: reviewError, // Renamed for clarity
  //   isFetching: isReviewFetching,
  //   isError: isReviewError,
  // } = useQuery({
  //   queryKey: ["review"],
  //   queryFn: () => fetchData(),
  // });
  function checkLength(value) {
    if (value?.length > 15) {
      return value.substring(0, 15) + "…";
    }
    return value;
  }
  const updateFlag = async () => {
    try {
      const getUserId = await localStorage.getItem("userId");
      const userId = JSON.parse(getUserId);
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      if (data) {
        const response = await fetch(
          `${API_URL}/booking/update-flag?id=${bookingId}&email=${hostEmail}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data}`,
            },
          }
        );
        if (!response.ok) {
          toast.error("Error during update");
        }
        toast.success("Successfully flagged review");
        setDialogOpen(false);
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleModal = (review) => {
    setDialogOpen(true);
    console.log("ogs", review?.bookingId?._id);
    setBookingId(review?.bookingId?._id);
    setHostEmail(review?.property?.hostEmail);
  };
  const StatusPill = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case "accept":
          return "bg-green-100 text-green-800";
        case "reject":
          return "bg-red-100 text-red-800";

        default:
          return "bg-gray-100 text-gray-800";
      }
    };
    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
          status?.hideStatus
        )}`}
      >
        {status?.bookingId?.flag
          ? status?.hideStatus?.charAt(0).toUpperCase() +
            status?.hideStatus?.slice(1)
          : null}
      </span>
    );
  };
  return (
    <div className="space-y-4 grid grid-cols-1">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Review Flagging</DialogTitle>
            <DialogDescription>
              Are you sure you want to flag this review? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={updateFlag}>
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="container mx-auto  space-y-6 max-w-full">
        <h1 className="text-2xl font-semibold font-bricolage text-absoluteDark">
          Guest Reviews
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reviews
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {reviewData?.reviewCount ? (
                <div className="text-2xl font-bold">
                  {reviewData?.reviewCount}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No records found
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {/* <p className="text-xs text-muted-foreground">+0.2 from last month</p> */}
              {reviewData?.averageRating ? (
                <div className="text-2xl font-bold">
                  {reviewData?.averageRating}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No records found
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Positive Reviews
              </CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              {/* <p className="text-xs text-muted-foreground">+3% from last month</p> */}
              <p className="text-xs text-muted-foreground">No records found</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Review Trend
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NA</div>
              {/* <p className="text-xs text-muted-foreground">+15% review rate</p> */}
              <p className="text-xs text-muted-foreground">No records found</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex grid w-full gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Input
                  placeholder="Search reviews..."
                  className=""
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                  value={selectedProperty}
                  onValueChange={setSelectedProperty}
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="Filter by property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>

                    {properties
                      ? properties.map((item) => (
                          <SelectItem key={item?.title} value={item?.title}>
                            {item?.title}
                          </SelectItem>
                        ))
                      : null}
                    {/* <SelectItem value="beachside">Beachside Villa</SelectItem>
                  <SelectItem value="mountain">Mountain Retreat</SelectItem>
                  <SelectItem value="city">City Center Apartment</SelectItem> */}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedRating}
                  onValueChange={setSelectedRating}
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="Filter by rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        " justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Review ID</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Request</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewData?.data ? (
                  reviewData?.data.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell className="font-medium">
                        <span title={review._id}>
                          {" "}
                          {checkLength(review._id)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          title={
                            review.user.firstName + " " + review.user.lastName
                          }
                        >
                          {" "}
                          {checkLength(
                            review.user.firstName + " " + review.user.lastName
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-current text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <span title={review.content}>
                          {checkLength(review.content)}
                        </span>
                      </TableCell>
                      <TableCell>{review.property.title}</TableCell>
                      <TableCell>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {/* <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4" />
                            <span className="sr-only">Reply</span>
                          </Button> */}
                          {!review?.bookingId?.flag ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleModal(review)}
                            >
                              <Flag className="h-4 w-4" />
                              <span className="sr-only">Flag</span>
                            </Button>
                          ) : (
                            "Flagged"
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusPill status={review} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="font-medium">No Data....</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
// {reviews.map((review) => (
//             <TableRow key={review.id}>
//               <TableCell className="font-medium">{review.id}</TableCell>
//               <TableCell>{review.guest}</TableCell>
//               <TableCell>
//                 <div className="flex items-center">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={`h-4 w-4 ${
//                         i < review.rating
//                           ? "text-yellow-400"
//                           : "text-gray-300"
//                       }`}
//                     />
//                   ))}
//                 </div>
//               </TableCell>
//               <TableCell className="max-w-xs truncate">
//                 {review.comment}
//               </TableCell>
//               <TableCell>{review.property}</TableCell>
//               <TableCell>{review.date}</TableCell>
//               <TableCell>
//                 <div className="flex space-x-2">
//                   <Button variant="ghost" size="sm">
//                     <MessageSquare className="h-4 w-4" />
//                     <span className="sr-only">Reply</span>
//                   </Button>
//                   <Button variant="ghost" size="sm">
//                     <Flag className="h-4 w-4" />
//                     <span className="sr-only">Flag</span>
//                   </Button>
//                 </div>
//               </TableCell>
//             </TableRow>
//           ))}
