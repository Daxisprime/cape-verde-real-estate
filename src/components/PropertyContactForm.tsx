"use client";

import React, { useState, useEffect } from 'react';
import { Send, Calendar, Phone, Mail, MessageCircle, Clock, User, MapPin, Home, Heart, CheckCircle, AlertCircle, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { agentDatabase, type Property } from '@/data/cape-verde-properties';
import { useAuth } from '@/contexts/AuthContext';
import { EmailService, type LeadData } from '@/lib/email';

interface PropertyContactFormProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

interface ViewingSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  agent: string;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  contactMethod: 'email' | 'phone' | 'whatsapp';
  inquiryType: 'viewing' | 'information' | 'offer' | 'financing';
  urgency: 'low' | 'medium' | 'high';
  budget?: number;
  timeframe: 'immediate' | 'this_month' | 'next_3_months' | 'next_6_months' | 'exploring';
  financingNeeded: boolean;
  additionalProperties: boolean;
  newsletter: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  message: string;
  timestamp: string;
  type: 'text' | 'appointment' | 'document' | 'link';
}

const availableSlots: ViewingSlot[] = [
  { id: '1', date: '2025-02-05', time: '10:00', available: true, agent: 'Maria Santos' },
  { id: '2', date: '2025-02-05', time: '14:00', available: true, agent: 'Maria Santos' },
  { id: '3', date: '2025-02-06', time: '09:30', available: false, agent: 'Maria Santos' },
  { id: '4', date: '2025-02-06', time: '11:00', available: true, agent: 'Maria Santos' },
  { id: '5', date: '2025-02-06', time: '15:30', available: true, agent: 'Maria Santos' },
  { id: '6', date: '2025-02-07', time: '10:30', available: true, agent: 'Maria Santos' },
  { id: '7', date: '2025-02-08', time: '14:00', available: true, agent: 'Maria Santos' },
];

