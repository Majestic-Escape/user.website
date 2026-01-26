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
  }

  /**
   * Get or create a socket connection.
   * Multiple calls with the same token return the same socket instance.
   */
  getSocket(token) {
    if (!token) return null;

    // If we have an existing socket with the same token, reuse it
    if (this.socket && this.token === token && this.socket.connected) {
      this.connectionCount++;
      return this.socket;
    }

    // If token changed or socket disconnected, clean up old socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.joinedRooms.clear();
    }

    this.token = token;
    this.connectionCount = 1;

    this.socket = io(CHAT_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Clear joined rooms on disconnect
    this.socket.on("disconnect", () => {
      this.joinedRooms.clear();
    });

    return this.socket;
  }

  /**
   * Join a conversation room (with client-side deduplication).
   */
  joinRoom(conversationId) {
    if (!this.socket || !conversationId) return;
    
    const roomKey = `conversation:${conversationId}`;
    if (this.joinedRooms.has(roomKey)) {
      return; // Already joined
    }

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
    if (this.connectionCount <= 0 && this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
      this.joinedRooms.clear();
      this.connectionCount = 0;
    }
  }

  /**
   * Force disconnect (for logout, etc.)
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
      this.joinedRooms.clear();
      this.connectionCount = 0;
    }
  }
}

// Export singleton instance
export const socketManager = new SocketManager();
