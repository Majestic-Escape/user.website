import { redirect } from "next/navigation";

// Hosts and travelers share one account and one OTP login. The dedicated
// host login page is parked (see page.md), but /host/login is still linked
// from the host navbar, register form and the dashboard logout — send those
// to the working login instead of a 404. After login, AuthContext's
// returnUrl brings the host back to where they were.
export default function HostLoginRedirect() {
  redirect("/login");
}
