"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  Send,
  MessageCircle,
  WifiOff,
  CheckCheck,
  Check,
  Home,
} from "lucide-react";
import { io } from "socket.io-client";
import Image from "next/image";
import ProtectedRoute from "@/components/protected-route";

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:3001";

export default function ChatPage({ params }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hostId = searchParams.get("hostId");
  const propertyId = params.propertyId;

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

  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);

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

  // Ref to track conversationId in socket callbacks (avoids stale closures)
  const conversationIdRef = useRef(null);
  const hasJoinedRoomRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    conversationIdRef.current = conversationId;
    // Reset joined flag when conversation changes
    if (conversationId) {
      hasJoinedRoomRef.current = false;
    }
  }, [conversationId]);

  // Initialize socket connection - STABLE, doesn't depend on conversationId
  useEffect(() => {
    if (!token) return;

    const socket = io(CHAT_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Chat] Socket connected, socket id:", socket.id);
      setConnectionStatus("connected");
      // Join conversation room if we have one and haven't joined yet
      if (conversationIdRef.current && !hasJoinedRoomRef.current) {
        console.log("[Chat] Joining room on connect:", conversationIdRef.current);
        socket.emit("conversation:join", { conversationId: conversationIdRef.current });
        hasJoinedRoomRef.current = true;
      }
    });

    socket.on("disconnect", () => {
      console.log("[Chat] Socket disconnected");
      setConnectionStatus("disconnected");
      hasJoinedRoomRef.current = false;
    });

    socket.on("connect_error", (err) => {
      console.error("[Chat] Socket connection error:", err);
      setConnectionStatus("error");
    });

    // Listen for server errors (e.g., failed to join room)
    socket.on("error", (err) => {
      console.error("[Chat] Server error:", err);
    });

    // Listen for new messages - uses ref to avoid stale closures
    socket.on("message:new", (data) => {
      console.log("[Chat] Received message:new event:", data.conversationId, "current:", conversationIdRef.current);
      if (data.conversationId === conversationIdRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    });

    // Listen for read receipts
    socket.on("message:read", (data) => {
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
    });

    return () => {
      if (conversationIdRef.current) {
        socket.emit("conversation:leave", { conversationId: conversationIdRef.current });
      }
      socket.disconnect();
    };
  }, [token]); // Only depends on token, not conversationId

  // Join conversation room when BOTH socket is connected AND conversationId is available
  useEffect(() => {
    if (!conversationId) {
      console.log("[Chat] No conversationId yet, waiting...");
      return;
    }
    
    const socket = socketRef.current;
    if (!socket) {
      console.log("[Chat] No socket yet, waiting...");
      return;
    }

    // Function to join the room
    const joinRoom = () => {
      if (hasJoinedRoomRef.current) {
        console.log("[Chat] Already joined room, skipping:", conversationId);
        return;
      }
      console.log("[Chat] Emitting conversation:join for:", conversationId, "socket connected:", socket.connected);
      socket.emit("conversation:join", { conversationId });
      hasJoinedRoomRef.current = true;
    };

    // Join immediately if connected
    if (socket.connected) {
      joinRoom();
    } else {
      console.log("[Chat] Socket not connected yet, will join on connect");
    }

    // Also join on reconnect
    const handleConnect = () => {
      console.log("[Chat] Socket connected, joining room now");
      hasJoinedRoomRef.current = false;
      joinRoom();
    };
    socket.on("connect", handleConnect);
    
    return () => {
      socket.off("connect", handleConnect);
      if (socket.connected && hasJoinedRoomRef.current) {
        console.log("[Chat] Leaving conversation room:", conversationId);
        socket.emit("conversation:leave", { conversationId });
        hasJoinedRoomRef.current = false;
      }
    };
  }, [conversationId, connectionStatus]); // Also depend on connectionStatus to re-run when socket connects

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

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
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
  }, [conversationId, messages, userId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !socketRef.current) return;

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
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-white">
        {/* Header */}
        <header className="flex items-center gap-3 p-4 border-b bg-white">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
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
            <p className="text-sm text-gray-500 truncate">
              Host: {host?.firstName || host?.name || "Host"}
            </p>
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
                  // Check if someone other than the sender has read the message
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
    </ProtectedRoute>
  );
}
