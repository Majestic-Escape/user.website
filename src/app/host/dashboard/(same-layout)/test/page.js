//test

"use client";
import { Button } from "@/components/ui/button";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const TestPage = () => {
  return (
    <div className="container mx-auto space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-bricolage text-absoluteDark mb-2">
            Testing
          </h1>
          <Button
            className="text-white bg-primaryGreen hover:bg-brightGreen rounded-3xl"
            onClick={async () => {
              console.log("payouts cron API called");
              const response = await fetch(`${API_URL}/payment/schedule-cron`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });
            }}
          >
            Cron for payout
          </Button>
          <div>
            The above cron collects all the booking whose checkin date is today
            and performs payout using razorpay
          </div>
        </div>
      </div>
    </div>
  );
};
export default TestPage;
