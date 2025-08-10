"use client";

import React from 'react';
import { MessageSquare, MapPin, Users, Shield, Clock, Check, CheckCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChatConversation, ChatMessage, ChatParticipant } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationListProps {
  conversations: ChatConversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  compact?: boolean;
  className?: string;
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  compact = false,
  className = ''
}: ConversationListProps) {
  const { user } = useAuth();

  const getConversationTitle = (conversation: ChatConversation) => {
    if (conversation.title) return conversation.title;

    const otherParticipants = conversation.participants.filter((p: ChatParticipant) => p.userId !== user?.id);
    if (otherParticipants.length === 1) {
      return otherParticipants[0].user?.name || 'Unknown User';
    }

    return `Group Chat`;
  };

  const getConversationSubtitle = (conversation: ChatConversation) => {
    if (conversation.propertyId) {
      return `Property Inquiry #${conversation.propertyId}`;
    }

    const otherParticipants = conversation.participants.filter((p: ChatParticipant) => p.userId !== user?.id);
    if (otherParticipants.length > 1) {
      return `${otherParticipants.length} participants`;
    }

    return otherParticipants[0]?.role || '';
  };

  const getConversationIcon = (type: 'direct' | 'group' | 'support') => {
    switch (type) {
      case 'group': return Users;
      case 'support': return Shield;
      default: return MessageSquare;
    }
  };

  const getConversationIconColor = (type: ConversationType) => {
    switch (type) {
      case 'property_inquiry': return 'text-green-600';
      case 'group': return 'text-blue-600';
      case 'support': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';

    const { content, type, senderId } = conversation.lastMessage;
    const isFromCurrentUser = senderId === user?.id;
    const prefix = isFromCurrentUser ? 'You: ' : '';

    switch (type) {
      case 'image':
        return `${prefix}📷 Photo`;
      case 'document':
        return `${prefix}📄 Document`;
      case 'property_link':
        return `${prefix}🏠 Property`;
      case 'viewing_request':
        return `${prefix}📅 Viewing Request`;
      case 'offer':
        return `${prefix}💰 Offer`;
      case 'system':
        return content;
      default:
        return `${prefix}${content}`;
    }
  };

  const getMessageStatusIcon = (conversation: Conversation) => {
    if (!conversation.lastMessage || conversation.lastMessage.senderId !== user?.id) {
      return null;
    }

    switch (conversation.lastMessage.status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  if (conversations.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {conversations.map((conversation) => {
        const IconComponent = getConversationIcon(conversation.type);
        const isSelected = conversation.id === selectedConversationId;
        const otherParticipant = conversation.participants.find((p: ChatParticipant) => p.userId !== user?.id);

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`
              cursor-pointer transition-colors duration-200 rounded-lg p-3
              ${isSelected
                ? 'bg-blue-50 border-l-4 border-l-blue-600'
                : 'hover:bg-gray-50'
              }
              ${compact ? 'p-2' : 'p-3'}
            `}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar or Icon */}
              <div className="relative">
                {otherParticipant?.avatar ? (
                  <Avatar className={compact ? 'h-8 w-8' : 'h-10 w-10'}>
                    <AvatarImage src={otherParticipant.avatar} />
                    <AvatarFallback className="text-xs">
                      {getConversationTitle(conversation).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className={`
                    ${compact ? 'h-8 w-8' : 'h-10 w-10'}
                    rounded-full bg-gray-100 flex items-center justify-center
                  `}>
                    <IconComponent className={`
                      ${compact ? 'h-4 w-4' : 'h-5 w-5'}
                      ${getConversationIconColor(conversation.type)}
                    `} />
                  </div>
                )}

                {/* Online indicator */}
                {otherParticipant && otherParticipant.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>

              {/* Conversation Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`
                    font-medium truncate
                    ${compact ? 'text-sm' : 'text-base'}
                    ${isSelected ? 'text-blue-900' : 'text-gray-900'}
                  `}>
                    {getConversationTitle(conversation)}
                  </h4>

                  <div className="flex items-center space-x-1 ml-2">
                    {getMessageStatusIcon(conversation)}
                    <span className={`
                      text-xs text-gray-500 whitespace-nowrap
                      ${compact ? 'hidden' : ''}
                    `}>
                      {conversation.lastActivity && formatTimestamp(conversation.lastActivity)}
                    </span>
                  </div>
                </div>

                {/* Subtitle */}
                {!compact && (
                  <p className="text-xs text-gray-500 truncate mb-1">
                    {getConversationSubtitle(conversation)}
                  </p>
                )}

                {/* Last Message Preview */}
                <div className="flex items-center justify-between">
                  <p className={`
                    text-gray-600 truncate
                    ${compact ? 'text-xs' : 'text-sm'}
                    ${conversation.unreadCount > 0 ? 'font-medium' : ''}
                  `}>
                    {getLastMessagePreview(conversation)}
                  </p>

                  {/* Unread Count */}
                  {conversation.unreadCount > 0 && (
                    <Badge className={`
                      bg-blue-600 text-white ml-2
                      ${compact ? 'h-4 w-4 text-xs p-0 flex items-center justify-center' : ''}
                    `}>
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </Badge>
                  )}
                </div>

                {/* Property Metadata */}
                {conversation.metadata.propertyId && !compact && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      <MapPin className="h-3 w-3 mr-1" />
                      Property Inquiry
                    </div>
                    {conversation.metadata.inquiryType && (
                      <div className="text-xs text-gray-500 capitalize">
                        {conversation.metadata.inquiryType}
                      </div>
                    )}
                  </div>
                )}

                {/* Conversation Type Badge */}
                {conversation.type !== 'direct' && !compact && (
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getConversationIconColor(conversation.type)}`}
                    >
                      <IconComponent className="h-3 w-3 mr-1" />
                      {conversation.type.replace('_', ' ')}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Archived indicator */}
            {conversation.isArchived && (
              <div className="mt-2 text-xs text-gray-400 italic">
                Archived
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
