import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import PropertyFilterBar from '@/components/PropertyFilterBar';
import PropertyGrid from '@/components/PropertyGrid';
import {
  Search, MapPin, Bed, Bath, Square, Heart, Filter,
  Users, FileText, Calculator, Shield, Key,
  Star, Eye, ArrowRight, Home, Building2, Map, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreFiltersButton, SearchRentalsButton } from './RentPageClient';

export const metadata: Metadata = {
  title: 'Rent Property in Cape Verde | ProCV Rentals',
  description: 'Find rental properties in Cape Verde or list your property for rent. Professional rental services for tenants and landlords.',
};

export default function RentPage() {
  const islands = [
    'All Islands', 'Santiago', 'Sal', 'São Vicente', 'Boa Vista',
    'Fogo', 'Santo Antão', 'Maio', 'Brava', 'São Nicolau'
  ];

  const propertyTypes = [
    'All Types', 'House', 'Apartment', 'Villa', 'Townhouse',
    'Studio', 'Commercial Space', 'Office'
  ];

  const priceRanges = [
    'Any Price', '€200 - €400', '€400 - €600', '€600 - €800',
    '€800 - €1,200', '€1,200 - €1,800', '€1,800 - €2,500', '€2,500+'
  ];

  const rentalProperties = [
    {
      id: 1,
      title: 'Modern Beachfront Apartment',
      price: 1200,
      location: 'Santa Maria, Sal',
      island: 'Sal',
      type: 'Apartment',
      bedrooms: 2,
      bathrooms: 2,
      area: 85,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      furnished: true,
      newListing: true,
      availableFrom: '2025-02-01'
    },
    {
      id: 2,
      title: 'City Center Studio',
      price: 450,
      location: 'Praia, Santiago',
      island: 'Santiago',
      type: 'Studio',
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      furnished: false,
      newListing: false,
      availableFrom: '2025-01-15'
    },
    {
      id: 3,
      title: 'Family House with Garden',
      price: 850,
      location: 'Mindelo, São Vicente',
      island: 'São Vicente',
      type: 'House',
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      furnished: true,
      newListing: false,
      availableFrom: '2025-02-15'
    },
    {
      id: 4,
      title: 'Luxury Villa with Pool',
      price: 2800,
      location: 'Sal Rei, Boa Vista',
      island: 'Boa Vista',
      type: 'Villa',
      bedrooms: 4,
      bathrooms: 3,
      area: 280,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      furnished: true,
      newListing: true,
      availableFrom: '2025-01-20'
    }
  ];

  const tenantGuides = [
    {
      title: 'Tenant Rights & Responsibilities',
      description: 'Know your rights and obligations as a tenant in Cape Verde',
      icon: Shield,
      link: '/advice/renting/tenant-rights'
    },
    {
      title: 'Rental Application Guide',
      description: 'Step-by-step guide to applying for rental properties',
      icon: FileText,
      link: '/advice/renting/application-guide'
    },
    {
      title: 'Moving to Cape Verde',
      description: 'Complete guide for expats renting in Cape Verde',
      icon: Home,
      link: '/advice/renting/expat-guide'
    },
    {
      title: 'Rental Inspections',
      description: 'What to look for when viewing rental properties',
      icon: Eye,
      link: '/advice/renting/inspections'
    }
  ];

  const landlordGuides = [
    {
      title: 'Landlord Legal Requirements',
      description: 'Legal obligations and compliance for Cape Verde landlords',
      icon: Shield,
      link: '/advice/renting/landlord-legal'
    },
    {
      title: 'Tenant Screening',
      description: 'Best practices for selecting reliable tenants',
      icon: Users,
      link: '/advice/renting/tenant-screening'
    },
    {
      title: 'Property Management',
      description: 'Managing your rental property effectively',
      icon: Key,
      link: '/advice/renting/property-management'
    },
    {
      title: 'Rental Pricing Strategy',
      description: 'Set competitive rental prices for maximum ROI',
      icon: Calculator,
      link: '/advice/renting/pricing-strategy'
    }
  ];

  const rentalStats = [
    { label: 'Properties to Rent', value: '1,234+', change: '+18%' },
    { label: 'Average Rent/m²', value: '€12.50', change: '+5%' },
    { label: 'Rental Yield', value: '8.2%', change: '+1.2%' },
    { label: 'Avg. Tenancy Length', value: '14 months', change: '+2 months' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Rental Properties in Cape Verde
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Find your perfect rental home or list your property for rent.
              Professional rental services for both tenants and landlords.
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-6xl mx-auto">
            <Tabs defaultValue="find-rental" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="find-rental" className="text-lg py-3">
                  <Home className="mr-2 h-5 w-5" />
                  Find a Rental
                </TabsTrigger>
                <TabsTrigger value="list-property" className="text-lg py-3">
                  <Key className="mr-2 h-5 w-5" />
                  List Your Property
                </TabsTrigger>
              </TabsList>

              <TabsContent value="find-rental">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search by location..."
                      className="pl-10 h-12 text-gray-900"
                    />
                  </div>

                  <Select>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select Island" />
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
                    <SelectTrigger className="h-12">
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

                  <Select>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Monthly Rent" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range} value={range.toLowerCase()}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <MoreFiltersButton />
                  <SearchRentalsButton />
                </div>
              </TabsContent>

              <TabsContent value="list-property">
                <div className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    List Your Property for Rent
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Reach thousands of potential tenants and maximize your rental income.
                    Our professional listing service includes photography, marketing, and tenant screening.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Button className="bg-green-600 hover:bg-green-700 px-8">
                      <Key className="mr-2 h-4 w-4" />
                      List My Property
                    </Button>
                    <Button variant="outline" className="text-gray-700 border-gray-300 px-8">
                      <Calculator className="mr-2 h-4 w-4" />
                      Rental Valuation
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Market Statistics */}
        <div className="py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Cape Verde Rental Market Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rentalStats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">
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

        {/* Featured Rentals */}
        <div className="py-12 border-t border-gray-200">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Rental Properties</h2>
              <p className="text-gray-600">Quality rental properties across Cape Verde</p>
            </div>
            <Button variant="outline">
              View All Rentals
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rentalProperties.map((property) => (
              <Card key={property.id} className="group hover:shadow-lg transition-all duration-300">
                <div className="relative h-48">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-col space-y-2">
                    {property.newListing && (
                      <Badge className="bg-green-600 text-white">New</Badge>
                    )}
                    {property.furnished && (
                      <Badge className="bg-blue-600 text-white">Furnished</Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-green-600 transition-colors">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.location}, {property.island}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-2xl font-bold text-green-600">
                      €{property.price}/month
                    </div>
                    <div className="text-sm text-gray-500">
                      Available from {new Date(property.availableFrom).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{property.type}</Badge>
                      {property.bedrooms > 0 && (
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms > 0 && (
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{property.area}m²</span>
                    </div>
                    <div className="text-green-600 font-medium">
                      €{(property.price / property.area).toFixed(2)}/m²
                    </div>
                  </div>

                  <div className="flex">
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      Contact Owner
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Guides Section */}
        <div className="py-12 border-t border-gray-200">
          <Tabs defaultValue="tenants" className="w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Rental Guides & Resources
              </h2>
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="tenants">For Tenants</TabsTrigger>
                <TabsTrigger value="landlords">For Landlords</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="tenants">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tenantGuides.map((guide, index) => {
                  const IconComponent = guide.icon;
                  return (
                    <Link key={index} href={guide.link}>
                      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <CardContent className="p-6 text-center">
                          <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-green-600 transition-colors">
                            <IconComponent className="h-8 w-8 text-green-600 group-hover:text-white transition-colors" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
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
            </TabsContent>

            <TabsContent value="landlords">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {landlordGuides.map((guide, index) => {
                  const IconComponent = guide.icon;
                  return (
                    <Link key={index} href={guide.link}>
                      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <CardContent className="p-6 text-center">
                          <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-green-600 transition-colors">
                            <IconComponent className="h-8 w-8 text-green-600 group-hover:text-white transition-colors" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
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
            </TabsContent>
          </Tabs>
        </div>

        {/* Call to Action */}
        <div className="py-12 border-t border-gray-200">
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Start Your Rental Journey Today</h2>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Whether you're looking for a rental property or want to list your property for rent,
              our expert team is here to help you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-white text-green-600 hover:bg-gray-100 px-8">
                <Home className="mr-2 h-4 w-4" />
                Browse Rentals
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 px-8">
                <Key className="mr-2 h-4 w-4" />
                List Your Property
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
