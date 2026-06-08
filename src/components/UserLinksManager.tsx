'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Eye, EyeOff, GripVertical, Check, X,
  ExternalLink, Edit2, Save, AlertCircle, CheckCircle,
  Loader2, Phone, Mail, Globe, MessageCircle, Send,
  Facebook, Instagram, Twitter, Linkedin, Youtube
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  type LinkPlatform,
  type UserLink,
  PLATFORM_CONFIG,
  formatLinkUrl,
} from '@/lib/user-links';
import {
  validatePhoneNumber,
  formatPhoneDisplay,
  COUNTRY_CODES,
  type PhoneValidationResult,
} from '@/lib/phone-validation';

interface UserLinksManagerProps {
  userId: string;
  onLinksChange?: (links: UserLink[]) => void;
}

// Platform icon component
function PlatformIcon({ platform, className = "h-5 w-5" }: { platform: LinkPlatform; className?: string }) {
  switch (platform) {
    case 'whatsapp':
      return <MessageCircle className={`${className} text-green-600`} />;
    case 'messenger':
      return <MessageCircle className={`${className} text-blue-500`} />;
    case 'facebook':
      return <Facebook className={`${className} text-blue-600`} />;
    case 'instagram':
      return <Instagram className={`${className} text-pink-600`} />;
    case 'twitter':
      return <Twitter className={`${className} text-sky-500`} />;
    case 'linkedin':
      return <Linkedin className={`${className} text-blue-700`} />;
    case 'telegram':
      return <Send className={`${className} text-blue-400`} />;
    case 'youtube':
      return <Youtube className={`${className} text-red-600`} />;
    case 'website':
      return <Globe className={`${className} text-gray-600`} />;
    case 'email':
      return <Mail className={`${className} text-gray-600`} />;
    case 'phone':
      return <Phone className={`${className} text-gray-600`} />;
    default:
      return <ExternalLink className={`${className} text-gray-600`} />;
  }
}

