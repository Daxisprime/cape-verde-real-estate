"use client";

import React, { useState } from 'react';
import { MapPin, Search, User, MessageSquare, Calendar, DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/contexts/ChatContext';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface PropertyInquiryModalProps {
  onClose: () => void;
  preselectedPropertyId?: string;
}

// Mock property data - in real app this would come from API
const mockProperties = [
  {
    id: '1',
    title: 'Modern Beachfront Villa',
    location: 'Santa Maria, Sal',
    price: 450000,
    image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/522602290.jpg',
    agentId: 'agent-1',
    agentName: 'John Agent'
  },
  {
    id: '2',
    title: 'Smart City Center Apartment',
    location: 'Praia, Santiago',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    agentId: 'agent-2',
    agentName: 'Maria Santos'
  },
  {
    id: '3',
    title: 'Luxury Ocean View Penthouse',
    location: 'Mindelo, São Vicente',
    price: 680000,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    agentId: 'agent-1',
    agentName: 'John Agent'
  }
];

const inquiryTypes = [
  { value: 'general', label: 'General Information', icon: Info },
  { value: 'viewing', label: 'Schedule Viewing', icon: Calendar },
  { value: 'offer', label: 'Make an Offer', icon: DollarSign },
  { value: 'financing', label: 'Financing Options', icon: MessageSquare }
];

export default function PropertyInquiryModal({
  onClose,
  preselectedPropertyId
}: PropertyInquiryModalProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState(preselectedPropertyId || '');
  const [inquiryType, setInquiryType] = useState('general');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createPropertyInquiry } = useChat();
  const { toast } = useToast();

  const filteredProperties = mockProperties.filter(property =>
    property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProperty = mockProperties.find(p => p.id === selectedPropertyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPropertyId || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a property and enter a message.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const property = mockProperties.find(p => p.id === selectedPropertyId);
      if (!property) throw new Error('Property not found');

      await createPropertyInquiry(selectedPropertyId, property.agentId, message.trim());

      toast({
        title: "Inquiry Sent",
        description: `Your inquiry about "${property.title}" has been sent to ${property.agentName}.`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Failed to Send Inquiry",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInquiryTemplate = (type: string, propertyTitle: string) => {
    switch (type) {
      case 'viewing':
        return `Hi! I'm interested in scheduling a viewing for "${propertyTitle}". Could you please let me know your available times this week?`;
      case 'offer':
        return `Hello, I'm very interested in "${propertyTitle}" and would like to discuss making an offer. Could we schedule a time to talk about the details?`;
      case 'financing':
        return `Hi, I'm interested in "${propertyTitle}" and would like to know more about financing options available for this property.`;
      default:
        return `Hello! I'm interested in learning more about "${propertyTitle}". Could you provide me with additional details?`;
    }
  };

  const handleInquiryTypeChange = (type: string) => {
    setInquiryType(type);
    if (selectedProperty) {
      setMessage(getInquiryTemplate(type, selectedProperty.title));
    }
  };

  const handlePropertySelect = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    const property = mockProperties.find(p => p.id === propertyId);
    if (property) {
      setMessage(getInquiryTemplate(inquiryType, property.title));
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Selection */}
      <div>
        <Label className="text-base font-medium">Select Property</Label>
        <p className="text-sm text-gray-600 mb-3">
          Choose the property you'd like to inquire about
        </p>

        {/* Search Properties */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Property List */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className={`cursor-pointer transition-all ${
                selectedPropertyId === property.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handlePropertySelect(property.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="relative w-16 h-16">
                    <Image
                      src={property.image}
                      alt={property.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{property.title}</h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{property.location}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-bold text-blue-600">
                        €{property.price.toLocaleString()}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="h-3 w-3 mr-1" />
                        {property.agentName}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No properties found matching your search.</p>
          </div>
        )}
      </div>

      {/* Inquiry Type */}
      {selectedProperty && (
        <div>
          <Label className="text-base font-medium">Inquiry Type</Label>
          <p className="text-sm text-gray-600 mb-3">
            What would you like to know about this property?
          </p>

          <div className="grid grid-cols-2 gap-2">
            {inquiryTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Button
                  key={type.value}
                  variant={inquiryType === type.value ? "default" : "outline"}
                  className="h-auto p-3 flex flex-col space-y-1"
                  onClick={() => handleInquiryTypeChange(type.value)}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-xs">{type.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Message */}
      {selectedProperty && (
        <div>
          <Label htmlFor="message" className="text-base font-medium">
            Your Message
          </Label>
          <p className="text-sm text-gray-600 mb-3">
            Tell the agent what you'd like to know or discuss
          </p>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={4}
            className="resize-none"
          />
          <div className="text-right mt-1">
            <span className={`text-xs ${message.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
              {message.length}/500
            </span>
          </div>
        </div>
      )}

      {/* Selected Property Summary */}
      {selectedProperty && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div>
                <p className="font-medium text-green-900">
                  Inquiry will be sent to {selectedProperty.agentName}
                </p>
                <p className="text-sm text-green-700">
                  Agent for {selectedProperty.title}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        <Button
          onClick={handleSubmit}
          disabled={!selectedPropertyId || !message.trim() || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Sending...
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Inquiry
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Tips for better responses:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific about your requirements and timeline</li>
            <li>• Include your budget range if discussing offers</li>
            <li>• Mention your preferred viewing times</li>
            <li>• Ask about financing options if needed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
