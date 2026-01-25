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
import { io } from "socket.io-client";
import Image from "next/image";

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

  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);
  const tokenRef = useRef(null);

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

  // Initialize socket connection - STABLE, doesn't depend on selectedConversation
  useEffect(() => {
    if (!tokenRef.current || !currentUserId) return;

    const socket = io(CHAT_URL, {
      auth: { token: tokenRef.current },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[HostInbox] Socket connected");
      setConnectionStatus("connected");
      // Join all conversation rooms on connect for real-time updates
      conversationsRef.current.forEach((conv) => {
        socket.emit("conversation:join", { conversationId: conv.id });
      });
    });

    socket.on("disconnect", () => {
      console.log("[HostInbox] Socket disconnected");
      setConnectionStatus("disconnected");
    });

    socket.on("connect_error", (error) => {
      setConnectionStatus("error");
      console.error("[HostInbox] Socket connection error:", error);
    });

    // Listen for new messages - uses refs to avoid stale closures
    socket.on("message:new", (data) => {
      const { message, conversationId } = data;
      console.log("[HostInbox] Received message:new event:", conversationId);

      // Only process messages for conversations where user is HOST
      // Check if this conversation is in our filtered list
      const isHostConversation = conversationsRef.current.some(
        (conv) => conv.id === conversationId
      );
      
      if (!isHostConversation) {
        console.log("[HostInbox] Ignoring message - not a host conversation");
        return;
      }

      // Update messages if viewing this conversation
      if (selectedConversationRef.current?.id === conversationId) {
        setMessages((prev) => {
          // Check if message already exists by id OR by clientMessageId (for optimistic updates)
          const existingIndex = prev.findIndex(m => 
            m.id === message.id || 
            (message.clientMessageId && m.id === message.clientMessageId)
          );
          
          if (existingIndex !== -1) {
            // Replace optimistic message with server message
            const updated = [...prev];
            updated[existingIndex] = message;
            return updated;
          }
          return [...prev, message];
        });
      }

      // Update conversation list - move to top and update last message
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
        // Sort by last message time (most recent first)
        return updated.sort((a, b) => {
          const timeA = a.lastMessage?.sentAt ? new Date(a.lastMessage.sentAt) : new Date(0);
          const timeB = b.lastMessage?.sentAt ? new Date(b.lastMessage.sentAt) : new Date(0);
          return timeB - timeA;
        });
      });
    });

    // Listen for read receipts
    socket.on("message:read", (data) => {
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
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]); // Only depends on currentUserId, not selectedConversation

  // Join conversation rooms when conversations list updates or socket reconnects
  useEffect(() => {
    if (conversations.length === 0) return;
    
    const socket = socketRef.current;
    if (!socket) return;

    // Function to join all rooms
    const joinAllRooms = () => {
      console.log("[HostInbox] Joining all conversation rooms:", conversations.length);
      conversations.forEach((conv) => {
        socket.emit("conversation:join", { conversationId: conv.id });
      });
    };

    // Join immediately if connected
    if (socket.connected) {
      joinAllRooms();
    }

    // Also join on reconnect
    socket.on("connect", joinAllRooms);
    
    return () => {
      socket.off("connect", joinAllRooms);
    };
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
          // FILTER: Only show conversations where current user is the HOST
          const hostConversations = (data.data || []).filter((conv) => {
            const participant = conv.participants.find(
              (p) => p.userId === currentUserId
            );
            return participant && participant.role === "host";
          });

          // Sort by last message time (most recent first)
          const sortedConversations = hostConversations.sort((a, b) => {
            const timeA = a.lastMessage?.sentAt ? new Date(a.lastMessage.sentAt) : new Date(0);
            const timeB = b.lastMessage?.sentAt ? new Date(b.lastMessage.sentAt) : new Date(0);
            return timeB - timeA;
          });

          console.log("[HostInbox] Filtered host conversations:", sortedConversations);
          console.log("[HostInbox] PropertyIds in conversations:", sortedConversations.map(c => c.propertyId));
          
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
    console.log("[HostInbox] Fetching details for propertyIds:", propertyIds);
    
    const guestIds = convs
      .flatMap((c) => c.participants.filter((p) => p.role === "guest"))
      .map((p) => p.userId);
    const uniqueGuestIds = [...new Set(guestIds)];

    // Fetch property details
    for (const propertyId of propertyIds) {
      try {
        // Route is /properties/:id (plural)
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/properties/${propertyId}`;
        console.log("[HostInbox] Fetching property from:", url);
        const res = await fetch(url);
        console.log("[HostInbox] Property response status:", res.status);
        if (res.ok) {
          const data = await res.json();
          console.log("[HostInbox] Property API response for", propertyId, ":", data);
          // Handle different response formats: { data: property } or { property: property } or direct property
          const property = data.data || data.property || data;
          console.log("[HostInbox] Extracted property:", property?.title, property);
          if (property && (property.title || property.name || property._id)) {
            setPropertyDetails((prev) => ({
              ...prev,
              [propertyId]: property,
            }));
          }
        } else {
          console.log("[HostInbox] Property fetch failed:", res.status, await res.text());
        }
      } catch (e) {
        console.error("[HostInbox] Error fetching property:", propertyId, e);
      }
    }

    // Fetch guest details
    console.log("[HostInbox] Fetching guest details for IDs:", uniqueGuestIds);
    for (const guestId of uniqueGuestIds) {
      try {
        // Correct endpoint is /api/v1/guests/info/:userId
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/guests/info/${guestId}`;
        console.log("[HostInbox] Fetching guest from:", url);
        const res = await fetch(url);
        console.log("[HostInbox] Guest fetch response for", guestId, "status:", res.status);
        if (res.ok) {
          const data = await res.json();
          console.log("[HostInbox] Guest data for", guestId, ":", JSON.stringify(data));
          const userData = data.user || data.guest || data.data || data;
          console.log("[HostInbox] Extracted user data:", userData?.firstName, userData?.lastName);
          if (userData) {
            setParticipantDetails((prev) => ({
              ...prev,
              [guestId]: userData,
            }));
          }
        } else {
          const errorText = await res.text();
          console.log("[HostInbox] Guest fetch failed:", res.status, errorText);
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
          // Reverse messages so oldest are first (newest at bottom)
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

  // Auto-scroll to bottom on new messages - prevent flickering
  const prevMessagesLengthRef = useRef(0);
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      // Use requestAnimationFrame to prevent flickering
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      });
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages.length]);

  // Reset on conversation change
  useEffect(() => {
    prevMessagesLengthRef.current = 0;
  }, [selectedConversation?.id]);

  // Track messages we've already marked as read to prevent infinite loops
  const markedAsReadRef = useRef(new Set());

  // Reset marked as read when conversation changes
  useEffect(() => {
    markedAsReadRef.current = new Set();
  }, [selectedConversation?.id]);

  // Mark messages as read - only once per message
  useEffect(() => {
    if (!selectedConversation || !messages.length || !socketRef.current || !socketRef.current.connected)
      return;

    const unreadMessageIds = messages
      .filter(
        (m) =>
          m.senderId !== currentUserId &&
          !m.readBy?.some((r) => r.userId === currentUserId) &&
          !markedAsReadRef.current.has(m.id) // Don't re-mark messages we've already sent read receipt for
      )
      .map((m) => m.id);

    if (unreadMessageIds.length > 0) {
      // Mark these as "sent read receipt" immediately to prevent re-sending
      unreadMessageIds.forEach(id => markedAsReadRef.current.add(id));

      socketRef.current.emit("message:read", {
        conversationId: selectedConversation.id,
        messageIds: unreadMessageIds,
      });

      // Update local unread count
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
  }, [selectedConversation?.id, messages, currentUserId]);

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

      setNewMessage("");
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

  // Get the GUEST participant (the person who sent the inquiry)
  const getGuestParticipant = (conversation) => {
    const guest = conversation.participants.find((p) => p.role === "guest");
    return guest || null;
  };

  const getGuestName = (conversation) => {
    const guest = getGuestParticipant(conversation);
    if (guest) {
      // Only show first name
      if (guest.firstName) return guest.firstName;
      
      // Fallback to fetched participant details
      const fetchedGuest = participantDetails[guest.userId];
      if (fetchedGuest) {
        return fetchedGuest.firstName || fetchedGuest.name?.split(' ')[0] || fetchedGuest.email?.split("@")[0] || "Guest";
      }
    }
    return "Guest";
  };

  const getGuestFirstName = (conversation) => {
    // Same as getGuestName now - only first name
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
    // Handle both 'photos' (ListingProperty) and 'images' (Property) field names
    const images = property?.photos || property?.images;
    return images?.[0] || property?.image || null;
  };

  const getPropertyDetails = (conversation) => {
    return propertyDetails[conversation.propertyId] || null;
  };

  const getPropertyLocation = (property) => {
    if (!property) return "";
    // Handle both direct fields and nested address object
    const city = property.address?.city || property.city;
    const state = property.address?.state || property.state;
    const parts = [city, state].filter(Boolean);
    return parts.join(", ");
  };

  const getPropertyPrice = (property) => {
    if (!property) return null;
    // Handle both 'basePrice' (ListingProperty) and 'price.base' (Property)
    return property.basePrice || property.price?.base || null;
  };

  const getPropertyType = (property) => {
    if (!property) return null;
    // Handle both 'propertyType' and 'type' field names
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
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
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

  return (
    <div className="h-[calc(100vh-64px-64px)] md:h-[calc(100vh-64px)] w-full bg-white font-poppins flex overflow-hidden">
      {/* Conversation List - Hidden on mobile when chat is selected */}
      <div
        className={`${
          selectedConversation ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-[380px] border-r overflow-hidden`}
      >
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
                const guest = getGuestParticipant(conv);
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
                          {getGuestName(conv)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-sm truncate">
                            {getGuestName(conv)}
                          </span>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatTime(conv.lastMessage?.sentAt)}
                          </span>
                        </div>
                        {/* Property Context Badge */}
                        <div className="flex items-center gap-1.5 mt-1">
                          {propertyImage ? (
                            <div className="relative h-5 w-5 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={propertyImage}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <Home className="h-4 w-4 text-primaryGreen flex-shrink-0" />
                          )}
                          <p className="text-xs text-primaryGreen font-medium truncate">
                            {getPropertyName(conv)}
                          </p>
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

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Chat Header - Fixed */}
          <div className="border-b bg-white flex-shrink-0">
            {/* Guest Info Row */}
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
                  {getGuestName(selectedConversation)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                  {getGuestName(selectedConversation)}
                </h3>
                <p className="text-sm text-gray-500">Property Enquiry · Guest</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                onClick={() => setShowPropertyInfo(!showPropertyInfo)}
              >
                {showPropertyInfo ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Property Context Card - Collapsible */}
            {showPropertyInfo && (
              <div className="px-4 pb-4">
                {(() => {
                  const property = getPropertyDetails(selectedConversation);
                  const propertyImage = getPropertyImage(selectedConversation);
                  
                  return (
                    <div className="bg-lightGreen/30 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="h-4 w-4 text-primaryGreen" />
                        <span className="text-xs font-medium text-primaryGreen uppercase tracking-wide">
                          Inquiry About
                        </span>
                      </div>
                      <div className="flex gap-3">
                        {/* Property Image */}
                        <div className="relative h-16 w-20 md:h-20 md:w-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                          {propertyImage ? (
                            <Image
                              src={propertyImage}
                              alt={getPropertyName(selectedConversation)}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Home className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Property Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm md:text-base truncate text-gray-900">
                            {getPropertyName(selectedConversation)}
                          </h4>
                          {getPropertyType(property) && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              {getPropertyType(property)}
                            </p>
                          )}
                          {(property?.address?.city || property?.address?.state) && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {getPropertyLocation(property)}
                            </p>
                          )}
                          {getPropertyPrice(property) && (
                            <p className="text-xs font-medium text-primaryGreen mt-1">
                              ₹{getPropertyPrice(property).toLocaleString()}/night
                            </p>
                          )}
                        </div>
                        
                        {/* View Property Link */}
                        <a
                          href={`/stay/${selectedConversation.propertyId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 self-center"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-primaryGreen text-primaryGreen hover:bg-primaryGreen hover:text-white"
                          >
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

          {/* Messages - Scrollable */}
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
                <p className="text-gray-500">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              (() => {
                // Find the latest own message that has been read by the other person
                const allOwnMessages = messages.filter(m => m.senderId === currentUserId);
                const latestReadOwnMessageId = allOwnMessages
                  .filter(m => (m.readBy || []).some(r => r.userId !== m.senderId))
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.id;
                
                return Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                      {date}
                    </span>
                  </div>
                  {dateMessages.map((message, index) => {
                    const isOwn = message.senderId === currentUserId;
                    // Only show "Read by" for the latest read message from current user
                    const isLatestReadMessage = message.id === latestReadOwnMessageId;
                    
                    // Check if we should show sender info (first message or different sender from previous)
                    const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                    const showSenderInfo = !isOwn && (!prevMessage || prevMessage.senderId !== message.senderId);
                    
                    // Get guest name for display
                    const guestFirstName = getGuestFirstName(selectedConversation);

                    return (
                      <div
                        key={message.id}
                        className={`flex flex-col mb-2 ${isOwn ? "items-end" : "items-start"}`}
                      >
                        {/* Time shown above for own messages */}
                        {isOwn && (
                          <span className="text-[11px] text-gray-400 mb-1 mr-1">
                            {formatMessageTime(message.createdAt)}
                          </span>
                        )}
                        
                        {/* Sender info for received messages (guest) */}
                        {showSenderInfo && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] text-gray-500">
                              {guestFirstName} · Guest {formatMessageTime(message.createdAt)}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${isOwn ? "justify-end" : "justify-start"} w-full`}>
                          <div
                            className={`inline-block ${
                              isOwn
                                ? "bg-primaryGreen text-white"
                                : "bg-white shadow-sm border border-gray-100"
                            } rounded-2xl px-4 py-2`}
                            style={{ maxWidth: '75%' }}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content.text}
                            </p>
                          </div>
                        </div>
                        
                        {/* Read by indicator - only for latest read message */}
                        {isOwn && isLatestReadMessage && (
                          <p className="text-[11px] text-gray-400 mt-1 mr-1">
                            Read by {guestFirstName}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ));
              })()
            )}
          </div>

          {/* Message Input - Fixed at bottom */}
          <div className="p-4 border-t bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <Input
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
      ) : (
        // Empty State - Desktop only
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50">
          <div className="rounded-full bg-lightGreen/50 p-6 mb-4">
            <MessageCircle className="h-12 w-12 text-primaryGreen" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Guest Inquiries</h2>
          <p className="text-gray-500 text-center max-w-sm">
            Select a conversation to view and respond to guest inquiries about your properties
          </p>
        </div>
      )}
    </div>
  );
}
