"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Loader2,
  Send,
  MessageCircle,
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
import ProtectedRoute from "@/components/protected-route";
import MobileChatContainer from "@/components/mobile-chat-container";
import MobileChatInput from "@/components/mobile-chat-input";
import { usePageVisibility } from "@/hooks/usePageVisibility";

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:3001";

export default function ChatPage({ params }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = params.propertyId;
  
  // Get hostId from URL or sessionStorage (for page refresh persistence)
  const urlHostId = searchParams.get("hostId");
  const [hostId, setHostId] = useState(null);
  
  // Persist hostId to sessionStorage and retrieve on refresh
  useEffect(() => {
    const storageKey = `chat_hostId_${propertyId}`;
    if (urlHostId) {
      // Store hostId when coming from a link with hostId param
      sessionStorage.setItem(storageKey, urlHostId);
      setHostId(urlHostId);
    } else {
      // Try to retrieve from sessionStorage on refresh
      const storedHostId = sessionStorage.getItem(storageKey);
      if (storedHostId) {
        setHostId(storedHostId);
      }
    }
  }, [urlHostId, propertyId]);

  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [property, setProperty] = useState(null);
  const [host, setHost] = useState(null);
  const [error, setError] = useState(null);

  // Track page visibility - only mark messages as read when page is visible
  const isPageVisible = usePageVisibility();

  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);
  const desktopInputRef = useRef(null);
  const shouldRefocusDesktopRef = useRef(false);
  const conversationIdRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showPropertyInfo, setShowPropertyInfo] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Map()); // Map<conversationId, Set<userId>>

  // Keyboard detection for auto-toggling property info (matching host inbox)
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
    if (keyboardStateChanged) {
      isManualToggleRef.current = false;
    }
  }, []);

  // Handle manual toggle of property info
  const handleTogglePropertyInfo = useCallback(() => {
    isManualToggleRef.current = true;
    setShowPropertyInfo(prev => !prev);
  }, []);

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

  // Refocus desktop input after message is sent
  useEffect(() => {
    if (shouldRefocusDesktopRef.current && newMessage === "" && !isMobileView) {
      const input = desktopInputRef.current;
      if (input) {
        requestAnimationFrame(() => {
          input.focus();
        });
      }
      shouldRefocusDesktopRef.current = false;
    }
  }, [newMessage, isMobileView]);

  // Auto-focus input when chat is ready (desktop only)
  useEffect(() => {
    if (!isMobileView && conversationId && !isLoading && !isLoadingMessages && desktopInputRef.current) {
      setTimeout(() => {
        desktopInputRef.current?.focus();
      }, 100);
    }
  }, [conversationId, isLoading, isLoadingMessages, isMobileView]);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobileView(isMobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get token and user ID on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(storedToken);
      setToken(parsed);
      const payload = JSON.parse(atob(parsed.split(".")[1]));
      setUserId(payload.userId);
    } catch (e) {
      console.error("Invalid token:", e);
      router.push("/login");
    }
  }, [router]);

  // Fetch property details
  useEffect(() => {
    if (!propertyId) return;

    async function fetchProperty() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/property/${propertyId}`
        );
        if (res.ok) {
          const data = await res.json();
          const prop = data.property || data;
          setProperty(prop);
          if (prop.host) {
            setHost(prop.host);
          }
        }
      } catch (e) {
        console.error("Error fetching property:", e);
      }
    }

    fetchProperty();
  }, [propertyId]);

  // Create or get conversation
  useEffect(() => {
    if (!token || !userId || !hostId || !propertyId) return;

    async function initConversation() {
      try {
        const res = await fetch(`${CHAT_URL}/api/chat/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            propertyId,
            hostId,
            guestId: userId,
          }),
        });

        const data = await res.json();
        console.log("[Chat] Conversation API response:", JSON.stringify(data, null, 2));
        if (data.success && data.data) {
          // Server returns 'id' (transformed from MongoDB _id)
          const convId = data.data.id || data.data._id;
          console.log("[Chat] Setting conversationId:", convId);
          setConversationId(convId);
        } else {
          setError(data.message || "Failed to create conversation");
        }
      } catch (error) {
        console.error("Failed to create conversation:", error);
        setError("Failed to connect to chat server");
      } finally {
        setIsLoading(false);
      }
    }

    initConversation();
  }, [token, userId, hostId, propertyId]);

  // Keep ref in sync with state (conversationIdRef declared above, used to avoid stale closures in socket callbacks)
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Initialize socket connection using singleton manager
  useEffect(() => {
    if (!token) return;

    const socket = socketManager.getSocket(token);
    if (!socket) return;

    socketRef.current = socket;

    const handleConnect = () => {
      console.log("[Chat] Socket connected, socket id:", socket.id);
      setConnectionStatus("connected");
      // Join conversation room if we have one
      if (conversationIdRef.current) {
        socketManager.joinRoom(conversationIdRef.current);
      }
    };

    const handleDisconnect = () => {
      console.log("[Chat] Socket disconnected");
      setConnectionStatus("disconnected");
    };

    const handleConnectError = (err) => {
      console.error("[Chat] Socket connection error:", err);
      setConnectionStatus("error");
    };

    const handleError = (err) => {
      console.error("[Chat] Server error:", err);
    };

    const handleNewMessage = (data) => {
      if (data.conversationId === conversationIdRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    };

    const handleMessageRead = (data) => {
      if (data.conversationId === conversationIdRef.current) {
        setMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg.id)
              ? {
                  ...msg,
                  readBy: [...msg.readBy, { userId: data.userId, readAt: data.timestamp }],
                }
              : msg
          )
        );
      }
    };

    const handleTypingUpdate = (data) => {
      if (data.conversationId === conversationIdRef.current) {
        setTypingUsers((prev) => {
          const updated = new Map(prev);
          const convTypingUsers = updated.get(data.conversationId) || new Set();
          
          if (data.isTyping) {
            convTypingUsers.add(data.userId);
          } else {
            convTypingUsers.delete(data.userId);
          }
          
          if (convTypingUsers.size > 0) {
            updated.set(data.conversationId, convTypingUsers);
          } else {
            updated.delete(data.conversationId);
          }
          
          return updated;
        });
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("error", handleError);
    socket.on("message:new", handleNewMessage);
    socket.on("message:read", handleMessageRead);
    socket.on("typing:update", handleTypingUpdate);

    // Set initial connection status
    if (socket.connected) {
      setConnectionStatus("connected");
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("error", handleError);
      socket.off("message:new", handleNewMessage);
      socket.off("message:read", handleMessageRead);
      socket.off("typing:update", handleTypingUpdate);
      
      if (conversationIdRef.current) {
        socketManager.leaveRoom(conversationIdRef.current);
      }
      socketManager.releaseSocket();
    };
  }, [token]);

  // Join conversation room when conversationId is available
  useEffect(() => {
    if (!conversationId || !socketRef.current) return;

    socketManager.joinRoom(conversationId);

    return () => {
      socketManager.leaveRoom(conversationId);
    };
  }, [conversationId]);

  // Load messages
  useEffect(() => {
    if (!conversationId || !token) return;

    async function loadMessages() {
      setIsLoadingMessages(true);
      try {
        const response = await fetch(
          `${CHAT_URL}/api/chat/conversations/${conversationId}/messages?limit=50`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const loadedMessages = data.data.data || data.data;
            // Reverse messages so oldest are first (newest at bottom)
            const messagesArray = Array.isArray(loadedMessages) ? loadedMessages : [];
            setMessages(messagesArray.reverse());
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    }

    loadMessages();
  }, [conversationId, token]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      });
    }
  }, [messages.length]);

  // Mark messages as read - only when page is visible (not in background tab)
  useEffect(() => {
    // Don't mark as read if page is not visible (tab in background)
    if (!isPageVisible) return;
    if (!conversationId || !messages.length || !socketRef.current || !userId) return;

    const unreadMessageIds = messages
      .filter(
        (m) =>
          m.senderId !== userId &&
          !m.readBy.some((r) => r.userId === userId)
      )
      .map((m) => m.id);

    if (unreadMessageIds.length > 0) {
      socketRef.current.emit("message:read", {
        conversationId,
        messageIds: unreadMessageIds,
      });
    }
  }, [conversationId, messages, userId, isPageVisible]);

  // Typing indicator functions - defined before handleSendMessage
  const emitTypingStart = useCallback(() => {
    if (!socketRef.current || !conversationId || isTypingRef.current) return;
    isTypingRef.current = true;
    socketRef.current.emit("typing:start", { conversationId });
  }, [conversationId]);

  const emitTypingStop = useCallback(() => {
    if (!socketRef.current || !conversationId || !isTypingRef.current) return;
    isTypingRef.current = false;
    socketRef.current.emit("typing:stop", { conversationId });
  }, [conversationId]);

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
  }, [conversationId, emitTypingStop]);

  // Clear typing users when conversation changes
  useEffect(() => {
    setTypingUsers(new Set());
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !socketRef.current) return;

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
          conversationId,
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
        shouldRefocusDesktopRef.current = true;
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

  const formatMessageTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
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

  // Helper functions for property details (matching host inbox)
  const getPropertyLocation = () => {
    if (!property) return "";
    const city = property.address?.city || property.city;
    const state = property.address?.state || property.state;
    const parts = [city, state].filter(Boolean);
    return parts.join(", ");
  };

  const getPropertyPrice = () => {
    if (!property) return null;
    return property.basePrice || property.price?.base || null;
  };

  const getPropertyType = () => {
    if (!property) return null;
    return property.propertyType || property.type || null;
  };

  const getPropertyImage = () => {
    const images = property?.photos || property?.images;
    return images?.[0] || property?.image || null;
  };

  const getHostName = () => {
    if (host?.firstName) return host.firstName;
    if (host?.name) return host.name.split(' ')[0];
    return "Host";
  };

  // Find latest read message for "Read by" indicator
  const getLatestReadMessageId = () => {
    const allOwnMessages = messages.filter(m => m.senderId === userId);
    return allOwnMessages
      .filter(m => (m.readBy || []).some(r => r.userId !== m.senderId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.id;
  };

  // Helper to check if someone is typing in a conversation
  const isConversationTyping = (convId) => {
    const typingSet = typingUsers.get(convId);
    return typingSet && typingSet.size > 0;
  };

  if (!token || isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primaryGreen" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center h-screen p-4">
          <MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => router.push('/messages')}>Go Back</Button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      {isMobileView ? (
        <MobileChatContainer onKeyboardChange={handleKeyboardChange}>
          {/* Chat Header - Fixed, matches host inbox style */}
          <div className="border-b bg-white flex-shrink-0">
            {/* Host Info Row */}
            <div className="flex items-center gap-3 p-4">
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                onClick={() => router.push('/messages')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={host?.avatar || host?.profilePicture} />
                <AvatarFallback className="bg-primaryGreen/10 text-primaryGreen">
                  {getHostName().split(" ").map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{getHostName()}</h3>
                {isConversationTyping(conversationId) ? (
                  <p className="text-sm text-primaryGreen animate-pulse">Typing...</p>
                ) : (
                  <p className="text-sm text-gray-500">Property Host</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleTogglePropertyInfo}
              >
                {showPropertyInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Property Context Card - Collapsible */}
            {showPropertyInfo && (
              <div className="px-4 pb-4">
                <div className="bg-lightGreen/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="h-4 w-4 text-primaryGreen" />
                    <span className="text-xs font-medium text-primaryGreen uppercase tracking-wide">Your Inquiry</span>
                  </div>
                  <div className="flex gap-3">
                    {/* Property Image */}
                    <div className="relative h-16 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                      {getPropertyImage() ? (
                        <Image src={getPropertyImage()} alt={property?.title || "Property"} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Home className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Property Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate text-gray-900">{property?.title || "Property"}</h4>
                      {getPropertyType() && <p className="text-xs text-gray-600 mt-0.5">{getPropertyType()}</p>}
                      {getPropertyLocation() && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {getPropertyLocation()}
                        </p>
                      )}
                      {getPropertyPrice() && (
                        <p className="text-xs font-medium text-primaryGreen mt-1">₹{getPropertyPrice().toLocaleString()}/night</p>
                      )}
                    </div>
                    
                    {/* View Property Link */}
                    <a href={`/stay/${propertyId}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 self-center">
                      <Button variant="outline" size="sm" className="text-xs border-primaryGreen text-primaryGreen hover:bg-primaryGreen hover:text-white">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Messages - Scrollable */}
          <div className="relative flex-1 flex flex-col min-h-0">
            <div
              ref={chatContainerRef}
              data-chat-messages="true"
              data-chat-container="true"
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
              onScroll={handleScroll}
              style={{ 
                overscrollBehavior: "contain",
                minHeight: 0,
                WebkitOverflowScrolling: "touch",
              }}
            >
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-primaryGreen" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center">Start a conversation with the host!</p>
                  <p className="text-sm text-gray-400 mt-2 text-center max-w-sm">
                    Ask about availability, amenities, or anything else about the property.
                  </p>
                </div>
              ) : (
                (() => {
                  const latestReadOwnMessageId = getLatestReadMessageId();
                  
                  return Object.entries(groupedMessages).map(([date, dateMessages]) => (
                    <div key={date}>
                      <div className="flex justify-center my-4">
                        <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">{date}</span>
                      </div>
                      {dateMessages.map((message, index) => {
                        const isOwn = message.senderId === userId;
                        const isLatestReadMessage = message.id === latestReadOwnMessageId;
                        const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                        const showSenderInfo = !isOwn && (!prevMessage || prevMessage.senderId !== message.senderId);

                        return (
                          <div key={message.id} className={`flex flex-col mb-2 ${isOwn ? "items-end" : "items-start"}`}>
                            {/* Time shown above for own messages */}
                            {isOwn && (
                              <span className="text-[11px] text-gray-400 mb-1 mr-1">{formatMessageTime(message.createdAt)}</span>
                            )}
                            
                            {/* Sender info for received messages (host) */}
                            {showSenderInfo && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] text-gray-500">{getHostName()} · Host {formatMessageTime(message.createdAt)}</span>
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
                            
                            {/* Read by indicator - only for latest read message */}
                            {isOwn && isLatestReadMessage && (
                              <p className="text-[11px] text-gray-400 mt-1 mr-1">Read by {getHostName()}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()
              )}
            </div>
            
            {/* Scroll to bottom button */}
            {showScrollToBottom && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 bg-white shadow-lg rounded-full p-2 border border-gray-200 hover:bg-gray-50 transition-all z-10"
                aria-label="Scroll to bottom"
              >
                <ChevronDown className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Message Input - Mobile optimized */}
          <MobileChatInput
            value={newMessage}
            onChange={handleInputChange}
            onSend={handleSendMessage}
            onKeyDown={handleKeyDown}
            disabled={connectionStatus !== "connected"}
            isSending={isSending}
            placeholder="Type a message..."
            autoFocus={!isLoadingMessages}
          />
        </MobileChatContainer>
      ) : (
        /* Desktop Layout - Unchanged */
        <div className="flex flex-col h-screen bg-white">
          {/* Header */}
          <header className="flex items-center gap-3 p-4 border-b bg-white">
            <Button variant="ghost" size="icon" onClick={() => router.push('/messages')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
              {property?.images?.[0] ? (
                <Image
                  src={property.images[0]}
                  alt={property?.title || "Property"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Home className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {property?.title || "Property"}
              </h3>
              {isConversationTyping(conversationId) ? (
                <p className="text-sm text-primaryGreen animate-pulse">Typing...</p>
              ) : (
                <p className="text-sm text-gray-500 truncate">
                  Host: {host?.firstName || host?.name || "Host"}
                </p>
              )}
            </div>
            {connectionStatus !== "connected" && (
              <div className="flex items-center text-orange-500">
                <WifiOff className="w-4 h-4" />
              </div>
            )}
          </header>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          >
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-primaryGreen" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">
                  Start a conversation with the host!
                </p>
                <p className="text-sm text-gray-400 mt-2 text-center max-w-sm">
                  Ask about availability, amenities, or anything else about the property.
                </p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                      {date}
                    </span>
                  </div>
                  {dateMessages.map((message) => {
                    const isOwn = message.senderId === userId;
                    const isRead = (message.readBy || []).some(r => r.userId !== message.senderId);

                    return (
                      <div
                        key={message.id}
                        className={`flex mb-3 ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] ${
                            isOwn
                              ? "bg-primaryGreen text-white"
                              : "bg-white shadow-sm"
                          } rounded-2xl px-4 py-2`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content.text}
                          </p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 ${
                              isOwn ? "text-white/70" : "text-gray-400"
                            }`}
                          >
                            <span className="text-[10px]">
                              {formatMessageTime(message.createdAt)}
                            </span>
                            {isOwn && (
                              <span className="text-[10px]">
                                {isRead ? (
                                  <CheckCheck className="w-3 h-3 inline" />
                                ) : (
                                  <Check className="w-3 h-3 inline" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="text-xs text-gray-500 italic mb-2 flex items-center gap-1">
                <span>{getHostName()} is typing</span>
                <span className="flex gap-0.5">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                </span>
              </div>
            )}
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
                disabled={
                  !newMessage.trim() ||
                  isSending ||
                  connectionStatus !== "connected"
                }
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
