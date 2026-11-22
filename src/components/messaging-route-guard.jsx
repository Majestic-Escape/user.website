"use client";

// Wraps a messaging route (/messages, /host/inbox, /contact_host/*). While
// messaging is switched off the page itself is NOT rendered — so it opens no
// socket, makes no chat request and shows no "try again" error — and the
// unavailable notice takes its place. The data was never reachable anyway: the
// chat service refuses every request while the switch is off. This is what a
// visitor who types the URL (or follows an old e-mail link) sees.
//
// What decides, in order:
//   1. the store says off (a refused request, a dropped socket, a config read)  → notice
//   2. this mount's own fresh read succeeded                                    → page
//   2b. this page load already learned "on" (newer than the server's render)    → page
//   3. the route layout (server) said off and nothing newer exists              → notice
//   4. a fresh answer already says on (read < 60 s ago)                         → page at once
//   5. the lookup itself failed (widget service unreachable / blocked)          → page
//      (fail-open: the chat service enforces the switch; a failed LOOKUP must not
//      take a working inbox away)
//   6. otherwise (first page of a visit) wait for the one read already in
//      flight — a blank beat of one request (≤ 1.5 s), never a page that is
//      about to be refused. Rule 4 keeps every later visit instant.
// The route layout's value alone is not trusted for "on": its page shell can be
// up to a request behind the switch (ISR), so the first visit after a flip would
// otherwise mount the page for a moment.
//
// While the notice is up the guard looks again every 30 s, so the page returns
// by itself when an admin switches messaging back on.

import { useEffect, useState } from "react";
import { MessagingUnavailable } from "@/components/messaging-unavailable";
import {
  ensureMessagingConfig,
  isMessagingStatusFresh,
  isMessagingStatusFromThisPage,
  markMessagingDisabled,
  useMessagingStatus,
} from "@/lib/use-messaging-enabled";

const RECHECK_WHILE_OFF_MS = 30_000;

// `fallback` is what shows while the answer is pending — pass the route's own
// loading skeleton. It is also what the SERVER renders (the guard has no answer
// yet at that point), so it is what a visitor sees until the page's JavaScript
// has loaded; a blank box there would replace the skeleton these routes
// carefully render from the first frame.
export function MessagingRouteGuard({ serverEnabled = true, home, homeLabel, fallback = null, children }) {
  const status = useMessagingStatus();
  const [verified, setVerified] = useState(false); // this mount's own read has finished

  let view;
  if (status === "off") view = "off";
  else if (verified) view = "on";
  else if (status === "on" && isMessagingStatusFromThisPage()) view = "on"; // newer than the server's render
  else if (!serverEnabled) view = "off";
  else if (status === "on" && isMessagingStatusFresh()) view = "on";
  else if (status === "unreadable") view = "on";
  else view = "wait";

  useEffect(() => {
    if (!serverEnabled) markMessagingDisabled();
    let alive = true;
    ensureMessagingConfig({ force: true }).then(() => {
      if (alive) setVerified(true);
    });
    return () => {
      alive = false;
    };
  }, [serverEnabled]);

  useEffect(() => {
    if (view !== "off") return undefined;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") ensureMessagingConfig({ force: true });
    }, RECHECK_WHILE_OFF_MS);
    return () => clearInterval(id);
  }, [view]);

  if (view === "off") return <MessagingUnavailable home={home} homeLabel={homeLabel} />;
  if (view === "wait") return <div aria-busy="true">{fallback ?? <div className="min-h-[50vh]" />}</div>;
  return children;
}
