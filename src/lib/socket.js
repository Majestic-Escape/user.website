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
    // Set by disconnect() (logout). Guards the recovery listeners below so they
    // never resurrect a socket the app deliberately tore down.
    this.intentionallyDisconnected = false;
    this._recoveryBound = false;
    // Rooms that were joined on the previous connection and must be re-joined
    // on the next one. Socket.IO's connection-state recovery does not restore
    // rooms behind the Redis adapter (production), so this is the only thing
    // that brings a thread back to life after a transport drop.
    this.pendingRejoin = new Set();
    this._onConnect = this._onConnect.bind(this);
    this._onDisconnect = this._onDisconnect.bind(this);
    this._onError = this._onError.bind(this);
  }

  /**
   * The manager's own socket listeners. Registered by getSocket() and
   * re-attached on every reuse: a consumer that calls socket.off("connect")
   * without a handler wipes every listener for that event, ours included, and
   * the singleton would then never notice a reconnect again (state stuck in
   * "connecting", no manual reconnect after a server restart, no room
   * rejoin). Idempotent — Socket.IO's emitter adds a function once per call,
   * so we check before adding.
   */
  _ensureListeners() {
    if (!this.socket) return;
    const has = (event, fn) => this.socket.listeners(event).includes(fn);
    if (!has("connect", this._onConnect)) this.socket.on("connect", this._onConnect);
    if (!has("disconnect", this._onDisconnect)) this.socket.on("disconnect", this._onDisconnect);
    if (!has("error", this._onError)) this.socket.on("error", this._onError);
  }

  _onConnect() {
    this.reconnectAttempt = 0;
    this.lastConnectTime = Date.now();
    console.log(`[SocketManager] Connected! Socket ID: ${this.socket?.id}`);
    this._setConnectionState("connected");

    // Rejoin all rooms after reconnection
    this._rejoinRooms();
  }

  _onDisconnect(reason) {
    const connectedDuration = this.lastConnectTime
      ? Math.round((Date.now() - this.lastConnectTime) / 1000)
      : 0;
    console.log(`[SocketManager] Disconnected after ${connectedDuration}s. Reason: ${reason}`);

    // Remember the rooms so the next connection re-joins them; the server
    // forgot them with the old socket.
    this.joinedRooms.forEach((room) => this.pendingRejoin.add(room));
    this.joinedRooms.clear();

    // Handle different disconnect reasons
    switch (reason) {
      case "io server disconnect":
        // The one reason Socket.IO will NOT auto-reconnect from. It fires on
        // every majestic-chat deploy/restart, so leaving it here meant guests
        // stayed silently offline — no live messages, no typing, no unread
        // updates — until they happened to reload the page. Reconnect
        // manually; `reconnection: true` does not cover this case.
        // (The widget's /support socket already does exactly this.)
        if (this.intentionallyDisconnected) {
          this._setConnectionState("disconnected");
          break;
        }
        console.log("[SocketManager] Server dropped us — reconnecting manually");
        this._setConnectionState("connecting");
        this.socket?.connect();
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
  }

  _onError(error) {
    console.error("[SocketManager] Socket error:", error);
  }

  /**
   * Recover connections the Socket.IO client will not recover by itself.
   *
   * Two cases, both of which left guests silently offline until they reloaded:
   *
   *   1. Backgrounded tabs. Browsers throttle timers in background tabs, so a
   *      drop that happens while the user is elsewhere sits in backoff (up to
   *      10s here) after they come back. Very common on mobile, where switching
   *      apps backgrounds the tab.
   *   2. Coming back online after losing network.
   *
   * The sibling `/support` socket in majestic-escape-rag-ai-chat-widget already
   * does this; user.website's manager was missing it. Idempotent — Socket.IO
   * ignores connect() on an already-connected socket.
   */
  _bindRecoveryListeners() {
    if (this._recoveryBound || typeof window === "undefined") return;
    this._recoveryBound = true;

    const recover = () => {
      if (this.intentionallyDisconnected) return;
      if (!this.socket || this.socket.connected) return;
      console.log("[SocketManager] Recovering connection (tab visible / back online)");
      this.socket.connect();
    };

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") recover();
    });
    window.addEventListener("online", recover);
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
      this._ensureListeners();
      return this.socket;
    }

    // If token changed, clean up old socket
    if (this.socket) {
      console.log("[SocketManager] Token changed, disconnecting old socket");
      this.socket.disconnect();
      this.socket = null;
      this.joinedRooms.clear();
      this.pendingRejoin.clear();
    }

    this.token = token;
    this.connectionCount = 1;
    this.reconnectAttempt = 0;
    // A fresh socket means a fresh session (first load, or logging back in
    // after a disconnect()). Clear the latch or recovery would stay disabled
    // for the rest of the tab's life.
    this.intentionallyDisconnected = false;
    this._bindRecoveryListeners();
    this._setConnectionState("connecting");

    // Detect mobile devices - they need polling fallback for stability
    const isMobile = typeof navigator !== 'undefined' && 
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    console.log(`[SocketManager] Creating new socket connection to ${CHAT_URL} (mobile: ${isMobile})`);

    this.socket = io(CHAT_URL, {
      auth: { token },
      // Reconnection settings - prevent rapid reconnect loops
      reconnection: true,
      reconnectionDelay: 1000, // Start with 1s delay
      reconnectionDelayMax: 10000, // Max 10s between attempts
      reconnectionAttempts: Infinity, // Keep trying forever
      randomizationFactor: 0.5, // Add jitter to prevent thundering herd
      // Connection timeout
      timeout: 20000, // 20s connection timeout
      // Transport settings - mobile needs polling fallback, desktop uses websocket only
      // Mobile browsers (iOS Safari, Android WebView) aggressively kill WebSockets
      // Polling survives tab backgrounding better but is expensive at scale
      transports: isMobile ? ['polling', 'websocket'] : ['websocket'],
      // Don't force new connection on page refresh if one exists
      forceNew: false,
      // Allow transport upgrade from polling to websocket
      upgrade: true,
      // Multiplexing - reuse connection for multiple namespaces
      multiplex: true,
    });

    // Track connection state (see _ensureListeners for why these are named)
    this._ensureListeners();

    this.socket.on("connect_error", (error) => {
      console.warn(`[SocketManager] Connection error: ${error.message}`);
      // A rejection by the server's auth middleware (expired / invalidated /
      // malformed token) is final: Socket.IO drops its subscriptions
      // (socket.active === false) and will not retry on its own, so
      // "connecting" would be a lie the badge shows forever. Report it as an
      // error; the recovery listeners still attempt connect() when the tab
      // regains focus or the network returns, and a new login supplies a new
      // token through getSocket().
      if (this.socket && !this.socket.active) {
        this._setConnectionState("error");
        return;
      }
      // Transport-level failures keep reconnecting with backoff.
      if (this.connectionState !== "connecting") {
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

    return this.socket;
  }

  /**
   * Rejoin every room of the previous connection (plus any join queued while
   * we were offline) on the new one.
   */
  _rejoinRooms() {
    if (!this.socket || !this.socket.connected) return;

    const roomsToRejoin = new Set([...this.pendingRejoin, ...this.joinedRooms]);
    this.pendingRejoin.clear();
    this.joinedRooms.clear();

    roomsToRejoin.forEach(roomKey => {
      const conversationId = roomKey.replace('conversation:', '');
      console.log(`[SocketManager] Rejoining room: ${conversationId}`);
      this._doJoinRoom(conversationId);
    });
  }

  /**
   * Join a conversation room (with client-side deduplication). Without a
   * socket yet (a page can have its list before the app has acquired one) or
   * while disconnected, the join is queued and issued on the next connect.
   */
  joinRoom(conversationId) {
    if (!conversationId) return;

    if (!this.socket || !this.socket.connected) {
      const roomKey = `conversation:${conversationId}`;
      this.pendingRejoin.add(roomKey);
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
    if (!conversationId) return;

    const roomKey = `conversation:${conversationId}`;
    this.pendingRejoin.delete(roomKey);
    if (!this.socket || !this.joinedRooms.has(roomKey)) {
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
   * Does NOT disconnect - keeps socket alive for reconnection.
   * Use disconnect() for explicit disconnection (logout, etc.)
   */
  releaseSocket() {
    this.connectionCount--;
    console.log(`[SocketManager] Released socket, count: ${this.connectionCount}`);
    // Don't disconnect on release - keep socket alive
    // This prevents disconnection when components unmount (tab switch, navigation)
    // The socket will be reused when the component remounts
    if (this.connectionCount < 0) {
      this.connectionCount = 0;
    }
  }

  /**
   * Force disconnect (for logout, etc.)
   */
  disconnect() {
    // Latched so the visibility/online listeners and the server-disconnect
    // branch don't immediately undo an intentional teardown (logout).
    this.intentionallyDisconnected = true;
    if (this.socket) {
      console.log("[SocketManager] Force disconnect");
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
      this.joinedRooms.clear();
      this.pendingRejoin.clear();
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
