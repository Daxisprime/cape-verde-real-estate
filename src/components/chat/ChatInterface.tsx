"use client";

import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Users, Settings, Search, Plus, Archive,
  Phone, Video, Info, MoreVertical, X, Minimize2,
  Paperclip, Send, Smile, Mic, Image, FileText,
  Calendar, DollarSign, MapPin, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChatConversation, ChatParticipant } from '@/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import ConversationList from './ConversationList';
import MessageArea from './MessageArea';
import MessageInput from './MessageInput';
import PropertyInquiryModal from './PropertyInquiryModal';
import { Conversation, ConversationType, MessageAttachment, TypingIndicator, ConversationParticipant } from '@/types/chat';

interface ChatInterfaceProps {
  isMinimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
  className?: string;
}

export default function ChatInterface({
  isMinimized = false,
  onMinimize,
  onClose,
  className = ''
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    onlineUsers,
    typingUsers,
    sendMessage,
    markAsRead,
    createPropertyInquiry,
    setCurrentConversation
  } = useChat();

  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(currentConversation?.id);
  const [showPropertyInquiry, setShowPropertyInquiry] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConversationInfo, setShowConversationInfo] = useState(false);

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId);
  const selectedMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];

  useEffect(() => {
    if (currentConversation && currentConversation.id !== selectedConversationId) {
      setSelectedConversationId(currentConversation.id);
    }
  }, [currentConversation, selectedConversationId]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);

    // Update current conversation in context
    const conversation = conversations.find((conv) => conv.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }

    // Mark conversation as read
    if (conversation?.lastMessage) {
      markAsRead(conversationId, conversation.lastMessage.id);
    }
  };

  const handleSendMessage = async (content: string, attachments: Array<{id: string; name: string; type: 'image' | 'document' | 'video'; url: string; size: number; mimeType: string; uploadedAt: string}> = []) => {
    if (!selectedConversationId || !content.trim()) return;

    try {
      await sendMessage(selectedConversationId, content.trim(), 'text', attachments);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;

    return (
      conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participants.some((p: ConversationParticipant) => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      conv.metadata?.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getConversationTitle = (conversation: ChatConversation) => {
    if (conversation.title) return conversation.title;

    const otherParticipants = conversation.participants.filter((p: ChatParticipant) => p.userId !== user?.id);
    if (otherParticipants.length === 1) {
      return otherParticipants[0].user?.name || 'Unknown User';
    }

    return `Group Chat (${conversation.participants.length} members)`;
  };

  const getConversationIcon = (type: ConversationType) => {
    switch (type) {
      case 'property_inquiry': return MapPin;
      case 'group': return Users;
      case 'support': return Shield;
      default: return MessageSquare;
    }
  };

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={onMinimize}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
          {conversations.some((conv) => conv.unreadCount > 0) && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 text-white p-0 flex items-center justify-center">
              {conversations.reduce((total: number, conv) => total + conv.unreadCount, 0)}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className="w-96 h-[600px] shadow-2xl border-0 bg-white">
        {/* Chat Header */}
        <CardHeader className="p-4 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              {selectedConversation ? getConversationTitle(selectedConversation) : 'Messages'}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {selectedConversation && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:bg-blue-700"
                    onClick={() => setShowConversationInfo(true)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:bg-blue-700"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:bg-blue-700"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                </>
              )}
              {onMinimize && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-blue-700"
                  onClick={onMinimize}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-blue-700"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-[calc(600px-80px)] flex">
          {/* Conversation List */}
          <div className="w-32 border-r border-gray-200 flex flex-col">
            {/* Search and Actions */}
            <div className="p-3 border-b border-gray-200">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs"
              />
              <div className="flex items-center justify-between mt-2">
                <Dialog open={showPropertyInquiry} onOpenChange={setShowPropertyInquiry}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start Property Inquiry</DialogTitle>
                    </DialogHeader>
                    <PropertyInquiryModal onClose={() => setShowPropertyInquiry(false)} />
                  </DialogContent>
                </Dialog>

                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Conversations */}
            <ScrollArea className="flex-1">
              <ConversationList
                conversations={filteredConversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                compact={true}
              />
            </ScrollArea>
          </div>

          {/* Message Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedConversation.participants[0]?.avatar} />
                        <AvatarFallback className="text-xs">
                          {getConversationTitle(selectedConversation).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{getConversationTitle(selectedConversation)}</div>
                        <div className="text-xs text-gray-500">
                          {selectedConversation.participants.length > 1 &&
                            `${selectedConversation.participants.length} participants`
                          }
                          {selectedConversation.metadata?.propertyTitle && (
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {selectedConversation.metadata?.propertyTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Online Status */}
                    <div className="flex items-center space-x-1">
                      {selectedConversation.participants
                        .filter((p: ConversationParticipant) => p.userId !== user?.id)
                        .map((participant: ConversationParticipant) => (
                          <div key={participant.userId} className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${
                              onlineUsers.some(user => user.id === participant.userId) ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  {/* Typing Indicators */}
                  {selectedConversationId && typingUsers[selectedConversationId]?.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {typingUsers[selectedConversationId]
                        .filter((userName: string) => userName !== user?.name)
                        .join(', ')
                      } {typingUsers[selectedConversationId].length === 1 ? 'is' : 'are'} typing...
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1">
                  <MessageArea
                    messages={selectedMessages}
                    conversation={selectedConversation}
                    currentUserId={user?.id || ''}
                  />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200">
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    conversationId={selectedConversationId!}
                  />
                </div>
              </>
            ) : (
              /* No Conversation Selected */
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <div>
                  <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                  <p className="text-gray-500 mb-4">
                    Choose a conversation from the list or start a new property inquiry.
                  </p>
                  <Button onClick={() => setShowPropertyInquiry(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Chat
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversation Info Modal */}
      {selectedConversation && (
        <Dialog open={showConversationInfo} onOpenChange={setShowConversationInfo}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Conversation Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Property Info */}
              {selectedConversation.metadata?.propertyId && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{selectedConversation.metadata.propertyTitle}</div>
                      <div className="text-sm text-gray-500">Property Discussion</div>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule Viewing
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Make Offer
                    </Button>
                  </div>
                </div>
              )}

              {/* Participants */}
              <div>
                <h4 className="font-medium mb-2">Participants ({selectedConversation.participants.length})</h4>
                <div className="space-y-2">
                  {selectedConversation.participants.map((participant: ConversationParticipant) => (
                    <div key={participant.userId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback className="text-xs">
                            {participant.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{participant.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{participant.role}</div>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        onlineUsers.some(user => user.id === participant.userId) ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <MoreVertical className="h-4 w-4 mr-1" />
                  More
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
