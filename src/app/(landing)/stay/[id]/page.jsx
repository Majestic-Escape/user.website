// src/app/stay/[id]/page.jsx - NEW SERVER COMPONENT
// You need to create this function
import PropertyPageClient from "./PropertyPageClient";

// Function to fetch property data (server-side)
async function fetchProperty(id) {
  if (!id) throw new Error("Property ID is missing");

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${API_URL}/properties/${id}`, {
    // Add cache control if needed
    next: { revalidate: 3600 }, // Revalidate every hour
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch property data (status: ${response.status})`,
    );
  }

  const result = await response.json();
  return result.data;
}

// DYNAMIC METADATA FOR PROPERTY PAGE
export async function generateMetadata({ params }) {
  try {
    const property = await fetchProperty(params.id);
    const siteUrl = "http://localhost:3000" || "https://user.me.coderelix.in";

    return {
      title: `${property.title} | Majestic Escape`,
      description:
        property.description ||
        `Book ${property.title} in ${property.address?.city || "Goa"}. ${property.basePrice ? `₹${property.basePrice} per night` : ""}`,

      openGraph: {
        title: property.title,
        description:
          property.description ||
          `Experience ${property.title} with Majestic Escape. ${property.basePrice ? `₹${property.basePrice} per night` : ""}`,
        url: `${siteUrl}/stay/${params.id}`,
        siteName: "Majestic Escape",
        images: [
          {
            url: property.photos?.[0] || `${siteUrl}/default-property.jpg`,
            width: 1200,
            height: 630,
            alt: property.title,
          },
        ],
        locale: "en_IN",
        type: "website",
      },

      twitter: {
        card: "summary_large_image",
        title: property.title,
        description:
          property.description || `Book ${property.title} on Majestic Escape`,
        images: [property.photos?.[0] || `${siteUrl}/default-property.jpg`],
      },

      other: {
        "og:price:amount": property.basePrice?.toString() || "",
        "og:price:currency": "INR",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Property | Majestic Escape",
      description: "Discover amazing properties on Majestic Escape",
    };
  }
}

// Server component that fetches data and passes to client
export default async function PropertyPage({ params }) {
  try {
    const property = await fetchProperty(params.id);
    return <PropertyPageClient initialProperty={property} params={params} />;
  } catch (error) {
    // Handle error gracefully
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center p-8 bg-red-50 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-red-700 mb-2">
            Error loading property
          </h2>
          <p className="text-red-600">Try refreshing</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}
