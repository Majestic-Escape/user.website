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

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:3001";

export default function HostInboxPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [propertyDetails, setPropertyDetails] = useState({});
  const [participantDetails, setParticipantDetails] = useState({});
  const [showPropertyInfo, setShowPropertyInfo] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Track page visibility - only mark messages as read when page is visible
  const isPageVisible = usePageVisibility();

  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);
  const tokenRef = useRef(null);
  const desktopInputRef = useRef(null);
  const shouldRefocusRef = useRef(false);

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
  const conversationsRef = useRef([]);

  // Keep refs in sync with state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

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

  // Reset dropdown to expanded when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setShowPropertyInfo(true);
      setShowScrollToBottom(false);
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

    const handleConnect = () => {
      console.log("[HostInbox] Socket connected");
      setConnectionStatus("connected");
      // Join all conversation rooms
      conversationsRef.current.forEach((conv) => {
        socketManager.joinRoom(conv.id);
      });
    };

    const handleDisconnect = () => {
      console.log("[HostInbox] Socket disconnected");
      setConnectionStatus("disconnected");
    };

    const handleConnectError = (error) => {
      setConnectionStatus("error");
      console.error("[HostInbox] Socket connection error:", error);
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

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("message:new", handleNewMessage);
    socket.on("message:read", handleMessageRead);

    // Set initial connection status
    if (socket.connected) {
      setConnectionStatus("connected");
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("message:new", handleNewMessage);
      socket.off("message:read", handleMessageRead);
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

  // Load conversations - FILTER FOR HOST ROLE ONLY
  useEffect(() => {
    if (!tokenRef.current || !currentUserId) return;

    async function loadConversations() {
      setIsLoading(true);
      try {
        const response = await fetch(`${CHAT_URL}/api/chat/conversations`, {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
          },
        });

        if (!response.ok) throw new Error("Failed to load conversations");

        const data = await response.json();
        console.log("[HostInbox] Raw conversations response:", data);
        if (data.success) {
          const hostConversations = (data.data || []).filter((conv) => {
            const participant = conv.participants.find(
              (p) => p.userId === currentUserId
            );
            return participant && participant.role === "host";
          });

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
  }, [currentUserId]);

  // Fetch property and participant details
  const fetchConversationDetails = async (convs) => {
    const propertyIds = [...new Set(convs.map((c) => c.propertyId))];
    const guestIds = convs
      .flatMap((c) => c.participants.filter((p) => p.role === "guest"))
      .map((p) => p.userId);
    const uniqueGuestIds = [...new Set(guestIds)];

    for (const propertyId of propertyIds) {
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
          }
        }
      } catch (e) {
        console.error("[HostInbox] Error fetching property:", propertyId, e);
      }
    }

    for (const guestId of uniqueGuestIds) {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/guests/info/${guestId}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const userData = data.user || data.guest || data.data || data;
          if (userData) {
            setParticipantDetails((prev) => ({
              ...prev,
              [guestId]: userData,
            }));
          }
        }
      } catch (e) {
        console.error("[HostInbox] Error fetching guest:", guestId, e);
      }
    }
  };

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !tokenRef.current) return;

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

    const unreadMessageIds = messages
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
    }
  }, [selectedConversation?.id, messages, currentUserId, isPageVisible]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !socketRef.current)
      return;

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
      if (guest.firstName) return guest.firstName;
      const fetchedGuest = participantDetails[guest.userId];
      if (fetchedGuest) {
        return fetchedGuest.firstName || fetchedGuest.name?.split(' ')[0] || fetchedGuest.email?.split("@")[0] || "Guest";
      }
    }
    return "Guest";
  };

  const getGuestFirstName = (conversation) => {
    return getGuestName(conversation);
  };

  const getGuestAvatar = (conversation) => {
    const guest = getGuestParticipant(conversation);
    if (guest) {
      const fetchedGuest = participantDetails[guest.userId];
      return fetchedGuest?.avatar || fetchedGuest?.profilePicture || null;
    }
    return null;
  };

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
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

  // Render conversation list component
  const renderConversationList = () => (
    <div className={`${selectedConversation ? "hidden md:flex" : "flex"} flex-col w-full md:w-[380px] border-r overflow-hidden`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bricolage font-semibold">Guest Inquiries</h2>
          {connectionStatus !== "connected" && (
            <Badge variant="outline" className="text-orange-500 border-orange-500">
              <WifiOff className="w-3 h-3 mr-1" />
              {connectionStatus === "error" ? "Error" : "Offline"}
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
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-primaryGreen" />
          </div>
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

              return (
                <Card
                  key={conv.id}
                  className={`p-3 cursor-pointer border-none shadow-none rounded-xl transition-colors ${
                    selectedConversation?.id === conv.id
                      ? "bg-lightGreen/40"
                      : "bg-gray-50 hover:bg-lightGreen/20"
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={getGuestAvatar(conv)} />
                      <AvatarFallback className="bg-primaryGreen/10 text-primaryGreen">
                        {getGuestName(conv).split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm truncate">{getGuestName(conv)}</span>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatTime(conv.lastMessage?.sentAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {propertyImage ? (
                          <div className="relative h-5 w-5 rounded overflow-hidden flex-shrink-0">
                            <Image src={propertyImage} alt="" fill className="object-cover" />
                          </div>
                        ) : (
                          <Home className="h-4 w-4 text-primaryGreen flex-shrink-0" />
                        )}
                        <p className="text-xs text-primaryGreen font-medium truncate">{getPropertyName(conv)}</p>
                      </div>
                      {(property?.address?.city || property?.address?.state || property?.city) && (
                        <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {getPropertyLocation(property)}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conv.lastMessage?.content || "No messages yet"}
                      </p>
                    </div>
                    {unreadCount > 0 && (
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
  const renderChatHeader = () => (
    <div className="border-b bg-white flex-shrink-0">
      <div className="flex items-center gap-3 p-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden flex-shrink-0"
          onClick={() => setSelectedConversation(null)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={getGuestAvatar(selectedConversation)} />
          <AvatarFallback className="bg-primaryGreen/10 text-primaryGreen">
            {getGuestName(selectedConversation).split(" ").map((n) => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{getGuestName(selectedConversation)}</h3>
          <p className="text-sm text-gray-500">Property Enquiry · Guest</p>
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
            
            return (
              <div className="bg-lightGreen/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-4 w-4 text-primaryGreen" />
                  <span className="text-xs font-medium text-primaryGreen uppercase tracking-wide">Inquiry About</span>
                </div>
                <div className="flex gap-3">
                  <div className="relative h-16 w-20 md:h-20 md:w-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                    {propertyImage ? (
                      <Image src={propertyImage} alt={getPropertyName(selectedConversation)} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Home className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm md:text-base truncate text-gray-900">{getPropertyName(selectedConversation)}</h4>
                    {getPropertyType(property) && <p className="text-xs text-gray-600 mt-0.5">{getPropertyType(property)}</p>}
                    {(property?.address?.city || property?.address?.state) && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {getPropertyLocation(property)}
                      </p>
                    )}
                    {getPropertyPrice(property) && (
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
          onChange={(e) => setNewMessage(e.target.value)}
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
          onChange={setNewMessage}
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
    <div className={`${isMobileView && selectedConversation ? 'h-[calc(100vh-64px)]' : 'h-[calc(100vh-64px-64px)]'} md:h-[calc(100vh-64px)] w-full bg-white font-poppins flex overflow-hidden`}>
      {renderConversationList()}
      
      {selectedConversation ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
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
