// Real-time Chat & Communication System Types

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
}

export interface ChatParticipant {
  userId: string;
  user?: ChatUser;
  name: string;
  avatar?: string;
  role: 'user' | 'agent' | 'admin';
  joinedAt: string;
  isTyping?: boolean;
  isOnline?: boolean;
}

export interface ChatAttachment {
  id: string;
  filename?: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'other' | 'video';
  size: number;
  mimeType?: string;
  uploadedAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system' | 'document' | 'property_link' | 'viewing_request' | 'offer';
  timestamp: string;
  isRead?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  edited?: boolean;
  attachments?: ChatAttachment[];
  metadata?: {
    propertyId?: string;
    viewingDate?: string;
    offerAmount?: number;
    [key: string]: unknown;
  };
}

export interface ChatConversation {
  id: string;
  title?: string;
  type: 'direct' | 'group' | 'support' | 'property_inquiry';
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  lastActivity?: string;
  updatedAt: string;
  createdAt: string;
  isActive: boolean;
  isArchived?: boolean;
  unreadCount?: number;
  propertyId?: string;
  agentId?: string;
  metadata?: {
    propertyId?: string;
    propertyTitle?: string;
    propertyImage?: string;
    agentId?: string;
    inquiryType?: string;
    [key: string]: unknown;
  };
  settings?: {
    allowFileSharing: boolean;
    allowViewingRequests: boolean;
    allowOffers: boolean;
    notifications: boolean;
  };
}

export interface ConversationCreateData {
  participantIds: string[];
  title?: string;
  type: 'direct' | 'group' | 'support' | 'property_inquiry';
  propertyId?: string;
  agentId?: string;
  initialMessage?: string;
}

// Type aliases for backward compatibility
export type Message = ChatMessage;
export type Conversation = ChatConversation;
export type ConversationParticipant = ChatParticipant;
export type MessageAttachment = ChatAttachment;
export type ConversationType = ChatConversation['type'];
export type TypingIndicator = {
  userId: string;
  userName: string;
  isTyping: boolean;
};
