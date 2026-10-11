import { useCallback, useEffect, useState } from "react";

// Counts down the server's `retryAfterSeconds` so a button can stay disabled
// (and say why) until a retry is actually allowed, instead of letting the
// user tap straight into a 429. One 1 s interval while counting, none
// otherwise; the time left is derived from Date.now(), so a throttled
// background tab is still right when it comes back.
export function useRetryCountdown() {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (until <= Date.now()) return undefined;
    setNow(Date.now());
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= until) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [until]);

  const start = useCallback((seconds) => {
    const s = Number(seconds);
    if (Number.isFinite(s) && s > 0) setUntil(Date.now() + s * 1000);
  }, []);

  return { secondsLeft: Math.max(0, Math.ceil((until - now) / 1000)), start };
}

export function formatRetry(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} min`;
  return "later";
}
