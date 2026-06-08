'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Mail, Phone, MessageCircle, Clock, CheckCircle, AlertCircle,
  Eye, Reply, Archive, Trash2, Search, Filter, RefreshCw,
  Star, Calendar, Home, User, ExternalLink, MoreVertical,
  ChevronDown, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  island: string;
  images: string[];
}

interface Inquiry {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  inquiry_type: string;
  preferred_contact: string;
  preferred_time: string | null;
  status: 'new' | 'read' | 'replied' | 'scheduled' | 'closed' | 'spam';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  read_at: string | null;
  replied_at: string | null;
  response_time_minutes: number | null;
  properties: Property;
}

interface AgentInquiriesManagerProps {
  agentId: string;
}

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  read: { label: 'Read', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  replied: { label: 'Replied', color: 'bg-green-100 text-green-800', icon: Reply },
  scheduled: { label: 'Scheduled', color: 'bg-purple-100 text-purple-800', icon: Calendar },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  spam: { label: 'Spam', color: 'bg-red-100 text-red-800', icon: Trash2 },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

export default function AgentInquiriesManager({ agentId }: AgentInquiriesManagerProps) {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Stats
  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    replied: inquiries.filter(i => i.status === 'replied').length,
    avgResponseTime: Math.round(
      inquiries
        .filter(i => i.response_time_minutes)
        .reduce((acc, i) => acc + (i.response_time_minutes || 0), 0) /
      (inquiries.filter(i => i.response_time_minutes).length || 1)
    ),
  };

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/inquiries?${params.toString()}`);
      const data = await response.json();

      if (data.inquiries) {
        setInquiries(data.inquiries);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inquiries',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Filter inquiries by search
  const filteredInquiries = inquiries.filter(inquiry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      inquiry.name.toLowerCase().includes(query) ||
      inquiry.email.toLowerCase().includes(query) ||
      inquiry.message.toLowerCase().includes(query) ||
      inquiry.properties?.title.toLowerCase().includes(query)
    );
  });

  // Update inquiry status
  const updateStatus = async (inquiryId: string, status: string) => {
    try {
      const response = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId, status }),
      });

      if (!response.ok) throw new Error('Failed to update');

      setInquiries(prev =>
        prev.map(i => (i.id === inquiryId ? { ...i, status: status as any } : i))
      );

      toast({
        title: 'Status Updated',
        description: `Inquiry marked as ${status}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  // Open inquiry detail
  const openInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailDialogOpen(true);

    // Mark as read if new
    if (inquiry.status === 'new') {
      updateStatus(inquiry.id, 'read');
    }
  };

  // Send reply
  const handleSendReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) return;

    setIsSending(true);
    try {
      // In production, this would send an email via the API
      // For now, just update the status
      await updateStatus(selectedInquiry.id, 'replied');

      toast({
        title: 'Reply Sent',
        description: `Your reply has been sent to ${selectedInquiry.email}`,
      });

      setIsReplyDialogOpen(false);
      setReplyMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Format time ago
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Total Inquiries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <div className="text-xs text-gray-500">New</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
            <div className="text-xs text-gray-500">Replied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.avgResponseTime > 60
                ? `${Math.round(stats.avgResponseTime / 60)}h`
                : `${stats.avgResponseTime}m`}
            </div>
            <div className="text-xs text-gray-500">Avg Response</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search inquiries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={fetchInquiries}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries List */}
      <Card>
        <CardHeader>
          <CardTitle>Inquiries ({filteredInquiries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No inquiries found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInquiries.map((inquiry) => {
                const StatusIcon = STATUS_CONFIG[inquiry.status].icon;
                return (
                  <div
                    key={inquiry.id}
                    className={`
                      flex items-start gap-4 p-4 border rounded-lg cursor-pointer
                      hover:bg-gray-50 transition-colors
                      ${inquiry.status === 'new' ? 'bg-blue-50 border-blue-200' : ''}
                    `}
                    onClick={() => openInquiry(inquiry)}
                  >
                    {/* Avatar */}
                    <Avatar>
                      <AvatarFallback>
                        {inquiry.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {inquiry.name}
                        </span>
                        <Badge className={STATUS_CONFIG[inquiry.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {STATUS_CONFIG[inquiry.status].label}
                        </Badge>
                        <Badge className={PRIORITY_CONFIG[inquiry.priority].color}>
                          {PRIORITY_CONFIG[inquiry.priority].label}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {inquiry.message}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Home className="h-3 w-3" />
                          {inquiry.properties?.title || 'Unknown Property'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(inquiry.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {inquiry.email}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInquiry(inquiry);
                          setIsReplyDialogOpen(true);
                        }}>
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(inquiry.id, 'scheduled');
                        }}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Viewing
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(inquiry.id, 'closed');
                        }}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Closed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(inquiry.id, 'spam');
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Mark as Spam
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6">
              {/* Property Info */}
              {selectedInquiry.properties && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={selectedInquiry.properties.images?.[0] || '/placeholder.jpg'}
                    alt={selectedInquiry.properties.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {selectedInquiry.properties.title}
                    </h4>
                    <p className="text-blue-600 font-bold">
                      €{selectedInquiry.properties.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedInquiry.properties.city}, {selectedInquiry.properties.island}
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Name</Label>
                  <p className="font-medium">{selectedInquiry.name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <a href={`mailto:${selectedInquiry.email}`} className="font-medium text-blue-600 hover:underline">
                    {selectedInquiry.email}
                  </a>
                </div>
                {selectedInquiry.phone && (
                  <div>
                    <Label className="text-gray-500">Phone</Label>
                    <a href={`tel:${selectedInquiry.phone}`} className="font-medium text-blue-600 hover:underline">
                      {selectedInquiry.phone}
                    </a>
                  </div>
                )}
                <div>
                  <Label className="text-gray-500">Preferred Contact</Label>
                  <p className="font-medium capitalize">{selectedInquiry.preferred_contact}</p>
                </div>
              </div>

              <Separator />

              {/* Message */}
              <div>
                <Label className="text-gray-500">Message</Label>
                <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Received: {new Date(selectedInquiry.created_at).toLocaleString()}</span>
                <Badge className={STATUS_CONFIG[selectedInquiry.status].color}>
                  {STATUS_CONFIG[selectedInquiry.status].label}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsDetailDialogOpen(false);
              setIsReplyDialogOpen(true);
            }}>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {selectedInquiry?.name}</DialogTitle>
            <DialogDescription>
              Your reply will be sent to {selectedInquiry?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Your Reply</Label>
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                rows={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReply} disabled={isSending || !replyMessage.trim()}>
              {isSending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
