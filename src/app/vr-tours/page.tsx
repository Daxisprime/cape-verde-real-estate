import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Monitor,
  Eye,
  Play,
  CheckCircle,
  Smartphone,
  Headphones,
  Globe,
  Clock,
  Camera,
  Building,
  Users,
  Star
} from 'lucide-react';
import Image from 'next/image';

export default function VRToursPage() {
  const features = [
    {
      icon: Monitor,
      title: "360° Virtual Reality",
      description: "Immersive 360-degree property tours with VR headset support"
    },
    {
      icon: Smartphone,
      title: "Mobile Compatible",
      description: "View tours on any device - desktop, tablet, or smartphone"
    },
    {
      icon: Camera,
      title: "4K Ultra HD Quality",
      description: "Crystal clear imagery captured with professional 360° cameras"
    },
    {
      icon: Globe,
      title: "Interactive Hotspots",
      description: "Click on areas for detailed information and measurements"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Tour properties anytime, anywhere without scheduling"
    },
    {
      icon: Users,
      title: "Guided Tours",
      description: "Agent-guided virtual tours with live commentary"
    }
  ];

  const tourTypes = [
    {
      title: "Standard VR Tour",
      description: "360° panoramic views of all rooms and spaces",
      duration: "5-8 minutes",
      features: ["High-resolution imagery", "Room navigation", "Basic hotspots"],
      price: "Free"
    },
    {
      title: "Premium VR Experience",
      description: "Enhanced tour with interactive elements and measurements",
      duration: "10-15 minutes",
      features: ["4K quality", "Interactive hotspots", "Measurement tools", "Property details"],
      price: "Premium listings"
    },
    {
      title: "Live Guided Tour",
      description: "Real-time tour with agent commentary and Q&A",
      duration: "20-30 minutes",
      features: ["Agent guidance", "Live chat", "Personalized walkthrough", "Instant questions"],
      price: "By appointment"
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Pre-screen properties before physical visits"
    },
    {
      icon: Globe,
      title: "Remote Viewing",
      description: "Tour properties from anywhere in the world"
    },
    {
      icon: Eye,
      title: "Better Understanding",
      description: "Get a true sense of space and layout"
    },
    {
      icon: Users,
      title: "Share with Family",
      description: "Multiple people can tour together virtually"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Monitor className="h-8 w-8 mr-3" />
                <Badge className="bg-white/20 text-white">PropTech Innovation</Badge>
              </div>
              <h1 className="text-5xl font-bold mb-6">
                Virtual Reality Property Tours
              </h1>
              <p className="text-xl mb-8">
                Experience properties like never before with immersive 360° virtual reality tours.
                Walk through homes from anywhere in the world.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Immersive 360° virtual tours</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Compatible with VR headsets</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Available 24/7 on any device</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  <Play className="h-5 w-5 mr-2" />
                  Start VR Tour
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  View Demo
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative">
                <Image
                  src="https://images.unsplash.com/photo-1592478411213-6153e4ebc696?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="VR Property Tour"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/30 to-transparent rounded-lg"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/50">
                    <Play className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Revolutionary VR Technology</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of property viewing with cutting-edge virtual reality technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tour Types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your VR Experience</h2>
            <p className="text-lg text-gray-600">
              Different tour options to match your viewing preferences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tourTypes.map((tour, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{tour.title}</CardTitle>
                    <Badge variant={index === 1 ? "default" : "outline"}>
                      {tour.price}
                    </Badge>
                  </div>
                  <p className="text-gray-600">{tour.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">{tour.duration}</span>
                    </div>
                    <div className="space-y-2">
                      {tour.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4" variant={index === 1 ? "default" : "outline"}>
                      {index === 2 ? "Schedule Tour" : "Start Tour"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose VR Property Tours?</h2>
            <p className="text-lg text-gray-600">
              Transform your property search with virtual reality technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Device Compatibility */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compatible with All Devices</h2>
            <p className="text-xl text-purple-200">
              Experience VR tours on any platform - no special equipment required
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <Monitor className="h-12 w-12 mx-auto mb-4 text-purple-200" />
              <h3 className="font-semibold mb-2">Desktop</h3>
              <p className="text-purple-200 text-sm">Full-featured VR experience</p>
            </div>
            <div>
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-purple-200" />
              <h3 className="font-semibold mb-2">Mobile</h3>
              <p className="text-purple-200 text-sm">Touch-friendly navigation</p>
            </div>
            <div>
              <Headphones className="h-12 w-12 mx-auto mb-4 text-purple-200" />
              <h3 className="font-semibold mb-2">VR Headsets</h3>
              <p className="text-purple-200 text-sm">Immersive VR experience</p>
            </div>
            <div>
              <Building className="h-12 w-12 mx-auto mb-4 text-purple-200" />
              <h3 className="font-semibold mb-2">Any Browser</h3>
              <p className="text-purple-200 text-sm">No downloads required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured VR Properties</h2>
            <p className="text-lg text-gray-600">
              Experience these stunning Cape Verde properties in virtual reality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Luxury Beachfront Villa",
                location: "Santa Maria, Sal",
                price: "€850,000",
                image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              },
              {
                title: "Modern City Apartment",
                location: "Praia, Santiago",
                price: "€285,000",
                image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              },
              {
                title: "Ocean View Penthouse",
                location: "Mindelo, São Vicente",
                price: "€650,000",
                image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              }
            ].map((property, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-t-lg"></div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-purple-600 text-white">VR Available</Badge>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/50">
                      <Play className="h-5 w-5 mr-2" />
                      Start VR Tour
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                  <p className="text-blue-600 font-bold text-lg">{property.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience VR Property Tours?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Start exploring Cape Verde properties in virtual reality today
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Monitor className="h-5 w-5 mr-2" />
              Browse VR Properties
            </Button>
            <Button size="lg" variant="outline">
              <Eye className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
