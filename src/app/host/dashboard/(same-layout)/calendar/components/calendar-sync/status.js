// Wording for SyncGuard states. The two directions are described separately
// and only with what Majestic can actually observe (docs/syncguard.md §10).

// Relative time, computed when the panel renders (no ticking timers; the
// panel refetches on focus and after every action).
export function relativeTime(value, now = Date.now()) {
  if (!value) return null;
  const ms = now - new Date(value).getTime();
  if (!Number.isFinite(ms)) return null;
  const abs = Math.abs(ms);
  const min = Math.round(abs / 60_000);
  let text;
  if (abs < 60_000) text = "just now";
  else if (min < 60) text = `${min} min`;
  else if (min < 48 * 60) text = `${Math.round(min / 60)} h`;
  else text = `${Math.round(min / 1440)} days`;
  if (text === "just now") return text;
  return ms >= 0 ? `${text} ago` : `in ${text}`;
}

export const TONES = {
  good: { dot: "bg-emerald-600", pill: "bg-emerald-50 text-emerald-800 ring-emerald-600/20" },
  warn: { dot: "bg-amber-500", pill: "bg-amber-50 text-amber-900 ring-amber-600/25" },
  bad: { dot: "bg-red-600", pill: "bg-red-50 text-red-800 ring-red-600/20" },
  neutral: { dot: "bg-gray-400", pill: "bg-gray-50 text-gray-700 ring-gray-500/20" },
};

// Overall protection of a connection / the whole listing.
export const PROTECTION = {
  HEALTHY: { tone: "good", label: "Protected" },
  DEGRADED: { tone: "warn", label: "Partly protected" },
  ACTION_REQUIRED: { tone: "bad", label: "Action required" },
  NONE: { tone: "neutral", label: "Not connected" },
};

// {Provider} → Majestic
export function inboundText(state, provider) {
  switch (state) {
    case "HEALTHY":
      return { tone: "good", label: "Up to date", detail: `Bookings from ${provider} block these dates on Majestic.` };
    case "DEGRADED":
      return { tone: "warn", label: "Retrying", detail: `The last check of ${provider} failed. Dates already blocked stay blocked.` };
    case "STALE":
      return { tone: "warn", label: "Out of date", detail: `${provider} hasn't been checked recently. Guests booking on Majestic trigger a fresh check first.` };
    case "PARTIAL":
      return { tone: "warn", label: "Partly read", detail: `Some entries of ${provider} couldn't be read fully.` };
    case "BROKEN":
      return { tone: "bad", label: "Not working", detail: null };
    case "NEEDS_ATTENTION":
      return { tone: "bad", label: "Needs attention", detail: null };
    case "PENDING":
      return { tone: "neutral", label: "Checking…", detail: "The first check is on its way." };
    default:
      return { tone: "neutral", label: state || "Unknown", detail: null };
  }
}

// Majestic → {Provider}: we can only see that *someone* requested the link
// (the request names itself as an app), never that it is saved in the OTA.
export function outboundText(state, provider, exp) {
  switch (state) {
    case "ACTIVE":
      // The requester's name comes from its User-Agent — a claim, not proof.
      return {
        tone: "good",
        label: "Link in use",
        detail: `Your Majestic link was last requested ${relativeTime(exp.lastServedAt)}${exp.lastServedAgent && exp.lastServedAgent !== "Other" ? ` by an app identifying itself as ${exp.lastServedAgent}` : ""}.`,
      };
    case "OPENED":
      // Something opened the link (a chat preview, a browser) but nothing
      // that identifies as a calendar service has requested it yet.
      return {
        tone: "warn",
        label: "Opened, not by a calendar",
        detail: `Your Majestic link was opened ${relativeTime(exp.lastServedAt)}, but not by an app identifying itself as ${provider} or another calendar service. Check the link is saved in ${provider}.`,
      };
    case "QUIET":
      return { tone: "warn", label: "Not requested lately", detail: `Nobody has requested your Majestic link since ${relativeTime(exp.lastServedAt)}. Check it is still saved in ${provider}.` };
    case "WAITING":
      return { tone: "warn", label: "Waiting for first request", detail: `You've added the link. ${provider} hasn't requested it yet — this can take a few hours.` };
    case "NOT_CONFIRMED":
      return { tone: "warn", label: "Not set up yet", detail: `Add your Majestic link in ${provider} so Majestic bookings block dates there too.` };
    default:
      return { tone: "neutral", label: "No link", detail: null };
  }
}
