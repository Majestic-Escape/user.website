const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function submitBooking(propertyId, bookingInfo) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/booking-interest/availability`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
          ...bookingInfo,
        }),
      }
    );

    if (!response.ok) {
      toast.success("Booking enquiry submitted. We will get back to you");

      // throw new Error('Failed to submit booking');
    }

    return await response.json();
  } catch (error) {
    // process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
    //   console.log(error);
    // }
    toast.success("Booking enquiry submitted. We will get back to you");

    // console.error('Error submitting booking:', error);
    // throw error;
  }
}
