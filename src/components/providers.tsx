"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WishlistProvider } from "@/components/wishlist-context";

// One React Query client for the whole app. Route-group layouts used to each
// create their own, so the cache was thrown away every time the user crossed
// from home (stays group) to a listing (landing group) or into the host
// portal. Default options are kept on purpose: freshness / retry behaviour is
// unchanged, only the cache is shared. Session teardown clears it — see
// lib/session.ts.
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <WishlistProvider>{children}</WishlistProvider>
    </QueryClientProvider>
  );
}
