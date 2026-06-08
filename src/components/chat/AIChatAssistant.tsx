"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, RotateCcw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  typing?: boolean;
}

interface PropertySuggestion {
  id: string;
  title: string;
  price: string;
  location: string;
  image: string;
  reason: string;
}

interface AIChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
}

export default function AIChatAssistant({
  isOpen,
  onClose,
  onMinimize,
  isMinimized
}: AIChatAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [propertySuggestions, setPropertySuggestions] = useState<PropertySuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { createPropertyInquiry } = useChat();
  const { toast } = useToast();

  // Initial AI greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: AIMessage = {
        id: '1',
        content: `Hello! I'm ProCV's AI Property Assistant. I'm here to help you find the perfect property in Cape Verde.

I can help you with:
• Property recommendations based on your preferences
• Market insights and pricing information
• Neighborhood and amenities information
• Mortgage calculations and financing options
• Scheduling viewings with real agents

What type of property are you looking for today?`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: AIMessage = {
      id: 'typing',
      content: 'AI Assistant is typing...',
      role: 'assistant',
      timestamp: new Date(),
      typing: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: messages.slice(-10), // Send last 10 messages for context
          userId: user?.id,
          userPreferences: {
            budget: undefined,
            location: undefined,
            propertyType: undefined
          }
        }),
      });

      const data = await response.json();

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      const aiResponse: AIMessage = {
        id: Date.now().toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);

      // Handle property suggestions
      if (data.propertySuggestions) {
        setPropertySuggestions(data.propertySuggestions);
      }

      // Handle follow-up actions
      if (data.action === 'schedule_viewing') {
        toast({
          title: "Schedule Viewing",
          description: "I can connect you with a real agent to schedule a property viewing.",
        });
        // Note: Call connect to agent manually for now
        // handleConnectToAgent(data.propertyId);
      }

    } catch (error) {
      console.error('AI Chat error:', error);

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      const errorMessage: AIMessage = {
        id: Date.now().toString(),
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or you can chat with one of our human agents using the chat button.",
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectToAgent = async (propertyId?: string) => {
    try {
      if (propertyId) {
        await createPropertyInquiry(
          propertyId,
          'agent-1', // Default agent ID - would be determined by property
          'I would like to schedule a viewing for this property (referred by AI Assistant)'
        );
      }

      toast({
        title: "Connected to Agent",
        description: "A real estate agent will contact you shortly.",
      });

      onClose(); // Close AI chat to show human chat
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to agent. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setPropertySuggestions([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <Card className="h-full flex flex-col shadow-2xl border-0 bg-gradient-to-br from-purple-50 to-blue-50">
        {/* Header */}
        <CardHeader className="flex-shrink-0 pb-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">AI Property Assistant</CardTitle>
                <p className="text-xs opacity-90">
                  {isLoading ? 'Thinking...' : 'Online • Instant responses'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={isMinimized ? () => onMinimize() : () => onMinimize()}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetConversation}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.typing
                        ? 'bg-gray-100 text-gray-600 animate-pulse'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Property Suggestions */}
              {propertySuggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Recommended Properties:</p>
                  {propertySuggestions.map((property) => (
                    <div
                      key={property.id}
                      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => window.open(`/property/${property.id}`, '_blank')}
                    >
                      <div className="flex space-x-3">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {property.title}
                          </h4>
                          <p className="text-sm text-blue-600 font-semibold">{property.price}</p>
                          <p className="text-xs text-gray-500">{property.location}</p>
                          <p className="text-xs text-gray-600 mt-1">{property.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-white rounded-b-lg">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about properties, neighborhoods, pricing..."
                  className="flex-1 border-gray-200 focus:border-blue-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-1 mt-2">
                {[
                  'Show me villas under €500k',
                  'Best neighborhoods in Santiago',
                  'Properties with ocean view',
                  'Investment opportunities'
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Powered by AI • Connect to human agent anytime</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleConnectToAgent()}
                  className="text-xs h-6 px-2"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Human Agent
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
