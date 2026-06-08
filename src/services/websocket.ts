// WebSocket Service for Real-time Chat Communication
import { ChatEvent, WebSocketMessage, Message, TypingIndicator, UserStatus } from '@/types/chat';

type WebSocketEventListener = (data: unknown) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private isConnecting = false;
  private eventListeners: Map<string, WebSocketEventListener[]> = new Map();
  private userId: string | null = null;
  private authToken: string | null = null;

  // Connection management
  connect(userId: string, authToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      this.userId = userId;
      this.authToken = authToken;
      this.isConnecting = true;

      try {
        // In production, this would connect to your WebSocket server
        // For demo purposes, we'll simulate WebSocket behavior
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/chat';

        console.log(`Connecting to WebSocket: ${wsUrl}`);

        // Simulate WebSocket connection for demo
        setTimeout(() => {
          this.simulateConnection();
          this.isConnecting = false;
          resolve();
        }, 1000);

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private simulateConnection() {
    // Create a mock WebSocket for demonstration
    this.socket = {
      readyState: WebSocket.OPEN,
      send: (data: string) => {
        console.log('WebSocket sending:', data);
        // Simulate server responses
        this.handleSimulatedResponse(JSON.parse(data));
      },
      close: () => {
        this.socket = null;
        this.emit('disconnected', {});
      }
    } as WebSocket;

    this.emit('connected', {});
    console.log('WebSocket connected (simulated)');
  }

  private handleSimulatedResponse(sentData: { type: string; payload: Record<string, unknown> }) {
    // Simulate various server responses for demo
    setTimeout(() => {
      switch (sentData.type) {
        case 'send_message':
          // Simulate message delivery confirmation
          this.emit('message_sent', {
            messageId: sentData.payload.id,
            timestamp: new Date().toISOString()
          });
          break;

        case 'typing_start':
          // Simulate other user typing responses
          setTimeout(() => {
            this.emit('user_typing', {
              conversationId: sentData.payload.conversationId,
              userId: 'agent-1',
              userName: 'John Agent',
              isTyping: true
            });
          }, 500);
          break;

        case 'join_conversation':
          // Simulate conversation join confirmation
          this.emit('conversation_joined', {
            conversationId: sentData.payload.conversationId,
            participants: sentData.payload.participants
          });
          break;
      }
    }, 200);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.userId = null;
    this.authToken = null;
    this.reconnectAttempts = 0;
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('connection_failed', {});
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnection attempt ${this.reconnectAttempts}`);

    setTimeout(() => {
      if (this.userId && this.authToken) {
        this.connect(this.userId, this.authToken).catch(() => {
          this.reconnect();
        });
      }
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  // Event handling
  on(event: string, callback: WebSocketEventListener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: WebSocketEventListener) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: unknown) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Message operations
  sendMessage(conversationId: string, message: Partial<Message>) {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    const payload = {
      type: 'send_message',
      payload: {
        ...message,
        conversationId,
        senderId: this.userId,
        timestamp: new Date().toISOString()
      }
    };

    this.socket!.send(JSON.stringify(payload));
  }

  // Typing indicators
  startTyping(conversationId: string) {
    if (!this.isConnected()) return;

    const payload = {
      type: 'typing_start',
      payload: {
        conversationId,
        userId: this.userId,
        timestamp: new Date().toISOString()
      }
    };

    this.socket!.send(JSON.stringify(payload));
  }

  stopTyping(conversationId: string) {
    if (!this.isConnected()) return;

    const payload = {
      type: 'typing_stop',
      payload: {
        conversationId,
        userId: this.userId,
        timestamp: new Date().toISOString()
      }
    };

    this.socket!.send(JSON.stringify(payload));
  }

  // User status
  updateStatus(status: UserStatus) {
    if (!this.isConnected()) return;

    const payload = {
      type: 'status_update',
      payload: {
        userId: this.userId,
        status,
        timestamp: new Date().toISOString()
      }
    };

    this.socket!.send(JSON.stringify(payload));
  }

  // Conversation operations
  joinConversation(conversationId: string) {
    if (!this.isConnected()) return;

    const payload = {
      type: 'join_conversation',
      payload: {
        conversationId,
        userId: this.userId,
        timestamp: new Date().toISOString()
      }
    };

    this.socket!.send(JSON.stringify(payload));
  }

  leaveConversation(conversationId: string) {
    if (!this.isConnected()) return;

    const payload = {
      type: 'leave_conversation',
      payload: {
        conversationId,
        userId: this.userId,
        timestamp: new Date().toISOString()
      }
    };

    this.socket!.send(JSON.stringify(payload));
  }

  // File upload
  uploadFile(conversationId: string, file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Simulate file upload for demo
      console.log(`Uploading file: ${file.name} (${file.size} bytes)`);

      setTimeout(() => {
        // Simulate successful upload
        const fileUrl = `https://same-assets.com/chat-files/${Date.now()}-${file.name}`;

        this.emit('file_uploaded', {
          conversationId,
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          fileType: file.type
        });

        resolve(fileUrl);
      }, 2000);
    });
  }

  // Mark messages as read
  markAsRead(conversationId: string, messageId: string) {
    if (!this.isConnected()) return;

    const payload = {
      type: 'mark_read',
      payload: {
        conversationId,
        messageId,
        userId: this.userId,
        timestamp: new Date().toISOString()
      }
    };

    this.socket!.send(JSON.stringify(payload));
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.socket) return 'disconnected';

    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }

  // Property-specific methods
  createPropertyInquiry(propertyId: string, agentId: string, message: string) {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    const payload = {
      type: 'create_property_inquiry',
      payload: {
        propertyId,
        agentId,
        buyerId: this.userId,
        message,
        timestamp: new Date().toISOString()
      }
    };

    this.socket!.send(JSON.stringify(payload));
  }

  scheduleViewing(conversationId: string, propertyId: string, requestedDate: string, message?: string) {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    const payload = {
      type: 'schedule_viewing',
      payload: {
        conversationId,
        propertyId,
        requestedDate,
        message,
        requesterId: this.userId,
        timestamp: new Date().toISOString()
      }
    };

    this.socket!.send(JSON.stringify(payload));
  }

  submitOffer(conversationId: string, propertyId: string, amount: number, terms?: string) {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    const payload = {
      type: 'submit_offer',
      payload: {
        conversationId,
        propertyId,
        amount,
        terms,
        buyerId: this.userId,
        timestamp: new Date().toISOString()
      }
    };

    this.socket!.send(JSON.stringify(payload));
  }

  // Heartbeat to maintain connection
  private startHeartbeat() {
    setInterval(() => {
      if (this.isConnected()) {
        this.socket!.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Every 30 seconds
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

// Export for testing
export { WebSocketService };
