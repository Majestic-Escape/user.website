"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Search,
  Send,
  ArrowLeft,
  Loader2,
  WifiOff,
  CheckCheck,
  Check,
  Home,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { socketManager } from "@/lib/socket";
import MobileChatContainer from "@/components/mobile-chat-container";
import MobileChatInput from "@/components/mobile-chat-input";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useUnreadCount } from "@/contexts/UnreadCountContext";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { getInitialPropertyDetails, setCachedProperty } from "@/lib/propertyDetailsCache";
import {
  getCachedConversations,
  setCachedConversations,
  readUserIdFromStoredToken,
} from "@/lib/conversationsCache";
import ConversationRowsSkeleton from "@/components/conversation-row-skeleton";

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:3001";

export default function HostInboxPage() {
  // Read the session cache once, synchronously, before the first paint. The
  // auth effect sets `currentUserId` too late to seed initial state, so we
  // decode the same token here. On a revisit the list renders on frame one
  // instead of showing a loader while the request round-trips.
  //
  // Scoped to "host": the same userId has a separate, different list under
  // "guest" for /messages. Sharing a key would paint guest threads here.
  const [bootstrap] = useState(() => {
    const cachedUserId = readUserIdFromStoredToken();
    return {
      userId: cachedUserId,
      conversations: getCachedConversations(cachedUserId, "host") ?? [],
    };
  });

  const [conversations, setConversations] = useState(bootstrap.conversations);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // Only block on a genuinely cold start; with a cached list we render it
  // immediately and revalidate in the background.
  const [isLoading, setIsLoading] = useState(bootstrap.conversations.length === 0);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [propertyDetails, setPropertyDetails] = useState(() => getInitialPropertyDetails());
  // Property ids with a request currently in the air — see fetchConversationDetails.
  const inFlightPropertiesRef = useRef(new Set());
  const [showPropertyInfo, setShowPropertyInfo] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Map()); // Map<conversationId, Set<userId>>

  // Track page visibility - only mark messages as read when page is visible
  const isPageVisible = usePageVisibility();
  const { refreshUnreadCount } = useUnreadCount();

  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);
  const tokenRef = useRef(null);
  const desktopInputRef = useRef(null);
  const shouldRefocusRef = useRef(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Refocus desktop input after message is sent
  useEffect(() => {
    if (shouldRefocusRef.current && newMessage === "" && !isMobileView) {
      const input = desktopInputRef.current;
      if (input) {
        requestAnimationFrame(() => {
          input.focus();
        });
      }
      shouldRefocusRef.current = false;
    }
  }, [newMessage, isMobileView]);

  // Auto-focus desktop input when conversation is selected
  useEffect(() => {
    if (!isMobileView && selectedConversation && !isLoadingMessages && desktopInputRef.current) {
      setTimeout(() => {
        desktopInputRef.current?.focus();
      }, 100);
    }
  }, [selectedConversation?.id, isLoadingMessages, isMobileView]);

  // Get token and user ID on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const parsed = JSON.parse(token);
        tokenRef.current = parsed;
        const payload = JSON.parse(atob(parsed.split(".")[1]));
        setCurrentUserId(payload.userId);
      } catch (e) {
        console.error("Invalid token:", e);
      }
    }
  }, []);

  // Refs to track current state in socket callbacks (avoids stale closures)
  const selectedConversationRef = useRef(null);
  // Seeded from the same cache as state so loadConversations() can tell a cold
  // start from a revalidate without depending on effect ordering.
  const conversationsRef = useRef(bootstrap.conversations);
  const isMobileViewRef = useRef(false);
  const programmaticBackRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    conversationsRef.current = conversations;
    // Persist on every change rather than only after the initial fetch, so
    // socket-driven updates (new message, unread counts) are what the next
    // visit paints instead of a list that went stale the moment a guest replied.
    if (currentUserId && conversations.length > 0) {
      setCachedConversations(currentUserId, "host", conversations);
    }
  }, [conversations, currentUserId]);

  useEffect(() => {
    isMobileViewRef.current = isMobileView;
  }, [isMobileView]);

  // Handle browser back button on mobile: go to conversation list instead of leaving the page
  useEffect(() => {
    const handlePopState = () => {
      if (programmaticBackRef.current) {
        programmaticBackRef.current = false;
        return;
      }
      if (isMobileViewRef.current && selectedConversationRef.current) {
        setSelectedConversation(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobileView(isMobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard detection for auto-toggling property info
  const isManualToggleRef = useRef(false);
  const lastKeyboardStateRef = useRef(false);

  // Handle keyboard state change from MobileChatContainer
  const handleKeyboardChange = useCallback((isOpen) => {
    const keyboardStateChanged = lastKeyboardStateRef.current !== isOpen;
    lastKeyboardStateRef.current = isOpen;
    
    // Only auto-toggle if keyboard state actually changed and not a manual toggle
    if (keyboardStateChanged && !isManualToggleRef.current) {
      if (isOpen) {
        // Keyboard opened - auto-collapse
        setShowPropertyInfo(false);
      } else {
        // Keyboard closed - auto-expand
        setShowPropertyInfo(true);
      }
    }
    // Always reset manual toggle flag when keyboard state changes
    // This allows auto-toggle to work again after the next keyboard change
    if (keyboardStateChanged) {
      isManualToggleRef.current = false;
    }
  }, []);

  // Handle manual toggle of property info
  const handleTogglePropertyInfo = useCallback(() => {
    isManualToggleRef.current = true;
    setShowPropertyInfo(prev => !prev);
  }, []);

  const handleSelectConversation = useCallback((conv) => {
    setSelectedConversation(conv);
    // Push a history entry on mobile so the browser back button returns to the list
    if (isMobileViewRef.current) {
      history.pushState({ conversationSelected: true }, '');
    }
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedConversation(null);
    // Sync browser history when navigating back via the arrow button
    if (isMobileViewRef.current && history.state?.conversationSelected) {
      programmaticBackRef.current = true;
      history.back();
    }
  }, []);

  // Reset dropdown to expanded when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setShowPropertyInfo(true);
      setShowScrollToBottom(false);
      // Don't clear typing users - we track per conversation now
      isManualToggleRef.current = false;
      lastKeyboardStateRef.current = false;
    }
  }, [selectedConversation?.id]);

  // Scroll detection for showing scroll-to-bottom button
  const handleScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    // Show button if user is more than 100px from bottom
    setShowScrollToBottom(distanceFromBottom > 100);
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Hide bottom navigation when chat is selected on mobile
  useEffect(() => {
    if (isMobileView && selectedConversation) {
      const bottomNav = document.querySelector('nav.fixed.bottom-0');
      if (bottomNav) bottomNav.style.display = 'none';
      
      return () => {
        if (bottomNav) bottomNav.style.display = '';
      };
    }
  }, [isMobileView, selectedConversation]);

  // Initialize socket connection using singleton manager
  useEffect(() => {
    if (!tokenRef.current || !currentUserId) return;

    const socket = socketManager.getSocket(tokenRef.current);
    if (!socket) return;

    socketRef.current = socket;

    // Subscribe to connection state changes from socket manager
    const unsubscribeConnection = socketManager.onConnectionChange((state) => {
      setConnectionStatus(state);
    });

    const handleConnect = () => {
      console.log("[HostInbox] Socket connected");
      // Join all conversation rooms
      conversationsRef.current.forEach((conv) => {
        socketManager.joinRoom(conv.id);
      });
    };

    const handleDisconnect = () => {
      console.log("[HostInbox] Socket disconnected");
      // Connection state is now managed by socketManager
    };

    const handleConnectError = (error) => {
      console.error("[HostInbox] Socket connection error:", error);
      // Connection state is now managed by socketManager
    };

    const handleNewMessage = (data) => {
      const { message, conversationId } = data;

      const isHostConversation = conversationsRef.current.some(
        (conv) => conv.id === conversationId
      );
      
      if (!isHostConversation) return;

      if (selectedConversationRef.current?.id === conversationId) {
        setMessages((prev) => {
          const existingIndex = prev.findIndex(m => 
            m.id === message.id || 
            (message.clientMessageId && m.id === message.clientMessageId)
          );
          
          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = message;
            return updated;
          }
          return [...prev, message];
        });
      }

      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: {
                  content: message.content.text || "[Attachment]",
                  senderId: message.senderId,
                  sentAt: message.createdAt,
                },
                unreadCount: {
                  ...conv.unreadCount,
                  [currentUserId]:
                    selectedConversationRef.current?.id === conversationId
                      ? 0
                      : (conv.unreadCount[currentUserId] || 0) + 1,
                },
              }
            : conv
        );
        return updated.sort((a, b) => {
          const timeA = a.lastMessage?.sentAt ? new Date(a.lastMessage.sentAt) : new Date(0);
          const timeB = b.lastMessage?.sentAt ? new Date(b.lastMessage.sentAt) : new Date(0);
          return timeB - timeA;
        });
      });
    };

    const handleMessageRead = (data) => {
      const { conversationId, messageIds, userId, timestamp } = data;
      if (selectedConversationRef.current?.id === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            messageIds.includes(msg.id)
              ? {
                  ...msg,
                  readBy: [...msg.readBy, { userId, readAt: timestamp }],
                }
              : msg
          )
        );
      }
    };

    const handleTypingUpdate = (data) => {
      const { conversationId, userId, isTyping } = data;
      // Update typing users map for ALL conversations (not just selected)
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        const convTypingUsers = updated.get(conversationId) || new Set();
        
        if (isTyping) {
          convTypingUsers.add(userId);
        } else {
          convTypingUsers.delete(userId);
        }
        
        if (convTypingUsers.size > 0) {
          updated.set(conversationId, convTypingUsers);
        } else {
          updated.delete(conversationId);
        }
        
        return updated;
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("message:new", handleNewMessage);
    socket.on("message:read", handleMessageRead);
    socket.on("typing:update", handleTypingUpdate);

    // Initial connection status is handled by socketManager.onConnectionChange

    return () => {
      // Unsubscribe from connection state changes
      unsubscribeConnection();
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("message:new", handleNewMessage);
      socket.off("message:read", handleMessageRead);
      socket.off("typing:update", handleTypingUpdate);
      socketManager.releaseSocket();
    };
  }, [currentUserId]);

  // Join conversation rooms when conversations list updates
  useEffect(() => {
    if (conversations.length === 0) return;

    conversations.forEach((conv) => {
      socketManager.joinRoom(conv.id);
    });
  }, [conversations]);

  // Prevent duplicate init in StrictMode
  const initCalledRef = useRef(false);

  // Clear stale sessionStorage on mount (in case of hard refresh)
  useEffect(() => {
    // Reset init state on fresh mount
    initCalledRef.current = false;
  }, []);

  // Load conversations - FILTER FOR HOST ROLE ONLY
  useEffect(() => {
    if (!tokenRef.current || !currentUserId) return;

    // Prevent duplicate fetch in React StrictMode and mobile remounts
    // Only check initCalledRef AFTER we have valid token and userId
    if (initCalledRef.current) {
      console.log("[HostInbox] Init already called, skipping duplicate");
      return;
    }
    
    // Additional check: prevent rapid re-initialization within 2 seconds
    const lastInitTime = sessionStorage.getItem('hostinbox_last_init');
    const now = Date.now();
    if (lastInitTime && (now - parseInt(lastInitTime, 10)) < 2000) {
      console.log("[HostInbox] Init called too recently, skipping (mobile protection)");
      // Don't return here on desktop - only skip if it's a true duplicate
      // Check if we already have conversations loaded
      if (conversations.length > 0) {
        return;
      }
    }
    
    // Set the flag AFTER all checks pass and we're about to fetch
    initCalledRef.current = true;
    sessionStorage.setItem('hostinbox_last_init', now.toString());

    async function loadConversations() {
      // Revalidate silently when a cached list is already on screen — flipping
      // isLoading here would tear it down and reintroduce the flash this cache
      // exists to remove.
      if (conversationsRef.current.length === 0) setIsLoading(true);
      try {
        // Server-side role filtering — only fetches host conversations (no wasted bandwidth)
        const response = await fetch(`${CHAT_URL}/api/chat/conversations?role=host`, {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
          },
        });

        if (!response.ok) throw new Error("Failed to load conversations");

        const data = await response.json();
        console.log("[HostInbox] Raw conversations response:", data);
        if (data.success) {
          // Server already filters by role=host — only need to filter empty convos
          const hostConversations = (data.data || []).filter((conv) => conv.lastMessage);

          const sortedConversations = hostConversations.sort((a, b) => {
            const timeA = a.lastMessage?.sentAt ? new Date(a.lastMessage.sentAt) : new Date(0);
            const timeB = b.lastMessage?.sentAt ? new Date(b.lastMessage.sentAt) : new Date(0);
            return timeB - timeA;
          });

          console.log("[HostInbox] Filtered host conversations:", sortedConversations);
          setConversations(sortedConversations);
          fetchConversationDetails(sortedConversations);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadConversations();
    
    // Cleanup: clear the mobile protection flag on unmount
    return () => {
      sessionStorage.removeItem('hostinbox_last_init');
    };
  }, [currentUserId]);

  // Fetch property details for conversations.
  //
  // This used to `await` inside a `for` loop, so N distinct properties cost N
  // sequential round-trips — an inbox with 8 listings waited for 8 requests to
  // complete one after another before the last row filled in. They are
  // independent, so they run concurrently now and the wait is one round-trip
  // rather than N.
  //
  // It also refetched every property on every mount, ignoring the sessionStorage
  // cache that already had them. Skipping what we hold means a revisit usually
  // issues zero property requests, and `inFlightPropertiesRef` stops a second
  // caller (e.g. a socket update arriving mid-load) from duplicating one that
  // is already in the air.
  const fetchConversationDetails = async (convs) => {
    const propertyIds = [...new Set(convs.map((c) => c.propertyId))].filter(
      (id) => id && !propertyDetails[id] && !inFlightPropertiesRef.current.has(id)
    );
    if (propertyIds.length === 0) return;

    propertyIds.forEach((id) => inFlightPropertiesRef.current.add(id));

    await Promise.all(
      propertyIds.map(async (propertyId) => {
        try {
          const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/properties/${propertyId}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const property = data.data || data.property || data;
            if (property && (property.title || property.name || property._id)) {
              setPropertyDetails((prev) => ({
                ...prev,
                [propertyId]: property,
              }));
              setCachedProperty(propertyId, property);
            }
          }
        } catch (e) {
          console.error("[HostInbox] Error fetching property:", propertyId, e);
        } finally {
          // Always release, so a transient failure can be retried on a later
          // pass instead of wedging that property as permanently "loading".
          inFlightPropertiesRef.current.delete(propertyId);
        }
      })
    );
    // Guest details are already stored in conversation participants (firstName, lastName)
  };

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !tokenRef.current) return;

    // Clear messages immediately when switching conversations to prevent stale data
    setMessages([]);

    async function loadMessages() {
      setIsLoadingMessages(true);
      try {
        const response = await fetch(
          `${CHAT_URL}/api/chat/conversations/${selectedConversation.id}/messages?limit=50`,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to load messages");

        const data = await response.json();
        if (data.success && data.data) {
          const loadedMessages = data.data.data || data.data;
          const messagesArray = Array.isArray(loadedMessages) ? loadedMessages : [];
          setMessages(messagesArray.reverse());
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    }

    loadMessages();
  }, [selectedConversation?.id]);

  // Auto-scroll to bottom on new messages
  const prevMessagesLengthRef = useRef(0);
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      });
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages.length]);

  useEffect(() => {
    prevMessagesLengthRef.current = 0;
  }, [selectedConversation?.id]);

  // Track messages we've already marked as read
  const markedAsReadRef = useRef(new Set());

  useEffect(() => {
    markedAsReadRef.current = new Set();
  }, [selectedConversation?.id]);

  // Mark messages as read - only when page is visible (not in background tab)
  useEffect(() => {
    // Don't mark as read if page is not visible (tab in background)
    if (!isPageVisible) return;
    if (!selectedConversation || !messages.length || !socketRef.current || !socketRef.current.connected)
      return;

    // IMPORTANT: Only process messages that belong to the CURRENT conversation
    // This prevents stale message IDs from being sent when switching conversations
    const currentConversationMessages = messages.filter(
      (m) => m.conversationId === selectedConversation.id
    );

    if (currentConversationMessages.length === 0) return;

    const unreadMessageIds = currentConversationMessages
      .filter(
        (m) =>
          m.senderId !== currentUserId &&
          !m.readBy?.some((r) => r.userId === currentUserId) &&
          !markedAsReadRef.current.has(m.id)
      )
      .map((m) => m.id);

    if (unreadMessageIds.length > 0) {
      unreadMessageIds.forEach(id => markedAsReadRef.current.add(id));

      socketRef.current.emit("message:read", {
        conversationId: selectedConversation.id,
        messageIds: unreadMessageIds,
      });

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                unreadCount: { ...conv.unreadCount, [currentUserId]: 0 },
              }
            : conv
        )
      );

      // Refresh global unread count badge
      refreshUnreadCount();
    }
  }, [selectedConversation?.id, messages, currentUserId, isPageVisible]);

  // Typing indicator functions - defined before handleSendMessage
  const emitTypingStart = useCallback(() => {
    if (!socketRef.current || !selectedConversation || isTypingRef.current) return;
    isTypingRef.current = true;
    socketRef.current.emit("typing:start", { conversationId: selectedConversation.id });
  }, [selectedConversation]);

  const emitTypingStop = useCallback(() => {
    if (!socketRef.current || !selectedConversation || !isTypingRef.current) return;
    isTypingRef.current = false;
    socketRef.current.emit("typing:stop", { conversationId: selectedConversation.id });
  }, [selectedConversation]);

  const handleInputChange = useCallback((value) => {
    setNewMessage(value);
    
    // Emit typing start
    if (value.trim()) {
      emitTypingStart();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Auto-stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        emitTypingStop();
      }, 3000);
    } else {
      // Input is empty, stop typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitTypingStop();
    }
  }, [emitTypingStart, emitTypingStop]);

  // Cleanup typing timeout on unmount or conversation change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitTypingStop();
    };
  }, [selectedConversation?.id, emitTypingStop]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !socketRef.current)
      return;

    // Stop typing indicator when sending
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emitTypingStop();

    setIsSending(true);
    const clientMessageId = `${Date.now()}-${Math.random()}`;

    try {
      socketRef.current.emit(
        "message:send",
        {
          conversationId: selectedConversation.id,
          content: { text: newMessage.trim() },
          type: "text",
          clientMessageId,
        },
        (response) => {
          if (!response.success) {
            console.error("Failed to send message:", response.error);
          }
        }
      );

      // Mark that we should refocus after message is cleared
      if (!isMobileView) {
        shouldRefocusRef.current = true;
      }
      setNewMessage("");
      
      // Direct focus for desktop - more reliable than useEffect
      if (!isMobileView && desktopInputRef.current) {
        setTimeout(() => {
          desktopInputRef.current?.focus();
        }, 0);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper functions
  const getGuestParticipant = (conversation) => {
    const guest = conversation.participants.find((p) => p.role === "guest");
    return guest || null;
  };

  const getGuestName = (conversation) => {
    const guest = getGuestParticipant(conversation);
    if (guest) {
      // Use firstName/lastName stored in conversation participant data
      if (guest.firstName) {
        return guest.lastName ? `${guest.firstName} ${guest.lastName}` : guest.firstName;
      }
    }
    return "Guest";
  };

  const getGuestFirstName = (conversation) => {
    const guest = getGuestParticipant(conversation);
    if (guest && guest.firstName) {
      return guest.firstName;
    }
    return "Guest";
  };

  const getGuestAvatar = (conversation) => {
    // Avatar not stored in conversation - return null (will show fallback initials)
    return null;
  };

  const isPropertyLoaded = (conversation) => Boolean(conversation && propertyDetails[conversation.propertyId]);

  const getPropertyName = (conversation) => {
    const property = propertyDetails[conversation.propertyId];
    return property?.title || property?.name || "Property Inquiry";
  };

  const getPropertyImage = (conversation) => {
    const property = propertyDetails[conversation.propertyId];
    const images = property?.photos || property?.images;
    return images?.[0] || property?.image || null;
  };

  const getPropertyDetails = (conversation) => {
    return propertyDetails[conversation.propertyId] || null;
  };

  const getPropertyLocation = (property) => {
    if (!property) return "";
    const city = property.address?.city || property.city;
    const state = property.address?.state || property.state;
    const parts = [city, state].filter(Boolean);
    return parts.join(", ");
  };

  const getPropertyPrice = (property) => {
    if (!property) return null;
    return property.basePrice || property.price?.base || null;
  };

  const getPropertyType = (property) => {
    if (!property) return null;
    return property.propertyType || property.type || null;
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      getGuestName(conv).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getPropertyName(conv).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "unread" && (conv.unreadCount[currentUserId] || 0) > 0);

    return matchesSearch && matchesFilter;
  });

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return d.toLocaleDateString([], { weekday: "short" });
    } else {
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const formatMessageTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatMessageDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    
    // Compare calendar days, not time difference
    const messageDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = today - messageDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: "long" });
    }
    return d.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatMessageDate(message.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  // Helper to check if someone is typing in a conversation
  const isConversationTyping = (convId) => {
    const typingSet = typingUsers.get(convId);
    return typingSet && typingSet.size > 0;
  };

  // Render conversation list component
  const renderConversationList = () => (
    <div className={`${selectedConversation ? "hidden md:flex" : "flex"} flex-col w-full md:w-[320px] lg:w-[380px] md:min-w-[280px] md:max-w-[380px] border-r overflow-hidden flex-shrink-0`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bricolage font-semibold">Guest Inquiries</h2>
          {connectionStatus === "connecting" && (
            <Badge variant="outline" className="text-blue-500 border-blue-500">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Connecting
            </Badge>
          )}
          {connectionStatus === "error" && (
            <Badge variant="outline" className="text-red-500 border-red-500">
              <WifiOff className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
          {connectionStatus === "disconnected" && (
            <Badge variant="outline" className="text-orange-500 border-orange-500">
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-8 bg-gray-50 border-none rounded-lg focus-visible:ring-2 focus-visible:ring-brightGreen/30 text-sm focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="p-2 border-b">
        <div className="flex gap-1 px-2">
          <Button
            variant={activeFilter === "all" ? "default" : "ghost"}
            size="sm"
            className={`rounded-full px-4 text-sm font-medium ${
              activeFilter === "all"
                ? "bg-primaryGreen text-white hover:bg-primaryGreen/90"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveFilter("all")}
          >
            All
          </Button>
          <Button
            variant={activeFilter === "unread" ? "default" : "ghost"}
            size="sm"
            className={`rounded-full px-4 text-sm font-medium ${
              activeFilter === "unread"
                ? "bg-primaryGreen text-white hover:bg-primaryGreen/90"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveFilter("unread")}
          >
            Unread
          </Button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          // Skeleton rows rather than a bare spinner, and the same component
          // /messages uses — the two inboxes now have one loading appearance.
          // Only reached on a cold start; a cached list skips this entirely.
          <ConversationRowsSkeleton rows={5} />
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-4">
            <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">
              {searchQuery
                ? "No conversations found"
                : "No guest inquiries yet. When guests message you about your properties, they'll appear here."}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredConversations.map((conv) => {
              const unreadCount = conv.unreadCount[currentUserId] || 0;
              const propertyImage = getPropertyImage(conv);
              const property = getPropertyDetails(conv);
              const propertyLoaded = isPropertyLoaded(conv);

              return (
                <Card
                  key={conv.id}
                  className={`p-3 cursor-pointer border-none shadow-none rounded-xl transition-colors ${
                    selectedConversation?.id === conv.id
                      ? "bg-lightGreen/40"
                      : "bg-gray-50 hover:bg-lightGreen/20"
                  }`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  {/* Guest name, avatar and timestamp come straight off the
                      conversation, so they used to render while the property
                      badge and preview beside them were still grey bars — a row
                      that reads as half-broken rather than loading. They are
                      gated on the same flag now, so a row is either entirely
                      real or entirely placeholder, matching /messages. */}
                  <div className="flex gap-3">
                    {propertyLoaded ? (
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={getGuestAvatar(conv)} />
                        <AvatarFallback className="bg-primaryGreen/10 text-primaryGreen">
                          {getGuestName(conv).split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        {propertyLoaded ? (
                          <>
                            <span className="font-medium text-sm truncate">{getGuestName(conv)}</span>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {formatTime(conv.lastMessage?.sentAt)}
                            </span>
                          </>
                        ) : (
                          <>
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-10 ml-2 flex-shrink-0" />
                          </>
                        )}
                      </div>
                      {propertyLoaded ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          {propertyImage ? (
                            <div className="relative h-5 w-5 rounded overflow-hidden flex-shrink-0">
                              <ImageWithSkeleton src={propertyImage} alt="" fill className="object-cover" />
                            </div>
                          ) : (
                            <Home className="h-4 w-4 text-primaryGreen flex-shrink-0" />
                          )}
                          <p className="text-xs text-primaryGreen font-medium truncate">{getPropertyName(conv)}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Skeleton className="h-5 w-5 rounded flex-shrink-0" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      )}
                      {propertyLoaded && (property?.address?.city || property?.address?.state || property?.city) && (
                        <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {getPropertyLocation(property)}
                        </p>
                      )}
                      {!propertyLoaded ? (
                        <Skeleton className="h-4 w-40 mt-1" />
                      ) : isConversationTyping(conv.id) ? (
                        <p className="text-sm text-primaryGreen truncate mt-1 animate-pulse">Typing...</p>
                      ) : (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conv.lastMessage?.content || "No messages yet"}
                        </p>
                      )}
                    </div>
                    {/* Gated too: the count comes off the conversation, so an
                        otherwise all-skeleton row would show a live unread
                        number floating beside grey bars. */}
                    {propertyLoaded && unreadCount > 0 && (
                      <div className="flex items-center">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primaryGreen text-white text-xs">
                          {unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Render chat header component
  const renderChatHeader = () => {
    const isTyping = isConversationTyping(selectedConversation?.id);
    
    return (
      <div className="border-b bg-white flex-shrink-0">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden flex-shrink-0"
            onClick={handleBackToList}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={getGuestAvatar(selectedConversation)} />
            <AvatarFallback className="bg-primaryGreen/10 text-primaryGreen">
              {getGuestName(selectedConversation).split(" ").map((n) => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="font-semibold truncate">{getGuestName(selectedConversation)}</h3>
            {isTyping ? (
              <p className="text-sm text-primaryGreen truncate animate-pulse">Typing...</p>
            ) : (
              <p className="text-sm text-gray-500 truncate">Property Enquiry · Guest</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 flex-shrink-0"
            onMouseDown={(e) => {
              // Prevent default to avoid stealing focus from input (keeps keyboard open)
              e.preventDefault();
            }}
            onClick={handleTogglePropertyInfo}
          >
            {showPropertyInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        
        {showPropertyInfo && (
          <div className="px-4 pb-4">
            {(() => {
              const property = getPropertyDetails(selectedConversation);
              const propertyImage = getPropertyImage(selectedConversation);
              const loaded = isPropertyLoaded(selectedConversation);

            return (
              <div className="bg-lightGreen/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-4 w-4 text-primaryGreen flex-shrink-0" />
                  <span className="text-xs font-medium text-primaryGreen uppercase tracking-wide">Inquiry About</span>
                </div>
                <div className="flex gap-3">
                  <div className="relative h-16 w-20 md:h-20 md:w-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                    {!loaded ? (
                      <Skeleton className="w-full h-full" />
                    ) : propertyImage ? (
                      <ImageWithSkeleton src={propertyImage} alt={getPropertyName(selectedConversation)} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Home className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    {loaded ? (
                      <h4 className="font-semibold text-sm md:text-base truncate text-gray-900">{getPropertyName(selectedConversation)}</h4>
                    ) : (
                      <Skeleton className="h-4 w-32" />
                    )}
                    {loaded && getPropertyType(property) && <p className="text-xs text-gray-600 mt-0.5 truncate">{getPropertyType(property)}</p>}
                    {loaded && (property?.address?.city || property?.address?.state) && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{getPropertyLocation(property)}</span>
                      </p>
                    )}
                    {loaded && getPropertyPrice(property) && (
                      <p className="text-xs font-medium text-primaryGreen mt-1">₹{getPropertyPrice(property).toLocaleString()}/night</p>
                    )}
                  </div>
                  <a href={`/stay/${selectedConversation.propertyId}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 self-center">
                    <Button variant="outline" size="sm" className="text-xs border-primaryGreen text-primaryGreen hover:bg-primaryGreen hover:text-white">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
  };

  // Render messages component
  const renderMessages = (isMobile = false) => {
    const allOwnMessages = messages.filter(m => m.senderId === currentUserId);
    const latestReadOwnMessageId = allOwnMessages
      .filter(m => (m.readBy || []).some(r => r.userId !== m.senderId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.id;

    return (
      <div className="relative flex-1 flex flex-col min-h-0">
        <div
          ref={chatContainerRef}
          data-chat-messages={isMobile ? "true" : undefined}
          data-chat-container={isMobile ? "true" : undefined}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          onScroll={handleScroll}
          style={isMobile ? { 
            overscrollBehavior: "contain",
            minHeight: 0,
            WebkitOverflowScrolling: "touch",
          } : { minHeight: 0 }}
        >
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-primaryGreen" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="flex justify-center my-4">
                  <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">{date}</span>
                </div>
                {dateMessages.map((message, index) => {
                  const isOwn = message.senderId === currentUserId;
                  const isLatestReadMessage = message.id === latestReadOwnMessageId;
                  const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                  const showSenderInfo = !isOwn && (!prevMessage || prevMessage.senderId !== message.senderId);
                  const guestFirstName = getGuestFirstName(selectedConversation);

                  return (
                    <div key={message.id} className={`flex flex-col mb-2 ${isOwn ? "items-end" : "items-start"}`}>
                      {isOwn && <span className="text-[11px] text-gray-400 mb-1 mr-1">{formatMessageTime(message.createdAt)}</span>}
                      {showSenderInfo && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] text-gray-500">{guestFirstName} · Guest {formatMessageTime(message.createdAt)}</span>
                        </div>
                      )}
                      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} w-full`}>
                        <div
                          className={`inline-block ${isOwn ? "bg-primaryGreen text-white" : "bg-white shadow-sm border border-gray-100"} rounded-2xl px-4 py-2`}
                          style={{ maxWidth: '75%' }}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content.text}</p>
                        </div>
                      </div>
                      {isOwn && isLatestReadMessage && (
                        <p className="text-[11px] text-gray-400 mt-1 mr-1">Read by {guestFirstName}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
        
        {/* Scroll to bottom button */}
        {showScrollToBottom && isMobile && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-white shadow-lg rounded-full p-2 border border-gray-200 hover:bg-gray-50 transition-all z-10"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>
    );
  };

  // Render desktop input
  const renderDesktopInput = () => (
    <div className="p-4 border-t bg-white flex-shrink-0">
      <div className="flex items-center gap-2">
        <Input
          ref={desktopInputRef}
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending || connectionStatus !== "connected"}
          className="flex-1 bg-gray-100 border-none rounded-full focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-0"
        />
        <Button
          size="icon"
          className="rounded-full bg-primaryGreen hover:bg-brightGreen"
          onClick={handleSendMessage}
          onMouseDown={(e) => e.preventDefault()}
          disabled={!newMessage.trim() || isSending || connectionStatus !== "connected"}
        >
          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );

  // Render empty state for desktop
  const renderEmptyState = () => (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50">
      <div className="rounded-full bg-lightGreen/50 p-6 mb-4">
        <MessageCircle className="h-12 w-12 text-primaryGreen" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Guest Inquiries</h2>
      <p className="text-gray-500 text-center max-w-sm">
        Select a conversation to view and respond to guest inquiries about your properties
      </p>
    </div>
  );

  // Main render - Mobile vs Desktop
  if (isMobileView && selectedConversation) {
    // Mobile chat view with optimized keyboard handling
    return (
      <MobileChatContainer onKeyboardChange={handleKeyboardChange}>
        {renderChatHeader()}
        {renderMessages(true)}
        <MobileChatInput
          value={newMessage}
          onChange={handleInputChange}
          onSend={handleSendMessage}
          onKeyDown={handleKeyDown}
          disabled={connectionStatus !== "connected"}
          isSending={isSending}
          placeholder="Type a message..."
          autoFocus={false}
        />
      </MobileChatContainer>
    );
  }

  // Desktop layout or mobile conversation list
  return (
    <div className={`${isMobileView && selectedConversation ? 'h-[calc(100vh-64px)]' : 'h-[calc(100vh-64px-64px)]'} md:h-full bg-white font-poppins flex overflow-hidden w-full`}>
      {renderConversationList()}
      
      {selectedConversation ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {renderChatHeader()}
          {renderMessages(false)}
          {renderDesktopInput()}
        </div>
      ) : (
        renderEmptyState()
      )}
    </div>
  );
}
