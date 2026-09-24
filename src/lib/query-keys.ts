// Key factories for React Query. Every useQuery and every invalidateQueries
// prefix is built here so a key is never spelled by hand in two places (an
// invalidation that targets `["KYCStatus", email]` while the gate reads
// `["KYCStatus", userId]` silently never fires — that class of bug is what
// this file removes).
//
// Convention: `xxx.all` is the prefix used to invalidate every variant of a
// query; `xxx(args)` is the exact key a component reads. User-scoped keys
// embed the user identity so two accounts on one browser can never share an
// entry (the cache is also cleared on login/logout — see lib/session.ts).

type Id = string | number | null | undefined;

export const queryKeys = {
  // Public catalogue
  frontStays: (type: Id) => ["frontStays", type ?? "all"] as const,
  frontStaysAll: ["frontStays"] as const,
  countStays: ["countStays"] as const,
  search: (params: string, page: Id) => ["search", params, page ?? 1] as const,
  searchAll: ["search"] as const,
  placesIndex: ["placesIndex"] as const,
  staySuggest: (q: string) => ["staySuggest", q] as const,
  property: (id: Id) => ["property", id] as const,
  reviews: (propertyId: Id, limit: Id, skip: Id) =>
    ["review", propertyId, limit, skip] as const,
  reviewsAll: (propertyId: Id) => ["review", propertyId] as const,
  checkDates: (propertyId: Id) => ["checkDates", propertyId] as const,

  // Traveler
  userBookings: (userId: Id) => ["userBookings", userId] as const,
  userBookingsAll: ["userBookings"] as const,
  bookingById: (bookingId: Id) => ["bookingId", bookingId] as const,
  account: (email: Id) => ["account", email] as const,

  // Host
  kycStatus: (userId: Id) => ["KYCStatus", userId] as const,
  kycStatusAll: ["KYCStatus"] as const,
  listingStatus: (email: Id) => ["listingStatus", email] as const,
  listingStatusAll: ["listingStatus"] as const,
  hostListings: (email: Id, page: Id) =>
    ["hostListings", email, page ?? 1] as const,
  hostListingsAll: ["hostListings"] as const,
  hostBookings: (hostId: Id, filters: unknown) =>
    ["hostBookings", hostId, filters] as const,
  hostBookingsAll: ["hostBookings"] as const,
  activeBookings: (hostId: Id) => ["activeBookings", hostId] as const,
  activeBookingsAll: ["activeBookings"] as const,
};
