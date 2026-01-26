"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { socketManager } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Send, 
  Loader2, 
  MessageCircle, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  X,
  Calendar,
  Users,
  Home,
  User,
  Shield,
  MapPin,
  ExternalLink,
  WifiOff,
  Check,
  CheckCheck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams.get('conversationId');
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showReservation, setShowReservation] = useState(true);
  const [showPropertyInfo, setShowPropertyInfo] = useState(true);
  const [tripDetailsExpanded, setTripDetailsExpanded] = useState(true);
  const [propertyDetails, setPropertyDetails] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const conversationsRef = useRef([]);
  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const shouldRefocusRef = useRef(false);
  const chatUrl = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:3001";

  // Keep refs in sync with state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Refocus input after message is sent
  useEffect(() => {
    if (shouldRefocusRef.current && newMessage === "") {
      const inputRef = isMobileView ? mobileInputRef : desktopInputRef;
      if (inputRef.current) {
        requestAnimationFrame(() => {
          inputRef.current.focus();
        });
      }
      shouldRefocusRef.current = false;
    }
  }, [newMessage, isMobileView]);

  // Auto-focus input when conversation is selected
  useEffect(() => {
    if (selectedConversation && !loadingMessages) {
      const inputRef = isMobileView ? mobileInputRef : desktopInputRef;
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  }, [selectedConversation?.id, loadingMessages, isMobileView]);

  // Fetch property details for a conversation
  const fetchPropertyDetails = async (propertyId) => {
    if (!propertyId || propertyDetails[propertyId]) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${propertyId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setPropertyDetails(prev => ({
          ...prev,
          [propertyId]: json.data
        }));
      }
    } catch (err) {
      console.error("Error fetching property:", err);
    }
  };

  // Prevent body scroll and hide footer on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const footer = document.querySelector('footer');
    if (footer) footer.style.display = 'none';
    
    return () => {
      document.body.style.overflow = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  // Hide bottom navigation when in mobile chat view
  useEffect(() => {
    if (isMobileView && selectedConversation) {
      // Hide bottom navigation when viewing a chat on mobile
      const bottomNav = document.querySelector('nav.fixed.bottom-0');
      if (bottomNav) bottomNav.style.display = 'none';
      
      return () => {
        if (bottomNav) bottomNav.style.display = '';
      };
    }
  }, [isMobileView, selectedConversation]);

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle mobile viewport height for keyboard
  const [mobileViewportHeight, setMobileViewportHeight] = useState("100vh");
  const initialViewportHeight = useRef(null);
  const isKeyboardOpenRef = useRef(false);
  const isManualToggleRef = useRef(false);
  const inputFocusedRef = useRef(false);
  const lastKeyboardStateRef = useRef(false);
  
  // Set initial viewport height once on mount (before any keyboard opens)
  useEffect(() => {
    if (typeof window !== "undefined" && initialViewportHeight.current === null) {
      // Use screen height as baseline since it doesn't change with keyboard
      initialViewportHeight.current = window.screen.height * 0.85; // Approximate usable viewport
      // Or use innerHeight if visualViewport not available
      if (window.visualViewport) {
        initialViewportHeight.current = window.visualViewport.height;
      } else {
        initialViewportHeight.current = window.innerHeight;
      }
    }
  }, []);
  
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isMobileView || !selectedConversation) return;

    // Capture initial height when entering chat (keyboard should be closed)
    // Only set if we don't have a value yet or if current viewport is larger (keyboard closed)
    const currentVpHeight = window.visualViewport?.height || window.innerHeight;
    if (initialViewportHeight.current === null || currentVpHeight > initialViewportHeight.current) {
      initialViewportHeight.current = currentVpHeight;
    }

    const updateHeight = () => {
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        setMobileViewportHeight(`${currentHeight}px`);
        
        // Detect keyboard open/close (keyboard is open if viewport shrinks by more than 150px)
        const heightDiff = initialViewportHeight.current - currentHeight;
        const keyboardNowOpen = heightDiff > 150;
        const wasKeyboardOpen = isKeyboardOpenRef.current;
        const keyboardStateChanged = keyboardNowOpen !== wasKeyboardOpen;
        
        // Only auto-toggle if keyboard state actually changed
        if (keyboardStateChanged) {
          // Update keyboard state first
          isKeyboardOpenRef.current = keyboardNowOpen;
          lastKeyboardStateRef.current = keyboardNowOpen;
          
          // Only auto-toggle if not a manual toggle
          if (!isManualToggleRef.current) {
            if (keyboardNowOpen) {
              // Keyboard just opened - auto-collapse
              setShowPropertyInfo(false);
              // Scroll to bottom multiple times as keyboard animates
              const scrollToBottom = () => {
                if (chatContainerRef.current) {
                  chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
              };
              scrollToBottom();
              setTimeout(scrollToBottom, 50);
              setTimeout(scrollToBottom, 100);
              setTimeout(scrollToBottom, 150);
              setTimeout(scrollToBottom, 200);
              setTimeout(scrollToBottom, 300);
              setTimeout(scrollToBottom, 400);
              setTimeout(scrollToBottom, 500);
            } else {
              // Keyboard just closed - auto-expand
              setShowPropertyInfo(true);
            }
          }
          // Always reset manual toggle flag when keyboard state changes
          isManualToggleRef.current = false;
        }
      } else {
        setMobileViewportHeight(`${window.innerHeight}px`);
      }
    };

    // Backup: Use focus/blur events for keyboard detection (more reliable on some Android devices)
    const handleFocusIn = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        inputFocusedRef.current = true;
        
        // Scroll to bottom immediately on focus
        const scrollToBottom = () => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        };
        scrollToBottom();
        
        // Small delay to let viewport resize event fire first
        setTimeout(() => {
          const keyboardStateChanged = !lastKeyboardStateRef.current;
          if (inputFocusedRef.current && !isKeyboardOpenRef.current) {
            // Keyboard likely opened via focus
            isKeyboardOpenRef.current = true;
            lastKeyboardStateRef.current = true;
            if (keyboardStateChanged && !isManualToggleRef.current) {
              setShowPropertyInfo(false);
            }
            if (keyboardStateChanged) {
              isManualToggleRef.current = false;
            }
          }
          // Scroll again after keyboard detection
          scrollToBottom();
        }, 300);
        
        // Additional scroll attempts for reliability
        setTimeout(scrollToBottom, 50);
        setTimeout(scrollToBottom, 100);
        setTimeout(scrollToBottom, 150);
        setTimeout(scrollToBottom, 200);
        setTimeout(scrollToBottom, 400);
        setTimeout(scrollToBottom, 500);
      }
    };

    const handleFocusOut = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        inputFocusedRef.current = false;
        // Small delay to check if focus moved to another input
        setTimeout(() => {
          const keyboardStateChanged = lastKeyboardStateRef.current;
          if (!inputFocusedRef.current && isKeyboardOpenRef.current) {
            // Keyboard likely closed via blur
            isKeyboardOpenRef.current = false;
            lastKeyboardStateRef.current = false;
            if (keyboardStateChanged && !isManualToggleRef.current) {
              setShowPropertyInfo(true);
            }
            if (keyboardStateChanged) {
              isManualToggleRef.current = false;
            }
          }
        }, 300);
      }
    };

    // Initial check
    updateHeight();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateHeight);
      window.visualViewport.addEventListener("scroll", updateHeight);
    }
    window.addEventListener("resize", updateHeight);
    
    // Add focus/blur listeners as backup
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    // Lock body scroll
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateHeight);
        window.visualViewport.removeEventListener("scroll", updateHeight);
      }
      window.removeEventListener("resize", updateHeight);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);

      // Restore body scroll
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
      
      // Reset keyboard state on unmount but keep initial height
      isKeyboardOpenRef.current = false;
      inputFocusedRef.current = false;
    };
  }, [isMobileView, selectedConversation]);

  // Handle manual toggle of property info
  const handleTogglePropertyInfo = () => {
    isManualToggleRef.current = true;
    setShowPropertyInfo(prev => !prev);
  };

  // Reset dropdown to expanded when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setShowPropertyInfo(true);
      isManualToggleRef.current = false;
      lastKeyboardStateRef.current = false;
      isKeyboardOpenRef.current = false;
    }
  }, [selectedConversation?.id]);

  // Scroll to bottom of messages - only on initial load or new messages
  const scrollToBottom = (smooth = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  };

  // Scroll to bottom when messages change
  const prevMessagesLength = useRef(0);
  useEffect(() => {
    if (messages.length > 0) {
      // Only smooth scroll for new messages, instant for initial load
      const isNewMessage = messages.length > prevMessagesLength.current;
      scrollToBottom(isNewMessage && prevMessagesLength.current > 0);
      prevMessagesLength.current = messages.length;
    }
  }, [messages.length]);

  // Reset message count when conversation changes
  useEffect(() => {
    prevMessagesLength.current = 0;
  }, [selectedConversation?.id]);

  // Scroll to bottom when conversation is selected
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        scrollToBottom(false);
      }, 100);
    }
  }, [selectedConversation?.id]);

  // Initialize auth
  useEffect(() => {
    let storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login?returnUrl=/messages");
      return;
    }
    
    try {
      storedToken = JSON.parse(storedToken);
    } catch (e) {}
    
    setToken(storedToken);

    try {
      const payload = JSON.parse(atob(storedToken.split(".")[1]));
      setUserId(payload.userId);
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  // Load conversations and connect socket
  useEffect(() => {
    if (!token || !userId) return;

    async function init() {
      try {
        setLoading(true);
        
        const res = await fetch(`${chatUrl}/api/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        if (data.success) {
          const allConvs = data.data || [];
          
          // FILTER: Only show conversations where current user is the GUEST
          const guestConversations = allConvs.filter((conv) => {
            const participant = conv.participants.find(
              (p) => p.userId === userId
            );
            return participant && participant.role === "guest";
          });
          
          // Sort by last message time (most recent first)
          const sortedConversations = guestConversations.sort((a, b) => {
            const timeA = a.lastMessage?.sentAt ? new Date(a.lastMessage.sentAt) : new Date(0);
            const timeB = b.lastMessage?.sentAt ? new Date(b.lastMessage.sentAt) : new Date(0);
            return timeB - timeA;
          });
          
          setConversations(sortedConversations);
          
          // Auto-select conversation from URL if provided
          if (conversationIdFromUrl) {
            const targetConv = sortedConversations.find(c => c.id === conversationIdFromUrl);
            if (targetConv) {
              setSelectedConversation(targetConv);
              // Clear the URL param to avoid re-selecting on refresh
              router.replace('/messages', { scroll: false });
            }
          }
          
          sortedConversations.forEach(conv => {
            if (conv.propertyId) {
              fetchPropertyDetails(conv.propertyId);
            }
          });
        }

        const socket = socketManager.getSocket(token);
        if (!socket) return;

        const handleConnect = () => {
          setConnected(true);
          const guestConvs = (data.data || []).filter((conv) => {
            const participant = conv.participants.find(
              (p) => p.userId === userId
            );
            return participant && participant.role === "guest";
          });
          guestConvs.forEach(conv => {
            socketManager.joinRoom(conv.id);
          });
        };

        const handleDisconnect = () => setConnected(false);
        
        const handleNewMessage = (msgData) => {
          const currentConversation = selectedConversationRef.current;
          
          // Only process messages for guest conversations
          const isGuestConversation = conversationsRef.current.some(
            (conv) => conv.id === msgData.conversationId
          );
          
          if (!isGuestConversation) return;
          
          if (currentConversation && msgData.conversationId === currentConversation.id) {
            setMessages(prev => {
              // Check if message already exists by id OR by clientMessageId (for optimistic updates)
              const existingIndex = prev.findIndex(m => 
                m.id === msgData.message.id || 
                (msgData.message.clientMessageId && m.id === msgData.message.clientMessageId)
              );
              
              if (existingIndex !== -1) {
                // Replace optimistic message with server message
                const updated = [...prev];
                updated[existingIndex] = msgData.message;
                return updated;
              }
              return [...prev, msgData.message];
            });
          }
          
          setConversations(prev => {
            const updated = prev.map(conv => {
              if (conv.id === msgData.conversationId) {
                return {
                  ...conv,
                  lastMessage: {
                    content: msgData.message.content?.text || '',
                    senderId: msgData.message.senderId,
                    sentAt: msgData.message.createdAt,
                  },
                  unreadCount: {
                    ...conv.unreadCount,
                    [userId]: currentConversation?.id === msgData.conversationId
                      ? 0
                      : (conv.unreadCount?.[userId] || 0) + (msgData.message.senderId !== userId ? 1 : 0),
                  },
                };
              }
              return conv;
            });
            // Sort by last message time
            return updated.sort((a, b) => {
              const timeA = a.lastMessage?.sentAt ? new Date(a.lastMessage.sentAt) : new Date(0);
              const timeB = b.lastMessage?.sentAt ? new Date(b.lastMessage.sentAt) : new Date(0);
              return timeB - timeA;
            });
          });
        };

        // Listen for read receipts
        const handleMessageRead = (readData) => {
          const { conversationId, messageIds, usrId, timestamp } = readData;
          if (selectedConversationRef.current?.id === conversationId) {
            setMessages((prev) =>
              prev.map((msg) =>
                messageIds.includes(msg.id)
                  ? {
                      ...msg,
                      readBy: [...(msg.readBy || []), { userId: usrId, readAt: timestamp }],
                    }
                  : msg
              )
            );
          }
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("message:new", handleNewMessage);
        socket.on("message:read", handleMessageRead);

        // Set initial connection status
        if (socket.connected) {
          setConnected(true);
        }

        socketRef.current = socket;
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("message:new");
        socketRef.current.off("message:read");
        socketManager.releaseSocket();
      }
    };
  }, [token, userId, chatUrl]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation || !token) return;

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const res = await fetch(
          `${chatUrl}/api/chat/conversations/${selectedConversation.id}/messages?limit=50`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        
        if (data.success && data.data) {
          const sortedMessages = (data.data.data || []).sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
          );
          setMessages(sortedMessages);
        }

        if (socketRef.current) {
          socketRef.current.emit("conversation:join", { conversationId: selectedConversation.id });
        }
      } catch (err) {
        console.error("Load messages error:", err);
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();
  }, [selectedConversation?.id, token, chatUrl, userId]);

  // Track messages we've already marked as read to prevent infinite loops
  const markedAsReadRef = useRef(new Set());

  // Reset marked as read when conversation changes
  useEffect(() => {
    markedAsReadRef.current = new Set();
  }, [selectedConversation?.id]);

  // Mark messages as read when viewing conversation (handles new incoming messages)
  useEffect(() => {
    if (!selectedConversation || !messages.length || !socketRef.current || !socketRef.current.connected) return;

    const unreadMessageIds = messages
      .filter(
        (m) =>
          m.senderId !== userId &&
          !(m.readBy || []).some((r) => r.userId === userId) &&
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
                unreadCount: { ...conv.unreadCount, [userId]: 0 },
              }
            : conv
        )
      );
    }
  }, [selectedConversation?.id, messages, userId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    const text = newMessage.trim();
    const clientMessageId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const optimisticMsg = {
      id: clientMessageId,
      conversationId: selectedConversation.id,
      senderId: userId,
      content: { text },
      type: "text",
      createdAt: new Date().toISOString(),
      status: "sending",
      readBy: [],
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      if (socketRef.current && connected) {
        socketRef.current.emit(
          "message:send",
          {
            conversationId: selectedConversation.id,
            content: { text },
            type: "text",
            clientMessageId,
          },
          (response) => {
            if (!response.success) {
              setMessages(prev => prev.filter(m => m.id !== clientMessageId));
            }
          }
        );
      }

      // Mark that we should refocus after message is cleared
      shouldRefocusRef.current = true;
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
      setSending(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setShowReservation(true);
    setShowPropertyInfo(true);
    if (conv.propertyId && !propertyDetails[conv.propertyId]) {
      fetchPropertyDetails(conv.propertyId);
    }
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  // Get host name from property details - only first name for privacy
  const getHostName = (conv) => {
    const property = propertyDetails[conv.propertyId];
    if (property?.host) {
      return property.host.firstName || 'Host';
    }
    return 'Host';
  };

  // Get property info from cached details
  const getPropertyInfo = (conv) => {
    const property = propertyDetails[conv.propertyId];
    return {
      title: property?.title || 'Property',
      image: property?.images?.[0] || property?.photos?.[0] || null,
      type: property?.propertyType || property?.type || 'Entire home',
      hostName: getHostName(conv),
      hostImage: property?.host?.profilePicture || null,
      location: getPropertyLocation(property),
      price: property?.basePrice || property?.price?.base || null,
    };
  };

  const getPropertyLocation = (property) => {
    if (!property) return "";
    const city = property.address?.city || property.city;
    const state = property.address?.state || property.state;
    const parts = [city, state].filter(Boolean);
    return parts.join(", ");
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 86400000) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) {
      return d.toLocaleDateString([], { weekday: 'short' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
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

  const filteredConversations = conversations.filter(conv => {
    if (searchQuery) {
      const propInfo = getPropertyInfo(conv);
      const searchLower = searchQuery.toLowerCase();
      const matchesHost = propInfo.hostName.toLowerCase().includes(searchLower);
      const matchesProperty = propInfo.title.toLowerCase().includes(searchLower);
      if (!matchesHost && !matchesProperty) {
        return false;
      }
    }
    if (filter === "unread") {
      return (conv.unreadCount?.[userId] || 0) > 0;
    }
    return true;
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount?.[userId] || 0), 0);

  if (loading) {
    return (
      <div className="h-screen pt-12 md:pt-[76px] pb-16 md:pb-0 w-full flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primaryGreen" />
      </div>
    );
  }


  // Reservation Sidebar Component
  const ReservationSidebar = () => {
    if (!selectedConversation || !showReservation) return null;

    const propInfo = getPropertyInfo(selectedConversation);
    
    return (
      <div className="w-[280px] border-l bg-white flex-shrink-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-3 h-[52px] border-b flex items-center justify-between flex-shrink-0">
          <h3 className="font-semibold text-sm">Reservation</h3>
          <button 
            onClick={() => setShowReservation(false)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Property Image & Status */}
          <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video mb-3">
            <div className="absolute top-2 left-2 z-10 bg-primaryGreen text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
              ENQUIRY SENT
            </div>
            {propInfo.image ? (
              <Image
                src={propInfo.image}
                alt={propInfo.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-lightGreen to-primaryGreen/20 flex items-center justify-center">
                <Home className="w-6 h-6 text-primaryGreen/50" />
              </div>
            )}
          </div>

          {/* Ready to book */}
          <div className="mb-3">
            <h4 className="font-semibold text-sm mb-1">Ready to book?</h4>
            <p className="text-xs text-gray-500 mb-2">Host lets guests book instantly.</p>
            <Button 
              variant="outline" 
              className="w-full h-9 text-sm border-gray-900 text-gray-900 hover:bg-gray-50"
              onClick={() => router.push(`/stay/${selectedConversation.propertyId}`)}
            >
              Book now
            </Button>
          </div>

          <hr className="my-3" />

          {/* Trip Details - Collapsible */}
          <div>
            <button 
              onClick={() => setTripDetailsExpanded(!tripDetailsExpanded)}
              className="w-full flex items-center justify-between py-1"
            >
              <h4 className="font-semibold text-sm">Trip Details</h4>
              <ChevronDown className={`w-4 h-4 transition-transform ${tripDetailsExpanded ? 'rotate-180' : ''}`} />
            </button>

            {tripDetailsExpanded && (
              <div className="space-y-3 mt-2">
                {/* Property Info */}
                <Link 
                  href={`/stay/${selectedConversation.propertyId}`}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1">
                    <p className="font-medium text-xs group-hover:text-primaryGreen">
                      {propInfo.title}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      View listing
                    </p>
                  </div>
                  <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-primaryGreen" />
                </Link>

                {/* Host Info */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <Avatar className="w-8 h-8">
                    {propInfo.hostImage ? (
                      <AvatarImage src={propInfo.hostImage} alt={propInfo.hostName} />
                    ) : null}
                    <AvatarFallback className="bg-primaryGreen text-white text-xs">
                      {propInfo.hostName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-xs">Hosted by {propInfo.hostName}</p>
                    <p className="text-[10px] text-gray-500">Property host</p>
                  </div>
                </div>

                {/* Dates placeholder */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-[10px]">Check-in</p>
                      <p className="font-medium">Add dates</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-[10px]">Checkout</p>
                      <p className="font-medium">Add dates</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-[10px]">Guests</p>
                      <p className="font-medium">1 guest</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  // Mobile Chat View
  if (isMobileView && selectedConversation) {
    const propInfo = getPropertyInfo(selectedConversation);
    
    return (
      <div 
        className="fixed inset-x-0 top-0 bg-white flex flex-col font-poppins z-[9999]"
        style={{
          height: mobileViewportHeight,
          maxHeight: mobileViewportHeight,
        }}
      >
        {/* Chat Header */}
        <div className="bg-white border-b flex-shrink-0">
          {/* Host Info Row */}
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={handleBackToList} className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Avatar className="w-10 h-10 flex-shrink-0">
              {propInfo.hostImage ? (
                <AvatarImage src={propInfo.hostImage} alt={propInfo.hostName} />
              ) : null}
              <AvatarFallback className="bg-primaryGreen text-white">
                {propInfo.hostName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm truncate">{propInfo.hostName}</h2>
              <p className="text-xs text-gray-500">Property Host</p>
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
              <div className="bg-lightGreen/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-4 w-4 text-primaryGreen" />
                  <span className="text-xs font-medium text-primaryGreen uppercase tracking-wide">
                    Your Inquiry
                  </span>
                </div>
                <div className="flex gap-3">
                  {/* Property Image */}
                  <div className="relative h-16 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                    {propInfo.image ? (
                      <Image
                        src={propInfo.image}
                        alt={propInfo.title}
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
                    <h4 className="font-semibold text-sm truncate text-gray-900">
                      {propInfo.title}
                    </h4>
                    {propInfo.type && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        {propInfo.type}
                      </p>
                    )}
                    {propInfo.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {propInfo.location}
                      </p>
                    )}
                    {propInfo.price && (
                      <p className="text-xs font-medium text-primaryGreen mt-1">
                        ₹{propInfo.price.toLocaleString()}/night
                      </p>
                    )}
                  </div>
                </div>
                
                {/* View Property Button */}
                <Link
                  href={`/stay/${selectedConversation.propertyId}`}
                  className="mt-3 flex items-center justify-center gap-1 w-full py-2 text-xs font-medium text-primaryGreen border border-primaryGreen rounded-lg hover:bg-primaryGreen hover:text-white transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Property
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          data-chat-messages="true"
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          style={{
            minHeight: 0,
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {loadingMessages ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-primaryGreen" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            (() => {
              // Find the latest own message that has been read by the other person
              const allOwnMessages = messages.filter(m => m.senderId === userId);
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
                  const isOwn = message.senderId === userId;
                  // Only show "Read by" for the latest read message from current user
                  const isLatestReadMessage = message.id === latestReadOwnMessageId;
                  const readByName = isOwn && isLatestReadMessage ? propInfo.hostName.split(' ')[0] : null;
                  
                  // Check if we should show sender info (first message or different sender from previous)
                  const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                  const showSenderInfo = !isOwn && (!prevMessage || prevMessage.senderId !== message.senderId);

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
                      
                      {/* Sender info for received messages */}
                      {showSenderInfo && (
                        <div className="flex items-center gap-2 mb-1 ml-10">
                          <span className="text-[11px] text-gray-500">
                            {propInfo.hostName} · Host {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} w-full`}>
                        {!isOwn && (
                          <Avatar className="w-8 h-8 mr-2 flex-shrink-0 self-end">
                            {propInfo.hostImage ? (
                              <AvatarImage src={propInfo.hostImage} />
                            ) : null}
                            <AvatarFallback className="bg-primaryGreen text-white text-xs">
                              {propInfo.hostName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`inline-block ${
                            isOwn
                              ? "bg-primaryGreen text-white"
                              : "bg-white shadow-sm border border-gray-100"
                          } rounded-2xl px-4 py-2`}
                          style={{ maxWidth: '75%' }}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content?.text}
                          </p>
                        </div>
                      </div>
                      
                      {/* Read by indicator - only for latest read message */}
                      {isOwn && readByName && (
                        <p className="text-[11px] text-gray-400 mt-1 mr-1">
                          Read by {readByName}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ));
            })()
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <Input
              ref={desktopInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
              disabled={sending || !connected}
              className="flex-1 bg-gray-100 border-none rounded-full focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-0"
            />
            <Button
              onClick={sendMessage}
              onMouseDown={(e) => e.preventDefault()}
              disabled={!newMessage.trim() || sending || !connected}
              size="icon"
              className="h-10 w-10 rounded-full bg-primaryGreen hover:bg-brightGreen"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Details Bottom Sheet Modal */}
        {showDetailsModal && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-[100]"
              onClick={() => setShowDetailsModal(false)}
            />
            
            <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl z-[101] max-h-[85vh] flex flex-col animate-slide-up">
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-1 overflow-y-auto px-5 pb-8">
                <h2 className="text-lg font-semibold font-bricolage mb-4">Trip details</h2>
                
                <Link 
                  href={`/stay/${selectedConversation.propertyId}`}
                  onClick={() => setShowDetailsModal(false)}
                  className="flex gap-3 p-3 border rounded-xl hover:bg-gray-50 transition-colors mb-6"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {propInfo.image ? (
                      <Image
                        src={propInfo.image}
                        alt={propInfo.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-lightGreen flex items-center justify-center">
                        <Home className="w-6 h-6 text-primaryGreen/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{propInfo.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="text-primaryGreen">Enquiry sent</span>
                    </p>
                    <p className="text-xs text-gray-500 truncate">{propInfo.type}</p>
                    <p className="text-xs text-primaryGreen font-medium mt-1 flex items-center">
                      Show reservation <ChevronRight className="w-3 h-3 ml-0.5" />
                    </p>
                  </div>
                </Link>

                <h3 className="text-base font-semibold mb-3">In this conversation</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11">
                      {propInfo.hostImage ? (
                        <AvatarImage src={propInfo.hostImage} alt={propInfo.hostName} />
                      ) : null}
                      <AvatarFallback className="bg-primaryGreen text-white">
                        {propInfo.hostName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{propInfo.hostName}</p>
                      <p className="text-xs text-gray-500">Host</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11">
                      <AvatarFallback className="bg-gray-800 text-white">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">You</p>
                      <p className="text-xs text-gray-500">Guest</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-semibold mb-3">Things to keep in mind</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p>To protect your payment, always communicate and pay through Majestic Escape.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }


  // Desktop View
  return (
    <div className="h-screen pt-12 md:pt-[76px] pb-16 md:pb-0 w-full bg-white font-poppins flex overflow-hidden">
      {/* Conversation List */}
      <div
        className={`${
          selectedConversation ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-[380px] border-r overflow-hidden bg-white`}
      >
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bricolage font-semibold">Messages</h2>
            {!connected && (
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
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              className={`rounded-full px-4 text-sm font-medium ${
                filter === "all"
                  ? "bg-primaryGreen text-white hover:bg-primaryGreen/90"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "ghost"}
              size="sm"
              className={`rounded-full px-4 text-sm font-medium ${
                filter === "unread"
                  ? "bg-primaryGreen text-white hover:bg-primaryGreen/90"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setFilter("unread")}
            >
              Unread
              {totalUnread > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  filter === "unread" ? "bg-white/20" : "bg-primaryGreen text-white"
                }`}>
                  {totalUnread}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 px-4">
              <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">
                {searchQuery
                  ? "No conversations found"
                  : filter === "unread"
                  ? "No unread messages. You're all caught up!"
                  : "No messages yet. Start a conversation by messaging a host about a property."}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {filteredConversations.map((conv) => {
                const unreadCount = conv.unreadCount?.[userId] || 0;
                const propInfo = getPropertyInfo(conv);

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
                    <div className="flex gap-3">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={propInfo.hostImage} />
                        <AvatarFallback className="bg-primaryGreen/10 text-primaryGreen">
                          {propInfo.hostName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-sm truncate">
                            {propInfo.hostName}
                          </span>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatTime(conv.lastMessage?.sentAt)}
                          </span>
                        </div>
                        {/* Property Context Badge */}
                        <div className="flex items-center gap-1.5 mt-1">
                          {propInfo.image ? (
                            <div className="relative h-5 w-5 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={propInfo.image}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <Home className="h-4 w-4 text-primaryGreen flex-shrink-0" />
                          )}
                          <p className="text-xs text-primaryGreen font-medium truncate">
                            {propInfo.title}
                          </p>
                        </div>
                        {propInfo.location && (
                          <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {propInfo.location}
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
            {/* Host Info Row */}
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
                <AvatarImage src={getPropertyInfo(selectedConversation).hostImage} />
                <AvatarFallback className="bg-primaryGreen/10 text-primaryGreen">
                  {getPropertyInfo(selectedConversation).hostName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                  {getPropertyInfo(selectedConversation).hostName}
                </h3>
                <p className="text-sm text-gray-500">Property Host</p>
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
                  const propInfo = getPropertyInfo(selectedConversation);
                  
                  return (
                    <div className="bg-lightGreen/30 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="h-4 w-4 text-primaryGreen" />
                        <span className="text-xs font-medium text-primaryGreen uppercase tracking-wide">
                          Your Inquiry
                        </span>
                      </div>
                      <div className="flex gap-3">
                        {/* Property Image */}
                        <div className="relative h-16 w-20 md:h-20 md:w-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                          {propInfo.image ? (
                            <Image
                              src={propInfo.image}
                              alt={propInfo.title}
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
                            {propInfo.title}
                          </h4>
                          {propInfo.type && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              {propInfo.type}
                            </p>
                          )}
                          {propInfo.location && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {propInfo.location}
                            </p>
                          )}
                          {propInfo.price && (
                            <p className="text-xs font-medium text-primaryGreen mt-1">
                              ₹{propInfo.price.toLocaleString()}/night
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
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          >
            {loadingMessages ? (
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
                const allOwnMessages = messages.filter(m => m.senderId === userId);
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
                    const isOwn = message.senderId === userId;
                    // Only show "Read by" for the latest read message from current user
                    const isLatestReadMessage = message.id === latestReadOwnMessageId;
                    const propInfo = getPropertyInfo(selectedConversation);
                    const readByName = isOwn && isLatestReadMessage ? propInfo.hostName.split(' ')[0] : null;
                    
                    // Check if we should show sender info
                    const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                    const showSenderInfo = !isOwn && (!prevMessage || prevMessage.senderId !== message.senderId);

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
                        
                        {/* Sender info for received messages */}
                        {showSenderInfo && (
                          <div className="flex items-center gap-2 mb-1 ml-10">
                            <span className="text-[11px] text-gray-500">
                              {propInfo.hostName} · Host {formatMessageTime(message.createdAt)}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${isOwn ? "justify-end" : "justify-start"} w-full`}>
                          {!isOwn && (
                            <Avatar className="w-8 h-8 mr-2 flex-shrink-0 self-end">
                              {propInfo.hostImage ? (
                                <AvatarImage src={propInfo.hostImage} />
                              ) : null}
                              <AvatarFallback className="bg-primaryGreen text-white text-xs">
                                {propInfo.hostName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`inline-block ${
                              isOwn
                                ? "bg-primaryGreen text-white"
                                : "bg-white shadow-sm border border-gray-100"
                            } rounded-2xl px-4 py-2`}
                            style={{ maxWidth: '75%' }}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content?.text}
                            </p>
                          </div>
                        </div>
                        
                        {/* Read by indicator - only for latest read message */}
                        {isOwn && readByName && (
                          <p className="text-[11px] text-gray-400 mt-1 mr-1">
                            Read by {readByName}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ));
              })()
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input - Fixed at bottom */}
          <div className="p-4 border-t bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                onFocus={() => {
                  // Scroll to bottom when keyboard opens
                  const doScroll = () => scrollToBottom(false);
                  doScroll();
                  setTimeout(doScroll, 100);
                  setTimeout(doScroll, 300);
                  setTimeout(doScroll, 500);
                }}
                disabled={sending || !connected}
                className="flex-1 h-10 px-4 bg-gray-100 rounded-full text-base outline-none focus:ring-2 focus:ring-primaryGreen disabled:opacity-50 disabled:cursor-not-allowed"
                autoComplete="off"
                autoCorrect="on"
                autoCapitalize="sentences"
                enterKeyHint="send"
              />
              {/* Using a div to prevent focus stealing on mobile */}
              <div
                role="button"
                aria-disabled={!newMessage.trim() || sending || !connected}
                className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 select-none cursor-pointer ${
                  !newMessage.trim() || sending || !connected
                    ? "bg-gray-300 pointer-events-none"
                    : "bg-primaryGreen hover:bg-brightGreen active:bg-brightGreen"
                }`}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sendMessage();
                  mobileInputRef.current?.focus();
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sendMessage();
                  mobileInputRef.current?.focus();
                }}
                style={{ 
                  WebkitTapHighlightColor: "transparent",
                  WebkitUserSelect: "none",
                  userSelect: "none",
                }}
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Send className="h-5 w-5 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Empty State - Desktop only
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50">
          <div className="rounded-full bg-lightGreen/50 p-6 mb-4">
            <MessageCircle className="h-12 w-12 text-primaryGreen" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
          <p className="text-gray-500 text-center max-w-sm">
            Select a conversation to view and respond to messages from property hosts
          </p>
        </div>
      )}

      {/* Reservation Sidebar - Desktop */}
      {!isMobileView && <ReservationSidebar />}
    </div>
  );
}