export default function PropertyContactForm({ property, isOpen, onClose }: PropertyContactFormProps) {
  const [activeTab, setActiveTab] = useState('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    contactMethod: 'email',
    inquiryType: 'viewing',
    urgency: 'medium',
    timeframe: 'this_month',
    financingNeeded: false,
    additionalProperties: false,
    newsletter: true
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'system',
      message: 'Welcome! How can I help you with this property?',
      timestamp: new Date().toISOString(),
      type: 'text'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAgentOnline, setIsAgentOnline] = useState(false);

  const { user, createInquiry } = useAuth();

  // Load user data if authenticated
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // Simulate agent online status
  useEffect(() => {
    const checkAgentStatus = () => {
      // Mock agent availability (70% chance of being online during business hours)
      const now = new Date();
      const hour = now.getHours();
      const isBusinessHours = hour >= 9 && hour <= 18;
      setIsAgentOnline(isBusinessHours && Math.random() > 0.3);
    };

    checkAgentStatus();
    const interval = setInterval(checkAgentStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const agent = property.agentId ? agentDatabase[property.agentId as keyof typeof agentDatabase] : null;

  const handleInputChange = (field: keyof ContactFormData, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      if (!agent) {
        throw new Error('No agent assigned to this property');
      }

      // Prepare lead data for email service
      const leadData: LeadData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        propertyId: property.id,
        agentId: agent.id,
        inquiryType: formData.inquiryType,
        urgency: formData.urgency,
        budget: formData.budget,
        timeframe: formData.timeframe,
        source: 'contact_form'
      };

      // Process the inquiry through email service
      const result = await EmailService.processPropertyInquiry(leadData, property);

      if (result.success) {
        // Create inquiry if user is authenticated
        if (user) {
          await createInquiry(
            property.id,
            agent.id,
            `${formData.inquiryType.toUpperCase()}: ${formData.message}`
          );
        }

        setSubmitStatus('success');

        // Add success message to chat
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'system',
          message: `✅ Your inquiry has been sent successfully! Lead Score: ${result.leadScore}/100. ${agent.name} will contact you within 24 hours.`,
          timestamp: new Date().toISOString(),
          type: 'text'
        }]);

        // Log analytics
        console.log('📧 Lead processed successfully:', {
          propertyId: property.id,
          agentId: agent.id,
          leadScore: result.leadScore,
          urgency: formData.urgency,
          inquiryType: formData.inquiryType,
          source: 'contact_form'
        });

      } else {
        throw new Error('Failed to process inquiry through email service');
      }

    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitStatus('error');

      // Add error message to chat
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'system',
        message: '❌ There was an error sending your inquiry. Please try again or contact the agent directly.',
        timestamp: new Date().toISOString(),
        type: 'text'
      }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateLeadScore = (data: ContactFormData): number => {
    let score = 50; // Base score

    // Budget factor
    if (data.budget && data.budget >= property.price * 0.8) score += 20;
    else if (data.budget && data.budget >= property.price * 0.6) score += 10;

    // Urgency factor
    if (data.urgency === 'high') score += 15;
    else if (data.urgency === 'medium') score += 5;

    // Timeframe factor
    if (data.timeframe === 'immediate') score += 20;
    else if (data.timeframe === 'this_month') score += 15;
    else if (data.timeframe === 'next_3_months') score += 10;

    // Inquiry type factor
    if (data.inquiryType === 'offer') score += 25;
    else if (data.inquiryType === 'viewing') score += 15;

    // Contact completeness
    if (data.name && data.email && data.phone) score += 10;

    return Math.min(score, 100);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: chatInput,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Simulate agent response
    setTimeout(() => {
      const responses = [
        "Thanks for your question! I'll get back to you shortly.",
        "Let me check the details for you.",
        "I can schedule a viewing for you. What time works best?",
        "This property has been very popular. Would you like to see similar options?",
        "I'd be happy to discuss financing options with you."
      ];

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      setChatMessages(prev => [...prev, agentMessage]);
    }, 1000 + Math.random() * 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!agent) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Contact Agent</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
          {/* Property & Agent Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Property Summary */}
            <Card>
              <CardContent className="p-4">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-32 object-cover rounded mb-3"
                />
                <h3 className="font-semibold text-sm line-clamp-2 mb-2">{property.title}</h3>
                <p className="text-xs text-gray-600 flex items-center mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  {property.location}
                </p>
                <p className="font-bold text-blue-600 text-lg">€{property.price.toLocaleString()}</p>
                <div className="flex gap-2 text-xs text-gray-600 mt-2">
                  <span>{property.bedrooms} bed</span>
                  <span>•</span>
                  <span>{property.bathrooms} bath</span>
                  <span>•</span>
                  <span>{property.totalArea}m²</span>
                </div>
              </CardContent>
            </Card>

            {/* Agent Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{agent.name}</h4>
                    <p className="text-sm text-gray-600">{agent.title}</p>
                    <p className="text-xs text-gray-500">{agent.company}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Experience:</span>
                    <span className="font-medium">{agent.experience} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Properties Sold:</span>
                    <span className="font-medium">{agent.salesCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rating:</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{agent.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${isAgentOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className={isAgentOnline ? 'text-green-600' : 'text-gray-500'}>
                      {isAgentOnline ? 'Online now' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {agent.languages.map((lang) => (
                      <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full text-sm" onClick={() => window.open(`tel:${agent.phone}`)}>
                <Phone className="h-4 w-4 mr-2" />
                Call {agent.phone}
              </Button>
              <Button variant="outline" className="w-full text-sm" onClick={() => window.open(`mailto:${agent.email}`)}>
                <Mail className="h-4 w-4 mr-2" />
                Email Agent
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="contact">Contact Form</TabsTrigger>
                <TabsTrigger value="viewing">Schedule Viewing</TabsTrigger>
                <TabsTrigger value="chat">Live Chat</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto mt-4">
                {/* Contact Form Tab */}
                <TabsContent value="contact" className="mt-0 h-full">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+238 XXX XXXX"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                        <Select value={formData.contactMethod} onValueChange={(value: 'email' | 'phone' | 'whatsapp') => handleInputChange('contactMethod', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone Call</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Inquiry Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="inquiryType">Inquiry Type</Label>
                        <Select value={formData.inquiryType} onValueChange={(value: 'viewing' | 'information' | 'offer' | 'financing') => handleInputChange('inquiryType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewing">Schedule Viewing</SelectItem>
                            <SelectItem value="information">Request Information</SelectItem>
                            <SelectItem value="offer">Make an Offer</SelectItem>
                            <SelectItem value="financing">Financing Options</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="urgency">Urgency Level</Label>
                        <Select value={formData.urgency} onValueChange={(value: 'low' | 'medium' | 'high') => handleInputChange('urgency', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - Just browsing</SelectItem>
                            <SelectItem value="medium">Medium - Actively looking</SelectItem>
                            <SelectItem value="high">High - Ready to buy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="budget">Budget Range (Optional)</Label>
                        <Input
                          id="budget"
                          type="number"
                          value={formData.budget || ''}
                          onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || undefined)}
                          placeholder="€500,000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="timeframe">Purchase Timeframe</Label>
                        <Select value={formData.timeframe} onValueChange={(value: 'immediate' | 'this_month' | 'next_3_months' | 'next_6_months' | 'exploring') => handleInputChange('timeframe', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediately</SelectItem>
                            <SelectItem value="this_month">This month</SelectItem>
                            <SelectItem value="next_3_months">Next 3 months</SelectItem>
                            <SelectItem value="next_6_months">Next 6 months</SelectItem>
                            <SelectItem value="exploring">Just exploring</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        required
                        rows={4}
                        placeholder="Tell us about your interest in this property, any specific questions, or requirements..."
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="financing"
                          checked={formData.financingNeeded}
                          onCheckedChange={(checked) => handleInputChange('financingNeeded', checked)}
                        />
                        <Label htmlFor="financing" className="text-sm">I need financing assistance</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="additional"
                          checked={formData.additionalProperties}
                          onCheckedChange={(checked) => handleInputChange('additionalProperties', checked)}
                        />
                        <Label htmlFor="additional" className="text-sm">I'm interested in similar properties</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="newsletter"
                          checked={formData.newsletter}
                          onCheckedChange={(checked) => handleInputChange('newsletter', checked)}
                        />
                        <Label htmlFor="newsletter" className="text-sm">Subscribe to market updates and new listings</Label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      {submitStatus === 'success' && (
                        <div className="flex items-center gap-2 text-green-600 mb-4">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Your inquiry has been sent successfully!</span>
                        </div>
                      )}
                      {submitStatus === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">There was an error sending your inquiry. Please try again.</span>
                        </div>
                      )}
                      <Button
                        type="submit"
                        disabled={isSubmitting || submitStatus === 'success'}
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Inquiry
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                {/* Viewing Scheduler Tab */}
                <TabsContent value="viewing" className="mt-0 h-full">
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <Calendar className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                      <h3 className="text-lg font-semibold">Schedule a Property Viewing</h3>
                      <p className="text-gray-600 text-sm">Select a convenient time to visit this property</p>
                    </div>

                    <div className="grid gap-3">
                      {availableSlots.map((slot) => (
                        <Card
                          key={slot.id}
                          className={`cursor-pointer transition-all ${
                            !slot.available
                              ? 'opacity-50 cursor-not-allowed'
                              : selectedSlot === slot.id
                              ? 'ring-2 ring-blue-500 bg-blue-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => slot.available && setSelectedSlot(slot.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{formatDate(slot.date)}</div>
                                <div className="text-sm text-gray-600 flex items-center mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTime(slot.time)}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                  <User className="h-3 w-3 mr-1" />
                                  with {slot.agent}
                                </div>
                              </div>
                              <div>
                                {!slot.available ? (
                                  <Badge variant="secondary">Booked</Badge>
                                ) : selectedSlot === slot.id ? (
                                  <Badge className="bg-blue-600">Selected</Badge>
                                ) : (
                                  <Badge variant="outline">Available</Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {selectedSlot && (
                      <div className="pt-4 border-t">
                        <Button
                          onClick={() => {
                            // Handle viewing booking
                            const slot = availableSlots.find(s => s.id === selectedSlot);
                            if (slot) {
                              alert(`Viewing scheduled for ${formatDate(slot.date)} at ${formatTime(slot.time)}`);
                              setActiveTab('contact');
                              setFormData(prev => ({
                                ...prev,
                                inquiryType: 'viewing',
                                message: `I would like to schedule a viewing for ${formatDate(slot.date)} at ${formatTime(slot.time)}.`
                              }));
                            }
                          }}
                          className="w-full"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Confirm Viewing Appointment
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Live Chat Tab */}
                <TabsContent value="chat" className="mt-0 h-full flex flex-col">
                  <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto min-h-[300px] max-h-[400px]">
                    <div className="space-y-3">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 text-sm ${
                              message.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : message.sender === 'agent'
                                ? 'bg-white border'
                                : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                            }`}
                          >
                            {message.sender !== 'user' && (
                              <div className="text-xs opacity-75 mb-1">
                                {message.sender === 'agent' ? agent.name : 'System'}
                              </div>
                            )}
                            <div>{message.message}</div>
                            <div className="text-xs opacity-75 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={isAgentOnline ? "Type your message..." : "Agent is offline. They'll respond when online."}
                      onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                      disabled={!isAgentOnline}
                    />
                    <Button onClick={handleChatSend} disabled={!chatInput.trim() || !isAgentOnline}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 mt-2 text-center">
                    {isAgentOnline ? (
                      <span className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {agent.name} is online and will respond shortly
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Agent is offline. Messages will be delivered when they return.
                      </span>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
