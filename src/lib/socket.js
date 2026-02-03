"use client";

import { io } from "socket.io-client";

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:3001";

/**
 * Singleton socket manager to prevent duplicate connections.
 * Ensures only one socket connection per user across all components.
 */
class SocketManager {
  constructor() {
    this.socket = null;
    this.token = null;
    this.connectionCount = 0;
    this.joinedRooms = new Set();
    this.connectionState = "disconnected"; // 'connecting' | 'connected' | 'disconnected' | 'error'
    this.connectionListeners = new Set();
    this.reconnectAttempt = 0;
    this.lastConnectTime = null;
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionChange(callback) {
    this.connectionListeners.add(callback);
    // Immediately notify of current state
    callback(this.connectionState);
    return () => this.connectionListeners.delete(callback);
  }

  /**
   * Update connection state and notify listeners
   */
  _setConnectionState(state) {
    if (this.connectionState !== state) {
      console.log(`[SocketManager] Connection state: ${this.connectionState} -> ${state}`);
      this.connectionState = state;
      this.connectionListeners.forEach(cb => cb(state));
    }
  }

  /**
   * Get or create a socket connection.
   * Multiple calls with the same token return the same socket instance.
   */
  getSocket(token) {
    if (!token) return null;

    // If we have an existing socket with the same token, reuse it
    // Check if socket exists and token matches (regardless of connection state)
    // The socket will connect/reconnect automatically
    if (this.socket && this.token === token) {
      this.connectionCount++;
      console.log(`[SocketManager] Reusing existing socket, count: ${this.connectionCount}`);
      return this.socket;
    }

    // If token changed, clean up old socket
    if (this.socket) {
      console.log("[SocketManager] Token changed, disconnecting old socket");
      this.socket.disconnect();
      this.socket = null;
      this.joinedRooms.clear();
    }

    this.token = token;
    this.connectionCount = 1;
    this.reconnectAttempt = 0;
    this._setConnectionState("connecting");

    console.log(`[SocketManager] Creating new socket connection to ${CHAT_URL}`);

    this.socket = io(CHAT_URL, {
      auth: { token },
      // Reconnection settings - prevent rapid reconnect loops
      reconnection: true,
      reconnectionDelay: 1000, // Start with 1s delay
      reconnectionDelayMax: 10000, // Max 10s between attempts
      reconnectionAttempts: 10, // Limit attempts to prevent infinite loops
      randomizationFactor: 0.5, // Add jitter to prevent thundering herd
      // Connection timeout
      timeout: 20000, // 20s connection timeout
      // Transport settings - use WebSocket only to avoid polling issues
      // This prevents "transport close" errors from polling fallback
      transports: ['websocket'],
      // Don't force new connection on page refresh if one exists
      forceNew: false,
      // Allow transport upgrade (not needed with websocket-only, but safe)
      upgrade: false,
      // Multiplexing - reuse connection for multiple namespaces
      multiplex: true,
    });

    // Track connection state
    this.socket.on("connect", () => {
      this.reconnectAttempt = 0;
      this.lastConnectTime = Date.now();
      console.log(`[SocketManager] Connected! Socket ID: ${this.socket.id}`);
      this._setConnectionState("connected");
      
      // Rejoin all rooms after reconnection
      this._rejoinRooms();
    });

    this.socket.on("connect_error", (error) => {
      console.warn(`[SocketManager] Connection error: ${error.message}`);
      // Stay in connecting state - let reconnection handle it
      if (this.connectionState !== "connecting") {
        this._setConnectionState("connecting");
      }
    });

    // Handle disconnect with detailed logging
    this.socket.on("disconnect", (reason) => {
      const connectedDuration = this.lastConnectTime 
        ? Math.round((Date.now() - this.lastConnectTime) / 1000) 
        : 0;
      console.log(`[SocketManager] Disconnected after ${connectedDuration}s. Reason: ${reason}`);
      
      // Clear joined rooms - they need to be rejoined after reconnect
      this.joinedRooms.clear();
      
      // Handle different disconnect reasons
      switch (reason) {
        case "io server disconnect":
          // Server forcefully disconnected - don't auto-reconnect
          console.log("[SocketManager] Server disconnected us, not reconnecting");
          this._setConnectionState("disconnected");
          break;
        case "io client disconnect":
          // We called disconnect() - intentional
          console.log("[SocketManager] Client initiated disconnect");
          this._setConnectionState("disconnected");
          break;
        case "transport close":
        case "transport error":
          // Network issue - will auto-reconnect
          console.log("[SocketManager] Transport issue, will reconnect automatically");
          this._setConnectionState("connecting");
          break;
        case "ping timeout":
          // Server didn't respond to ping - will auto-reconnect
          console.log("[SocketManager] Ping timeout, will reconnect automatically");
          this._setConnectionState("connecting");
          break;
        default:
          // Unknown reason - let reconnection handle it
          console.log(`[SocketManager] Unknown disconnect reason: ${reason}`);
          this._setConnectionState("connecting");
      }
    });

    // Reconnection event handlers for debugging
    this.socket.io.on("reconnect_attempt", (attempt) => {
      this.reconnectAttempt = attempt;
      console.log(`[SocketManager] Reconnection attempt ${attempt}`);
      this._setConnectionState("connecting");
    });

    this.socket.io.on("reconnect", (attempt) => {
      console.log(`[SocketManager] Reconnected after ${attempt} attempts`);
      this.reconnectAttempt = 0;
    });

    this.socket.io.on("reconnect_error", (error) => {
      console.warn(`[SocketManager] Reconnection error: ${error.message}`);
    });

    this.socket.io.on("reconnect_failed", () => {
      console.error("[SocketManager] Reconnection failed after all attempts");
      this._setConnectionState("error");
    });

    // Handle errors
    this.socket.on("error", (error) => {
      console.error("[SocketManager] Socket error:", error);
    });

    return this.socket;
  }

  /**
   * Rejoin all previously joined rooms after reconnection
   */
  _rejoinRooms() {
    if (!this.socket || !this.socket.connected) return;
    
    const roomsToRejoin = new Set(this.joinedRooms);
    this.joinedRooms.clear();
    
    roomsToRejoin.forEach(roomKey => {
      const conversationId = roomKey.replace('conversation:', '');
      console.log(`[SocketManager] Rejoining room: ${conversationId}`);
      this._doJoinRoom(conversationId);
    });
  }

  /**
   * Join a conversation room (with client-side deduplication).
   */
  joinRoom(conversationId) {
    if (!this.socket || !conversationId) return;
    
    // Only join if socket is connected
    if (!this.socket.connected) {
      // Queue the join for when socket connects
      const roomKey = `conversation:${conversationId}`;
      // Pre-add to joinedRooms so it gets rejoined on connect
      this.joinedRooms.add(roomKey);
      console.log(`[SocketManager] Queued room join for: ${conversationId}`);
      return;
    }

    this._doJoinRoom(conversationId);
  }

  _doJoinRoom(conversationId) {
    const roomKey = `conversation:${conversationId}`;
    if (this.joinedRooms.has(roomKey)) {
      return; // Already joined
    }

    console.log(`[SocketManager] Joining room: ${conversationId}`);
    this.socket.emit("conversation:join", { conversationId });
    this.joinedRooms.add(roomKey);
  }

  /**
   * Leave a conversation room.
   */
  leaveRoom(conversationId) {
    if (!this.socket || !conversationId) return;

    const roomKey = `conversation:${conversationId}`;
    if (!this.joinedRooms.has(roomKey)) {
      return; // Not in room
    }

    console.log(`[SocketManager] Leaving room: ${conversationId}`);
    this.socket.emit("conversation:leave", { conversationId });
    this.joinedRooms.delete(roomKey);
  }

  /**
   * Check if already joined a room.
   */
  isInRoom(conversationId) {
    return this.joinedRooms.has(`conversation:${conversationId}`);
  }

  /**
   * Release a reference to the socket.
   * Only disconnects when all references are released.
   */
  releaseSocket() {
    this.connectionCount--;
    console.log(`[SocketManager] Released socket, count: ${this.connectionCount}`);
    if (this.connectionCount <= 0 && this.socket) {
      console.log("[SocketManager] No more references, disconnecting");
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
      this.joinedRooms.clear();
      this.connectionCount = 0;
      this._setConnectionState("disconnected");
    }
  }

  /**
   * Force disconnect (for logout, etc.)
   */
  disconnect() {
    if (this.socket) {
      console.log("[SocketManager] Force disconnect");
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
      this.joinedRooms.clear();
      this.connectionCount = 0;
      this._setConnectionState("disconnected");
    }
  }

  /**
   * Get current connection state
   */
  getConnectionState() {
    return this.connectionState;
  }

  /**
   * Check if currently connected
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Get reconnection attempt count
   */
  getReconnectAttempt() {
    return this.reconnectAttempt;
  }
}

// Export singleton instance
export const socketManager = new SocketManager();
