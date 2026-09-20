// How the OTHER party is named across the site (contact lock-down, 2026-09-20):
// first name only — the API no longer returns a counterpart's last name, and
// no page should try to render one. Never yields "undefined" or a stray space.
//
//   counterpartName(booking.hostId, "Host")   → "Rahul"
//   counterpartName(null, "Guest")            → "Guest"
export function counterpartName(user, fallback = "") {
  if (!user || typeof user !== "object") return fallback;
  const first = typeof user.firstName === "string" ? user.firstName.trim() : "";
  return first || fallback;
}

// The signed-in user's own name (own profile, own invoice): full name.
export function ownFullName(user, fallback = "") {
  if (!user || typeof user !== "object") return fallback;
  const parts = [user.firstName, user.lastName].map((p) => (typeof p === "string" ? p.trim() : "")).filter(Boolean);
  return parts.join(" ") || fallback;
}
