"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { socketManager } from "@/lib/socket";
import { useAuth } from "@/contexts/AuthContext";

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:3001";

// Minimum interval between API fetches (2 seconds)
const FETCH_DEBOUNCE_MS = 2000;

const UnreadCountContext = createContext({
  unreadCount: 0,       // unread count for current portal (host or guest)
  hostUnread: 0,        // host-specific unread count
  guestUnread: 0,       // guest-specific unread count
  isLoading: true,
  refreshUnreadCount: async () => {},
});

export function useUnreadCount() {
  return useContext(UnreadCountContext);
}

// Create and cache notification sound
let notificationAudio = null;
function playNotificationSound() {
  try {
    if (!notificationAudio) {
      notificationAudio = new Audio("/sounds/notification.mp3");
      notificationAudio.volume = 0.3;
    }
    const sound = notificationAudio.cloneNode();
    sound.volume = 0.3;
    sound.play().catch(() => {});
  } catch (e) {
    // Audio not supported
  }
}

export function UnreadCountProvider({ children }) {
  const [hostUnread, setHostUnread] = useState(0);
  const [guestUnread, setGuestUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const pathname = usePathname();
  const prevHostRef = useRef(0);
  const prevGuestRef = useRef(0);
  const fetchedRef = useRef(false);
  const socketListenerRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  // Determine which portal the user is on
  const isHostPortal = pathname?.startsWith("/host");
  const unreadCount = isHostPortal ? hostUnread : guestUnread;

  // Fetch BOTH unread counts in a single API call (role=all)
  const fetchUnreadCount = useCallback(async (force = false) => {
    // Debounce: skip if called within FETCH_DEBOUNCE_MS
    const now = Date.now();
    if (!force && now - lastFetchTimeRef.current < FETCH_DEBOUNCE_MS) {
      return;
    }
    lastFetchTimeRef.current = now;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setHostUnread(0);
        setGuestUnread(0);
        setIsLoading(false);
        return;
      }

      const parsed = JSON.parse(token);
      const headers = { Authorization: `Bearer ${parsed}` };

      // Single API call returns both host and guest counts
      const res = await fetch(`${CHAT_URL}/api/chat/unread-count?role=all`, { headers });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const hostCount = data.data.host || 0;
          const guestCount = data.data.guest || 0;
          setHostUnread(hostCount);
          setGuestUnread(guestCount);
          prevHostRef.current = hostCount;
          prevGuestRef.current = guestCount;
        }
      }
    } catch (error) {
      console.error("[UnreadCount] Error fetching unread count:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and when user changes
  useEffect(() => {
    if (!user) {
      setHostUnread(0);
      setGuestUnread(0);
      setIsLoading(false);
      fetchedRef.current = false;
      return;
    }

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchUnreadCount(true); // force on initial load
    }
  }, [user, fetchUnreadCount]);

  // Subscribe to real-time unread count updates via socket
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    let parsed;
    try {
      parsed = JSON.parse(token);
    } catch {
      return;
    }

    const socket = socketManager.getSocket(parsed);
    if (!socket) return;

    if (socketListenerRef.current) {
      socketManager.releaseSocket();
      return;
    }

    const handleUnreadUpdate = (data) => {
      if (!data || typeof data.totalUnread !== "number" || !data.role) return;
      
      const { totalUnread, role } = data;

      if (role === "host") {
        if (totalUnread > prevHostRef.current && prevHostRef.current >= 0) {
          playNotificationSound();
          showBrowserNotification(totalUnread, "host");
        }
        prevHostRef.current = totalUnread;
        setHostUnread(totalUnread);
      } else if (role === "guest") {
        if (totalUnread > prevGuestRef.current && prevGuestRef.current >= 0) {
          playNotificationSound();
          showBrowserNotification(totalUnread, "guest");
        }
        prevGuestRef.current = totalUnread;
        setGuestUnread(totalUnread);
      }
    };

    socket.on("unread:update", handleUnreadUpdate);
    socketListenerRef.current = true;

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    return () => {
      socket.off("unread:update", handleUnreadUpdate);
      socketListenerRef.current = false;
      socketManager.releaseSocket();
    };
  }, [user]);

  // Refresh on page visibility change (with debounce)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchUnreadCount(); // debounce is built into fetchUnreadCount
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, fetchUnreadCount]);

  const value = {
    unreadCount,    // current portal's count
    hostUnread,     // host-specific
    guestUnread,    // guest-specific
    isLoading,
    refreshUnreadCount: () => fetchUnreadCount(true), // force refresh bypasses debounce
  };

  return (
    <UnreadCountContext.Provider value={value}>
      {children}
    </UnreadCountContext.Provider>
  );
}

function showBrowserNotification(count, role) {
  if (document.hidden && "Notification" in window && Notification.permission === "granted") {
    try {
      const portal = role === "host" ? "Host" : "Guest";
      new Notification("New Message", {
        body: `You have ${count} unread message${count > 1 ? "s" : ""} (${portal})`,
        icon: "/logo.png",
        tag: `unread-${role}`,
      });
    } catch (e) {
      // Notification API not available
    }
  }
}
