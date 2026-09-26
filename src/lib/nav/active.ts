// Which navigation item the current page belongs to. Shared by every menu
// (bottom bars, sidebars, sheets, category tabs) so they all agree.
//
// Exact items ("/") only match themselves; the rest also match their
// sub-pages ("/host/dashboard/bookings/review-guest" lights "Bookings").
// Among several matches the longest href wins, so "/host/dashboard" does not
// stay lit on "/host/dashboard/bookings".
export type NavMatch = { href: string; exact?: boolean; also?: string[] };

function matches(pathname: string, href: string, exact?: boolean): boolean {
  if (pathname === href) return true;
  if (exact || href === "/") return false;
  return pathname.startsWith(href.endsWith("/") ? href : `${href}/`);
}

/** The href of the item that is active for `pathname`, or null. */
export function activeHref(pathname: string | null | undefined, items: NavMatch[]): string | null {
  if (!pathname) return null;
  let best: string | null = null;
  let bestLen = -1;
  for (const item of items) {
    const candidates = [item.href, ...(item.also ?? [])];
    for (const c of candidates) {
      if (matches(pathname, c, item.exact && c === item.href) && c.length > bestLen) {
        best = item.href;
        bestLen = c.length;
      }
    }
  }
  return best;
}
