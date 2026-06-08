"use client";

import React, { useEffect, useRef } from 'react';
import {
  Check, CheckCheck, Clock, AlertCircle, Download, Eye,
  MapPin, Calendar, DollarSign, FileText, Image as ImageIcon,
  Video, Paperclip, ExternalLink, Heart
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, ChatConversation, ChatParticipant } from '@/types/chat';
import Image from 'next/image';

interface MessageAreaProps {
  messages: ChatMessage[];
  conversation: ChatConversation;
  currentUserId: string;
  className?: string;
}

export default function MessageArea({
  messages,
  conversation,
  currentUserId,
  className = ''
}: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getMessageStatusIcon = (message: Message) => {
    if (message.senderId !== currentUserId) return null;

    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'text':
        return (
          <div className="prose prose-sm max-w-none">
            <p className="mb-0 whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.id} className="relative group">
                <Image
                  src={attachment.url}
                  alt={attachment.name}
                  width={300}
                  height={200}
                  className="rounded-lg max-w-xs object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(attachment.url, '_blank')}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
                  onClick={() => window.open(attachment.url, '_blank')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {message.content && (
              <p className="text-sm mt-2">{message.content}</p>
            )}
          </div>
        );

      case 'document':
        return (
          <div className="space-y-2">
            {message.attachments.map((attachment) => (
              <Card key={attachment.id} className="p-3 max-w-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-gray-500">
                      {(attachment.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.url, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
            {message.content && (
              <p className="text-sm mt-2">{message.content}</p>
            )}
          </div>
        );

      case 'property_link':
        return (
          <Card className="p-4 max-w-sm bg-green-50 border-green-200">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-green-900">Property Shared</h4>
                {message.metadata?.propertyId && (
                  <p className="text-sm text-green-700 mt-1">
                    {message.content || 'Check out this property'}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-green-300 text-green-700 hover:bg-green-100"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Property
                </Button>
              </div>
            </div>
          </Card>
        );

      case 'viewing_request':
        return (
          <Card className="p-4 max-w-sm bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">Viewing Request</h4>
                <p className="text-sm text-blue-700 mt-1">{message.content}</p>
                {message.metadata?.viewingDate && (
                  <p className="text-xs text-blue-600 mt-1">
                    Requested: {new Date(message.metadata.viewingDate).toLocaleDateString()}
                  </p>
                )}
                <div className="flex space-x-2 mt-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Confirm
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
                    Suggest Alternative
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );

      case 'offer':
        return (
          <Card className="p-4 max-w-sm bg-orange-50 border-orange-200">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-orange-900">Property Offer</h4>
                {message.metadata?.offerAmount && (
                  <p className="text-lg font-bold text-orange-800 mt-1">
                    €{message.metadata.offerAmount.toLocaleString()}
                  </p>
                )}
                <p className="text-sm text-orange-700 mt-1">{message.content}</p>
                <div className="flex space-x-2 mt-2">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="border-orange-300 text-orange-700">
                    Counter
                  </Button>
                  <Button size="sm" variant="outline" className="border-orange-300 text-orange-700">
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );

      case 'system':
        return (
          <div className="text-center">
            <Badge variant="outline" className="text-xs text-gray-500 bg-gray-50">
              {message.content}
            </Badge>
          </div>
        );

      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [date: string]: Message[] } = {};

    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
  };

  const shouldShowAvatar = (message: Message, previousMessage?: Message) => {
    if (!previousMessage) return true;
    if (previousMessage.senderId !== message.senderId) return true;

    const timeDiff = new Date(message.timestamp).getTime() - new Date(previousMessage.timestamp).getTime();
    return timeDiff > 5 * 60 * 1000; // 5 minutes
  };

  const shouldShowTimestamp = (message: Message, nextMessage?: Message) => {
    if (!nextMessage) return true;
    if (nextMessage.senderId !== message.senderId) return true;

    const timeDiff = new Date(nextMessage.timestamp).getTime() - new Date(message.timestamp).getTime();
    return timeDiff > 5 * 60 * 1000; // 5 minutes
  };

  const messageGroups = groupMessagesByDate(messages);

  if (messages.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {conversation.type === 'property_inquiry' ? (
              <MapPin className="h-8 w-8 text-gray-400" />
            ) : (
              <Heart className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <h3 className="font-medium text-gray-900 mb-1">
            {conversation.type === 'property_inquiry'
              ? 'Property Discussion Started'
              : 'Conversation Started'
            }
          </h3>
          <p className="text-sm text-gray-500">
            {conversation.type === 'property_inquiry'
              ? 'Ask questions about the property or schedule a viewing'
              : 'Send a message to start the conversation'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className={`h-full ${className}`} ref={scrollAreaRef}>
      <div className="p-4 space-y-6">
        {messageGroups.map(({ date, messages }) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center mb-4">
              <Badge variant="outline" className="text-xs text-gray-500 bg-gray-50">
                {new Date(date).toLocaleDateString([], {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Badge>
            </div>

            {/* Messages for this date */}
            <div className="space-y-3">
              {messages.map((message, index) => {
                const isFromCurrentUser = message.senderId === currentUserId;
                const previousMessage = index > 0 ? messages[index - 1] : undefined;
                const nextMessage = index < messages.length - 1 ? messages[index + 1] : undefined;
                const showAvatar = shouldShowAvatar(message, previousMessage);
                const showTimestamp = shouldShowTimestamp(message, nextMessage);
                const participant = conversation.participants.find((p: ChatParticipant) => p.userId === message.senderId);

                if (message.type === 'system') {
                  return (
                    <div key={message.id} className="flex justify-center">
                      {renderMessageContent(message)}
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={`flex items-end space-x-2 ${
                      isFromCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 flex items-end">
                      {showAvatar && !isFromCurrentUser && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant?.avatar} />
                          <AvatarFallback className="text-xs">
                            {(participant?.name || message.senderName).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex flex-col ${isFromCurrentUser ? 'items-end' : 'items-start'}`}>
                      {/* Sender name (only for first message in group) */}
                      {showAvatar && !isFromCurrentUser && (
                        <p className="text-xs text-gray-500 mb-1 ml-2">
                          {participant?.name || message.senderName}
                        </p>
                      )}

                      {/* Message bubble */}
                      <div
                        className={`
                          max-w-xs lg:max-w-md rounded-2xl px-4 py-2
                          ${isFromCurrentUser
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                          }
                          ${message.status === 'failed' ? 'bg-red-100 border border-red-200' : ''}
                        `}
                      >
                        {renderMessageContent(message)}

                        {/* Message metadata */}
                        {message.edited && (
                          <p className="text-xs opacity-70 mt-1 italic">
                            edited
                          </p>
                        )}
                      </div>

                      {/* Timestamp and status */}
                      {showTimestamp && (
                        <div className={`
                          flex items-center space-x-1 mt-1 px-2
                          ${isFromCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}
                        `}>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(message.timestamp)}
                          </span>
                          {getMessageStatusIcon(message)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
