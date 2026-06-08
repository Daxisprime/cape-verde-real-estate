import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import PropertyFilterBar from '@/components/PropertyFilterBar';
import PropertyGrid from '@/components/PropertyGrid';
import {
  Search, MapPin, Bed, Bath, Square, Heart, Filter,
  TrendingUp, Users, FileText, Calculator, Shield,
  Star, Eye, ArrowRight, Home, Building2, Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const metadata: Metadata = {
  title: 'Buy Property in Cape Verde | ProCV Real Estate',
  description: 'Find your dream property in Cape Verde. Browse houses, apartments, villas and land for sale across all islands with expert guidance.',
};

export default function BuyPage() {
  const islands = [
    'All Islands', 'Santiago', 'Sal', 'São Vicente', 'Boa Vista',
    'Fogo', 'Santo Antão', 'Maio', 'Brava', 'São Nicolau'
  ];

  const propertyTypes = [
    'All Types', 'House', 'Apartment', 'Villa', 'Townhouse',
    'Land/Plot', 'Commercial', 'Investment Property'
  ];

  const priceRanges = [
    'Any Price', '€50k - €100k', '€100k - €200k', '€200k - €300k',
    '€300k - €500k', '€500k - €750k', '€750k - €1M', '€1M+'
  ];

  const featuredProperties = [
    {
      id: 1,
      title: 'Luxury Oceanfront Villa',
      price: 650000,
      location: 'Santa Maria, Sal',
      island: 'Sal',
      type: 'Villa',
      bedrooms: 4,
      bathrooms: 3,
      area: 320,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      featured: true,
      newListing: false
    },
    {
      id: 2,
      title: 'Modern City Apartment',
      price: 185000,
      location: 'Praia, Santiago',
      island: 'Santiago',
      type: 'Apartment',
      bedrooms: 2,
      bathrooms: 2,
      area: 95,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      featured: false,
      newListing: true
    },
    {
      id: 3,
      title: 'Beachfront Investment Property',
      price: 420000,
      location: 'Mindelo, São Vicente',
      island: 'São Vicente',
      type: 'House',
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      featured: true,
      newListing: false
    },
    {
      id: 4,
      title: 'Traditional Island Home',
      price: 95000,
      location: 'Ribeira Grande, Santo Antão',
      island: 'Santo Antão',
      type: 'House',
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      featured: false,
      newListing: false
    }
  ];

  const buyingGuides = [
    {
      title: 'First-Time Buyer\'s Guide',
      description: 'Complete guide for first-time property buyers in Cape Verde',
      icon: Home,
      link: '/advice/buying/first-time-buyers'
    },
    {
      title: 'Property Investment Guide',
      description: 'Investment strategies and ROI analysis for Cape Verde properties',
      icon: TrendingUp,
      link: '/advice/buying/investment-guide'
    },
    {
      title: 'Legal Requirements',
      description: 'Understanding Cape Verde property laws and regulations',
      icon: FileText,
      link: '/advice/buying/legal-requirements'
    },
    {
      title: 'Financing Options',
      description: 'Mortgage and financing solutions for property purchases',
      icon: Calculator,
      link: '/advice/buying/financing'
    }
  ];

  const marketStats = [
    { label: 'Properties Available', value: '2,847+', change: '+12%' },
    { label: 'Average Price/m²', value: '€1,850', change: '+8%' },
    { label: 'Price Growth (YoY)', value: '15.2%', change: '+2.1%' },
    { label: 'Foreign Buyers', value: '67%', change: '+5%' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section with Search */}
      <div className="bg-white border-b border-gray-100 text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Dream Property in Cape Verde
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              Discover stunning properties across Cape Verde's beautiful islands.
              From beachfront villas to city apartments, your perfect home awaits.
            </p>
          </div>

          {/* Property Search */}
          <div className="max-w-6xl mx-auto">
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by location or property type..."
                    className="pl-10"
                  />
                </div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Island" />
                  </SelectTrigger>
                  <SelectContent>
                    {islands.map((island) => (
                      <SelectItem key={island} value={island.toLowerCase()}>
                        {island}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Market Statistics */}
        <div className="py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Cape Verde Property Market Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketStats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-[#2563EB] mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 mb-2">{stat.label}</div>
                  <Badge className="bg-green-100 text-green-800">
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Property Search Results */}
        <div className="py-12 border-t border-gray-200">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProperties.map((property) => (
                <Card key={property.id} className="hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {property.featured && (
                      <Badge className="absolute top-2 left-2 bg-red-600 text-white">
                        Featured
                      </Badge>
                    )}
                    {property.newListing && (
                      <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                        New
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-2xl font-bold text-[#2563EB]">
                        €{property.price.toLocaleString()}
                      </span>
                      <Badge variant="secondary">{property.island}</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.location}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span>{property.bedrooms} bed</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span>{property.bathrooms} bath</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        <span>{property.area}m²</span>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Buying Guides */}
        <div className="py-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Buying Property in Cape Verde
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {buyingGuides.map((guide, index) => {
              const IconComponent = guide.icon;
              return (
                <Link key={index} href={guide.link}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-[#2563EB] transition-colors">
                        <IconComponent className="h-8 w-8 text-[#2563EB] group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#2563EB] transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {guide.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-12 border-t border-gray-200">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Buy Your Cape Verde Property?</h2>
            <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
              Get personalized assistance from our expert real estate agents. We'll help you find the perfect property
              and guide you through the entire buying process.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] px-8">
                <Users className="mr-2 h-4 w-4" />
                Find an Agent
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#2563EB] px-8">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Affordability
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