export default function UserLinksManager({ userId, onLinksChange }: UserLinksManagerProps) {
  const { toast } = useToast();
  const [links, setLinks] = useState<UserLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);

  // Form states
  const [selectedLink, setSelectedLink] = useState<UserLink | null>(null);
  const [newLink, setNewLink] = useState({
    platform: 'whatsapp' as LinkPlatform,
    raw_input: '',
    display_label: '',
    is_public: true,
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  // Phone validation state
  const [phoneValidation, setPhoneValidation] = useState<PhoneValidationResult | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Fetch links
  const fetchLinks = useCallback(async () => {
    try {
      const response = await fetch(`/api/user-links?userId=${userId}`);
      const data = await response.json();

      if (data.links) {
        setLinks(data.links);
        onLinksChange?.(data.links);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your links',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, onLinksChange, toast]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Get available platforms (not already added)
  const availablePlatforms = Object.keys(PLATFORM_CONFIG).filter(
    platform => !links.some(link => link.platform === platform)
  ) as LinkPlatform[];

  // Validate phone input when platform or input changes
  const validateInput = (platform: LinkPlatform, input: string): PhoneValidationResult | null => {
    if (['whatsapp', 'phone'].includes(platform) && input.trim()) {
      return validatePhoneNumber(input);
    }
    return null;
  };

  // Handle input change with validation
  const handleInputChange = (value: string, isNewLink: boolean = true) => {
    if (isNewLink) {
      setNewLink(prev => ({ ...prev, raw_input: value }));
      if (['whatsapp', 'phone'].includes(newLink.platform)) {
        setPhoneValidation(validatePhoneNumber(value));
      } else {
        setPhoneValidation(null);
      }
    } else if (selectedLink) {
      setSelectedLink(prev => prev ? { ...prev, raw_input: value } : null);
      if (['whatsapp', 'phone'].includes(selectedLink.platform)) {
        setPhoneValidation(validatePhoneNumber(value));
      } else {
        setPhoneValidation(null);
      }
    }
  };

  // Handle platform change
  const handlePlatformChange = (platform: LinkPlatform) => {
    setNewLink(prev => ({ ...prev, platform, raw_input: '' }));
    setPhoneValidation(null);
  };

  // Add new link
  const handleAddLink = async () => {
    if (!newLink.raw_input.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a value',
        variant: 'destructive',
      });
      return;
    }

    // Validate phone numbers
    if (['whatsapp', 'phone'].includes(newLink.platform)) {
      const validation = validatePhoneNumber(newLink.raw_input);
      if (!validation.isValid) {
        toast({
          title: 'Invalid Phone Number',
          description: validation.errorMessage || 'Please enter a valid phone number',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          platform: newLink.platform,
          raw_input: newLink.raw_input,
          display_label: newLink.display_label || null,
          is_public: newLink.is_public,
          display_order: links.length,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Link Added',
          description: `Your ${PLATFORM_CONFIG[newLink.platform].label} link has been added.`,
        });
        setIsAddDialogOpen(false);
        setNewLink({
          platform: availablePlatforms[0] || 'whatsapp',
          raw_input: '',
          display_label: '',
          is_public: true,
        });
        fetchLinks();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add link',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update link
  const handleUpdateLink = async () => {
    if (!selectedLink) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/user-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          platform: selectedLink.platform,
          raw_input: selectedLink.raw_input,
          display_label: selectedLink.display_label || null,
          is_public: selectedLink.is_public,
          display_order: selectedLink.display_order,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Link Updated',
          description: 'Your link has been updated.',
        });
        setIsEditDialogOpen(false);
        setSelectedLink(null);
        fetchLinks();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update link',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete link
  const handleDeleteLink = async () => {
    if (!selectedLink) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/user-links?userId=${userId}&platform=${selectedLink.platform}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Link Deleted',
          description: 'Your link has been removed.',
        });
        setIsDeleteDialogOpen(false);
        setSelectedLink(null);
        fetchLinks();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete link',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle visibility
  const handleToggleVisibility = async (link: UserLink) => {
    try {
      const response = await fetch('/api/user-links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'toggle_visibility',
          platform: link.platform,
          is_public: !link.is_public,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLinks(prev =>
          prev.map(l =>
            l.id === link.id ? { ...l, is_public: !l.is_public } : l
          )
        );
        toast({
          title: link.is_public ? 'Link Hidden' : 'Link Visible',
          description: link.is_public
            ? 'This link is now private.'
            : 'This link is now visible on your profile.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update visibility',
        variant: 'destructive',
      });
    }
  };

  // Send verification code
  const handleSendVerification = async () => {
    if (!selectedLink) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/user-links/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          platform: selectedLink.platform,
          action: 'send_code',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVerificationSent(true);
        toast({
          title: 'Verification Code Sent',
          description: `A code has been sent to your ${PLATFORM_CONFIG[selectedLink.platform].label}.`,
        });
      } else {
        throw new Error(data.error || 'Failed to send code');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification code',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Verify code
  const handleVerifyCode = async () => {
    if (!selectedLink || !verificationCode) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/user-links/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          platform: selectedLink.platform,
          action: 'verify_code',
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Link Verified',
          description: 'Your link has been verified successfully.',
        });
        setIsVerifyDialogOpen(false);
        setSelectedLink(null);
        setVerificationCode('');
        setVerificationSent(false);
        fetchLinks();
      } else {
        throw new Error(data.error || 'Invalid code');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid verification code',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder locally
    const newLinks = [...links];
    const [draggedItem] = newLinks.splice(draggedIndex, 1);
    newLinks.splice(dragOverIndex, 0, draggedItem);

    // Update display_order
    const reorderedLinks = newLinks.map((link, index) => ({
      ...link,
      display_order: index,
    }));

    setLinks(reorderedLinks);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Save to server
    try {
      const response = await fetch('/api/user-links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'update_order',
          orders: reorderedLinks.map(l => ({
            platform: l.platform,
            order: l.display_order,
          })),
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      onLinksChange?.(reorderedLinks);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save new order',
        variant: 'destructive',
      });
      fetchLinks(); // Revert to server state
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Social & Contact Links
              </CardTitle>
              <CardDescription>
                Add your social media and contact links to share on your profile
              </CardDescription>
            </div>
            {availablePlatforms.length > 0 && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="text-center py-8">
              <ExternalLink className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No links added yet</p>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Link
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop to reorder your links
              </p>
              {links.map((link, index) => (
                <div
                  key={link.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`
                    flex items-center gap-3 p-3 border rounded-lg transition-all cursor-move
                    ${draggedIndex === index ? 'opacity-50 border-dashed' : ''}
                    ${dragOverIndex === index && draggedIndex !== index ? 'border-blue-500 bg-blue-50' : ''}
                    ${!link.is_public ? 'bg-gray-50' : 'bg-white'}
                    hover:shadow-sm
                  `}
                >
                  {/* Drag handle */}
                  <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />

                  {/* Platform icon */}
                  <PlatformIcon platform={link.platform} />

                  {/* Link details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {PLATFORM_CONFIG[link.platform].label}
                      </span>
                      {link.is_verified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {!link.is_public && (
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {link.display_label || link.raw_input}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Test link */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(link.formatted_url, '_blank')}
                      title="Test link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    {/* Toggle visibility */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVisibility(link)}
                      title={link.is_public ? 'Make private' : 'Make public'}
                    >
                      {link.is_public ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Verify (for phone/email/whatsapp) */}
                    {['whatsapp', 'phone', 'email'].includes(link.platform) && !link.is_verified && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLink(link);
                          setIsVerifyDialogOpen(true);
                        }}
                        title="Verify"
                        className="text-orange-600"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Edit */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLink(link);
                        setIsEditDialogOpen(true);
                      }}
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLink(link);
                        setIsDeleteDialogOpen(true);
                      }}
                      title="Delete"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Link Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Link</DialogTitle>
            <DialogDescription>
              Add a social media or contact link to your profile
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Platform</Label>
              <Select
                value={newLink.platform}
                onValueChange={(value) => handlePlatformChange(value as LinkPlatform)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availablePlatforms.map(platform => (
                    <SelectItem key={platform} value={platform}>
                      <div className="flex items-center gap-2">
                        <span>{PLATFORM_CONFIG[platform].icon}</span>
                        <span>{PLATFORM_CONFIG[platform].label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                {PLATFORM_CONFIG[newLink.platform].label}
                {PLATFORM_CONFIG[newLink.platform].prefix && (
                  <span className="text-gray-400 ml-1">
                    ({PLATFORM_CONFIG[newLink.platform].prefix})
                  </span>
                )}
              </Label>

              {/* Country code hint for phone/whatsapp */}
              {['whatsapp', 'phone'].includes(newLink.platform) && (
                <p className="text-xs text-gray-500 mb-1">
                  Include country code (e.g., +238 for Cape Verde, +351 for Portugal)
                </p>
              )}

              <Input
                type={PLATFORM_CONFIG[newLink.platform].inputType}
                value={newLink.raw_input}
                onChange={(e) => handleInputChange(e.target.value, true)}
                placeholder={PLATFORM_CONFIG[newLink.platform].placeholder}
                className={phoneValidation && !phoneValidation.isValid && newLink.raw_input ? 'border-red-500' : ''}
              />

              {/* Phone validation feedback */}
              {['whatsapp', 'phone'].includes(newLink.platform) && phoneValidation && newLink.raw_input && (
                <div className="mt-1">
                  {phoneValidation.isValid ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600">
                        {phoneValidation.country ? (
                          <>
                            {phoneValidation.country.flag} {phoneValidation.country.country} - {formatPhoneDisplay(newLink.raw_input)}
                          </>
                        ) : (
                          formatPhoneDisplay(newLink.raw_input)
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-xs text-red-600">{phoneValidation.errorMessage}</span>
                    </div>
                  )}
                  {phoneValidation.warningMessage && phoneValidation.isValid && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ {phoneValidation.warningMessage}
                    </p>
                  )}
                </div>
              )}

              {/* URL preview for non-phone platforms */}
              {!['whatsapp', 'phone'].includes(newLink.platform) && newLink.raw_input && (
                <p className="text-xs text-gray-500 mt-1">
                  Will link to: {formatLinkUrl(newLink.platform, newLink.raw_input)}
                </p>
              )}

              {/* WhatsApp URL preview */}
              {newLink.platform === 'whatsapp' && phoneValidation?.isValid && (
                <p className="text-xs text-gray-500 mt-1">
                  Will link to: https://wa.me/{phoneValidation.cleanedNumber}
                </p>
              )}
            </div>

            <div>
              <Label>Display Label (optional)</Label>
              <Input
                value={newLink.display_label}
                onChange={(e) => setNewLink(prev => ({ ...prev, display_label: e.target.value }))}
                placeholder="e.g., Chat with me, My Portfolio"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show on Profile</Label>
                <p className="text-sm text-gray-500">Make this link visible to others</p>
              </div>
              <Switch
                checked={newLink.is_public}
                onCheckedChange={(checked) => setNewLink(prev => ({ ...prev, is_public: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLink} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Link Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
            <DialogDescription>
              Update your {selectedLink ? PLATFORM_CONFIG[selectedLink.platform].label : ''} link
            </DialogDescription>
          </DialogHeader>

          {selectedLink && (
            <div className="space-y-4 py-4">
              <div>
                <Label>
                  {PLATFORM_CONFIG[selectedLink.platform].label}
                </Label>
                <Input
                  type={PLATFORM_CONFIG[selectedLink.platform].inputType}
                  value={selectedLink.raw_input}
                  onChange={(e) => setSelectedLink(prev => prev ? { ...prev, raw_input: e.target.value } : null)}
                  placeholder={PLATFORM_CONFIG[selectedLink.platform].placeholder}
                />
                {selectedLink.raw_input && (
                  <p className="text-xs text-gray-500 mt-1">
                    Will link to: {formatLinkUrl(selectedLink.platform, selectedLink.raw_input)}
                  </p>
                )}
              </div>

              <div>
                <Label>Display Label (optional)</Label>
                <Input
                  value={selectedLink.display_label || ''}
                  onChange={(e) => setSelectedLink(prev => prev ? { ...prev, display_label: e.target.value } : null)}
                  placeholder="e.g., Chat with me, My Portfolio"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show on Profile</Label>
                  <p className="text-sm text-gray-500">Make this link visible to others</p>
                </div>
                <Switch
                  checked={selectedLink.is_public}
                  onCheckedChange={(checked) => setSelectedLink(prev => prev ? { ...prev, is_public: checked } : null)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLink} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your {selectedLink ? PLATFORM_CONFIG[selectedLink.platform].label : ''} link?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLink}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verification Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your Link</DialogTitle>
            <DialogDescription>
              Verify your {selectedLink ? PLATFORM_CONFIG[selectedLink.platform].label : ''} to show a verified badge
            </DialogDescription>
          </DialogHeader>

          {selectedLink && (
            <div className="space-y-4 py-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  {selectedLink.platform === 'email' && (
                    <>We'll send a verification code to <strong>{selectedLink.raw_input}</strong></>
                  )}
                  {selectedLink.platform === 'phone' && (
                    <>We'll send an SMS with a verification code to <strong>{selectedLink.raw_input}</strong></>
                  )}
                  {selectedLink.platform === 'whatsapp' && (
                    <>We'll send a WhatsApp message with a verification code to <strong>{selectedLink.raw_input}</strong></>
                  )}
                </p>
              </div>

              {!verificationSent ? (
                <Button onClick={handleSendVerification} disabled={isSaving} className="w-full">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Send Verification Code
                </Button>
              ) : (
                <>
                  <div>
                    <Label>Enter Verification Code</Label>
                    <Input
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSendVerification}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      Resend Code
                    </Button>
                    <Button
                      onClick={handleVerifyCode}
                      disabled={isSaving || verificationCode.length < 6}
                      className="flex-1"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Verify
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsVerifyDialogOpen(false);
                setVerificationCode('');
                setVerificationSent(false);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Export a display-only version for profile pages
export function UserLinksDisplay({ links }: { links: UserLink[] }) {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.filter(l => l.is_public).map(link => (
        <a
          key={link.id}
          href={link.formatted_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          title={link.display_label || PLATFORM_CONFIG[link.platform].label}
        >
          <PlatformIcon platform={link.platform} className="h-4 w-4" />
          <span className="text-sm font-medium">
            {link.display_label || PLATFORM_CONFIG[link.platform].label}
          </span>
          {link.is_verified && (
            <CheckCircle className="h-3 w-3 text-green-600" />
          )}
        </a>
      ))}
    </div>
  );
}
