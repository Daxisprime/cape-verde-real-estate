"use client";

import React, { useState, useRef, useCallback } from 'react';
import {
  Send, Paperclip, Image as ImageIcon, FileText, Smile,
  Mic, Calendar, DollarSign, X, Plus, Upload, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useChat } from '@/contexts/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { ChatAttachment } from '@/types/chat';
interface MessageInputProps {
  onSendMessage: (content: string, attachments?: ChatAttachment[]) => void;
  conversationId: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function MessageInput({
  onSendMessage,
  conversationId,
  disabled = false,
  placeholder = "Type a message...",
  className = ''
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showViewingRequest, setShowViewingRequest] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { startTyping, stopTyping } = useChat();
  const { toast } = useToast();

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 120; // max 4-5 lines
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();

    // Typing indicators
    if (e.target.value.length > 0) {
      startTyping(conversationId);
    } else {
      stopTyping(conversationId);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;
    if (disabled) return;

    try {
      await onSendMessage(message, attachments);
      setMessage('');
      setAttachments([]);
      stopTyping(conversationId);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (files: FileList | null, type: 'file' | 'image') => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Mock file upload implementation
        const attachment: MessageAttachment = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: URL.createObjectURL(file),
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString()
        };
        return attachment;
      });

      const uploadedAttachments = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...uploadedAttachments]);

      toast({
        title: "Files uploaded",
        description: `${uploadedAttachments.length} file(s) ready to send.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  const getAttachmentIcon = (type: MessageAttachment['type']) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'document': return FileText;
      default: return Paperclip;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`border-t bg-white ${className}`}>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="p-3 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => {
              const IconComponent = getAttachmentIcon(attachment.type);
              return (
                <Card key={attachment.id} className="p-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <IconComponent className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="p-3">
        <div className="flex items-end space-x-2">
          {/* Quick Actions Button */}
          <Dialog open={showQuickActions} onOpenChange={setShowQuickActions}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Quick Actions</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col space-y-1"
                  onClick={() => {
                    setShowViewingRequest(true);
                    setShowQuickActions(false);
                  }}
                >
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs">Request Viewing</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col space-y-1"
                  onClick={() => {
                    setShowOfferForm(true);
                    setShowQuickActions(false);
                  }}
                >
                  <DollarSign className="h-5 w-5" />
                  <span className="text-xs">Make Offer</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col space-y-1"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-xs">Share Image</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col space-y-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Share Document</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* File Upload Buttons */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Upload className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploading}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[40px] max-h-[120px] resize-none pr-12 py-2"
              rows={1}
            />

            {/* Emoji Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1 h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={disabled || (!message.trim() && attachments.length === 0)}
            className="h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Character count */}
        {message.length > 900 && (
          <div className="text-right mt-1">
            <span className={`text-xs ${message.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}>
              {message.length}/1000
            </span>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.xlsx,.csv"
        onChange={(e) => handleFileUpload(e.target.files, 'file')}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileUpload(e.target.files, 'image')}
        className="hidden"
      />

      {/* Viewing Request Modal */}
      <Dialog open={showViewingRequest} onOpenChange={setShowViewingRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Property Viewing</DialogTitle>
          </DialogHeader>
          <ViewingRequestForm
            conversationId={conversationId}
            onSubmit={() => setShowViewingRequest(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Offer Form Modal */}
      <Dialog open={showOfferForm} onOpenChange={setShowOfferForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Property Offer</DialogTitle>
          </DialogHeader>
          <OfferForm
            conversationId={conversationId}
            onSubmit={() => setShowOfferForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Viewing Request Form Component
function ViewingRequestForm({
  conversationId,
  onSubmit
}: {
  conversationId: string;
  onSubmit: () => void;
}) {
  const [requestedDate, setRequestedDate] = useState('');
  const [message, setMessage] = useState('');
  // Mock scheduleViewing for demo purposes
  const scheduleViewing = async (conversationId: string, propertyId: string, requestedDate: string, message?: string) => {
    console.log('Mock viewing scheduled:', { conversationId, propertyId, requestedDate, message });
  };
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await scheduleViewing(conversationId, 'property-id', requestedDate, message);
      toast({
        title: "Viewing request sent",
        description: "The agent will respond to your viewing request soon.",
      });
      onSubmit();
    } catch (error) {
      toast({
        title: "Failed to send request",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="date">Preferred Date & Time</Label>
        <Input
          id="date"
          type="datetime-local"
          value={requestedDate}
          onChange={(e) => setRequestedDate(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          required
        />
      </div>
      <div>
        <Label htmlFor="message">Additional Message (Optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Any specific requirements or questions..."
          rows={3}
        />
      </div>
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1">
          <Calendar className="h-4 w-4 mr-2" />
          Send Request
        </Button>
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Offer Form Component
function OfferForm({
  conversationId,
  onSubmit
}: {
  conversationId: string;
  onSubmit: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [terms, setTerms] = useState('');
  // Mock submitOffer for demo purposes
  const submitOffer = async (conversationId: string, propertyId: string, amount: number, terms?: string) => {
    console.log('Mock offer submitted:', { conversationId, propertyId, amount, terms });
  };
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitOffer(conversationId, 'property-id', parseInt(amount), terms);
      toast({
        title: "Offer submitted",
        description: "Your offer has been sent to the agent for review.",
      });
      onSubmit();
    } catch (error) {
      toast({
        title: "Failed to submit offer",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Offer Amount (EUR)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="450000"
          min="1"
          required
        />
      </div>
      <div>
        <Label htmlFor="terms">Terms & Conditions (Optional)</Label>
        <Textarea
          id="terms"
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          placeholder="Any specific terms, financing details, or conditions..."
          rows={3}
        />
      </div>
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1">
          <DollarSign className="h-4 w-4 mr-2" />
          Submit Offer
        </Button>
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
