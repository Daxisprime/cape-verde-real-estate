"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'file' | 'property_viewing' | 'property_offer';
  timestamp: string;
  attachments?: FileAttachment[];
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface FileAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video';
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

interface ConversationParticipant {
  userId: string;
  name: string;
  role: 'buyer' | 'agent' | 'admin';
  joinedAt: string;
  isTyping: boolean;
  isOnline: boolean;
}

interface Conversation {
  id: string;
  type: 'property_inquiry' | 'support' | 'direct';
  title: string;
  participants: ConversationParticipant[];
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
  };
  lastActivity: string;
  unreadCount: number;
  metadata?: {
    propertyId?: string;
    propertyTitle?: string;
    propertyImage?: string;
    agentId?: string;
    inquiryType?: string;
  };
  settings: {
    allowFileSharing: boolean;
    allowViewingRequests: boolean;
    allowOffers: boolean;
    notifications: boolean;
  };
  isArchived: boolean;
  createdAt: string;
}

interface OnlineUser {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
}

interface ChatContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Data
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: { [conversationId: string]: Message[] };
  onlineUsers: OnlineUser[];
  typingUsers: { [conversationId: string]: string[] };

  // Actions
  setCurrentConversation: (conversation: Conversation | null) => void;
  sendMessage: (conversationId: string, content: string, type?: string, attachments?: FileAttachment[]) => Promise<void>;
  markAsRead: (conversationId: string, messageId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  createPropertyInquiry: (propertyId: string, agentId: string, initialMessage: string) => Promise<string>;
  createConversation: (participants: string[], type: string, title: string, metadata?: Record<string, unknown>) => Promise<string>;

  // Stats
  totalUnreadCount: number;
  activeConversationsCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

// Chat server configuration
const CHAT_SERVER_URL = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'wss://procv-chat-server-production.up.railway.app' // Production fallback
  : 'http://localhost:8080';

export function ChatProvider({ children }: ChatProviderProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Connection state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Data state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ [conversationId: string]: string[] }>({});

  // Load mock data for production fallback
  const loadMockData = React.useCallback(() => {
    const mockConversations: Conversation[] = [
      {
        id: 'conv-1',
        type: 'property_inquiry',
        title: 'Modern Beachfront Villa Inquiry',
        participants: [
          {
            userId: 'user-1',
            name: 'Demo User',
            role: 'buyer',
            joinedAt: new Date().toISOString(),
            isTyping: false,
            isOnline: true
          },
          {
            userId: 'agent-1',
            name: 'John Agent',
            role: 'agent',
            joinedAt: new Date().toISOString(),
            isTyping: false,
            isOnline: true
          }
        ],
        lastActivity: new Date().toISOString(),
        unreadCount: 0,
        metadata: {
          propertyId: '1',
          propertyTitle: 'Modern Beachfront Villa',
          propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          agentId: 'agent-1',
          inquiryType: 'viewing'
        },
        settings: {
          allowFileSharing: true,
          allowViewingRequests: true,
          allowOffers: true,
          notifications: true
        },
        isArchived: false,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    setConversations(mockConversations);

    const mockMessages: { [key: string]: Message[] } = {
      'conv-1': [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          senderId: 'agent-1',
          senderName: 'John Agent',
          content: 'Hello! I see you\'re interested in the Modern Beachfront Villa. I\'d be happy to help you with any questions or schedule a viewing.',
          type: 'text',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          attachments: [],
          status: 'read'
        },
        {
          id: 'msg-2',
          conversationId: 'conv-1',
          senderId: 'user-1',
          senderName: 'Demo User',
          content: 'Hi John! Yes, I\'m very interested. The property looks amazing. Could you tell me more about the neighborhood and amenities?',
          type: 'text',
          timestamp: new Date(Date.now() - 3300000).toISOString(),
          attachments: [],
          status: 'read'
        }
      ]
    };

    setMessages(mockMessages);
  }, []);

  const loadConversationMessages = React.useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`${CHAT_SERVER_URL.replace('ws', 'http')}/api/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer demo-token`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📩 Loaded messages for conversation ${conversationId}:`, data.messages);
        setMessages(prev => ({
          ...prev,
          [conversationId]: data.messages
        }));
      }
    } catch (error) {
      console.error(`Error loading messages for conversation ${conversationId}:`, error);
    }
  }, []);

  const loadConversations = React.useCallback(async () => {
    try {
      const response = await fetch(`${CHAT_SERVER_URL.replace('ws', 'http')}/api/conversations`, {
        headers: {
          'Authorization': `Bearer demo-token`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Loaded conversations:', data.conversations);
        setConversations(data.conversations);

        // Load messages for each conversation
        for (const conversation of data.conversations) {
          loadConversationMessages(conversation.id);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      if (process.env.NODE_ENV === 'production') {
        loadMockData();
      }
    }
  }, [loadMockData, loadConversationMessages]);

  // Connection function
  const connectToServer = React.useCallback(() => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setConnectionError(null);

    console.log('🔌 Connecting to chat server:', CHAT_SERVER_URL);

    const newSocket = io(CHAT_SERVER_URL, {
      auth: {
        token: 'demo-token'
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to chat server');
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      setSocket(newSocket);

      // Load initial data
      loadConversations();
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setIsConnecting(false);
      setIsConnected(false);
      setConnectionError(error.message);

      // Fall back to mock data if chat server unavailable (both dev and production)
      console.log('🔄 Chat server unavailable, using mock data for demo');
      loadMockData();

      // Don't show repeated toast errors - just log and use fallback
      // Only show toast once for the first connection attempt
      if (!connectionError) {
        console.log('Chat server not available - using offline mode');
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from chat server:', reason);
      setIsConnected(false);
      setSocket(null);

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        toast({
          title: "Connection Lost",
          description: "Reconnecting to chat server...",
          variant: "destructive"
        });
      }
    });

    newSocket.on('reconnect', () => {
      console.log('🔄 Reconnected to chat server');
      setIsConnected(true);
      setConnectionError(null);

      toast({
        title: "Connection Restored",
        description: "Successfully reconnected to chat server"
      });

      loadConversations();
    });

    // Message events
    newSocket.on('new_message', (message: Message) => {
      console.log('📩 Received new message:', message);

      setMessages(prev => ({
        ...prev,
        [message.conversationId]: [
          ...(prev[message.conversationId] || []),
          message
        ]
      }));

      // Update conversation last activity
      setConversations(prev => prev.map(conv =>
        conv.id === message.conversationId
          ? { ...conv, lastActivity: message.timestamp, unreadCount: conv.unreadCount + 1 }
          : conv
      ));

      // Show notification if not current conversation
      if (!currentConversation || currentConversation.id !== message.conversationId) {
        toast({
          title: `New message from ${message.senderName}`,
          description: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
        });
      }
    });

    newSocket.on('message_sent', (data: { success: boolean; message: Message }) => {
      if (data.success) {
        console.log('✅ Message sent successfully');

        // Update message status
        setMessages(prev => ({
          ...prev,
          [data.message.conversationId]: prev[data.message.conversationId]?.map(msg =>
            msg.id === data.message.id ? { ...msg, status: 'sent' } : msg
          ) || []
        }));
      }
    });

    newSocket.on('user_typing', (data: { userId: string; userName: string; isTyping: boolean }) => {
      if (currentConversation) {
        setTypingUsers(prev => {
          const conversationTyping = prev[currentConversation.id] || [];
          if (data.isTyping) {
            return {
              ...prev,
              [currentConversation.id]: [...conversationTyping.filter(name => name !== data.userName), data.userName]
            };
          } else {
            return {
              ...prev,
              [currentConversation.id]: conversationTyping.filter(name => name !== data.userName)
            };
          }
        });
      }
    });

    newSocket.on('online_users', (users: OnlineUser[]) => {
      console.log('👥 Online users updated:', users);
      setOnlineUsers(users);
    });

    newSocket.on('user_status_change', (data: { userId: string; isOnline: boolean }) => {
      setOnlineUsers(prev => prev.map(user =>
        user.id === data.userId ? { ...user, isOnline: data.isOnline } : user
      ));
    });

    newSocket.on('error', (error) => {
      console.error('🚨 Socket error:', error);
      toast({
        title: "Chat Error",
        description: error.message || "An error occurred with the chat system",
        variant: "destructive"
      });
    });
  }, [isConnecting, isConnected, currentConversation, toast, loadMockData, loadConversations, connectionError]);

  // Initialize socket connection
  React.useEffect(() => {
    if (user) {
      connectToServer();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, connectToServer, socket]);



  const sendMessage = async (
    conversationId: string,
    content: string,
    type: string = 'text',
    attachments: FileAttachment[] = []
  ) => {
    if (!socket || !isConnected) {
      // Fallback for production when chat server is unavailable
      if (process.env.NODE_ENV === 'production') {
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          conversationId,
          senderId: user?.id || 'unknown',
          senderName: user?.name || 'Unknown User',
          content,
          type: type as Message['type'],
          timestamp: new Date().toISOString(),
          attachments,
          status: 'sent'
        };

        setMessages(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), tempMessage]
        }));

        toast({
          title: "Message Sent",
          description: "Message sent (demo mode - chat server unavailable)",
        });
        return;
      }

      toast({
        title: "Connection Error",
        description: "Not connected to chat server",
        variant: "destructive"
      });
      return;
    }

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: user?.id || 'unknown',
      senderName: user?.name || 'Unknown User',
      content,
      type: type as Message['type'],
      timestamp: new Date().toISOString(),
      attachments,
      status: 'sending'
    };

    // Add message immediately to UI
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), tempMessage]
    }));

    // Send via socket
    socket.emit('send_message', {
      conversationId,
      content,
      type,
      attachments
    });
  };

  const markAsRead = (conversationId: string, messageId: string) => {
    if (socket && isConnected) {
      socket.emit('mark_read', { conversationId, messageId });
    }
  };

  const startTyping = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { conversationId });
    }
  };

  const stopTyping = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { conversationId });
    }
  };

  const joinConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('join_conversation', { conversationId });
      console.log(`👥 Joined conversation: ${conversationId}`);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_conversation', { conversationId });
      console.log(`👋 Left conversation: ${conversationId}`);
    }
  };

  const createPropertyInquiry = async (
    propertyId: string,
    agentId: string,
    initialMessage: string
  ): Promise<string> => {
    const conversationId = await createConversation(
      [user?.id || '', agentId],
      'property_inquiry',
      `Property Inquiry - ${propertyId}`,
      {
        propertyId,
        agentId,
        inquiryType: 'support'
      }
    );

    // Send initial message
    await sendMessage(conversationId, initialMessage);

    return conversationId;
  };

  const createConversation = async (
    participants: string[],
    type: string,
    title: string,
    metadata: Record<string, unknown> = {}
  ): Promise<string> => {
    if (socket && isConnected) {
      return new Promise((resolve) => {
        const conversationId = `conv-${Date.now()}`;

        socket.emit('create_conversation', {
          participants,
          type,
          title,
          metadata
        });

        // For now, return the generated ID
        resolve(conversationId);
      });
    }

    // Fallback for production
    const conversationId = `conv-${Date.now()}`;
    return conversationId;
  };

  // Computed values
  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  const activeConversationsCount = conversations.filter(conv => !conv.isArchived).length;

  const value: ChatContextType = {
    isConnected,
    isConnecting,
    connectionError,
    conversations,
    currentConversation,
    messages,
    onlineUsers,
    typingUsers,
    setCurrentConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    joinConversation,
    leaveConversation,
    createPropertyInquiry,
    createConversation,
    totalUnreadCount,
    activeConversationsCount
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
