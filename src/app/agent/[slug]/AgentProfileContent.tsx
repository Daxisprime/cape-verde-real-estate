'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin, Phone, Mail, Star, Award, Users, Home, MessageCircle,
  Calendar, TrendingUp, CheckCircle, Globe, Building2, Clock,
  ChevronRight, Share2, Heart, ExternalLink, Briefcase
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserLinksDisplay from '@/components/UserLinksDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AgentProperty {
  id: string;
  title: string;
  price: number;
  price_type: 'sale' | 'rent';
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  total_area: number;
  island: string;
  city: string;
  images: string[];
  status: string;
  is_featured: boolean;
}

interface AgentReview {
  id: string;
  author_name: string;
  author_avatar: string | null;
  rating: number;
  comment: string;
  date: string;
}

interface AgentLink {
  id: string;
  platform: string;
  formatted_url: string;
  display_label: string | null;
  is_public: boolean;
  is_verified: boolean;
}

interface Agent {
  id: string;
  slug: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  bio: string;
  roles: string[];
  is_verified: boolean;
  is_active: boolean;
  license_number: string;
  company: string;
  years_experience: number;
  specialties: string[];
  languages: string[];
  service_areas: string[];
  stats: {
    properties_sold: number;
    total_volume: number;
    average_days_on_market: number;
    client_satisfaction: number;
    reviews_count: number;
  };
  links: AgentLink[];
  properties: AgentProperty[];
  reviews: AgentReview[];
}

interface AgentProfileContentProps {
  agent: Agent;
}

export default function AgentProfileContent({ agent }: AgentProfileContentProps) {
  const { toast } = useToast();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    property: '',
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, send to API
    toast({
      title: 'Message Sent!',
      description: `Your message has been sent to ${agent.full_name}. They will respond shortly.`,
    });
    setIsContactDialogOpen(false);
    setContactForm({ name: '', email: '', phone: '', message: '', property: '' });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${agent.full_name} - Real Estate Agent`,
          text: agent.bio,
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied!',
        description: 'Profile link copied to clipboard.',
      });
    }
  };

  const activeProperties = agent.properties.filter(p => p.status === 'active');
  const featuredProperties = activeProperties.filter(p => p.is_featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar & Basic Info */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={agent.avatar_url} alt={agent.full_name} />
                  <AvatarFallback className="text-3xl bg-blue-500">
                    {agent.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {agent.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Agent Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{agent.full_name}</h1>
                  <p className="text-blue-100 text-lg mb-2">{agent.company}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 font-semibold">{agent.stats.client_satisfaction}</span>
                      <span className="ml-1 text-blue-200">({agent.stats.reviews_count} reviews)</span>
                    </div>
                    {agent.is_verified && (
                      <Badge className="bg-green-500/20 text-green-100 border-green-400">
                        <Award className="h-3 w-3 mr-1" />
                        Verified Agent
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{agent.years_experience}+</div>
                  <div className="text-xs text-blue-200">Years Experience</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{agent.stats.properties_sold}</div>
                  <div className="text-xs text-blue-200">Properties Sold</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{activeProperties.length}</div>
                  <div className="text-xs text-blue-200">Active Listings</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{agent.stats.average_days_on_market}</div>
                  <div className="text-xs text-blue-200">Avg Days to Sell</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Agent Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact {agent.full_name.split(' ')[0]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Social Links */}
                {agent.links.length > 0 && (
                  <UserLinksDisplay
                    links={agent.links.map(l => ({
                      ...l,
                      platform: l.platform as any,
                    }))}
                    variant="buttons"
                  />
                )}

                <Separator />

                {/* Contact Info */}
                <div className="space-y-3">
                  <a
                    href={`tel:${agent.phone}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
                  >
                    <Phone className="h-5 w-5" />
                    <span>{agent.phone}</span>
                  </a>
                  <a
                    href={`mailto:${agent.email}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
                  >
                    <Mail className="h-5 w-5" />
                    <span>{agent.email}</span>
                  </a>
                </div>

                <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contact {agent.full_name}</DialogTitle>
                      <DialogDescription>
                        Send a message and they'll respond within 24 hours.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          id="name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input
                          id="phone"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          rows={4}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">Send Message</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* About Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm leading-relaxed">{agent.bio}</p>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">License: {agent.license_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{agent.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{agent.years_experience}+ years experience</span>
                  </div>
                </div>

                <Separator />

                {/* Specialties */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.specialties.map((specialty, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.languages.map((lang, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Service Areas */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Service Areas</h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.service_areas.map((area, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Properties & Reviews */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="properties" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="properties">
                  <Home className="h-4 w-4 mr-2" />
                  Properties ({activeProperties.length})
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  <Star className="h-4 w-4 mr-2" />
                  Reviews ({agent.reviews.length})
                </TabsTrigger>
              </TabsList>

              {/* Properties Tab */}
              <TabsContent value="properties" className="space-y-6">
                {/* Featured Properties */}
                {featuredProperties.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Listings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {featuredProperties.map(property => (
                        <PropertyCard key={property.id} property={property} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Properties */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">All Listings</h3>
                  {activeProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeProperties.map(property => (
                        <PropertyCard key={property.id} property={property} />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Home className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No active listings at the moment.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                {/* Rating Summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900">
                          {agent.stats.client_satisfaction}
                        </div>
                        <div className="flex items-center justify-center my-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.floor(agent.stats.client_satisfaction)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">
                          {agent.stats.reviews_count} reviews
                        </div>
                      </div>

                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => {
                          const count = agent.reviews.filter(r => Math.floor(r.rating) === rating).length;
                          const percentage = (count / agent.reviews.length) * 100 || 0;
                          return (
                            <div key={rating} className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 w-3">{rating}</span>
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <Progress value={percentage} className="flex-1 h-2" />
                              <span className="text-sm text-gray-500 w-8">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews List */}
                {agent.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {agent.reviews.map(review => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.author_avatar || undefined} />
                              <AvatarFallback>
                                {review.author_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900">{review.author_name}</h4>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center my-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-gray-600 mt-2">{review.comment}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Star className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No reviews yet.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Property Card Component
function PropertyCard({ property }: { property: AgentProperty }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        {property.is_featured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500">
            Featured
          </Badge>
        )}
        <Badge
          className="absolute top-2 right-2"
          variant={property.price_type === 'rent' ? 'secondary' : 'default'}
        >
          {property.price_type === 'rent' ? 'For Rent' : 'For Sale'}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
        </div>
        <p className="text-2xl font-bold text-blue-600">
          €{property.price.toLocaleString()}
          {property.price_type === 'rent' && <span className="text-sm font-normal">/mo</span>}
        </p>
        <div className="flex items-center text-gray-500 text-sm mt-2">
          <MapPin className="h-4 w-4 mr-1" />
          {property.city}, {property.island}
        </div>
        <div className="flex items-center gap-4 text-gray-500 text-sm mt-2">
          <span>{property.bedrooms} bed</span>
          <span>{property.bathrooms} bath</span>
          <span>{property.total_area} m²</span>
        </div>
        <Button variant="outline" className="w-full mt-4" asChild>
          <Link href={`/property/${property.id}`}>
            View Details
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
