'use client';

import React, { useState } from 'react';
import {
  Send, Phone, Mail, MessageCircle, User, Clock,
  Loader2, CheckCircle, AlertCircle, Calendar, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface PropertyInquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  agentName?: string;
  agentAvatar?: string;
  onSuccess?: () => void;
  variant?: 'card' | 'inline' | 'modal';
  className?: string;
}

interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  inquiryType: 'general' | 'viewing' | 'offer' | 'question';
  preferredContact: 'email' | 'phone' | 'whatsapp';
  preferredTime: string;
}

const INQUIRY_TYPES = [
  { value: 'general', label: 'General Inquiry', icon: MessageCircle },
  { value: 'viewing', label: 'Schedule Viewing', icon: Calendar },
  { value: 'offer', label: 'Make an Offer', icon: Home },
  { value: 'question', label: 'Ask a Question', icon: AlertCircle },
];

const PREFERRED_TIMES = [
  { value: '', label: 'Any time' },
  { value: 'morning', label: 'Morning (9am - 12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
  { value: 'evening', label: 'Evening (5pm - 8pm)' },
  { value: 'weekends', label: 'Weekends only' },
];

export default function PropertyInquiryForm({
  propertyId,
  propertyTitle,
  agentName,
  agentAvatar,
  onSuccess,
  variant = 'card',
  className = '',
}: PropertyInquiryFormProps) {
  const { user, profile } = useSupabaseAuth();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<InquiryFormData>({
    name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    message: '',
    inquiryType: 'general',
    preferredContact: 'email',
    preferredTime: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSelectChange = (name: keyof InquiryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateMessage = () => {
    const templates: Record<string, string> = {
      general: `Hi, I'm interested in the property "${propertyTitle}". Could you please provide more information?`,
      viewing: `Hi, I would like to schedule a viewing for "${propertyTitle}". Please let me know your available times.`,
      offer: `Hi, I'm interested in making an offer on "${propertyTitle}". Could we discuss the details?`,
      question: `Hi, I have a question about "${propertyTitle}": `,
    };
    return templates[formData.inquiryType] || templates.general;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate
      if (!formData.name.trim()) {
        throw new Error('Please enter your name');
      }
      if (!formData.email.trim()) {
        throw new Error('Please enter your email');
      }
      if (!formData.message.trim() || formData.message.length < 10) {
        throw new Error('Please enter a message (at least 10 characters)');
      }

      // Submit inquiry
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
          inquiryType: formData.inquiryType,
          preferredContact: formData.preferredContact,
          preferredTime: formData.preferredTime || null,
          userId: user?.id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send inquiry');
      }

      setIsSuccess(true);
      toast({
        title: 'Inquiry Sent!',
        description: agentName
          ? `${agentName} will respond to your inquiry soon.`
          : 'The agent will respond to your inquiry soon.',
      });

      onSuccess?.();

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send inquiry';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Inquiry Sent Successfully!
          </h3>
          <p className="text-gray-600 mb-6">
            {agentName ? `${agentName} has been notified` : 'The agent has been notified'}
            {' '}and will respond to your inquiry soon.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>We've sent a confirmation to <strong>{formData.email}</strong></p>
            <p>Average response time: <strong>2-4 hours</strong></p>
          </div>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => {
              setIsSuccess(false);
              setFormData(prev => ({ ...prev, message: '' }));
            }}
          >
            Send Another Inquiry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Inquiry Type Selection */}
      <div className="space-y-3">
        <Label>What would you like to do?</Label>
        <div className="grid grid-cols-2 gap-2">
          {INQUIRY_TYPES.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  handleSelectChange('inquiryType', type.value);
                  if (!formData.message || formData.message.startsWith('Hi, I')) {
                    setFormData(prev => ({ ...prev, message: generateMessage() }));
                  }
                }}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all
                  ${formData.inquiryType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            <User className="h-4 w-4 inline mr-1" />
            Your Name *
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            <Mail className="h-4 w-4 inline mr-1" />
            Email *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          <Phone className="h-4 w-4 inline mr-1" />
          Phone (optional)
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+238 999 1234"
        />
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">
          <MessageCircle className="h-4 w-4 inline mr-1" />
          Message *
        </Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Tell us what you'd like to know..."
          rows={4}
          required
          minLength={10}
        />
        <p className="text-xs text-gray-500">
          {formData.message.length}/5000 characters
        </p>
      </div>

      {/* Preferred Contact Method */}
      <div className="space-y-3">
        <Label>Preferred contact method</Label>
        <RadioGroup
          value={formData.preferredContact}
          onValueChange={(value) => handleSelectChange('preferredContact', value)}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="contact-email" />
            <Label htmlFor="contact-email" className="cursor-pointer">
              <Mail className="h-4 w-4 inline mr-1" />
              Email
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="phone" id="contact-phone" />
            <Label htmlFor="contact-phone" className="cursor-pointer">
              <Phone className="h-4 w-4 inline mr-1" />
              Phone
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="whatsapp" id="contact-whatsapp" />
            <Label htmlFor="contact-whatsapp" className="cursor-pointer">
              <MessageCircle className="h-4 w-4 inline mr-1" />
              WhatsApp
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Preferred Time */}
      <div className="space-y-2">
        <Label>
          <Clock className="h-4 w-4 inline mr-1" />
          Best time to contact
        </Label>
        <Select
          value={formData.preferredTime}
          onValueChange={(value) => handleSelectChange('preferredTime', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select preferred time" />
          </SelectTrigger>
          <SelectContent>
            {PREFERRED_TIMES.map(time => (
              <SelectItem key={time.value} value={time.value || 'any'}>
                {time.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Inquiry
          </>
        )}
      </Button>

      {/* Privacy Note */}
      <p className="text-xs text-gray-500 text-center">
        By submitting this form, you agree to our{' '}
        <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
        Your information will only be shared with the property agent.
      </p>
    </form>
  );

  // Render based on variant
  if (variant === 'inline') {
    return <div className={className}>{formContent}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Contact Agent
        </CardTitle>
        <CardDescription>
          Interested in this property? Send a message to the agent.
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}

// Compact version for sidebars
export function CompactInquiryForm({
  propertyId,
  propertyTitle,
  agentName,
}: {
  propertyId: string;
  propertyTitle: string;
  agentName?: string;
}) {
  const { user, profile } = useSupabaseAuth();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          name: profile?.full_name || 'Guest',
          email,
          message: message || `I'm interested in "${propertyTitle}"`,
          inquiryType: 'general',
          preferredContact: 'email',
          userId: user?.id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: 'Message Sent!',
        description: 'The agent will respond soon.',
      });

      setMessage('');

    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to send',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!user && (
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      )}
      <Textarea
        placeholder={`I'm interested in this property...`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
}
