"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { socketManager } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Loader2, Clock, Home, MapPin, Calendar, ExternalLink, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "@/components/date-picker";
import { format, differenceInCalendarDays } from "date-fns";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper function to format time to 12-hour format
const formatTime = (time) => {
  if (!time) return '';
  
  // Handle if time is already in format like "2:00 PM"
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  
  // Handle 24-hour format like "14:00" or "14:00:00"
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const minute = minutes || '00';
  
  if (hour === 0) {
    return `12:${minute} AM`;
  } else if (hour < 12) {
    return `${hour}:${minute} AM`;
  } else if (hour === 12) {
    return `12:${minute} PM`;
  } else {
    return `${hour - 12}:${minute} PM`;
  }
};

export default function ContactHostPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL params (fallbacks)
  const hostIdParam = searchParams.get("hostId");
  const hostNameParam = searchParams.get("hostName") || "Host";
  const propertyNameParam = searchParams.get("propertyName") || "Property";
  const propertyImageParam = searchParams.get("propertyImage") || "";
  const propertyTypeParam = searchParams.get("propertyType") || "Entire home";
  const responseTimeParam = searchParams.get("responseTime") || "within an hour";
  const propertyId = params.propertyId;

  // State
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [guestFirstName, setGuestFirstName] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting"); // 'connecting' | 'connected' | 'disconnected' | 'error'
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [propertyData, setPropertyData] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedDates, setSelectedDates] = useState(null); // { from: Date, to: Date } | null
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [mobileDatePickerOpen, setMobileDatePickerOpen] = useState(false);

  const socketRef = useRef(null);
  const textareaRef = useRef(null);
  const initCalledRef = useRef(null); // Track init key to prevent duplicate init
  const chatUrl = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:3001";

  // Fetch property data
  useEffect(() => {
    if (!propertyId) return;
    
    async function fetchProperty() {
      try {
        const res = await fetch(`${API_BASE_URL}/properties/${propertyId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setPropertyData(json.data);
        }
      } catch (err) {
        console.error("Error fetching property:", err);
      }
    }
    
    fetchProperty();
  }, [propertyId]);

  // Derive values from fetched data or URL params
  const hostId = propertyData?.host?._id || hostIdParam;
  const hostName = propertyData?.host 
    ? `${propertyData.host.firstName || ''} ${propertyData.host.lastName || ''}`.trim() || decodeURIComponent(hostNameParam)
    : decodeURIComponent(hostNameParam);
  const propertyName = propertyData?.title || decodeURIComponent(propertyNameParam);
  const propertyImage = propertyData?.images?.[0] || propertyData?.photos?.[0] || (propertyImageParam ? decodeURIComponent(propertyImageParam) : null);
  const propertyType = propertyData?.propertyType || propertyData?.type || decodeURIComponent(propertyTypeParam);
  const responseTime = propertyData?.host?.responseTime || decodeURIComponent(responseTimeParam);
  const hostImage = propertyData?.host?.profilePicture || null;
  const propertyLocation = propertyData?.address 
    ? [propertyData.address.city, propertyData.address.state].filter(Boolean).join(", ")
    : "";
  const propertyPrice = propertyData?.basePrice || propertyData?.price?.base || null;

  // Trip plan helpers
  const tripNights = selectedDates?.from && selectedDates?.to
    ? Math.max(differenceInCalendarDays(selectedDates.to, selectedDates.from), 1)
    : 0;
  const tripTotalPrice = propertyPrice && tripNights > 0 ? propertyPrice * tripNights : null;

  const formatTripRange = () => {
    if (!selectedDates?.from || !selectedDates?.to) return null;
    return `${format(selectedDates.from, "d MMM")} – ${format(selectedDates.to, "d MMM yyyy")}`;
  };

  const buildOutgoingMessage = () => {
    const base = message.trim();
    if (!selectedDates?.from || !selectedDates?.to) return base;
    const range = `${format(selectedDates.from, "d MMM yyyy")} – ${format(selectedDates.to, "d MMM yyyy")}`;
    const nightsLabel = `${tripNights} night${tripNights === 1 ? "" : "s"}`;
    return `${base}\n\n🗓️ Requested dates: ${range} (${nightsLabel})`;
  };

  // Set default message after hostName is available
  useEffect(() => {
    if (hostName && hostName !== 'Host') {
      const firstName = hostName.split(' ')[0];
      setMessage(`Hi ${firstName}! I'll be visiting...`);
    }
  }, [hostName]);

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lock body scroll on mobile to prevent parent page scroll
  useEffect(() => {
    if (!isMobile) return;
    
    // Save current scroll position and lock body
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%';
    document.body.dataset.scrollY = scrollY.toString();
    
    return () => {
      // Restore scroll position on unmount
      const savedScrollY = document.body.dataset.scrollY || '0';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(savedScrollY, 10));
      delete document.body.dataset.scrollY;
    };
  }, [isMobile]);

  // Handle keyboard visibility on mobile (for send button adjustment)
  useEffect(() => {
    if (!isMobile) return;
    
    const handleResize = () => {
      // Use visualViewport API for accurate keyboard detection
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const keyboardH = windowHeight - viewportHeight;
        setKeyboardHeight(keyboardH > 50 ? keyboardH : 0);
      }
    };
    
    // Listen to visualViewport resize for keyboard detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, [isMobile]);

  // Initialize auth
  useEffect(() => {
    let storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    
    try {
      storedToken = JSON.parse(storedToken);
    } catch (e) {}
    
    setToken(storedToken);

    try {
      const payload = JSON.parse(atob(storedToken.split(".")[1]));
      setUserId(payload.userId);
      // Store guest's first name from token
      if (payload.firstName) {
        setGuestFirstName(payload.firstName);
      }
    } catch (e) {
      console.error("Invalid token");
      router.push("/login");
    }
  }, [router]);

  // Initialize socket and conversation
  useEffect(() => {
    if (!token || !userId || !hostId || !propertyId) return;

    if (userId === hostId) {
      router.push(`/stay/${propertyId}`);
      return;
    }

    // Create a unique key for this initialization to prevent duplicates in StrictMode
    // but allow re-init if dependencies actually change
    const initKey = `${token}-${userId}-${hostId}-${propertyId}`;
    if (initCalledRef.current === initKey) {
      console.log("[ContactHost] Init already called for this config, skipping");
      return;
    }
    initCalledRef.current = initKey;

    async function initSocket() {
      try {
        setLoading(true);
        console.log("[ContactHost] Initializing socket (conversation will be created on first message)...");
        
        // DON'T create conversation here - wait until user sends a message
        // This prevents empty conversations from appearing in host's inbox

        const socket = socketManager.getSocket(token);
        if (!socket) return;

        // Subscribe to connection state changes from socket manager
        const unsubscribeConnection = socketManager.onConnectionChange((state) => {
          setConnectionStatus(state);
        });

        const handleError = (err) => setError(err.message);

        socket.on("error", handleError);

        socketRef.current = socket;
        
        // Store unsubscribe function for cleanup
        socketRef.current._unsubscribeConnection = unsubscribeConnection;
      } catch (err) {
        console.error("Socket init error:", err);
        setError("Failed to connect to chat server");
      } finally {
        setLoading(false);
      }
    }

    initSocket();

    return () => {
      if (socketRef.current) {
        // Unsubscribe from connection state changes
        if (socketRef.current._unsubscribeConnection) {
          socketRef.current._unsubscribeConnection();
        }
        socketRef.current.off("error");
        socketManager.releaseSocket();
      }
    };
  }, [token, userId, hostId, propertyId, chatUrl, router]);

  // Helper to wait for socket connection with timeout
  const waitForSocketConnection = (maxWaitMs = 5000) => {
    return new Promise((resolve) => {
      // Already connected
      if (socketManager.isConnected()) {
        resolve(true);
        return;
      }
      
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (socketManager.isConnected()) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (Date.now() - startTime > maxWaitMs) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    });
  };

  const sendMessage = async () => {
    if (!message.trim() || sending) return;

    const outgoing = buildOutgoingMessage();

    setSending(true);
    setError(null);

    try {
      let convId = conversationId;
      
      // Create conversation on first message (lazy creation)
      // This prevents empty conversations from appearing in host's inbox
      if (!convId) {
        console.log("[ContactHost] Creating conversation on first message...");
        const res = await fetch(`${chatUrl}/api/chat/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            propertyId,
            hostId,
            guestId: userId,
            // Include participant names for display
            hostFirstName: propertyData?.host?.firstName,
            hostLastName: propertyData?.host?.lastName,
            guestFirstName: guestFirstName,
          }),
        });

        const data = await res.json();
        console.log("[ContactHost] Conversation response:", data, "status:", res.status);
        
        if (!res.ok || !data.success) {
          console.error("[ContactHost] Failed to create conversation:", data.message || data.error, "status:", res.status);
          setError(data.message || data.error || "Failed to create conversation");
          setSending(false);
          return;
        }
        
        convId = data.data.id || data.data._id;
        console.log("[ContactHost] Created conversationId:", convId);
        setConversationId(convId);
      }

      // Wait for socket to be connected (with timeout)
      // This handles the race condition where user clicks send before socket is ready
      const isConnected = await waitForSocketConnection(3000);
      
      if (!isConnected || !socketRef.current) {
        console.warn("[ContactHost] Socket not connected after waiting, using HTTP fallback");
        // HTTP fallback for sending message
        try {
          const msgRes = await fetch(`${chatUrl}/api/chat/conversations/${convId}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              content: { text: outgoing },
              type: "text",
            }),
          });
          
          const msgData = await msgRes.json();
          if (msgRes.ok && msgData.success) {
            setSending(false);
            setSent(true);
            return;
          } else {
            setError(msgData.message || "Failed to send message");
            setSending(false);
            return;
          }
        } catch (httpErr) {
          console.error("[ContactHost] HTTP fallback failed:", httpErr);
          setError("Failed to send message. Please try again.");
          setSending(false);
          return;
        }
      }

      const clientMessageId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      socketRef.current.emit(
        "message:send",
        {
          conversationId: convId,
          content: { text: outgoing },
          type: "text",
          clientMessageId,
        },
        (response) => {
          setSending(false);
          if (response.success) {
            setSent(true);
          } else {
            setError(response.error || "Failed to send message");
          }
        }
      );
    } catch (err) {
      setSending(false);
      setError(err.message);
    }
  };

  // Success state
  if (sent) {
    return (
      <div className={`fixed ${isMobile ? 'inset-0 z-[100]' : 'top-12 md:top-[76px] left-0 right-0 bottom-12 md:bottom-0 z-40'} flex items-center justify-center px-4 bg-white`}>
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-lightGreen rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-8 h-8 text-primaryGreen" />
          </div>
          <h1 className="text-2xl font-semibold font-bricolage mb-2">Message sent!</h1>
          <p className="text-gray-600 mb-8">
            {hostName} typically responds {responseTime}. You can view your conversation in your messages.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => router.push("/messages")}
              className="bg-primaryGreen hover:bg-brightGreen text-white"
            >
              Go to messages
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push(`/stay/${propertyId}`)}
              className="border-gray-300"
            >
              Back to listing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={`fixed ${isMobile ? 'inset-0 z-[100]' : 'top-12 md:top-[76px] left-0 right-0 bottom-12 md:bottom-0 z-40'} flex items-center justify-center bg-white`}>
        <Loader2 className="w-8 h-8 animate-spin text-primaryGreen" />
      </div>
    );
  }


  // Mobile Message Input Screen
  if (isMobile && showMessageInput) {
    return (
      <div 
        className="fixed inset-0 bg-white flex flex-col z-[100] font-poppins"
        style={{ 
          height: keyboardHeight > 0 ? `${window.visualViewport?.height || window.innerHeight}px` : '100dvh',
          top: keyboardHeight > 0 ? `${window.visualViewport?.offsetTop || 0}px` : 0
        }}
      >
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b bg-white flex-shrink-0">
          <button onClick={() => setShowMessageInput(false)} className="p-1.5 -ml-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="ml-3 font-medium">Message {hostName}</span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Property Card */}
          <div className="p-4 border-b bg-lightGreen/20">
            <div className="flex gap-3">
              <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {propertyImage ? (
                  <Image
                    src={propertyImage}
                    alt={propertyName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-lightGreen flex items-center justify-center">
                    <Home className="w-5 h-5 text-primaryGreen/50" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{propertyName}</p>
                <p className="text-xs text-gray-500">{propertyType}</p>
                {propertyLocation && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {propertyLocation}
                  </p>
                )}
                {propertyPrice && !selectedDates && (
                  <p className="text-xs font-medium text-primaryGreen mt-1">
                    ₹{propertyPrice.toLocaleString()}/night
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dates & Guests */}
          <div className="px-4 py-4 border-b">
            <div className="flex justify-between items-center mb-3 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Dates</span>
              </div>
              <Popover open={mobileDatePickerOpen} onOpenChange={setMobileDatePickerOpen}>
                <PopoverTrigger asChild>
                  {selectedDates ? (
                    <button className="flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-primaryGreen group">
                      <span>{formatTripRange()}</span>
                      <Pencil className="w-3 h-3 text-gray-400 group-hover:text-primaryGreen" />
                    </button>
                  ) : (
                    <button className="flex items-center gap-1.5 text-xs font-medium text-primaryGreen border border-primaryGreen/40 hover:bg-primaryGreen hover:text-white hover:border-primaryGreen rounded-full px-3 py-1.5 transition-colors">
                      <Calendar className="w-3.5 h-3.5" />
                      Add dates for accurate pricing
                    </button>
                  )}
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto max-w-[95vw] p-4 z-[200]"
                  align="end"
                  sideOffset={6}
                >
                  <DatePicker
                    initialDates={selectedDates || undefined}
                    onSelect={(dates) => {
                      if (dates?.from && dates?.to) {
                        setSelectedDates({ from: dates.from, to: dates.to });
                        setMobileDatePickerOpen(false);
                      }
                    }}
                    onClose={() => setMobileDatePickerOpen(false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {selectedDates && tripTotalPrice && (
              <div className="mb-3 pl-6 space-y-1">
                <p className="text-sm text-gray-600">
                  ₹{propertyPrice.toLocaleString()} × {tripNights} {tripNights === 1 ? "night" : "nights"}
                </p>
                <p className="text-base font-semibold text-primaryGreen">
                  Total ₹{tripTotalPrice.toLocaleString()}
                </p>
              </div>
            )}
            {selectedDates && (
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => setSelectedDates(null)}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear dates
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 text-center mt-1">You won't be charged yet</p>
            <Link href={`/stay/${propertyId}`} className="block mt-3">
              <Button
                variant="outline"
                className="w-full border-primaryGreen text-primaryGreen hover:bg-primaryGreen hover:text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View property
              </Button>
            </Link>
            {selectedDates && (
              <p className="mt-2 text-xs text-primaryGreen text-center">
                Host will see these dates with your message
              </p>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4">
            <h2 className="text-base font-semibold font-bricolage mb-3">Your message</h2>
            
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${hostName.split(' ')[0]}! I'll be visiting...`}
              className="min-h-[140px] resize-none border-gray-200 focus:border-primaryGreen focus:ring-primaryGreen text-sm rounded-xl"
            />

            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
        </div>

        {/* Fixed Send Button - adjusts with keyboard */}
        <div className="px-4 py-4 border-t bg-white flex-shrink-0">
          <Button
            onClick={sendMessage}
            disabled={!message.trim() || sending}
            className="w-full bg-primaryGreen hover:bg-brightGreen text-white h-12 rounded-xl text-sm font-medium"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send message
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col z-[100] font-poppins">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b bg-white flex-shrink-0">
          <button onClick={() => router.back()} className="p-1.5 -ml-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          {/* Host Info Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-xl font-semibold font-bricolage mb-1">Contact {hostName}</h1>
              <p className="text-gray-500 text-sm flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Typically responds {responseTime}
              </p>
            </div>
            <Avatar className="w-12 h-12 border-2 border-white shadow flex-shrink-0">
              {hostImage ? (
                <AvatarImage src={hostImage} alt={hostName} />
              ) : null}
              <AvatarFallback className="bg-primaryGreen text-white text-lg font-medium">
                {hostName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Most travellers ask about */}
          <div className="mb-6">
            <h2 className="text-base font-semibold font-bricolage mb-4">Most travellers ask about</h2>
            
            <div className="space-y-5">
              <div>
                <h3 className="font-medium text-sm mb-2">Getting there</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primaryGreen mt-0.5">•</span>
                    <span>
                      {propertyData?.amenities?.includes('free-parking') 
                        ? 'Free parking on premises' 
                        : propertyData?.amenities?.includes('paid-parking')
                        ? 'Paid parking on premises'
                        : 'Parking information not available'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primaryGreen mt-0.5">•</span>
                    <span>
                      {propertyData?.checkinTime && propertyData?.checkoutTime
                        ? `Check-in for this home is between ${formatTime(propertyData.checkinTime)} and checkout is at ${formatTime(propertyData.checkoutTime)}.`
                        : 'Check-in and checkout times will be confirmed by the host.'}
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-sm mb-2">Booking & stay clarity</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primaryGreen mt-0.5">•</span>
                    <span>Long-stay discounts available.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primaryGreen mt-0.5">•</span>
                    <span>Extra mattress available at additional cost.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primaryGreen mt-0.5">•</span>
                    <span>Government ID required at check-in.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primaryGreen mt-0.5">•</span>
                    <span>Early check-in / late checkout subject to availability.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <hr className="mb-5" />

          {/* Property availability info */}
          <p className="text-sm text-gray-700">
            This home is available from various dates.{" "}
            <Link href={`/stay/${propertyId}`} className="font-semibold text-primaryGreen">
              Book now
            </Link>
          </p>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="px-5 py-4 border-t bg-white flex-shrink-0 flex items-center justify-between">
          <span className="text-sm text-gray-700">Still have a question?</span>
          <Button
            onClick={() => setShowMessageInput(true)}
            className="bg-primaryGreen hover:bg-brightGreen text-white px-5 py-2.5 rounded-lg text-sm font-medium"
          >
            Message host
          </Button>
        </div>
      </div>
    );
  }


  // Desktop Layout
  return (
    <div className="min-h-[calc(100vh-76px)] bg-gray-50 font-poppins">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back button */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back to listing</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left Column - Contact Form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            {/* Host Info */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b">
              <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                {hostImage ? (
                  <AvatarImage src={hostImage} alt={hostName} />
                ) : null}
                <AvatarFallback className="bg-primaryGreen text-white text-xl font-medium">
                  {hostName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold font-bricolage">Contact {hostName}</h1>
                <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
                  <Clock className="w-4 h-4" />
                  Typically responds {responseTime}
                </p>
              </div>
            </div>

            {/* Most travellers ask about */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold font-bricolage mb-5">Most travellers ask about</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primaryGreen" />
                    Getting there
                  </h3>
                  <ul className="text-gray-600 text-sm space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-primaryGreen mt-0.5">•</span>
                      <span>
                        {propertyData?.amenities?.includes('free-parking') 
                          ? 'Free parking on premises' 
                          : propertyData?.amenities?.includes('paid-parking')
                          ? 'Paid parking on premises'
                          : 'Parking information not available'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primaryGreen mt-0.5">•</span>
                      <span>
                        {propertyData?.checkinTime && propertyData?.checkoutTime
                          ? `Check-in time for this home starts at ${formatTime(propertyData.checkinTime)} and checkout is at ${formatTime(propertyData.checkoutTime)}.`
                          : 'Check-in and checkout times will be confirmed by the host.'}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primaryGreen" />
                    Booking & stay clarity
                  </h3>
                  <ul className="text-gray-600 text-sm space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-primaryGreen mt-0.5">•</span>
                      <span>Long-stay discounts available.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primaryGreen mt-0.5">•</span>
                      <span>Extra mattress available at additional cost.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primaryGreen mt-0.5">•</span>
                      <span>Government ID required at check-in.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primaryGreen mt-0.5">•</span>
                      <span>Early check-in / late checkout subject to availability.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <hr className="mb-8" />

            {/* Message Form */}
            <div>
              <h2 className="text-lg font-semibold font-bricolage mb-4">Still have questions? Message the host</h2>
              
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hi ${hostName.split(' ')[0]}! I'll be visiting...`}
                className="min-h-[140px] resize-none border-gray-200 focus:border-primaryGreen focus:ring-primaryGreen text-base rounded-xl"
              />

              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}

              <Button
                onClick={sendMessage}
                disabled={!message.trim() || sending}
                className="mt-4 bg-primaryGreen hover:bg-brightGreen text-white px-6 py-2.5 rounded-lg"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send message
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - Property Card */}
          <div>
            <div className="lg:sticky lg:top-24 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Property Image */}
              <div className="relative h-48 bg-gray-100">
                {propertyImage ? (
                  <Image
                    src={propertyImage}
                    alt={propertyName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-lightGreen to-primaryGreen/20 flex items-center justify-center">
                    <Home className="w-12 h-12 text-primaryGreen/30" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <span className="text-xs font-medium text-gray-700">{propertyType}</span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-5">
                <h3 className="font-semibold text-base mb-1 line-clamp-2">{propertyName}</h3>
                {propertyLocation && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    {propertyLocation}
                  </p>
                )}
                {propertyPrice && !tripTotalPrice && (
                  <p className="text-sm font-medium text-primaryGreen mb-4">
                    ₹{propertyPrice.toLocaleString()}/night
                  </p>
                )}
                {tripTotalPrice && (
                  <div className="mb-4 space-y-1">
                    <p className="text-sm text-gray-600">
                      ₹{propertyPrice.toLocaleString()} × {tripNights} {tripNights === 1 ? "night" : "nights"}
                    </p>
                    <p className="text-base font-semibold text-primaryGreen">
                      Total ₹{tripTotalPrice.toLocaleString()}
                    </p>
                  </div>
                )}

                <hr className="mb-4" />

                {/* Dates & Guests */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-sm text-gray-600">Dates</span>
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        {selectedDates ? (
                          <button className="flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-primaryGreen group">
                            <span>{formatTripRange()}</span>
                            <Pencil className="w-3 h-3 text-gray-400 group-hover:text-primaryGreen" />
                          </button>
                        ) : (
                          <button className="flex items-center gap-1.5 text-xs font-medium text-primaryGreen border border-primaryGreen/40 hover:bg-primaryGreen hover:text-white hover:border-primaryGreen rounded-full px-3 py-1.5 transition-colors">
                            <Calendar className="w-3.5 h-3.5" />
                            Add dates for accurate pricing
                          </button>
                        )}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto max-w-[95vw] p-4" align="end" sideOffset={6}>
                        <DatePicker
                          initialDates={selectedDates || undefined}
                          onSelect={(dates) => {
                            if (dates?.from && dates?.to) {
                              setSelectedDates({ from: dates.from, to: dates.to });
                              setDatePickerOpen(false);
                            }
                          }}
                          onClose={() => setDatePickerOpen(false)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {selectedDates && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setSelectedDates(null)}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                        Clear dates
                      </button>
                    </div>
                  )}
                </div>

                <hr className="my-4" />

                <p className="text-sm text-gray-500 text-center mb-4">You won't be charged yet</p>

                {/* View Property Button */}
                <Link href={`/stay/${propertyId}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full border-primaryGreen text-primaryGreen hover:bg-primaryGreen hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View property
                  </Button>
                </Link>

                {selectedDates && (
                  <p className="mt-3 text-xs text-primaryGreen text-center">
                    Host will see these dates with your message
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
