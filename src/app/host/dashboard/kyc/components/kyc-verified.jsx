"use client";

// The "already verified" state of /host/dashboard/kyc and /kyc-edit/[id]:
// a summary of what was verified and where to go next, in the dashboard's
// card language instead of a bare sentence.
import Link from "next/link";
import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  FileCheck,
  Landmark,
  MapPin,
  PlusCircle,
  Receipt,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DOCUMENT_LABELS = {
  pan: "PAN card",
  voterId: "Voter ID",
  passport: "Passport",
  aadhaar: "Aadhaar",
  drivingLicense: "Driving licence",
};

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Only the tail of an identifier is shown on screen (the page can be open
// on a shared device); the stored value may already be masked.
function maskTail(value, keep = 4) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= keep) return text;
  return `${"•".repeat(Math.min(text.length - keep, 8))}${text.slice(-keep)}`;
}

function joinAddress(address) {
  if (!address) return "";
  return [address.city, address.state]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");
}

export function KycVerifiedState({ form, firstName }) {
  const documentType = form?.documentInfo?.documentType;
  const documentLabel =
    DOCUMENT_LABELS[documentType] || (documentType ? documentType : "Identity document");
  const verifiedOn =
    formatDate(form?.documentInfo?.verifiedAt) || formatDate(form?.updatedAt);
  const gst = form?.gstInfo;
  const gstVerified = !!(gst && gst.isVerified && gst.gstNumber);
  const address = joinAddress(form?.personalInfo?.address);

  const details = [
    {
      icon: FileCheck,
      label: "Document",
      value: documentLabel,
      hint: "Verified",
    },
    {
      icon: CalendarCheck,
      label: "Verified on",
      value: verifiedOn || "—",
    },
    {
      icon: Receipt,
      label: "GST",
      value: gstVerified ? maskTail(gst.gstNumber) : "Not added",
      hint: gstVerified ? "Verified" : "Optional",
    },
    {
      icon: MapPin,
      label: "Address",
      value: address || "—",
    },
  ];

  const nextSteps = [
    {
      icon: PlusCircle,
      title: "Add a listing",
      text: "Verified hosts can publish new properties.",
      href: "/host/dashboard/add-listing",
      cta: "Add property",
    },
    {
      icon: Landmark,
      title: "Payouts",
      text: "Add your bank details to receive payments.",
      href: "/host/dashboard/bank-info",
      cta: "Set up payouts",
    },
    {
      icon: CalendarDays,
      title: "Calendar",
      text: "Keep your availability in sync.",
      href: "/host/dashboard/calendar",
      cta: "Open calendar",
    },
    {
      icon: ClipboardList,
      title: "Bookings",
      text: "Track requests, confirmed stays and check-ins.",
      href: "/host/dashboard/bookings",
      cta: "View bookings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-poppins" data-testid="kyc-verified">
      <header className="bg-white w-full z-50 top-0 fixed right-0 left-0 border-b border-b-gray-200 p-4">
        <div className="container max-w-7xl mx-auto px-4 flex justify-between items-center gap-3">
          <Link
            className="px-6 py-2 border rounded-3xl border-black font-medium text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-absoluteDark whitespace-nowrap"
            href={"/host/dashboard"}
          >
            Back to Dashboard
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs sm:text-sm font-medium text-primaryGreen whitespace-nowrap">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            KYC verified
          </span>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 pt-28 pb-16">
        <Card className="bg-white border-green-300">
          <CardHeader className="items-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
              <BadgeCheck className="h-9 w-9 text-primaryGreen" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-medium text-absoluteDark font-bricolage">
              Your KYC is verified
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-stone max-w-md">
              Thanks{firstName ? `, ${firstName}` : ""}. Your identity is confirmed,
              so your listings can go live and you can receive payouts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2" data-testid="kyc-verified-details">
              {details.map(({ icon: Icon, label, value, hint }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <Icon className="h-5 w-5 mt-0.5 text-primaryGreen shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-xs uppercase tracking-wide text-stone">{label}</dt>
                    <dd className="text-sm font-medium text-absoluteDark break-words">
                      {value}
                      {hint ? (
                        <span className="ml-2 text-xs font-normal text-stone">{hint}</span>
                      ) : null}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/host/dashboard/listings"
                className="inline-flex items-center justify-center rounded-3xl bg-primaryGreen px-6 py-2.5 text-sm font-medium text-white hover:bg-brightGreen transition-colors"
              >
                Go to your listings
              </Link>
              <Link
                href="/host/dashboard/add-listing"
                className="inline-flex items-center justify-center rounded-3xl border border-primaryGreen bg-green-50 px-6 py-2.5 text-sm font-medium text-primaryGreen hover:text-green-500 transition-colors"
              >
                Add a new listing
              </Link>
            </div>

            <p className="mt-6 text-xs text-stone">
              Need to change a verified detail? Write to{" "}
              <a className="underline text-primaryGreen" href="mailto:info@majesticescape.in">
                info@majesticescape.in
              </a>
              {" "}— verified KYC isn&apos;t edited in place, so your listings stay live.
            </p>
          </CardContent>
        </Card>

        <h2 className="mt-8 mb-3 text-lg font-medium text-absoluteDark font-bricolage">
          What&apos;s next
        </h2>
        <div className="grid gap-4 sm:grid-cols-2" data-testid="kyc-next-steps">
          {nextSteps.map(({ icon: Icon, title, text, href, cta }) => (
            <Card key={href} className="bg-white border-green-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-absoluteDark font-bricolage">
                  {title}
                </CardTitle>
                <Icon className="h-6 w-6 text-primaryGreen" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone mb-4">{text}</p>
                <Link
                  href={href}
                  className="inline-block bg-green-50 border text-sm font-medium py-2 px-4 rounded mt-2 border-primaryGreen hover:text-green-500 text-primaryGreen"
                >
                  {cta}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export default KycVerifiedState;
