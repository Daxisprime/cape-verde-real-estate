import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Brain,
  TrendingUp,
  Calculator,
  CheckCircle,
  BarChart3,
  MapPin,
  Home,
  DollarSign,
  Clock,
  Shield,
  Zap,
  Target
} from 'lucide-react';
import Image from 'next/image';

export default function AIValuationPage() {
  const features = [
    {
      icon: Brain,
      title: "Machine Learning Algorithm",
      description: "Advanced AI models trained on millions of property transactions"
    },
    {
      icon: TrendingUp,
      title: "Real-Time Market Data",
      description: "Live property market trends and comparable sales analysis"
    },
    {
      icon: MapPin,
      title: "Location Intelligence",
      description: "Neighborhood analysis including amenities, schools, and infrastructure"
    },
    {
      icon: BarChart3,
      title: "Predictive Analytics",
      description: "Future value projections based on market indicators"
    },
    {
      icon: Shield,
      title: "Government Data Integration",
      description: "Official property records and municipal data sources"
    },
    {
      icon: Clock,
      title: "Instant Results",
      description: "Get accurate valuations in under 30 seconds"
    }
  ];

  const valuationFactors = [
    "Property size and layout",
    "Location and neighborhood",
    "Recent comparable sales",
    "Market trends and conditions",
    "Property condition and age",
    "Local amenities and infrastructure",
    "Economic indicators",
    "Seasonal market patterns"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Brain className="h-8 w-8 mr-3" />
                <Badge className="bg-white/20 text-white">PropTech Innovation</Badge>
              </div>
              <h1 className="text-5xl font-bold mb-6">
                AI-Powered Property Valuation
              </h1>
              <p className="text-xl mb-8">
                Get instant, accurate property valuations using cutting-edge machine learning
                algorithms trained on Cape Verde's real estate market data.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>95% accuracy rate on valuations</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Instant results in 30 seconds</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Updated daily with market data</span>
                </div>
              </div>

              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                <Calculator className="h-5 w-5 mr-2" />
                Get Free AI Valuation
              </Button>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold mb-2">Live Demo</h3>
                  <p className="text-white/80">Try our AI valuation tool</p>
                </div>

                <div className="space-y-4">
                  <Input placeholder="Property address" className="bg-white text-gray-900" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Bedrooms" className="bg-white text-gray-900" />
                    <Input placeholder="Bathrooms" className="bg-white text-gray-900" />
                  </div>
                  <Input placeholder="Total area (m²)" className="bg-white text-gray-900" />
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Zap className="h-4 w-4 mr-2" />
                    Generate AI Valuation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How AI Valuation Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our advanced machine learning system analyzes millions of data points
              to provide the most accurate property valuations in Cape Verde
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Input Property Details</h3>
              <p className="text-gray-600">Enter basic property information and location</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Processing</h3>
              <p className="text-gray-600">Machine learning algorithms analyze market data</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Market Analysis</h3>
              <p className="text-gray-600">Compare with similar properties and trends</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Accurate Valuation</h3>
              <p className="text-gray-600">Receive precise market value estimate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Advanced AI Technology</h2>
            <p className="text-lg text-gray-600">
              Powered by state-of-the-art machine learning and real-time data processing
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

      {/* Valuation Factors */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">What Our AI Considers</h2>
              <p className="text-lg text-gray-600 mb-8">
                Our machine learning algorithm analyzes hundreds of factors to ensure
                the most accurate valuation possible for your Cape Verde property.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {valuationFactors.map((factor, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="AI Analytics"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-purple-200">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-purple-200">Properties Valued</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">30s</div>
              <div className="text-purple-200">Average Response Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-purple-200">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Value Your Property?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Get an instant, accurate AI-powered valuation of your Cape Verde property in seconds
          </p>
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Brain className="h-5 w-5 mr-2" />
            Start AI Valuation
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
