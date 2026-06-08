'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import {
  Calculator, Users, FileText, TrendingUp, CheckCircle,
  Camera, MapPin, Star, Clock, ArrowRight, Home,
  PiggyBank, Shield, Eye, Phone, Mail, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SellHeroButtons, ValuationButton } from './SellPageClient';

// Note: Client components cannot export metadata
// Title and description should be handled by a parent layout or head component

export default function SellPage() {
  const sellingSteps = [
    {
      step: 1,
      title: 'Property Valuation',
      description: 'Get an accurate valuation of your property',
      icon: Calculator,
      details: [
        'Free instant valuation online',
        'Professional appraisal available',
        'Market comparison analysis',
        'Price recommendation'
      ]
    },
    {
      step: 2,
      title: 'Choose an Agent',
      description: 'Find the right estate agent for your needs',
      icon: Users,
      details: [
        'Compare local agents',
        'View performance statistics',
        'Read client reviews',
        'Interview multiple agents'
      ]
    },
    {
      step: 3,
      title: 'Marketing & Photography',
      description: 'Professional marketing of your property',
      icon: Camera,
      details: [
        'Professional photography',
        'Virtual tours and videos',
        'Online and offline marketing',
        'Social media promotion'
      ]
    },
    {
      step: 4,
      title: 'Complete the Sale',
      description: 'Navigate the legal process smoothly',
      icon: CheckCircle,
      details: [
        'Handle viewings and offers',
        'Negotiate best price',
        'Legal documentation',
        'Transfer completion'
      ]
    }
  ];

  const topAgents = [
    {
      id: 1,
      name: 'Maria Santos',
      company: 'Atlantic Real Estate',
      experience: 8,
      propertiesSold: 156,
      avgSaleTime: 45,
      avgSalePrice: 185000,
      rating: 4.9,
      reviews: 47,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      specialties: ['Luxury Properties', 'Investment', 'Commercial'],
      islands: ['Sal', 'Santiago', 'São Vicente']
    },
    {
      id: 2,
      name: 'João Pereira',
      company: 'Cape Verde Properties',
      experience: 12,
      propertiesSold: 203,
      avgSaleTime: 38,
      avgSalePrice: 210000,
      rating: 4.8,
      reviews: 62,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      specialties: ['Residential', 'First-time Sellers', 'Market Analysis'],
      islands: ['Santiago', 'Boa Vista', 'Fogo']
    },
    {
      id: 3,
      name: 'Ana Silva',
      company: 'Island Properties CV',
      experience: 6,
      propertiesSold: 89,
      avgSaleTime: 42,
      avgSalePrice: 165000,
      rating: 4.7,
      reviews: 31,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      specialties: ['Beachfront', 'Tourism Properties', 'International Clients'],
      islands: ['Sal', 'Boa Vista', 'Santo Antão']
    }
  ];

  const sellingGuides = [
    {
      title: 'Preparing Your Property for Sale',
      description: 'Essential tips to maximize your property\'s appeal and value',
      icon: Home,
      readTime: '8 min read',
      link: '/advice/selling/property-preparation'
    },
    {
      title: 'Understanding Cape Verde Property Laws',
      description: 'Legal requirements and processes for selling property',
      icon: FileText,
      readTime: '6 min read',
      link: '/advice/selling/legal-requirements'
    },
    {
      title: 'Pricing Your Property Right',
      description: 'How to set a competitive price that attracts buyers',
      icon: TrendingUp,
      readTime: '5 min read',
      link: '/advice/selling/pricing-strategy'
    },
    {
      title: 'Tax Implications of Selling',
      description: 'Understanding taxes and costs involved in property sales',
      icon: PiggyBank,
      readTime: '7 min read',
      link: '/advice/selling/tax-guide'
    }
  ];

  const marketInsights = [
    { label: 'Average Sale Time', value: '42 days', trend: '-5 days' },
    { label: 'Price Achievement', value: '96.8%', trend: '+2.1%' },
    { label: 'Market Activity', value: 'High', trend: 'Increasing' },
    { label: 'Foreign Buyers', value: '67%', trend: '+8%' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Sell Your Cape Verde Property with Confidence
              </h1>
              <p className="text-xl text-purple-100 mb-8">
                Get the best price for your property with our expert agents and comprehensive marketing.
                Start with a free valuation and connect with top-rated professionals.
              </p>
              <SellHeroButtons />
            </div>

            {/* Quick Valuation Form */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Get Your Property Valuation
              </h3>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Property address or location"
                    className="h-12 text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Bedrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bedroom</SelectItem>
                      <SelectItem value="2">2 Bedrooms</SelectItem>
                      <SelectItem value="3">3 Bedrooms</SelectItem>
                      <SelectItem value="4">4+ Bedrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input
                    placeholder="Your email address"
                    type="email"
                    className="h-12 text-gray-900"
                  />
                </div>
                <ValuationButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Market Insights */}
        <div className="py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Cape Verde Property Market Performance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketInsights.map((insight, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {insight.value}
                  </div>
                  <div className="text-gray-600 mb-2">{insight.label}</div>
                  <Badge className="bg-green-100 text-green-800">
                    {insight.trend}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Selling Process */}
        <div className="py-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How to Sell Your Property in 4 Easy Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sellingSteps.map((step) => {
              const IconComponent = step.icon;
              return (
                <Card key={step.step} className="relative hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      {step.step}
                    </div>
                    <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 mb-4 text-center">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Top Agents */}
        <div className="py-12 border-t border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Top-Rated Estate Agents in Cape Verde
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect with our highest-performing agents who specialize in maximizing property sale prices
              and reducing time on market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="relative w-16 h-16 mr-4">
                      <Image
                        src={agent.image}
                        alt={agent.name}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{agent.name}</h3>
                      <p className="text-gray-600">{agent.company}</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium">{agent.rating}</span>
                        <span className="ml-1 text-sm text-gray-500">({agent.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-gray-900">{agent.experience}</div>
                      <div className="text-gray-600">Years Exp.</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-gray-900">{agent.propertiesSold}</div>
                      <div className="text-gray-600">Properties Sold</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-gray-900">{agent.avgSaleTime} days</div>
                      <div className="text-gray-600">Avg. Sale Time</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-gray-900">€{agent.avgSalePrice.toLocaleString()}</div>
                      <div className="text-gray-600">Avg. Sale Price</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-1">
                      {agent.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Service Areas:</h4>
                    <div className="flex flex-wrap gap-1">
                      {agent.islands.map((island, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {island}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                    <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                      <Phone className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline">
              View All Agents
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selling Guides */}
        <div className="py-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Expert Selling Guides & Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sellingGuides.map((guide, index) => {
              const IconComponent = guide.icon;
              return (
                <Link key={index} href={guide.link}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                    <CardContent className="p-6 text-center h-full flex flex-col">
                      <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-purple-600 transition-colors">
                        <IconComponent className="h-8 w-8 text-purple-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 flex-1">
                        {guide.description}
                      </p>
                      <Badge variant="outline" className="self-center">
                        {guide.readTime}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="py-12 border-t border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why Sell with ProCV?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Expert Agents</h3>
                <p className="text-gray-600">
                  Work with verified, top-performing agents who know the Cape Verde market inside out.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Maximum Value</h3>
                <p className="text-gray-600">
                  Our data-driven approach and professional marketing achieve 96.8% of asking price on average.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Faster Sales</h3>
                <p className="text-gray-600">
                  Professional photography, virtual tours, and targeted marketing reduce time on market.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-12 border-t border-gray-200">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Sell Your Property?</h2>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Start with a free, no-obligation valuation and connect with our top-rated agents.
              Get the best price for your Cape Verde property.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-white text-purple-600 hover:bg-gray-100 px-8">
                <Calculator className="mr-2 h-4 w-4" />
                Get Free Valuation
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8">
                <Users className="mr-2 h-4 w-4" />
                Find an Agent
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
