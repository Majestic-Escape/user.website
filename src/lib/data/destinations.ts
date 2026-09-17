// The nine "Explore by destination" cards on the home page. Shared by the
// client section (location-wise-stays.jsx) and the server prefetch
// (lib/server/catalogue.ts) so both build the same countstays request.
// Images are the pre-generated WebP variants (scripts/optimize-static-images.mjs),
// served as plain files.
export type Destination = {
  id: number;
  name: string;
  staysNearby: number; // fallback shown when the live count is unavailable
  image: string; // 1x (300 w)
  image2x: string; // 2x (600 w)
};

const spot = (file: string) => ({ image: `/images/spots/gen/${file}-300.webp`, image2x: `/images/spots/gen/${file}-600.webp` });

export const destinations: Destination[] = [
  { id: 1, name: "Panjim", staysNearby: 19, ...spot("panjim") },
  { id: 2, name: "Ujjain", staysNearby: 10, ...spot("ujjain") },
  { id: 3, name: "Nashik", staysNearby: 6, ...spot("nashik") },
  { id: 4, name: "Mapusa", staysNearby: 8, ...spot("margao") },
  { id: 5, name: "Margao", staysNearby: 15, ...spot("mapusa") },
  { id: 6, name: "Lucknow", staysNearby: 15, ...spot("lucknow") },
  { id: 7, name: "Varanasi", staysNearby: 32, ...spot("varanasi") },
  { id: 8, name: "Ayodhya", staysNearby: 32, ...spot("ayodhya") },
  { id: 9, name: "Kutch", staysNearby: 32, ...spot("kutch") },
];

// `city=Panjim,Ujjain,…` exactly as the section has always sent it.
export const destinationCities = destinations.map((d) => d.name).join(",");
