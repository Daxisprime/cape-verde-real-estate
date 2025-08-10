"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Minimize2, Bell, Bot, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import ChatInterface from './ChatInterface';
import AIChatAssistant from './AIChatAssistant';

interface FloatingChatButtonProps {
  className?: string;
}

export default function FloatingChatButton({ className = '' }: FloatingChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAIMinimized, setIsAIMinimized] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { conversations } = useChat();

  // Calculate total unread messages
  const totalUnread = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  // Show notification animation when new messages arrive
  useEffect(() => {
    if (totalUnread > 0 && !isOpen) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [totalUnread, isOpen]);

  // Don't render if user is not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleToggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else if (isOpen) {
      setIsOpen(false);
    } else {
      setShowChatOptions(!showChatOptions);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const openHumanChat = () => {
    setIsOpen(true);
    setShowChatOptions(false);
  };

  const openAIChat = () => {
    setIsAIChatOpen(true);
    setIsAIMinimized(false);
    setShowChatOptions(false);
  };

  return (
    <>
      {/* Chat Options Menu */}
      {showChatOptions && (
        <div className="fixed bottom-24 right-6 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-2 min-w-[220px]">
          <div className="space-y-1">
            <button
              onClick={openAIChat}
              className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 rounded-lg transition-all"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">AI Assistant</div>
                <div className="text-sm text-gray-500">Instant property help • 24/7</div>
              </div>
            </button>

            <button
              onClick={openHumanChat}
              className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-blue-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Human Agents</div>
                <div className="text-sm text-gray-500">Real estate experts</div>
              </div>
              {totalUnread > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </Badge>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Close options overlay */}
      {showChatOptions && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowChatOptions(false)}
        />
      )}

      {/* Floating Chat Button */}
      {(!isOpen || isMinimized) && (!isAIChatOpen || isAIMinimized) && (
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
          <div className="relative">
            {/* Main Chat Button */}
            <Button
              onClick={handleToggleChat}
              className={`
                h-14 w-14 rounded-full shadow-lg transition-all duration-300 group
                ${showNotification ? 'animate-pulse' : ''}
                ${totalUnread > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              <MessageSquare className="h-6 w-6 text-white" />
            </Button>

            {/* Unread Messages Badge */}
            {totalUnread > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 text-white p-0 flex items-center justify-center border-2 border-white">
                {totalUnread > 99 ? '99+' : totalUnread}
              </Badge>
            )}

            {/* Notification Popup */}
            {showNotification && totalUnread > 0 && (
              <Card className="absolute bottom-16 right-0 w-64 shadow-lg animate-in slide-in-from-bottom-2">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {totalUnread === 1 ? 'New message' : `${totalUnread} new messages`}
                      </p>
                      <p className="text-xs text-gray-500">
                        Click to view your conversations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions for Minimized State */}
            {isMinimized && (
              <div className="absolute bottom-16 right-0 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 rounded-full bg-white shadow-md"
                  onClick={() => setIsOpen(true)}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Chat Interface */}
      {isOpen && !isMinimized && (
        <ChatInterface
          isMinimized={false}
          onMinimize={handleMinimize}
          onClose={handleClose}
          className="fixed bottom-6 right-6 z-50"
        />
      )}

      {/* AI Chat Assistant */}
      <AIChatAssistant
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        onMinimize={() => setIsAIMinimized(!isAIMinimized)}
        isMinimized={isAIMinimized}
      />

      {/* Chat Status Indicator */}
      {(isOpen || isMinimized || isAIChatOpen) && (
        <div className="fixed bottom-6 left-6 z-40">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-2 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-700 font-medium">
                {isAIChatOpen ? 'AI Assistant Active' : 'Chat Active'}
              </span>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// Hook to control chat from anywhere in the app
export function useChatControl() {
  const { conversations } = useChat();
  const [chatState, setChatState] = useState({
    isOpen: false,
    isMinimized: false,
    currentConversation: null as typeof conversations[0] | null
  });

  const openChat = (conversationId?: string) => {
    setChatState({
      isOpen: true,
      isMinimized: false,
      currentConversation: conversations.find(c => c.id === conversationId) || null
    });
  };

  const closeChat = () => {
    setChatState({
      isOpen: false,
      isMinimized: false,
      currentConversation: null
    });
  };

  const minimizeChat = () => {
    setChatState(prev => ({
      ...prev,
      isMinimized: true,
      isOpen: false
    }));
  };

  return {
    ...chatState,
    openChat,
    closeChat,
    minimizeChat
  };
}
