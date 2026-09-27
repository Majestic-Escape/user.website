// The nine "Explore by destination" cards on the home page. Shared by the
// client section (location-wise-stays.jsx) and the server prefetch
// (lib/server/catalogue.ts) so both build the same countstays request.
// Images are the pre-generated WebP variants (scripts/optimize-static-images.mjs),
// served as plain files. A card's number comes only from the backend (the
// stays its page lists); there is no fallback number.
export type Destination = {
  id: number;
  name: string;
  image: string; // 1x (300 w)
  image2x: string; // 2x (600 w)
};

const spot = (file: string) => ({ image: `/images/spots/gen/${file}-300.webp`, image2x: `/images/spots/gen/${file}-600.webp` });

export const destinations: Destination[] = [
  { id: 1, name: "Panjim", ...spot("panjim") },
  { id: 2, name: "Ujjain", ...spot("ujjain") },
  { id: 3, name: "Nashik", ...spot("nashik") },
  { id: 4, name: "Mapusa", ...spot("mapusa") },
  { id: 5, name: "Margao", ...spot("margao") },
  { id: 6, name: "Lucknow", ...spot("lucknow") },
  { id: 7, name: "Varanasi", ...spot("varanasi") },
  { id: 8, name: "Ayodhya", ...spot("ayodhya") },
  { id: 9, name: "Kutch", ...spot("kutch") },
];

// `city=Panjim,Ujjain,…` exactly as the section has always sent it.
export const destinationCities = destinations.map((d) => d.name).join(",");
